import axios from "axios"
import jwt from "jsonwebtoken"

import appLogger from "../../logger/appLogger.js"
import errorLogger from "../../logger/errorLogger.js"
import accessLogger from "../../logger/accesslogger.js"


export const login = async (req, res) => {
  console.log("LOGIN request received", {
    requestId: req.requestId
  })

  try {
    const response = await axios.post(
      "http://authservice:4001/auth/login",
      req.body,
      {
        headers: {
          "x-request-id": req.requestId
        }
      }
    )

    const { id, email, roles } = response.data

    appLogger.info({
      requestId: req.requestId,
      event: "LOGIN_SUCCESS",
      userId: id,
      email,
      roles
    })

    const token = jwt.sign(
      { userId: id, roles: roles, email: email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    })

    accessLogger.info({
      requestId: req.requestId,
      action: "LOGIN",
      status: response.status
    })

    console.log("LOGIN response sent", {
      requestId: req.requestId,
      status: response.status
    })

    res.status(response.status).json({
      message: "login successful",
      id,
      email,
      roles
    })
  } catch (err) {
    console.error("GATEWAY LOGIN ERROR", {
      requestId: req.requestId,
      message: err.message
    })

    errorLogger.error({
      requestId: req.requestId,
      event: "LOGIN_FAILED",
      error: err.message,
      status: err.response?.status
    })

    res.status(err.response?.status || 500).json({
      message: "Auth service login failed"
    })
  }
}