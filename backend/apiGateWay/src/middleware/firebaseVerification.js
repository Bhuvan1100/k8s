import admin from "firebase-admin";
import serviceAccount from "../config/firebase-service-account.json" assert { type: "json" };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const firebaseVerification = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = {
      firebase_id: decodedToken.uid,
      email: decodedToken.email,
      roles: decodedToken.roles || []
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Firebase token" });
  }
};

export default firebaseVerification;
