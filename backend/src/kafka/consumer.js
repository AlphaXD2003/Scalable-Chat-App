const { PartitionAssigners } = require("kafkajs");
const { kafka } = require("./client");

const initConsumer = async ({ groupId, eachMessageRun }) => {
  try {
    const consumer = kafka.consumer({
      groupId,
    });
    await consumer.connect();
    await consumer.subscribe({
      topics: [process.env.KAFKA_TOPIC],
      fromBeginning: true,
    });

    console.log(`Consumer with id ${groupId} connected.`);
    await consumer.run({
      partitionsConsumedConcurrently: 1,
      eachMessage: eachMessageRun,
    });
  } catch (error) {
    console.log(
      `Error while consuming with the consumer with groupId ${groupId}`
    );
    console.log(error.message);
  }
};

module.exports = { initConsumer };
