import { Worker } from "bullmq";
import { redisConnection } from "../infra/redisConnection.js";
import mailer from "../infra/mailer.js";

new Worker(
  "order-created-buyer",
  async job => {
    const { email, orderId } = job.data;

    if (!email || !orderId) {
      throw new Error("INVALID_JOB_DATA");
    }

    try {
      await mailer.sendMail({
        from: `"Purchase Service" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Order Has Been Placed",
        html: `
          <h2>Order Placed</h2>
          <p>Your order with ID <b>${orderId}</b> has been placed successfully.</p>
          <p>We will notify you once it is processed.</p>
        `,
      });

      console.log("ordered-item email sent to", email);

      return { sent: true, orderId };
    } catch (err) {
      console.error("failed to send ordered-item email", err);
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

console.log("Ordered-created-buyer email worker started");
