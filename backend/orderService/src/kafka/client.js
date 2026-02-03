import { Kafka, logLevel } from "kafkajs";

const kafka = new Kafka({
  clientId: "order-service",
  brokers: ["kafka:9092"], 
  logLevel: logLevel.NOTHING,
  retry: {
    initialRetryTime: 300,
    retries: 5
  }
});

export default kafka;
