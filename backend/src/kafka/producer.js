const { kafka } = require("./client");

const producer = kafka.producer();

const produceInKakfa = async ({
  topic = process.env.KAFKA_TOPIC,
  messages,
}) => {
  try {
    console.log("Messages that are going to be published: ", messages);
    if (messages.length <= 0)
      return console.log("No message was there to produce in kafka.");
    await producer.connect();
    console.log("Producer connected");
    await producer.send({
      topic,
      messages,
    });
  } catch (error) {
    console.log("Error while producing messages in Kafka");
    console.log(error.message);
  } finally {
    await producer.disconnect();
    console.log("Producer disconnected");
  }
};

module.exports = { produceInKakfa };
