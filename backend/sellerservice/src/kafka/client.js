import { Kafka, logLevel } from "kafkajs";


export const kafka = new Kafka({
  clientId: "seller-service",
  brokers: ["kafka:9092"],
  logLevel: logLevel.NOTHING,
  retry: {
    initialRetryTime: 1000,
    retries: 20
  }
});
