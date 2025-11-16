const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/", [], (req, res) => {
  const token = req.header("token");
  if (!token || token === "null") {
    return res
      .status(401)
      .json({ errors: [{ msg: "No token, authorization denied" }] });
  }

  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);
    console.log(decoded);
    return res.status(200).json({ msg: "Token is valid" });
  } catch (error) {
    console.error(error);
    if (error && error.name === "TokenExpiredError") {
      return res.status(401).json({ errors: [{ msg: "Token expired" }] });
    }
    if (error && error.name === "JsonWebTokenError") {
      return res.status(401).json({ errors: [{ msg: "Invalid token" }] });
    }

    return res.status(500).json({ errors: [{ msg: "Authentication error" }] });
  }
});

module.exports = router;
