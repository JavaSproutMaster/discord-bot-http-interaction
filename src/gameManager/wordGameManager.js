import { difficultyLevels, wordCategories } from "../commands/corpus.js";
import WordGame from "../guess/word.js";
import { getCustomEmoji } from "../utils/word.js";
import { UserWordGameManager } from "./userWordGameManager.js";

export class WordGameManager {
  constructor(redis, value, guildId, channelId, participants=[], successUsers=[], attemptedUsers=[], rounds=0, category, difficulty, winners, token) {
    this.category = category;
    this.difficulty = difficulty;
    this._client = redis;
    this.value = value;
    this.gameKey = `${guildId}_${channelId}`;
    this.gameType = 'Word';
    this.participants = participants;
    this.successUsers = successUsers;
    this.attemptedUsers = attemptedUsers;
    this.memberCounts = [winners,1];
    this.rounds = rounds;
    this.maxRounds = 1;
    this.currentGuess = null;
    this.lastGuessResult = null;
    this.startedAt = new Date();
    this.lastGuessAt = null;
    this.finishedAt = null;
    this.won = false;
    this.expireTime = 10 * 60;
    this.token = token;
  }
  finishGame() {
    this.won = true;
  }
  startNextRound() {
    this.increaseRounds();
    this.setParticipants(this.successUsers);
    this.setSuccessUsers([]);
    const gid = this.gameKey.split('_')[0]
    const cid = this.gameKey.split('_')[1]
    const game = new WordGame(gid, cid);
    const newCategory = wordCategories[Math.floor(Math.random() * 10)];
    const newDifficulty = difficultyLevels[Math.floor(Math.random() * 3)];
    const newFeed = game.startGame(newCategory, newDifficulty);
    this.value = newFeed;  
    this.category = newCategory;
    this.difficulty = newDifficulty;
  }
  congritulation(userId) {
    this.successUsers.push(userId);
    if (this.rounds === this.maxRounds || this.memberCounts[this.rounds] === 1) {
      this.finishGame();
      return;
    }
    if (this.successUsers.length === this.memberCounts[this.rounds]) {
      this.startNextRound();
    }
  }
  async guess(userId, word) {
    // validate word length
    if (word.length !== this.value.length) {
      return {
        attempted: false,
        length: false,
        success: false,
        guessResults: [],
        message: `Invalid word length.\nThe length of the word is ${this.value.length}.`,
        remainingAttempts: 6,
      };
    }
    // validate user can guess or not
    // user inside participants and not inside successUsers are allowed to guess...
    const userKey = `${this.gameKey}_${userId}`;
    const userGameData = await this._client.get(userKey);

    const userGameKey = this.gameKey + '_' + userId;
    const userWordGameManager = new UserWordGameManager(userGameKey, 'Word');
    
    if ((this.rounds === 0 || this.participants.includes(userId)) && !this.successUsers.includes(userId)) {

      this.lastGuessAt = new Date();

      // check userWordGameManager

      if (userGameData) {
        const userData = JSON.parse(userGameData);

        if (userData.remainingAttempts <= 0) {
          // await this._client.delete(userKey);
          return {
            success: false,
            won: false,
            attempted: false,
            length: true,
            guessResult: userData.guessResults,
            remainingAttempts: userData.remainingAttempts,
            message: "You are out of guesses for this game! Better luck next game!",
          }
        }
        userWordGameManager.setAttempts(userData.attempts);
        userWordGameManager.setGuessResults(userData.guessResults);
      }
      // add attempted new users to the list
      if (!this.attemptedUsers.includes(userKey)) {
        this.attemptedUsers.push(userKey);
      }
      const result = getCustomEmoji(word, this.value);
      userWordGameManager.addGuessResults(result);
      // successfully guessed
      if (word.toLowerCase() === this.value.toLowerCase()) {
        // clear userGameData
        const currentRound = this.rounds;
        this.congritulation(userId);
        
        if (this.won) {
          const gameData = userWordGameManager.getGameData();
          // remove all users Data
          this.attemptedUsers.forEach(async userKey => {
            await this._client.delete(userKey);
          });
          const value = this.value;
          await this._client.delete(this.gameKey);
          return {
            won: true,
            attempted: true, 
            success: true,
            value: value,
            length: true,
            startedNextRound: false,
            category: gameData.category,
            guessResult: gameData.guessResults,
          };
        }
        else if (currentRound < this.rounds) {
          const gameData = userWordGameManager.getGameData();
          const successUsers = this.participants;
          this.attemptedUsers.forEach(async userKey => {
            await this._client.delete(userKey);
          });
          return this.saveGameDataAndReturn({
            length: true,
            success: true,
            value: this.value,
            won: false,
            attempted: true,
            startedNextRound: true,
            category: this.category,
            difficulty: this.difficulty,
            successUsers: successUsers,
            rounds: this.rounds + 1,
            guessResult: gameData.guessResults,
            remainingAttempts: gameData.remainingAttempts,
          });
        }
        return this.saveGameDataAndReturn({
          length: true,
          success: true,
          value: this.value,
          won: false,
          successUsers: this.successUsers,
          attempted: true,
          startedNextRound: false,
          guessResult: userWordGameManager.getGameData().guessResults,
          remainingAttempts: userWordGameManager.getGameData().remainingAttempts,
        });
      }
      if (!this.won) {
        await this._client.set(userGameKey, JSON.stringify(userWordGameManager.getGameData()));
      }

      return this.saveGameDataAndReturn({
        length: true,
        success: false,
        won: false,
        attempted: true,
        guessResult: userWordGameManager.getGameData().guessResults,
        remainingAttempts: userWordGameManager.getGameData().remainingAttempts,
      });
    }
    if (this.successUsers.includes(userId)) {
      
      return {
        success: false,
        won: false,
        attempted: false,
        guessResult: null,
        message: `*<@${userId}> cannot guess anymore.  \n:tada:You have successed already. :tada:*`,
      }
    }
    if (this.rounds !== 0 && !this.participants.includes(userId)) {
      return {
        success: false,
        attempted: false,
        message: `<@${userId}> cannot guess. You are not inside the participants.\n`,
      } 
    }
    return {
      success: false,
      attempted: false,
      message: `<@${userId}> cannot guess anymore.  You have exceeded the maximum number of attempts. \n`,
    }
  }
  getGameType() {
    return this.gameType;
  }
  setGameType(gameType) {
    this.gameType = gameType.toLowerCase();
  }
  getValue() {
    return this.value;
  }
  setValue(value) {
    this.value = value;
  }
  getParticipants() {
    return this.participants;
  }
  setParticipants(participants) {
    this.participants = participants;
  }
  addParticipant(participant) {
    this.participants.push(participant);
  }
  setSuccessUsers(users) {
    this.successUsers = users;
  }
  addsuccessUser(user) {
    this.successUsers.push(user);
  }
  setRounds(rounds) {
    this.rounds = rounds;
  }
  getRounds() {
    return this.rounds;
  }

  increaseRounds() {
    this.rounds = this.rounds + 1;
  }

  getMemberCount() {
    return this.memberCounts[this.rounds];
  }

  getGameData() {
    return {
      gameType: this.gameType,
      gameKey: this.gameKey,
      value: this.value,
      participants: this.participants,
      successUsers: this.successUsers,
      attemptedUsers: this.attemptedUsers,
      memberCounts: this.memberCounts,
      rounds: this.rounds,
      attempts: this.attempts,
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
  }

  async startGame() {
    const gameData = this.gameData();
    await this._client.set(this.gameKey, JSON.stringify(gameData));
  }

  async saveGameDataAndReturn(returnVal) {
    const gameData = this.getGameData();

    await this._client.set(this.gameKey, JSON.stringify(gameData));
    return returnVal;
  }

  async endGame() {
    await this._client.delete(this.gameKey);
    this.attemptedUsers.forEach(async userKey => await this._client.delete(userKey));
  }
}