import { UserWordGameManager } from "../gameManager/userWordGameManager.js";
import EmojiGame from "../guess/emoji.js"

export const startEmojiGame = async (redisHelper, guildId, channelId, category, difficulty, winners) => {
  const game = new EmojiGame(redisHelper, guildId, channelId, winners);
  const oldData = await redisHelper.get(game.key);
  if (oldData) {
    const data = JSON.parse(oldData);
    return {
      success: false,
      value: null,
      msg: `${data.gameType} guessing game started before. Please guess the ${data.gameType.toLowerCase()}.`
    }
  }
  const gameData = await game.startGame(category, difficulty, winners);

  return {
    success: true,
    value: gameData.value,
    msg: `Guess the ${gameData.gameType.toLowerCase()}.\n
    ${gameData.value.emoji}\n
    hint: ${gameData.value.hint}`
  }
}

export const endEmojiGame = async (redisHelper, guildId, channelId) => {
  const game = new EmojiGame(redisHelper, guildId, channelId);
  const gameKey = game.key;
  const gameData = await redisHelper.get(gameKey);
  if (!gameData) return "Game not started yet.";
  var data = JSON.parse(gameData);

  if (gameData) {
    game.attemptedUsers = data.attemptedUsers;
    await game.endEmojiGame();
    return `Game over! The emoji was ${data.value.phrase}.`;
  }
  return "No game in progress.";
}

export const guessEmojiGame = async (redisHelper, guildId, channelId, userId, word) => {
  const game = new EmojiGame(redisHelper, guildId, channelId);
  const gameData = await game.getEmojiGameData();
  if (!gameData) return {
    status: 404,
    message: "No game in progress."
  };
  const userKey = `${game.key}_${userId}`;
  const userGameData = JSON.parse(await redisHelper.get(userKey));
  const userGameManager = new UserWordGameManager(userKey, 'Emoji');
  if (!game.attemptedUsers.includes(userId))
    game.attemptedUsers.push(userId);

  // valid user's permission to guess
  if (gameData.rounds > 0 && !gameData.participants.includes(userId)) {
    return {
      status: 403,
      message: `Sorry, you cannot guess the emoji in this round.`
    }
  }
  // valid remain attempts of user
  if (userGameData && userGameData.remainingAttempts <= 0) {
    return {
      status: 403,
      message: "You are no longer able to make guesses as you have exceeded the maximum limit of **6** attempts."
    }
  }
  if (gameData.successUsers.includes(userId)) {
    return {
      status: 403,
      message: `You've already successed! Enjoy with the next round!.`
    }
  }
  // valid attempted user
  userGameManager.setAttempts(userGameData?.attempts || 0);
  userGameManager.setGuessResults(userGameData?.guessResults || []);

  // update userGameData
  userGameManager.addGuessResults(word);
  const updatedUserGameData = userGameManager.getGameData();
  await redisHelper.set(userKey, JSON.stringify(updatedUserGameData));
  if (gameData.value.phrase.toLowerCase() === word.toLowerCase()) {
    const matchResult = await game.successedUser(userId);
    return matchResult;
  } else {
    await game.setEmojiGameData();
    return {
      status: 500,
      message: "Sorry, that's not the correct answer. Try again."
    }
  }
}