import NumberGame from "../guess/number.js";

export const startNumberGame = async (redisHelper, message) => {
  const game = new NumberGame(message.guild_id, message.channel_id);
  const oldFeed = await redisHelper.get(game.key);
  if (oldFeed) {
    console.log(oldFeed);
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
    // remaining_attempts: game.max_attempts - 1,
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

export const guessNumber = async (redisHelper, message) => {
  const game = new NumberGame(message.guild_id, message.channel_id);
  const key = game.key;
  const gameData = await redisHelper.get(key);
  console.log(gameData);
  if (!gameData) return "Game not started yet.";
  var data = JSON.parse(gameData);
  const result = game.guess(message.data.options[0].value, data);
  if (!result.success && result.guessed) {
    data.attempts = data.attempts + 1;
    data.last_guess_time = new Date();
    data.remaining_attempts = data.remaining_attempts - 1;

    redisHelper.set(game.key, JSON.stringify(data));
  }
  if (result.success) {
    await redisHelper.delete(key);

  }
  return result;
}

export const endNumberGame = async (redisHelper, message) => {
  const game = new NumberGame(message.guild_id, message.channel_id);
  const key = game.key;
  const gameData = await redisHelper.get(key);
  await redisHelper.delete(game.key);
  if (gameData) return "Number guessing game ended.";
  return "No number guessing game found.";
}
