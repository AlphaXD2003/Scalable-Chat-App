const { kafka } = require("./client");

const admin = kafka.admin();

const kafkaInit = async () => {
  try {
    await admin.connect();
    console.log("Admin connected");

    const topicConfig = {
      topics: [
        {
          topic: process.env.KAFKA_TOPIC,
          numPartitions: 5,
          replicationFactor: 1,
        },
      ],
    };

    console.log("Creating topics with config:", topicConfig);

    const result = await admin.createTopics(topicConfig);
    console.log("Topic creation result:", result);

    await admin.disconnect();
    console.log("Admin disconnected");
  } catch (error) {
    console.error("Error during Kafka initialization:", error);
  }
};

module.exports = { kafkaInit };
