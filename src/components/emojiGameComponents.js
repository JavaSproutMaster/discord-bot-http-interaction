import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export const startEmojiGameComponent = (value) => {
  const guessButton = new ButtonBuilder()
  .setLabel('Guess')
  .setCustomId('start_guess_emoji_button')
  .setStyle(ButtonStyle.Primary)
  .setEmoji('1285976321184235571');
  const embed = new EmbedBuilder()
    .setTitle('Guess the emoji')
    .setDescription(`Guess the emoji with the valid **${value.phrase.length}**-letter phrase.\n
      **hint**: ${value.hint}\n
      *Click the following button to guess the emoji...*\n
      `);
  const row = new ActionRowBuilder().addComponents(guessButton);
  return {
    content: `\n
    Emoji Game started! 🚀
    ${value.emoji}\n`,
    embeds: [embed.toJSON(),],
    components : [
      row.toJSON(),
    ]
  };
} 

export const successEmojiGameComponent = (rGuessEmojiGame, userId) => {

  const guessButton = new ButtonBuilder()
  .setLabel('Guess')
  .setCustomId('guess_emoji_button')
  .setStyle(ButtonStyle.Primary)
  .setEmoji('1285976321184235571');
  const embed = new EmbedBuilder()
    .setTitle(rGuessEmojiGame.title)
    .setDescription(`${rGuessEmojiGame.message}`);
  const row = new ActionRowBuilder().addComponents(guessButton);
  if (rGuessEmojiGame.won) {
    return {
      content: ' \n Word Game started! 🚀\n\n',
      embeds: [embed.toJSON()]
    };  
  }
  return {
    content: ' \n Word Game started! 🚀\n\n',
    embeds: [embed.toJSON()],
    components : [
        row.toJSON(),
    ]
  };
}


export const wonEmojiGameComponent = (rGuessWordGame, userId) => {

  const guessButton = new ButtonBuilder()
  .setLabel('Guess')
  .setCustomId('guess_emoji_button')
  .setStyle(ButtonStyle.Primary)
  .setEmoji('1285976321184235571');
  const embed = new EmbedBuilder()
    .setTitle(':tada:Congratulations!:tada:')
    .setDescription(`**<@${userId}>** won the game. \n
      Set **<@${userId}>** as a role reward of **prize**.\n
      Guess the word in **6** tries.\n
      1. Each guess must be a valid **length**-letter word.\n
      2. The color of the tiles will change to show how close your guess was to the word.\n
      **Example**\n
      <:om:1283619926296236074>\t\t<:gu:1283619660289540127>\t\t<:l_:1283620146715299883>\t\t<:l_:1283620146715299883>\t\t<:gy:1283619751158878310>\n
      - **M** is in the word but in the wrong spot.\n
      - **U** is in the word and in the correct spot.\n
      - **L** is not in the word in any spot.\n
      - **Y** is in the word and in the correct spot.\n\n
      `);
  
  return {
    content: ' \n Word Game Finished! 🚀\n\n',
    embeds: [embed.toJSON()],
  };
}