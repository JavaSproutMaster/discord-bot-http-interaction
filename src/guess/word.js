import { corpus } from "../commands/corpus.js";
import Game from "./guess.js";

export default class WordGame extends Game {

  constructor(guildId, channelId) {
    super(guildId, channelId);
  }

  startGame(category, difficulty) {
    const wordList = corpus[category][difficulty];
    const randNum = Math.floor(Math.random() * wordList.length);
    const feed = wordList[randNum];
    return feed;
  }
}