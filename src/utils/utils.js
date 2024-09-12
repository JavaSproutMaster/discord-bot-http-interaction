import NumberGame from "../guess/number.js";
import WordGame from "../guess/word.js";

export const guess = async (redisHelper, message) => {
  const guildId = message.guild.id;
  const channelId = message.channel.id;
  const key = `${guildId}_${channelId}`;
  const gameData = await redisHelper.get(key);
  const content = message.content;
  if (gameData) {
    const data = JSON.parse(gameData);
    if( data.gameType.toLowerCase() === "number") {
      const numberGame = new NumberGame(guildId, channelId);
      console.log(content);
      const resultNumberGame = await numberGame.guess(content, data);
      console.log(resultNumberGame);
      console.log(data.value);
      if (resultNumberGame.success === true) {
        await redisHelper.delete(key);
        return {
          success: true,
          msg: `*Congritulations 🏆🏆🏆!    @${message.author.globalName} guessed the correct word: ${content}.*`,
        }
      }
    }
    if( data.gameType.toLowerCase() === "word") {
      const wordGame = new WordGame(guildid, channelId);
      if (content.length === 1 && /^[a-zA-Z]$/.test(content)) {
        const res = await wordGame.guessLetter(message.content, data.value);
      }

      const res = await wordGame.guess(message.content, data);
      if (res.success) 
        return {
          success: true,
          type: 'Number',
          value: data.value,
        }
    }

  }
}