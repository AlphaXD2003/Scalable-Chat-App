const { Server } = require("socket.io");
const ApiErrors = require("../utils/ApiError");
const { redis } = require("../redis/redis");
const { v4: uuid } = require("uuid");
const { produceInKakfa } = require("../kafka/producer");
const { ChatMessageModel } = require("../models/message.model");
const User = require("../models/user.models");
const { GroupInfo } = require("../models/groupsInfo.models");
class Socket {
  constructor(WebServer) {
    this.messages = { isSubscribed: false };
    this.groupmessages = { isSubscribed: false };
    this.delete_message = { isSubscribed: false };
    this.socketio = new Server(WebServer, {
      cors: {
        origin: ["http://localhost:5173"],
        credentials: true,
      },
    });
    this.initializeEventListeners();
  }
  initializeEventListeners() {
    this.socketio.on("connection", async (socket) => {
      // Ensure single subscription to the Redis channel
      if (!this.messages.isSubscribed) {
        await redis.subscribeChannel("messages", async (data) => {
          console.log("Subscribed messages", JSON.parse(data));

          const adata = JSON.parse(data);
          console.log(adata.username);
          const userstatus = await redis.getValue(adata.username);
          console.log(userstatus);
          console.log(`Adata: `, adata);
          if (userstatus === "offline" || !userstatus) {
            console.log(`${adata.username} is offline.`);

            await redis.setValue({
              key: `offline:${adata.username}:${adata.uid}`,
              value: JSON.stringify({
                ...adata,
                time: new Date(),
                roomType: "private",
              }),
            });
            await produceInKakfa({
              topic: process.env.KAFKA_TOPIC,
              messages: [
                {
                  key: `offline:${adata.username}:${adata.uid}`,
                  value: JSON.stringify({
                    ...adata,
                    time: Date.now(),
                  }),
                  partition: process.env.KAFKA_CHAT_OFFLINE_ID,
                },
              ],
            });
          } else {
            this.socketio.to(adata.username).emit("receive_message", adata);
          }
        });
        this.messages.isSubscribed = true;
      }

      if (!this.groupmessages.isSubscribed) {
        await redis.subscribeChannel("group_messages", async (data) => {
          const adata = JSON.parse(data);
          const uid = adata.uid;
          const message = adata.message;
          const groupname = adata.groupname;
          console.log("Groupname: ", groupname);
          this.socketio.to(groupname).emit("receive_group_message", adata);
          const groupinfo = await GroupInfo.find({ groupname });
          console.log("Groupinfo: ");
          console.log(groupinfo);
          let usernameOfTheGroup = [];

          const promises = groupinfo.map(async (group) => {
            const user = await User.findById(group.memberId);

            console.log(`User Info of group ${groupname}`);
            console.log(user.username);
            if (!usernameOfTheGroup.includes(user.username)) {
              usernameOfTheGroup.push(user.username);
            }
            console.log(`${usernameOfTheGroup}`);
          });

          // Wait for all promises to resolve
          await Promise.all(promises);
          console.log(`Username of the memebers in group ${groupname}`);
          console.log(usernameOfTheGroup);
          usernameOfTheGroup.forEach(async (username) => {
            const userstatus = await redis.getValue(username);
            if (userstatus === "offline" || undefined) {
              await redis.setValue({
                key: `offlinegroup:${groupname}:${username}:${uid}`,
                value: JSON.stringify({
                  ...adata,
                  time: Date.now(),
                  receiver: username,
                }),
              });

              await produceInKakfa({
                topic: process.env.KAFKA_TOPIC,
                messages: [
                  {
                    key: `offlinegroup:${groupname}:${username}:${uid}`,
                    value: JSON.stringify({
                      ...adata,
                      time: Date.now(),
                      receiver: username,
                    }),
                    partition: Number(process.env.KAFKA_CHAT_GROUP_OFFLINE_ID),
                  },
                ],
              });
            }
          });
        });
        this.groupmessages.isSubscribed = true;
      }
      if (!this.delete_message.isSubscribed) {
        await redis.subscribeChannel("delete_message", async (data) => {
          const adata = JSON.parse(data);
          this.socketio.to(adata.name).emit("delete_msg_online", adata);
        });
        this.delete_message.isSubscribed = true;
      }

      console.log(`New Socket connected: ${socket.id}`);
      const username = socket.handshake.query.username;
      try {
        if (!username)
          throw new ApiErrors(401, "Socket is not having username");
      } catch (error) {
        return;
      }
      let userdata = await User.findOne({ username });
      const groups = await GroupInfo.find({ memberId: userdata._id });
      socket.groups = [];
      groups.forEach((group) => {
        socket.join(group.groupname);
        socket.groups.push(group.groupname);
      });
      console.log("The groups , socket in..");
      console.log(socket.groups);

      socket.join(username);
      socket.username = username;
      await redis.setValue({
        key: socket.username,
        value: "online",
        expiryInMinutes: 0.5,
      });
      // Heartbeat mechanism to keep the user status "online"
      const heartbeatInterval = setInterval(async () => {
        await redis.setValue({
          key: socket.username,
          value: "online",
          expiryInMinutes: 0.5,
        });
      }, 0.5 * 60 * 1000); // Update every 30

      // sending offline private messages
      const offlineMessageKeys = await redis.getKeys(`offline:${username}:*`);
      console.log(offlineMessageKeys);
      let offlineMessage = [];
      for (const key of offlineMessageKeys) {
        console.log(key);
        const data = await redis.getValue(key);
        console.log(data);
        await redis.deleteKey(key);
        await produceInKakfa({
          topic: process.env.KAFKA_TOPIC,
          messages: [
            {
              key: key,
              value: null, // Tombstone message
              partition: process.env.KAFKA_CHAT_OFFLINE_ID,
            },
          ],
        });
        offlineMessage.push(JSON.parse(data));
      }

      const messagesFromDB = await ChatMessageModel.find({
        $and: [
          {
            receiver: socket.username,
          },
          {
            roomType: "private",
          },
        ],
      });

      offlineMessage = [...offlineMessage, ...messagesFromDB];
      console.log("All Offline messages are : ");
      console.log(offlineMessage);

      console.log("Sending offline messages to ", socket.username);
      socket.emit("message:offline", offlineMessage);
      offlineMessage = [];

      // sending offline private messages
      let offLineGroupMessages = [];
      const groupPromise = socket.groups.map(async (group) => {
        const offlineGroupMessageKeys = await redis.getKeys(
          `offlinegroup:${group}:${username}:*`
        );
        for (const key of offlineGroupMessageKeys) {
          const data = await redis.getValue(key);
          await redis.deleteKey(key);
          await produceInKakfa({
            topic: process.env.KAFKA_TOPIC,
            messages: [
              {
                key: key,
                value: null, // Tombstone message
                partition: process.env.KAFKA_CHAT_GROUP_OFFLINE_ID,
              },
            ],
          });
          offLineGroupMessages.push(JSON.parse(data));
        }
      });
      await Promise.all(groupPromise);
      console.log(socket.username);
      const groupmessagesFromDB = await ChatMessageModel.find({
        $and: [
          {
            receiver: socket.username,
          },
          {
            roomType: "group",
          },
        ],
      });
      console.log(groupmessagesFromDB);
      console.log("Sending offline group messages to ", socket.username);
      offLineGroupMessages = [...groupmessagesFromDB, ...offLineGroupMessages];
      socket.emit("groupmessage:offline", offLineGroupMessages);
      offLineGroupMessages = [];
      await ChatMessageModel.deleteMany({
        receiver: socket.username,
      });
      socket.on("send_message", async (data) => {
        console.log(data);
        const username = data.username;
        const userstatus = await redis.getValue(data?.username);
        if (!userstatus) {
          socket.emit("error_msg", { error_message: "username is not valid" });
          return;
        }
        const message = data.message;
        const sender = socket.username;
        const uid = data.mid;

        await redis.publishMessage({
          channel: "messages",
          message: JSON.stringify({
            ...data,
            sender,
            uid,
          }),
        });
      });

      socket.on("group_message_send", async (data) => {
        const uid = data.mid;

        await redis.publishMessage({
          channel: "group_messages",
          message: JSON.stringify({ ...data, uid, sender: socket.username }),
        });
      });

      socket.on("delete_message", async (data) => {
        await redis.publishMessage({
          channel: "delete_message",
          message: JSON.stringify({ ...data, timestamp: new Date() }),
        });
      });

      socket.on("disconnect", async () => {
        await redis.setValue({ key: socket.username, value: "offline" });
        socket.username = undefined;
        clearInterval(heartbeatInterval);
        socket.groups = [];
      });
    });
  }
}

module.exports = { Socket };
