import prisma from "../config/prismaClient.js";

export const fillCheckoutSessionDetails = async (req, res) => {
  const { sessionId, userId, buyerDetails } = req.body;

  console.log("[ORDER-SERVICE] fillCheckoutSessionDetails called");
  console.log("[ORDER-SERVICE] sessionId:", sessionId);
  console.log("[ORDER-SERVICE] userId:", userId);
  console.log("[ORDER-SERVICE] buyerDetails:", buyerDetails);

  if (!sessionId || !userId || !buyerDetails) {
    console.error("[ORDER-SERVICE] Missing required fields");
    return res.status(400).json({
      message: "sessionId, userId and buyerDetails are required"
    });
  }

  try {
    const session = await prisma.checkoutSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      console.error("[ORDER-SERVICE] Session not found:", sessionId);
      return res.status(404).json({
        message: "Checkout session not found"
      });
    }

    if (session.userId !== userId) {
      console.error("[ORDER-SERVICE] Session-user mismatch");
      return res.status(403).json({
        message: "Session does not belong to this user"
      });
    }

    if (
      session.status !== "PREVIEW" &&
      session.status !== "DETAILS_FILLED"
    ) {
      console.error("[ORDER-SERVICE] Invalid session state:", session.status);
      return res.status(400).json({
        message: "Checkout session is not editable in current state"
      });
    }

    const updatedSession = await prisma.checkoutSession.update({
      where: { id: sessionId },
      data: {
        buyerDetailsSnapshot: buyerDetails,
        status: "DETAILS_FILLED"
      }
    });

    console.log("[ORDER-SERVICE] Session updated successfully:", updatedSession.id);

    return res.status(200).json({
      success: true,
      sessionId: updatedSession.id,
      status: updatedSession.status
    });

  } catch (error) {
    console.error("[ORDER-SERVICE] Failed to update checkout session:", error);

    return res.status(500).json({
      message: "Failed to update checkout session details"
    });
  }
};
