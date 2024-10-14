import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export const startWordGameComponent = (value, category, difficulty) => {
  const guessButton = new ButtonBuilder()
  .setLabel('Guess')
  .setCustomId('start_guess_word_button')
  .setStyle(ButtonStyle.Primary)
  .setEmoji('1285976321184235571');
  const embed = new EmbedBuilder()
    .setTitle('How To Play')
    .setDescription(`Guess the word in **6** tries.\n
      1. Each guess must be a valid **${value.length}**-letter word in **${category}**.\n
      2. The color of the tiles will change to show how close your guess was to the word.\n
      **Example**\n
      <:om:1283619926296236074>\t\t<:gu:1283619660289540127>\t\t<:l_:1283620146715299883>\t\t<:l_:1283620146715299883>\t\t<:gy:1283619751158878310>\n
      - **M** is in the word but in the wrong spot.\n
      - **U** is in the word and in the correct spot.\n
      - **L** is not in the word in any spot.\n
      - **Y** is in the word and in the correct spot.\n
      *Click the following button to guess the word...*\n
      `);
  const row = new ActionRowBuilder().addComponents(guessButton);

  return {
    content: ' \n Word Game started! 🚀\n\n',
    embeds: [embed.toJSON(),],
    components : [
      row.toJSON(),
    ]
  };
} 

export const successWordGameComponent = (rGuessWordGame, category, userId) => {
  const successUsers = rGuessWordGame.successUsers;
  let userList = "";
  for(let i = 0; i < successUsers.length; i++) {
    userList += `${i+1}. <@${successUsers[i]}>`;
    if(i!== successUsers.length - 1) {
      userList += '\n';
    }
  }
  const guessButton = new ButtonBuilder()
  .setLabel('Guess')
  .setCustomId('guess_word_button')
  .setStyle(ButtonStyle.Primary)
  .setEmoji('1285976321184235571');
  const embed = new EmbedBuilder()
    .setTitle('How To Play')
    .setDescription(`Guess the word in **6** tries.\n
      1. Each guess must be a valid **${rGuessWordGame.value.length}**-letter word in **${category}**.\n
      2. The color of the tiles will change to show how close your guess was to the word.\n
      **Example**\n
      <:om:1283619926296236074>\t\t<:gu:1283619660289540127>\t\t<:l_:1283620146715299883>\t\t<:l_:1283620146715299883>\t\t<:gy:1283619751158878310>\n
      - **M** is in the word but in the wrong spot.\n
      - **U** is in the word and in the correct spot.\n
      - **L** is not in the word in any spot.\n
      - **Y** is in the word and in the correct spot.\n\n
      ${userList}\n
			**<@${userId}>** has guessed the word with **${6-rGuessWordGame.remainingAttempts}** guess${6-rGuessWordGame.remainingAttempts > 1 ? "es": ""} !\n\n
					Let others continue guessing just allow 5 people or so to guess it.\n\n

      *Click the following button to guess the word...*\n
      `);
  const row = new ActionRowBuilder().addComponents(guessButton);
  
  return {
    content: ' \n Word Game started! 🚀\n\n',
    embeds: [embed.toJSON()],
    components : [
        row.toJSON(),
    ]
  };
}


export const wonWordGameComponent = (rGuessWordGame, userId) => {
  const successUsers = rGuessWordGame.successUsers;

  const guessButton = new ButtonBuilder()
  .setLabel('Guess')
  .setCustomId('guess_word_button')
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
  const row = new ActionRowBuilder().addComponents(guessButton);
  
  return {
    content: ' \n Word Game Finished! 🚀\n\n',
    embeds: [embed.toJSON()],
    // components : [
    //     row.toJSON(),
    // ]
  };
}