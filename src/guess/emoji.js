import { difficultyLevels } from "../commands/corpus.js";
import { emojiCategories, emojiGames } from "../commands/emojiGames.js";
import Game from "./guess.js";

export default class EmojiGame extends Game {
  constructor(redisHelper, guildId, channelId, winners) {
    super(guildId, channelId);
    this._client = redisHelper;
    this.category = '';
    this.difficulty = '';
    this.gameType = 'Emoji';
    this.participants = [];
    this.successUsers = [];
    this.attemptedUsers = [];
    this.memberCounts = [winners,1];
    this.rounds = 0;
    this.maxRounds = 1;
    this.currentGuess = null;
    this.lastGuessResult = null;
    this.startedAt = new Date();
    this.lastGuessAt = null;
    this.finishedAt = null;
    this.won = false;
    this.expireTime = 10 * 60;
    this.token = '';
  }

  async getEmojiGameData() {

    const gameData = await this._client.get(this.key);
    if (!gameData) return null;
    const data = JSON.parse(gameData);
    this.category = data.category;
    this.difficulty = data.difficulty;
    this.gameType = data.gameType;
    this.participants = data.participants;
    this.value = data.value;
    this.successUsers = data.successUsers;
    this.attemptedUsers = data.attemptedUsers;
    this.memberCounts = data.memberCounts;
    this.rounds = data.rounds;
    this.currentGuess = data.currentGuess;
    this.lastGuessResult = data.lastGuessResult;
    this.startedAt = data.startedAt;
    this.lastGuessAt = data.lastGuessAt;
    this.finishedAt = data.finishedAt;
    this.expireTime = data.expireTime;
    this.won = data.won;
    this.token = data.token;
    return data;
  }
  async setEmojiGameData() {
    const data = {
      gameType: this.gameType,
      key: this.key,
      value: this.value,
      participants: this.participants,
      successUsers: this.successUsers,
      attemptedUsers: this.attemptedUsers,
      memberCounts: this.memberCounts,
      rounds: this.rounds,
      currentGuess: this.currentGuess,
      lastGuessResult: this.lastGuessResult,
      startedAt: this.startedAt,
      lastGuessAt: this.lastGuessAt,
      finishedAt: this.finishedAt,
      expireTime: this.expireTime,
      won: this.won,
      category: this.category,
      difficulty: this.difficulty,
      token: this.token,
    }
    this._client.set(this.key, JSON.stringify(data));
    return data;
  }
  async startGame(category, difficulty, winners = 2) {
    let length = emojiGames[category].length;
    if (difficulty.toLowerCase() === 'easy') {
      length = length/3;
    }
    if (difficulty.toLowerCase() === 'medium') {
      length = length * 2 / 3;
    }
    const randNum = Math.floor(Math.random() * length);
    const feed = emojiGames[category][randNum];
    this.category = category;
    this.winners = winners;
    this.difficulty = difficulty;
    this.value = feed;
    const gameData = await this.setEmojiGameData();
    return gameData;
  }

  async startNextRound() {
    this.rounds++;
    this.successUsers.forEach( async key => {
      const gameKey = `${this.key}_${key}`
      await this._client.delete(gameKey);
    });
    const newCategory = emojiCategories[Math.floor(Math.random() * 6)];
    const newDifficulty = difficultyLevels[Math.floor(Math.random() * 3)];
    let length = emojiGames[newCategory].length;
    if (newDifficulty.toLowerCase() === 'easy') {
      length = length/3;
    }
    if (newDifficulty.toLowerCase() === 'medium') {
      length = length * 2 / 3;
    }
    const randNum = Math.floor(Math.random() * length);
    const newFeed = emojiGames[newCategory][randNum];
    this.value = newFeed;
    this.category = newCategory;
    this.difficulty = newDifficulty;
    this.participants = this.successUsers;
    this.successUsers = [];

    await this.setEmojiGameData();
  }

  async endEmojiGame() {
    this.attemptedUsers.forEach(async (userKey) => {
      const gameKey = `${this.key}_${userKey}`;
      await this._client.delete(gameKey);
    });

    await this._client.delete(this.key);
  }

  async successedUser(userId) {
    const userKey = `${this.key}_${userId}`;

    const data = this.getEmojiGameData();

    this.successUsers.push(userId);
    if (this.memberCounts[this.rounds] === 1) {
      this.endEmojiGame();
      return {
        status: 200,
        value: this.value,
        category: this.category,
        successUsers: this.successUsers,
        won: true,
        nextRound: false,
        title: 'Emoji Game finished successfully !',
        message: `:tada:Contratulations, <@${userId}>!:tada:\n
        Set <@${userId}> as a role reward of **prizeEmojiMaster**.`,
      }
    }

    if (this.successUsers.length === this.memberCounts[this.rounds]) {
      this.startNextRound();
      let userList = "";
      for(let i = 0; i < this.participants.length; i++) {
        userList += `${i+1}. <@${this.participants[i]}>`;
        if(i!== this.participants.length - 1) {
          userList += '\n';
        }
      }
      return {
        status: 200,
        value: this.value,
        category: this.category,
        won: false,
        nextRound: true,
        successUsers: this.successUsers,
        title: 'Next Round started',
        message: `Here are the participants:\n
        ${userList}\n
        Guess the emoji with the valid **${this.value.phrase.length}**-letter phrase.\n
        **hint**: ${this.value.hint}!\n
        *Click the following button to guess the emoji*...`
      }
    }

    await this.setEmojiGameData();
    let userList = "";
    for(let i = 0; i < this.successUsers.length; i++) {
      userList += `${i+1}. <@${this.successUsers[i]}>`;
      if(i!== this.successUsers.length - 1) {
        userList += '\n';
      }
    }
    return {
      status: 200,
      value: this.value,
      category: this.category,
      won: false,
      nextRound: false,
      successUsers: this.successUsers,
      title: 'Guess the emoji',
      message: `Here are the successful users!\n
      ${userList}.\n
      Guess the emoji with the valid **${this.value.phrase.length}**-letter phrase.\n
      **hint**: ${this.value.hint}!\n
      Let others continue guessing just allow 5 people or so to guess it.\n
      `
    };
  }
}
