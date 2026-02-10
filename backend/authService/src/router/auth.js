import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const signup = async (req, res) => {
  const requestId = req.requestId

  try {
    console.log(`[${requestId}] SIGNUP request body`, req.body)

    const { email } = req.body

    if (!email) {
      console.log(`[${requestId}] SIGNUP failed: email missing`)

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

      console.log(`[${requestId}] SIGNUP user created: ${user.id}`)

      appLogger.info(
        { requestId, userId: user.id, email },
        "User created during signup"
      )
    } else {
      console.log(`[${requestId}] SIGNUP user already exists: ${user.id}`)

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
    console.error(`[${requestId}] SIGNUP ERROR`, err)

    errorLogger.error(
      {
        requestId,
        error: err.message,
        stack: err.stack
      },
      "Signup failed"
    )

    return res.status(500).json({ message: "Internal server error" })
  }
}

export const login = async (req, res) => {
  const requestId = req.requestId

  try {
    console.log(`[${requestId}] LOGIN request body`, req.body)

    const { email } = req.body

    if (!email) {
      console.log(`[${requestId}] LOGIN failed: email missing`)

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
      console.log(`[${requestId}] LOGIN user not found: ${email}`)

      appLogger.info(
        { requestId, email },
        "Login failed: user not found"
      )

      return res.status(404).json({ message: "User not found" })
    }

    console.log(`[${requestId}] LOGIN user authenticated: ${user.id}`)

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
    console.error(`[${requestId}] LOGIN ERROR`, err)

    errorLogger.error(
      {
        requestId,
        error: err.message,
        stack: err.stack
      },
      "Login failed"
    )

    return res.status(500).json({ message: "Internal server error" })
  }
}
