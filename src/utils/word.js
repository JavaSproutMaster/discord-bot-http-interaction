import { customEmojisDic } from "../commands/customEmojiDic.js";
import WordGame from "../guess/word.js";

export const startWordGame = async (redisHelper, message) => {
  const game = new WordGame(message.guild_id, message.channel_id);

  const oldFeed = await redisHelper.get(game.key);
  if (oldFeed) {
    console.log(oldFeed);
    var data = JSON.parse(oldFeed);
    return `${data.gameType} guessing game started before. Please guess the ${data.gameType.toLowerCase()}.`;
  }

  var category = "";
  var difficulty = ""
  if (message.data.options.length !== 2)
    return "You should input the category and difficulty."

  category = message.data.options[0].value;
  difficulty = message.data.options[1].value;

  const feed = game.startGame(category, difficulty);
  const gameData = {
    value: feed,
    gameType: "Word",
    category: message.data.options[0].value,
    difficulty: message.data.options[1].value,
    attempts: 0,
    current_guess: null,
    last_guess_result: null,
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

  return `We have selected a random word of ${category}.`
}

export const endWordGame = async (redisHelper, message) => {
  const game = new WordGame(message.guild_id, message.channel_id);
  const gameData = await redisHelper.get(game.key);

  var data = JSON.parse(gameData);
  if (gameData) {
    await redisHelper.delete(game.key);
    return `Game over! The word was ${data.value}. You have ${data.attempts} attempts.`;
  }
  return "No game in progress.";
}

export const guessLetter = async (redisHelper, message) => {

  const letter = message.data.options[0].value;

  if (letter.length === 1 && /^[a-zA-Z]$/.test(letter)) {
    // valid letter for input
    const game = new WordGame(message.guild_id, message.channel_id);
    const key = game.key;
    const gameData = await redisHelper.get(key);
    if (!gameData) return {
      success: false,
      message: "Game not started yet."
    } 

    var data = JSON.parse(gameData);
    if (gameData) {
      const currentGuessLower = data.value.toLowerCase();
      const result = game.guessLetter(letter, currentGuessLower);
      data.attempts = data.attempts + 1;
      data.last_guess_at = new Date();
      await redisHelper.set(key, JSON.stringify(data));
      return result;
    }
  }
  return {
    success: false,
    message: "Invalid input. Please enter a valid single letter."
  } 
}


export const guessWord = async (redisHelper, message) => {
  const game = new WordGame(message.guild_id, message.channel_id);
  const key = game.key;
  const gameData = await redisHelper.get(key);
  if (!gameData) return {
    success: false,
    message: "Game not started yet."
  } 
  var data = JSON.parse(gameData);

  const guessingWord = message.data.options[0].value;
  const result = game.guessWord(guessingWord, data.value);
  if (result) {
    // success, delete the game status on redis
    await redisHelper.delete(key);
    return {
      success: true,
      message: `Congratulations! You guessed the word correctly. The word was ${data.value}.`,
      value: data.value,
    }
  }
  else {
    // update the gamestatus of word game...
    data.lost = true;
    data.finished_at = new Date();
    data.attempts = data.attempts + 1;
    data.remaining_attempts = data.remaining_attempts - 1;
    await redisHelper.set(key, JSON.stringify(data));
    console.log(data);
    return {
      success: false,
      message: `Sorry, enter a word of ${data.value.length} length from the ${data.category} category.`
    }
  }
}

export const getCustomEmoji = (word, feed) => {
  if (word.length !== feed.length) return null;

  var result = '';
  for (let i = 0; i < word.length; i++) {
    if (word[i] === feed[i]) result = result + getEmojiCharacter(word[i], 'rpos');
    else if (feed.includes(word[i])) result = result + getEmojiCharacter(word[i], 'fpos');
    else result = result + getEmojiCharacter(word[i], 'npos');
  }
  return result;
}

const getEmojiCharacter = (char, cat) => {
  // TODO: fetch the emoji from a database or a file based on the category and character
  const emojiVal = customEmojisDic[cat][char];
  return `<:${emojiVal.value}:${emojiVal.id}>`;
}