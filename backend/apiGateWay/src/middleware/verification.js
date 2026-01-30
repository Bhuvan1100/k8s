import jwt from "jsonwebtoken";

const jwtCookieMiddleware = (req, res, next) => {
  
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "No token found in cookies" });
  }

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default jwtCookieMiddleware;
