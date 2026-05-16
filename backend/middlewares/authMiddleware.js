const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  // Try standard 'Authorization' header first, then fallback to custom 'token' header
  let token = req.header("Authorization");
  
  if (token && token.startsWith("Bearer ")) {
    token = token.split(" ")[1]; // Remove 'Bearer ' prefix
  } else {
    token = req.header("token");
  }

  // Check if not token
  if (!token) {
    return res
      .status(401)
      .json({ errors: [{ msg: "No token, authorization denied" }] });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ errors: [{ msg: "Token is not valid" }] });
  }
};

