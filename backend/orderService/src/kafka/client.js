import { Kafka, logLevel } from "kafkajs";

const kafka = new Kafka({
  clientId: "order-service",
  brokers: ["kafka:9092"], 
  logLevel: logLevel.NOTHING,
  retry: {
    initialRetryTime: 1000,
    retries: 20
  }
});

export default kafka;
