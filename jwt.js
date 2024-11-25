const jwt = require("jsonwebtoken");

const jwtAuthMiddleWare = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "UnAuthorized" });
  const token = req.headers.authorization.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Invalid Token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("error", error);
    res.status(401).json({ message: "Invalid Token" });
  }
};

const generateJWtToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET);
};

module.exports = { jwtAuthMiddleWare, generateJWtToken };
