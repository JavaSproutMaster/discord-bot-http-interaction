import { corpus } from "../commands/corpus.js";
import Game from "./guess.js";

export default class WordGame extends Game {

  constructor(guildId, channelId) {
    // super('wordGame', guildId, channelId);
    super(guildId, channelId);
  }

  startGame(category, difficulty) {
    const wordList = corpus[category][difficulty];
    const randNum = Math.floor(Math.random() * wordList.length);
    const feed = wordList[randNum];
    return feed;
  }

  guessLetter(letter, feed) {
    if (feed.includes(letter)) {
      return {
        success: true,
        message: `Correct! The letter ${letter} is present in the word.`
      }
    }
    else
      return {
        success: false,
        message: `Incorrect! The letter ${letter} is not present in the word.`
      }
  }
  guessWord(word, feed) {
    if (word.toLowerCase() === feed.toLowerCase()) {
      return true;
    }
    
    return false;
  }
}