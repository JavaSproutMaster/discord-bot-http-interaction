class RedisHelper {
  
  constructor(client) {
    this.client = client;
    this.expireTime = 10 * 60;
  }
  
  async set(key, value, expireTime) {
    if (!expireTime)
      await this.client.set(key, value);
    else
      await this.client.set(key, value);
  }

  async get(key) {
    return await this.client.get(key);
  }

  async delete(key) {
    await this.client.del(key);
  }
}

export default RedisHelper;
