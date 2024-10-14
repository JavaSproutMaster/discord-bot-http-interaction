import NumberGame from "../guess/number.js";

export const startNumberGame = async (redisHelper, message) => {
  const game = new NumberGame(message.guild_id, message.channel_id);
  const oldFeed = await redisHelper.get(game.key);
  if (oldFeed) {
    const data = JSON.parse(oldFeed);
    return {
      success: false,
      msg: `${data.gameType} guessing game started before. Please guess the ${data.gameType.toLowerCase()}.`
    }
  }
  const feed = game.startGame(message.data.options[0].value);

  const gameData = {
    value: feed,
    gameType: "Number",
    max_value: message.data.options[0].value,
    attempts: 0,
    current_guess: null,
    last_guess_result: null,
    last_guess_time: null,
    remaining_attempts: 100,
    started_at: new Date(),
    last_guess_at: null,
    finished_at: null,
    won: false,
    lost: false,
    tied: false,
    expireTime: game.expireTime,
  }
  await redisHelper.set(game.key, JSON.stringify(gameData));
  return {
    success: true,
    msg: `We have selected a random number between 1 and ${message.data.options[0].value}.`
  }
}

export const guess = async (redisHelper, message) => {
  const guildId = message.guild.id;
  const channelId = message.channel.id;
  const key = `${guildId}_${channelId}`;
  const gameData = await redisHelper.get(key);
  const content = message.content;
  if (gameData) {
    const data = JSON.parse(gameData);
    if( data.gameType.toLowerCase() === "number") {
      const numberGame = new NumberGame(guildId, channelId);
      const resultNumberGame = await numberGame.guess(content, data);
      if (resultNumberGame.success === true) {
        await redisHelper.delete(key);
        return {
          success: true,
          msg: `*Congritulations 🏆🏆🏆!    @${message.author.globalName} guessed the correct word: ${content}.*`,
        }
      }
    }
  }
}

export const endNumberGame = async (redisHelper, message) => {
  const game = new NumberGame(message.guild_id, message.channel_id);
  const key = game.key;
  const gameData = await redisHelper.get(key);
  await redisHelper.delete(game.key);
  if (gameData) return "Number guessing game ended.";
  return "No number guessing game found.";
}
