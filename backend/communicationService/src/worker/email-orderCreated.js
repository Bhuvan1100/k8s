import { Worker } from "bullmq";
import { redisConnection } from "../infra/redisConnection.js";
import mailer from "../infra/mailer.js";

new Worker(
  "order-created-seller",
  async job => {
    const { email, orderId, productId, productVariantId } = job.data;

    if (!email || !orderId || !productId || !productVariantId) {
      throw new Error("INVALID_JOB_DATA");
    }

    try {
      await mailer.sendMail({
        from: `"Order Service" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "New Order Item Sold",
        html: `
          <h2>New Order Item</h2>
          <p><b>Order ID:</b> ${orderId}</p>
          <p><b>Product ID:</b> ${productId}</p>
          <p><b>Variant ID:</b> ${productVariantId}</p>
          <p>This item has been successfully sold.</p>
        `,
      });

      console.log(
        "seller order item email sent to",
        email,
        orderId,
        productVariantId
      );

      return {
        sent: true,
        orderId,
        productVariantId
      };
    } catch (err) {
      console.error("failed to send seller order item email", err);
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

console.log("Order-created-seller email worker started");
