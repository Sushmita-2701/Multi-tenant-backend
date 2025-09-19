const jwt = require("jsonwebtoken");


const secret=process.env.SECRET;

function generateToken(user) {
  return jwt.sign(
    { email: user.email, role: user.role, tenant: user.tenant },
    SECRET,
    { expiresIn: "1h" }
  );
}

// Authenticate middleware
function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// Role check middleware
function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

module.exports = { generateToken, authenticate, authorizeRole };
