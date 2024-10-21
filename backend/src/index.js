require("dotenv").config({
  path: "./.env",
});

const { httpServer } = require("./app");
const connectDatabase = require("./db/db");
const { kafkaInit } = require("./kafka/admin");
const { initConsumer } = require("./kafka/consumer");
const { DeleteMessage } = require("./models/deleteMessages.model");
const { ChatMessageModel } = require("./models/message.model");
const User = require("./models/user.models");
const { redis } = require("./redis/redis");
const { Socket } = require("./sockets/socket.io");
const cloudinary = require("./utils/cloudinary");
const { transporter } = require("./utils/sendMail");
const fs = require("fs");
connectDatabase()
  .then(async () => {
    try {
      httpServer.listen(process.env.PORT || 5000, () => {
        console.log(
          `Server is running at http://localhost:${process.env.PORT}`
        );
      });
      new Socket(httpServer);
      await redis.init();
      await kafkaInit();
      await initConsumer({
        groupId: process.env.KAFKA_CHAT_GROUP_ID,

        eachMessageRun: async ({
          topic,
          partition,
          message,
          heartbeat,
          pause,
        }) => {
          try {
            if (message.value === null) return;
            console.log(`Message: ${message.value.toString()}`);
            console.log(`Partition received: ${partition}`);
            if (partition == process.env.KAFKA_CHAT_PARTITION_MAIL_ID) {
              console.log(`Sending Message from Kafka Consumer..`);
              const data = JSON.parse(message.value.toString());
              await transporter.sendMail({
                from: data.from,
                to: data.to,
                html: data.html,
                subject: data.subject,
              });
              console.log(`Message sent to ${data.to} from ${data.from}`);
            } else if (
              partition == process.env.KAFKA_CHAT_PARTITION_AVATAR_ID
            ) {
              const data = JSON.parse(message.value.toString());
              console.log(
                `Setting Avatar of User having user Id ${data.user_id}`
              );

              const user = await User.findById(data.user_id);
              if (user) {
                const avatar_url = await cloudinary(data.localpath);
                if (avatar_url) {
                  user.avatar = avatar_url;
                  await user.save({ validateBeforeSave: true });
                }
                fs.unlink(data.localpath, (err) => {
                  if (err) {
                    console.error(
                      `Error deleting file ${data.localpath}:`,
                      err
                    );
                  } else {
                    console.log(`File ${data.localpath} deleted successfully.`);
                  }
                });
              }
            } else if (partition == process.env.KAFKA_CHAT_VERIFY_MAIL_ID) {
              const data = JSON.parse(message.value.toString());
              console.log(`Sending verification mail to ${data.to}`);
              await transporter.sendMail({
                to: data.to,
                from: data.from,
                subject: data.subject,
                html: data.html,
              });
            } else if (partition == process.env.KAFKA_CHAT_OFFLINE_ID) {
              const key = message.key.toString();
              const value = JSON.parse(message.value.toString());
              console.log(`Key: ${key} from kafka offline message`);
              console.log(value);
              const keyExist = await redis.keyExists(key);
              console.log(keyExist);
              if (!keyExist) return;
              await ChatMessageModel.create({
                uid: key,
                roomId: value.username,
                sender: value.sender,
                receiver: value.username,
                message: value.message,
                sendingTime: value.time,
              });
              await redis.deleteKey(key);
            } else if (partition == process.env.KAFKA_CHAT_GROUP_OFFLINE_ID) {
              const key = message.key.toString();
              const value = JSON.parse(message.value.toString());
              console.log(`Key: ${key} from kafka offline group message`);
              console.log(value);
              const keyExists = await redis.keyExists(key);
              if (!keyExists) return;
              console.log(keyExists);
              await ChatMessageModel.create({
                uid: key,
                roomId: value.groupname,
                sender: value.sender,
                receiver: value.receiver,
                message: value.message,
                sendingTime: value.time,
                roomType: "group",
              });
              await redis.deleteKey(key);
            } else if (partition == process.env.KAFKA_CHAT_DELETE_ID) {
              const key = message.key.toString();
              const value = JSON.parse(message.value.toString());
              if (!value) return;
              try {
                await DeleteMessage.create({
                  from: value.from,
                  to: value.to,
                  messageId: value.messageId,
                  name: value.name,
                });
                await redis.deleteKey(
                  `offline:delete:${value.to}:${value.messageId}`
                );
              } catch (error) {}
            } else {
              console.log("oops");
            }
          } catch (error) {
            console.log(error);
          }
        },
      });
    } catch (error) {
      console.log(`Error occured: ${error.message}`);
    }
  })
  .catch((error) => {
    console.log("Error while connecting to the Database...");
    console.log(error);
  });
