import { Kafka, logLevel } from "kafkajs";

const KAFKA_HOST = process.env.KAFKA_HOST || "localhost";
const KAFKA_PORT = process.env.KAFKA_PORT || "9092";

export const kafka = new Kafka({
  clientId: "order-service",
  brokers: [`${KAFKA_HOST}:${KAFKA_PORT}`],
  logLevel: logLevel.NOTHING,
  retry: {
    initialRetryTime: 1000,
    retries: 20,
  },
});