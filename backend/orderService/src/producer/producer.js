import kafka from "../kafka/client.js";

const producer = kafka.producer({
  allowAutoTopicCreation: true,
  idempotent: true
});

let isConnected = false;

export const connectProducer = async () => {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
    console.log("[KAFKA] Producer connected");
  }
};

export const kafkaProducer = producer;
