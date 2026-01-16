import { Worker } from "bullmq";
import { redisConnection } from "../infra/redisConnection.js";
import mailer from "../infra/mailer.js";

new Worker(
  "order-created",
  async job => {
    const { email, orderId } = job.data;

    if (!email || !orderId) {
      throw new Error("INVALID_JOB_DATA");
    }

    try {
      await mailer.sendMail({
        from: `"Order Service" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Order Created Successfully",
        html: `
          <h2>Order Confirmed</h2>
          <p>Your order with ID <b>${orderId}</b> has been created successfully.</p>
        `,
      });

      console.log("order created email sent to", email);

      return { sent: true, orderId };
    } catch (err) {
      console.error("failed to send order created email", err);
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

console.log("Order-created email worker started");
