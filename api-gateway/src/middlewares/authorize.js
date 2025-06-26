function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    if (!allowedRoles.includes(req.user.type)) {
      return res
        .status(403)
        .json({ message: "Acesso negado: permissões insuficientes" });
    }

    next();
  };
}

module.exports = authorizeRoles;
