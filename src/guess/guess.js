export default class Game {
  
  // constructor(name) {
  //   this.name = name;
  //   this.key = this.name.toLowerCase();
  // }

  // constructor(name, guildId) {
  //   this.name = name;
  //   this.guildId = guildId;
  //   this.key = `${this.name}_${this.guildId}`;
  // }

  // constructor(name, guildId, channelId) {
  //   this.name = name;
  //   this.guildId = guildId;
  //   this.channelId = channelId;
  //   this.key = `${this.name}_${this.guildId}_${this.channelId}`;
  // }
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