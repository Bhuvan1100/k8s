import { Kafka, logLevel } from "kafkajs";


export const kafka = new Kafka({
  clientId: "product-service",
  brokers: ["kafka:9092"],
  retry: {
    initialRetryTime: 300,
    retries: 5
  },
  logLevel: logLevel.NOTHING
});
