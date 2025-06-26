require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const authenticateToken = require("./middlewares/authenticate");
const authorizeRoles = require("./middlewares/authorize");

const app = express();
const PORT = process.env.PORT || 3333;

const AUTH_MS_URL = process.env.AUTH_MS_URL || "http://auth-service:8081";
const PACIENTE_MS_URL =
  process.env.PACIENTE_MS_URL || "http://paciente-service:8082";
const CONSULTA_MS_URL =
  process.env.CONSULTA_MS_URL || "http://consulta-service:8083";

app.use(
  cors({
    origin: "*",
  })
);

// Auth sem autenticação
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: AUTH_MS_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq) => proxyReq.removeHeader("Authorization"),
  })
);

// Endpoints específicos acessíveis também por FUNCIONARIO
const allowPacienteFuncionario = [
  "/api/paciente/buscar",
  "/api/paciente/todos",
];

app.use("/api/paciente", (req, res, next) => {
  if (allowPacienteFuncionario.some((path) => req.path.startsWith(path))) {
    return authorizeRoles("PACIENTE", "FUNCIONARIO")(req, res, () =>
      authenticateToken(req, res, () => proxyPaciente(req, res))
    );
  }
  return authenticateToken(req, res, () =>
    authorizeRoles("PACIENTE")(req, res, () => proxyPaciente(req, res))
  );
});

function proxyPaciente(req, res) {
  createProxyMiddleware({
    target: PACIENTE_MS_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader("Authorization", req.headers["authorization"]);

      if (req.path === "/completar") {
        proxyReq.setHeader("x-user-id", req.user.id);
        proxyReq.setHeader("x-user-cpf", req.user.cpf);
        proxyReq.setHeader("x-user-email", req.user.email);
      }
    },
    onError: (err, req, res) => {
      if (!res.headersSent) {
        res.status(502).json({
          message: "Erro ao comunicar com o serviço de paciente",
          detail: err.message,
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      let body = Buffer.from("");
      proxyRes.on("data", (data) => (body = Buffer.concat([body, data])));
      proxyRes.on("end", () => {
        if (proxyRes.statusCode >= 400) {
          res.status(proxyRes.statusCode);
          try {
            res.json(JSON.parse(body.toString()));
          } catch {
            res.send(body.toString());
          }
        }
      });
    },
  })(req, res);
}

// Proxy para Consulta Service (com autenticação e autorização para múltiplas roles)
app.use(
  "/api/consulta",
  authenticateToken,
  authorizeRoles("ADMIN", "FUNCIONARIO", "PACIENTE"),
  createProxyMiddleware({
    target: CONSULTA_MS_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
      proxyReq.setHeader("Authorization", req.headers["authorization"]);
      proxyReq.setHeader("x-user-id", req.user.id);
      proxyReq.setHeader("x-user-cpf", req.user.cpf);
      proxyReq.setHeader("x-user-email", req.user.email);
      proxyReq.setHeader("x-user-type", req.user.type);
    },
    onError: (err, req, res) => {
      if (res.headersSent) return;
      res.status(502).json({
        message: "Erro ao comunicar com o serviço de consulta",
        detail: err.message,
      });
    },
    onProxyRes: (proxyRes, req, res) => {
      let body = Buffer.from("");
      proxyRes.on("data", (data) => {
        body = Buffer.concat([body, data]);
      });
      proxyRes.on("end", () => {
        if (proxyRes.statusCode >= 400) {
          res.status(proxyRes.statusCode);
          try {
            res.json(JSON.parse(body.toString()));
          } catch {
            res.send(body.toString());
          }
        }
      });
    },
  })
);

app.listen(PORT, () => {
  console.log(`API Gateway rodando na porta ${PORT}`);
});
