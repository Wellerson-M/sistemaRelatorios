const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  // Exemplo esperado: Bearer <token>
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Agora disponível nas rotas
    next();
  } catch (err) {
    return res.status(403).json({ erro: "Token inválido ou expirado" });
  }
}

module.exports = verifyToken;
