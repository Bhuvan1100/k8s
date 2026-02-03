import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const fillCheckoutSessionDetails = async (req, res) => {
  const { sessionId, userId } = req.body

  appLogger.info("FILL_CHECKOUT_SESSION_DETAILS_REQUEST", { sessionId, userId })
  console.log("[FILL_CHECKOUT_SESSION_DETAILS] request entered", sessionId, userId)

  if (!sessionId || !userId || !req.body.buyerDetails) {
    console.log("[FILL_CHECKOUT_SESSION_DETAILS] missing required fields", sessionId, userId)
    return res.status(400).json({
      message: "sessionId, userId and buyerDetails are required"
    })
  }

  try {
    console.log("[FILL_CHECKOUT_SESSION_DETAILS] fetching session", sessionId)

    const session = await prisma.checkoutSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      console.log("[FILL_CHECKOUT_SESSION_DETAILS] session not found", sessionId)
      return res.status(404).json({
        message: "Checkout session not found"
      })
    }

    if (session.userId !== userId) {
      console.log("[FILL_CHECKOUT_SESSION_DETAILS] session-user mismatch", sessionId, userId)
      return res.status(403).json({
        message: "Session does not belong to this user"
      })
    }

    if (
      session.status !== "PREVIEW" &&
      session.status !== "DETAILS_FILLED"
    ) {
      console.log(
        "[FILL_CHECKOUT_SESSION_DETAILS] invalid session state",
        sessionId,
        session.status
      )
      return res.status(400).json({
        message: "Checkout session is not editable in current state"
      })
    }

    console.log("[FILL_CHECKOUT_SESSION_DETAILS] updating session", sessionId)

    const updatedSession = await prisma.checkoutSession.update({
      where: { id: sessionId },
      data: {
        buyerDetailsSnapshot: req.body.buyerDetails,
        status: "DETAILS_FILLED"
      }
    })

    appLogger.info("FILL_CHECKOUT_SESSION_DETAILS_SUCCESS", {
      sessionId: updatedSession.id,
      status: updatedSession.status
    })
    console.log("[FILL_CHECKOUT_SESSION_DETAILS] success", updatedSession.id)

    return res.status(200).json({
      success: true,
      sessionId: updatedSession.id,
      status: updatedSession.status
    })

  } catch (error) {
    errorLogger.error("FILL_CHECKOUT_SESSION_DETAILS_FAILED", {
      sessionId,
      userId,
      message: error.message,
      stack: error.stack
    })
    console.log("[FILL_CHECKOUT_SESSION_DETAILS] failed", sessionId)

    return res.status(500).json({
      message: "Failed to update checkout session details"
    })
  }
}
