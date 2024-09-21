const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "chat-app",
  brokers: [`${process.env.KAFKA_BROKER}`],
});

module.exports = { kafka };
