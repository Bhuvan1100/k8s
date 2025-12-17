import prisma from "../utils/prismaClient.js";

/**
 * SIGNUP
 * - If user does not exist → create with role
 * - If user exists:
 *    - role already present → do nothing
 *    - role missing → add role
 * - Return roles in all cases
 */
export const signup = async (req, res) => {
  const { email, firebase_id, role } = req.body;

  if (!firebase_id || !role) {
    return res.status(400).json({ message: "firebase_id and role required" });
  }

  let user = await prisma.user.findUnique({
    where: { userId: firebase_id }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        userId: firebase_id,
        email,
        roles: [role]
      }
    });
  } else if (!user.roles.includes(role)) {
    user = await prisma.user.update({
      where: { userId: firebase_id },
      data: {
        roles: {
          push: role
        }
      }
    });
  }

  return res.json({
    message: "Signup successful",
    id:user.id,
    email:user.email,
    roles: user.roles,
  });
};


/**
 * LOGIN
 * - User must exist
 * - Just return roles
 */
export const login = async (req, res) => {
  const { firebase_id } = req.body;

  if (!firebase_id) {
    return res.status(400).json({ message: "firebase_id required" });
  }

  const user = await prisma.user.findUnique({
    where: { userId: firebase_id }
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    message: "Login successful",
    id:user.id,
    email:user.email,
    roles: user.roles
  });
};
