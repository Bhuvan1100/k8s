import jwt from "jsonwebtoken";

const verifyUser = (req, res) => {
  const token = req.cookies?.access_token;

  
  if (!token) {
    return res.status(200).json({
      authenticated: false,
      user: null
    });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    return res.status(200).json({
      authenticated: true,
      user: {
        userId: user.userId,
        email: user.email,
        roles: user.roles
      }
    });

  } catch (err) {
   
    return res.status(200).json({
      authenticated: false,
      user: null
    });
  }
};

export default verifyUser;
