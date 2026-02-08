import axios from "axios"
import jwt from "jsonwebtoken"

import errorLogger from "../logger/errorLogger.js"
import accessLogger from "../logger/accesslogger.js"
import appLogger from "../logger/appLogger.js"

export const signup = async (req, res) => {
  console.log("SIGNUP request received", {
    requestId: req.requestId
  })

  try {
    const response = await axios.post(
      "http://authservice:4001/auth/signup",
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
      event: "SIGNUP_SUCCESS",
      userId: id,
      email,
      roles
    })

    const token = jwt.sign(
      { userId: id, roles, email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    })

    accessLogger.info({
      requestId: req.requestId,
      action: "SIGNUP",
      status: response.status
    })

    console.log("SIGNUP response sent", {
      requestId: req.requestId,
      status: response.status
    })

    res.status(response.status).json({
      message: "sign-up successful",
      id,
      email,
      roles
    })
  } catch (err) {
    console.error("GATEWAY SIGNUP ERROR", {
      requestId: req.requestId,
      message: err.message
    })

    errorLogger.error({
      requestId: req.requestId,
      event: "SIGNUP_FAILED",
      error: err.message,
      status: err.response?.status
    })

    res.status(err.response?.status || 500).json({
      message: "Auth service signup failed"
    })
  }
}

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
      secure: false,
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
