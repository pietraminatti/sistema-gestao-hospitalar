/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Link,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { login } from "../services/auth/auth";
import { setAuth } from "../stores/slices/user.slice";
import { toast } from "react-toastify";
import { ROUTING } from "../constants/routing";
import { jwtDecode } from "jwt-decode";
import { ApiError, UserJwtData } from "../types";

const validationSchema = Yup.object({
  identifier: Yup.string()
    .required("CPF ou e-mail é obrigatório")
    .test(
      "is-valid-identifier",
      "Deve ser um e-mail válido ou um CPF numérico com 11 dígitos",
      (value) => {
        if (!value) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
        return emailRegex.test(value) || cpfRegex.test(value);
      }
    ),
  password: Yup.string()
    .min(4, "A senha tem pelo menos 4 caracteres")
    .required("Senha é obrigatória"),
});

function maskCpf(value: string): string {
  const numeric = value.replace(/[^\d]/g, "").slice(0, 11);
  return numeric
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      identifier: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);

        let cleanedIdentifier = values.identifier;

        // Se for CPF, remove tudo que não for dígito
        const onlyNumbers = cleanedIdentifier.replace(/\D/g, "");
        if (/^\d{11}$/.test(onlyNumbers)) {
          cleanedIdentifier = onlyNumbers; // CPF limpo só números
        }
        // Senão, assume email e mantém como está
        const response = await login(cleanedIdentifier, values.password);

        const token = response.data.data.token;
        const decoded: UserJwtData = jwtDecode(token);

        dispatch(setAuth(decoded));
        localStorage.setItem("token", token);
        localStorage.setItem("user", decoded.type);

        // Exibir mensagem vinda da API no toast
        toast.success(response.data.message);

        switch (decoded.type) {
          case "PACIENTE":
            setTimeout(() => navigate(ROUTING.PACIENTE), 1000);
            break;
          case "FUNCIONARIO":
            setTimeout(() => navigate(ROUTING.FUNCIONARIO), 1000);
            break;
          case "ADMIN":
            setTimeout(() => navigate(ROUTING.ADMIN), 1000);
            break;
        }
      } catch (error: unknown) {
        const err = error as ApiError;
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Limpa a senha quando o identifier muda
  useEffect(() => {
    formik.setFieldValue("password", "");
  }, [formik.values.identifier]);

  // Detecta autofill do navegador após montar o componente e atualiza formik
  useEffect(() => {
    const timeout = setTimeout(() => {
      const identifierInput = document.getElementById(
        "identifier"
      ) as HTMLInputElement;
      const passwordInput = document.getElementById(
        "password"
      ) as HTMLInputElement;

      if (identifierInput && passwordInput) {
        const identifier = identifierInput.value.trim();
        const password = passwordInput.value;

        if (identifier && !formik.values.identifier) {
          formik.setFieldValue("identifier", identifier);
        }

        if (password && !formik.values.password) {
          formik.setFieldValue("password", password);
        }
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  const handleIdentifierChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    const onlyNumbers = value.replace(/\D/g, "");

    if (/^\d+$/.test(onlyNumbers) && onlyNumbers.length <= 11) {
      formik.setFieldValue("identifier", maskCpf(onlyNumbers));
    } else {
      formik.setFieldValue("identifier", value);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          p: 3,
          mt: 8,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 3 }}>
          Ainda não tem uma conta? <Link href="/register">Crie uma conta</Link>
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="identifier"
            name="identifier"
            label="E-mail ou CPF"
            value={formik.values.identifier}
            onChange={handleIdentifierChange}
            error={
              formik.touched.identifier && Boolean(formik.errors.identifier)
            }
            helperText={formik.touched.identifier && formik.errors.identifier}
            disabled={isLoading}
            sx={{ mb: 2 }}
            autoComplete="username"
          />

          <TextField
            fullWidth
            id="password"
            name="password"
            label="Senha"
            type={showPassword ? "text" : "password"}
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={isLoading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
            autoComplete="current-password"
          />

          <Link
            href={ROUTING.FORGET_PASSWORD}
            sx={{ display: "block", textAlign: "right", mb: 2 }}
          >
            Esqueceu a senha?
          </Link>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            size="large"
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={24} />}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Box>
    </Container>
  );
}
