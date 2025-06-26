const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.error("[JWT] Authorization header not provided");
    return res.status(401).json({ message: "Token not provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.error("[JWT] Bearer token missing in Authorization header");
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        console.error("[JWT] Token verification failed:", err.message);
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      if (!user.sub) {
        console.error("[JWT] Token missing 'sub' claim");
        return res.status(401).json({ message: "Token missing subject (sub)" });
      }
      req.user = {
        id: user.sub,
        cpf: user.cpf,
        email: user.email,
        type: user.type,
      };
      next();
    });
  } catch (error) {
    console.error("[JWT] Exception during token verification:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = authenticateToken;
