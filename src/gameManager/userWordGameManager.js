export class UserWordGameManager {
  constructor(userGameKey, gameType, maxAttempts = 6) {
    this.gameType = gameType;
    this.userGameKey = userGameKey;
    this.attempts = 0;
    this.guessResults = [];
    this.remainingAttempts = maxAttempts,
    this.maxAttempts = maxAttempts;
    this.started_at = new Date();
    this.last_guess_at = null;
    this.finished_at = null;
    this.expireTime = 10 * 60;
  }

  getAttempts() {
    return this.attempts;
  }
  setAttempts(attempts) {
    this.attempts = attempts;
    this.remainingAttempts = this.maxAttempts - attempts;
  }
  getRemainingAttempts() {
    return this.remainingAttempts;
  }
  increaseAttempt() {
    this.attempts++;
    this.remainingAttempts --;
    this.last_guess_at = new Date();
  }
  getGuessResults() {
    return this.guessResults;
  }
  setGuessResults(guessResults) {
    this.guessResults = guessResults;
  }
  addGuessResults(guessResult) {
    this.guessResults.push(guessResult);
    this.increaseAttempt();
  }
  startNextRoundGame() {
    this.attempts = 0;
    this.started_at = new Date();
    this.remainingAttempts = this.maxAttempts;
    this.last_guess_at = null;
    this.guessResults = [];

    this.finished_at = null;
  }

  getGameData() {
    return {
      gameType: this.gameType,
      userGameKey: this.userGameKey,
      attempts: this.attempts,
      guessResults: this.guessResults,
      remainingAttempts: this.remainingAttempts,
      startedAt: this.started_at,
      lastGuessAt: this.last_guess_at,
      finishedAt: this.finished_at, 
      expireTime: this.expireTime,
      maxAttempts: this.maxAttempts,
    }
  }
}