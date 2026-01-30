import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"


export const signup = async (req, res) => {
  const requestId = req.headers["x-request-id"]

  try {
    console.log(req.body)
    const { email } = req.body

    if (!email) {
      appLogger.warn(
        { requestId },
        "Signup failed: email missing"
      )

      return res.status(400).json({ message: "email required" })
    }

    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: { email }
      })

      console.log("[SIGNUP] User created:", user.id)

      appLogger.info(
        { requestId, userId: user.id, email },
        "User created during signup"
      )
    } else {
      console.log("[SIGNUP] User already exists:", user.id)

      appLogger.info(
        { requestId, userId: user.id, email },
        "Signup called for existing user"
      )
    }

    return res.status(200).json({
      message: "Signup successful",
      id: user.id,
      email: user.email,
      roles: user.roles
    })
  } catch (err) {
    console.error("[SIGNUP ERROR]", err.message)

    errorLogger.error(
      {
        requestId,
        err: err.message,
        stack: err.stack
      },
      "Signup failed"
    )

    return res.status(500).json({ message: "Internal server error" })
  }
}

export const login = async (req, res) => {
  const requestId = req.headers["x-request-id"]

  try {
    const { email } = req.body

    if (!email) {
      appLogger.warn(
        { requestId },
        "Login failed: email missing"
      )

      return res.status(400).json({ message: "email required" })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      appLogger.info(
        { requestId, email },
        "Login failed: user not found"
      )

      return res.status(404).json({ message: "User not found" })
    }

    console.log("[LOGIN] User authenticated:", user.id)

    appLogger.info(
      { requestId, userId: user.id, email },
      "User logged in successfully"
    )

    return res.status(200).json({
      message: "Login successful",
      id: user.id,
      email: user.email,
      roles: user.roles
    })
  } catch (err) {
    console.error("[LOGIN ERROR]", err.message)

    errorLogger.error(
      {
        requestId,
        err: err.message,
        stack: err.stack
      },
      "Login failed"
    )

    return res.status(500).json({ message: "Internal server error" })
  }
}
