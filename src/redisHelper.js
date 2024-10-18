class RedisHelper {
  
  constructor(client) {
    this.client = client;
    this.expireTime = 5 * 60;
  }

  // constructor(client, expireTime) {
  //   this.client = client;
  //   this.expireTime = expireTime
  // }
  
  async set(key, value, expireTime) {
    if (!expireTime)
      await this.client.set(key, value, 'EX', this.expireTime);
    else
      await this.client.set(key, value, 'EX', expireTime);
  }

  async get(key) {
    return await this.client.get(key);
  }

  async delete(key) {
    await this.client.del(key);
  }
}

export default RedisHelper;