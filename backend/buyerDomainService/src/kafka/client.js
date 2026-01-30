import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "buyer-service",
  brokers: ["kafka:9092"]
});
