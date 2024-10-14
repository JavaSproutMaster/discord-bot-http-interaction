export default class Game {
  constructor(guildId, channelId) {
    this.guildId = guildId;
    this.channelId = channelId;
    this.key = `${this.guildId}_${this.channelId}`;
  }
  startGame() {
    console.log(`${this.name} has started.`);
  }

  guess(val) {
    console.log(`${this.name} guessed ${val}.`);
  }

  endGame() {
    console.log(`${this.name} has ended.`);
    return this.key;
  }
}