import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "order-service",
  brokers: ["kafka:9092"], 
  retry: {
    initialRetryTime: 300,
    retries: 5
  }
});

export default kafka;
