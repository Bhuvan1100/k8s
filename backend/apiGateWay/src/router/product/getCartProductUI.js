import axios from "axios"

import errorLogger from "../../logger/errorLogger.js"
import accessLogger from "../../logger/accesslogger.js"
import appLogger from "../../logger/appLogger.js"

export const getCartProductForUI = async (req, res) => {
  console.log("GET_CART_PRODUCT_FOR_UI request received", {
    requestId: req.requestId
  });

  try {
    const response = await axios.post(
      "http://productservice:4003/product/cart/ui",
      req.body,
      {
        headers: {
          "x-request-id": req.requestId
        }
      }
    );

    console.log("GET_CART_PRODUCT_FOR_UI response sent", {
      requestId: req.requestId,
      status: response.status
    });

    appLogger.info({
      requestId: req.requestId,
      event: "GET_CART_PRODUCT_FOR_UI_SUCCESS"
    });

    accessLogger.info({
      requestId: req.requestId,
      action: "GET_CART_PRODUCT_FOR_UI",
      status: response.status
    });

    return res.status(response.status).json(response.data);

  } catch (err) {
    console.error("GET_CART_PRODUCT_FOR_UI error", {
      requestId: req.requestId,
      message: err.message
    });

    errorLogger.error({
      requestId: req.requestId,
      event: "GET_CART_PRODUCT_FOR_UI_FAILED",
      error: err.message,
      status: err.response?.status
    });

    return res.status(err.response?.status || 500).json({
      message: "Product service failed"
    });
  }
};
