import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "product-service",
  brokers: ["kafka:9092"]
});
