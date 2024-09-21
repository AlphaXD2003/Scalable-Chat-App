const { createClient } = require("redis");

class Redis {
  constructor() {
    // this.init()
    //   .then(() => {})
    //   .catch((error) => console.log(`Redis Client Error ${err}`));
  }
  async init() {
    this.redis = await createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    })
      .on("error", (err) => console.log(`Redis Client Error ${err}`))
      .connect();
    console.log(`Redis is connected...`);

    this.publisher = await createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    })
      .on("error", (err) => console.log(`Redis Pub Error ${err}`))
      .connect();
    console.log(`Redis Publisher is connected...`);

    this.subscriber = await createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    })
      .on("error", (err) => console.log(`Redis Sub Error ${err}`))
      .connect();
    console.log(`Redis Subscriber is connected...`);
  }

  async setValue({ key, value, expiryInMinutes }) {
    if (expiryInMinutes) {
      await this.redis.set(key, value, {
        EX: expiryInMinutes * 60,
      });
    } else {
      await this.redis.set(key, value);
    }
  }

  async getValue(key) {
    const value = await this.redis.get(key);
    return value;
  }

  async getKeys(pattern) {
    const keys = await this.redis.keys(pattern);
    return keys;
  }

  async keyExists(key) {
    const keyExist = await this.redis.exists(key);
    return keyExist;
  }

  async deleteKey(key) {
    await this.redis.del(key);
  }

  async publishMessage({ channel, message }) {
    await this.publisher.publish(channel, message);
  }

  async subscribeChannel(channel, callback) {
    await this.subscriber.subscribe(
      channel,
      async (message) => await callback(message)
    );
  }
}

const redis = new Redis();
module.exports = { redis };
