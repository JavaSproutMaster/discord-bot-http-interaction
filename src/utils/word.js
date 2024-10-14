import { customEmojisDic } from "../commands/customEmojiDic.js";
import { WordGameManager } from "../gameManager/wordGameManager.js";
import WordGame from "../guess/word.js";

export const startWordGame = async (redisHelper, category, difficulty,  guildId, channelId, initialWinners = 5, token) => {
  const game = new WordGame(guildId, channelId);
  const oldFeed = await redisHelper.get(game.key);
  if (oldFeed) {
    var data = JSON.parse(oldFeed);
    return {
      value: null,
      message: `${data.gameType} guessing game started before. Please guess the ${data.gameType.toLowerCase()}.`
    };
  }
  const feed = game.startGame(category, difficulty);
  const gameManager = new WordGameManager(redisHelper, feed, guildId, channelId, [], [], [], 0, category, difficulty, initialWinners, token);
  const gameData = gameManager.getGameData();
  await redisHelper.set(game.key, JSON.stringify(gameData));

  return {
    value: gameData.value,
    category: gameData.category,
    difficulty: gameData.difficulty
  }
}

export const endWordGame = async (redisHelper, message) => {
  const game = new WordGame(message.guild_id, message.channel_id);
  const gameKey = game.key;
  const gameData = await redisHelper.get(gameKey);
  if (!gameData) return "Game not started yet.";
  var data = JSON.parse(gameData);

  const gameManager = new WordGameManager(redisHelper, data.value, message.guild_id, message.channel_id, data.participants, data.successUsers, data.attemptedUsers, data.rounds, data.token);
  if (gameData) {
    await gameManager.endGame();
    return `Game over! The word was ${data.value}. 💥`;
  }
  return "No game in progress.";
}

export const guessWord = async (redisHelper, guildId, channelId, userId, val) => {
  const game = new WordGame(guildId, channelId);
  const gameKey = game.key;
  const gameData = await redisHelper.get(gameKey);
  if (!gameData) return {
    success: false,
    message: "Game not started yet."
  } 
  var data = JSON.parse(gameData);

  const gameManager = new WordGameManager(redisHelper, data.value, guildId, channelId, data.participants, data.successUsers, data.attemptedUsers, data.rounds, data.category, data.difficulty, data.memberCounts[0], data.token);
  const result = await gameManager.guess(userId, val);

  return result;
}

export const getCustomEmoji = (word, feed) => {
  if (word.length !== feed.length) return null;
  const wword = word.toLowerCase();
  const ffeed = feed.toLowerCase();
  var result = '';
  for (let i = 0; i < wword.length; i++) {
    if (wword[i] === ffeed[i]) result = result + getEmojiCharacter(0, wword[i]);
    else if (ffeed.includes(wword[i])) result = result + getEmojiCharacter(1, wword[i]);
    else result = result + getEmojiCharacter(2, wword[i]);
  }
  return result;
}

const getEmojiCharacter = (cat, char) => {
  // TODO: fetch the emoji from a database or a file based on the category and character
  const emojiVal = customEmojisDic[cat][char];
  return `<:${emojiVal.value}:${emojiVal.id}>`;
}

