import Game from "./guess.js";

export default class NumberGame extends Game {
  constructor(guildId, channelId) {
    // super('numberGame', guildId, channelId);
    super(guildId, channelId);
  }

  startGame(max) {
    this.max = max;
    const randNum = Math.floor(Math.random() * max) + 1;
    return randNum < 0 ? 0: randNum;
  }

  guess(num, gameData) {
    if (!parseInt(num)) return {
      success: false,
      guessed: true,
      msg: "Input valid number ..."
    }
    const {
      value,
      max_value,
    } = gameData;
    if (value === undefined) return {
      success: false,
      guessed: false,
      msg: "Game not started yet."
    }
    let number = parseInt(num);
    if (number === undefined) return {
      success: false,
      guessed: false,
      msg: "Input valid value ..."
    }
    if (number < 0 || number > max_value) return {
      success: false,
      guessed: false,
      msg: `Input valid value in range of [0, ${max_value}] ...`
    }
    if (number === value) {
      return {
        success: true,
        guessed: true,
        msg: `Congratulations! `,
        value: value
      };
    }
    if (num < value) return {
      success: false,
      guessed: true,
      msg: "higher"
    }
    if( num > value) return {
      success: false,
      guessed: true,
      msg: "lower"
    };
  }
}