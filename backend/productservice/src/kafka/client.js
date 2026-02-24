import { Kafka, logLevel } from "kafkajs";


export const kafka = new Kafka({
  clientId: "product-service",
  brokers: ["kafka:9092"],
  retry: {
    initialRetryTime: 5000,
    retries: 50
  },
  logLevel: logLevel.NOTHING
});
