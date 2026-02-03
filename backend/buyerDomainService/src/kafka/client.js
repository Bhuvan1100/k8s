import { Kafka, logLevel } from "kafkajs";


export const kafka = new Kafka({
  clientId: "buyer-service",
  brokers: ["kafka:9092"],
  logLevel: logLevel.NOTHING,
  retry: {
    initialRetryTime: 300,
    retries: 5
  }
});
