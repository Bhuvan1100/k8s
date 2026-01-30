import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "seller-service",
  brokers: ["kafka:9092"]
});
