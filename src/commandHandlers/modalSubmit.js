import { InteractionResponseType } from "discord-interactions";
import { END_EMOJI_GAME, END_NUMBER_GAME, END_WORD_GAME, START_EMOJI_GAME, START_NUMBER_GAME, START_WORD_GAME } from "../commands/index.js";
import { startWordGameComponent, successWordGameComponent } from "../components/wordGameComponents.js";
import { endNumberGame, startNumberGame } from "../utils/number.js";
import { endWordGame, guessWord, startWordGame } from "../utils/word.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { endEmojiGame, guessEmojiGame, startEmojiGame } from "../utils/emoji.js";
import { startEmojiGameComponent, successEmojiGameComponent, wonEmojiGameComponent } from "../components/emojiGameComponents.js";
import { assignRole, getRoleId } from "../utils/role.js";
import { editMessage } from "../utils/util.js";

export const handleModalSubmit = async (channelManager, guildManager, message, redisHelper, response) => {
  var embed, button;
  const userId = message.member.user.id;
  const guildId = message.guild_id;
  const channelId = message.channel_id;

  let gameData = JSON.parse(await redisHelper.get(`${guildId}_${channelId}`));
  
  if (!gameData) {
    embed = new EmbedBuilder()
    .setTitle('Game not started !')
    .setDescription(`\n Game has been ended.`)
    .setColor(0xffff00);  // Optional: Set a color for the embed

    response.status(200).send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [embed.toJSON()],
        flags: 64, // Ephemeral message flag (only the user sees it)
      },
    });
  }
  
  const textInput = message.data.components[0].components[0];
  const word = textInput.value;

  if (message.data.custom_id === 'guess_word_modal') {

    var startMessageId = await redisHelper.get(`${guildId}_${channelId}_start_word_message_id`);

    const rGuessWordGame = await guessWord(redisHelper, guildId, channelId, userId, word);
    var guessedResults = rGuessWordGame.guessResult;
    gameData = JSON.parse(await redisHelper.get(`${guildId}_${channelId}`));
    const attempted = rGuessWordGame.attempted;
    const lenOK = rGuessWordGame.length;
    const successed = rGuessWordGame.success;
    const startedNextRound = rGuessWordGame.startedNextRound;
    const won = rGuessWordGame.won;

    const guessAgainBtn = new ButtonBuilder()
      .setCustomId('guess_word_button')
      .setLabel('Guess')
      .setStyle(ButtonStyle.Primary);
    const nextButton = new ButtonBuilder()
      .setCustomId('guess_word_button')
      .setLabel('Next Guess')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled();

    if (won) {

      const role = await getRoleId(guildManager, guildId, 'prize');
      if (role) {
        await assignRole(userId, role);
      }

      embed = new EmbedBuilder()
      .setTitle(`:tada:Congratulations!:tada:`)
      .setDescription(`\n${guessedResults.map(result => result.trim()).join('\n')}\n\n<@${userId}> won the game! <:congratulation:1286214494858645566>\n
      Set **<@${userId}>** as a role reward of **prize**. 
      `)
      .setColor(0xff0000);  // Optional: Set a color for the embed
      
      await	editMessage(channelManager, channelId, startMessageId, wonWordGameComponent(rGuessWordGame, userId));

      response.status(200).send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [embed.toJSON()],
          flags: 64, // Ephemeral message flag (only the user sees it)
        },
      });
      return;
    }
    else if (!lenOK && !attempted) {
      embed = new EmbedBuilder()
      .setTitle('Please wait the next round...')
      .setDescription(`\n${rGuessWordGame.message}`)
      .setColor(0xff0000);  // Optional: Set a color for the embed
      button = nextButton;
    }
    else if (lenOK && !attempted) {
      embed = new EmbedBuilder()
      .setTitle('Guess Results')
      .setDescription(`\n${guessedResults.map(result => result.trim()).join('\n')}\n\n **${rGuessWordGame.remainingAttempts}** guesses left!\n${rGuessWordGame.message}`)
      .setColor(0xff0000);  // Optional: Set a color for the embed

      button = guessAgainBtn;
    }
    else if (attempted && !successed) {
      embed = new EmbedBuilder()
      .setTitle('Guessing Failed...')
      .setDescription(`\n${guessedResults.map(result => result.trim()).join('\n')}\n\n **${rGuessWordGame.remainingAttempts}** guesses left!\n`)
      .setColor(0xff0000);  // Optional: Set a color for the embed
      button = guessAgainBtn;
    }
    else if (successed && !startedNextRound) {
      const successUsers = rGuessWordGame.successUsers;
      let userList = "";
      for(let i = 0; i < successUsers.length; i++) {
        userList += `${i+1}. <@${successUsers[i]}>`;
        if(i!== successUsers.length - 1) {
          userList += '\n';
        }
      }
      embed = new EmbedBuilder()
      .setTitle(`:tada:Congratulations!:tada:`)
      .setDescription(`\n${userList}\n\n
        **<@${userId}>** has guessed the word with **${6-rGuessWordGame.remainingAttempts}** guess${6-rGuessWordGame.remainingAttempts > 1 ? "es": ""} !\n\n
        Let others continue guessing just allow 5 people or so to guess it.\n\n
        `)
      .setColor(0xff0000);  // Optional: Set a color for the embed
      const row = new ActionRowBuilder().addComponents(guessAgainBtn);
      const result = await	editMessage(channelManager, channelId, startMessageId, successWordGameComponent(rGuessWordGame, gameData.category, userId));
      response.status(200).send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [embed.toJSON()],
          components: [row.toJSON()],
          flags: 64, // Ephemeral message flag (only the user sees it)
        },
      });
      return;
    }
    else if (successed && startedNextRound) {
      const successUsers = rGuessWordGame.successUsers;
      const rounds = rGuessWordGame.rounds;
      let userList=``;
      for(let i = 0; i < successUsers.length; i++) {
        userList += `${i+1}. <@${successUsers[i]}>`;
        if(i!== successUsers.length - 1) {
          userList += '\n';
        }
      }
      const embed = new EmbedBuilder()
        .setTitle(`:tada:Congratulations!:tada:\n`)
        .setDescription(`${userList}\n
          These successed users can play the next round!\n
          Guess the new word in **6** tries.\n
        - Each guess must be a valid **${rGuessWordGame.value.length}**-letter word in **${rGuessWordGame.category}**.\n
        *Click the following button to guess the word...*\n
      `);
      const guessButton = new ButtonBuilder()
      .setLabel('Guess')
      .setCustomId('start_guess_word_button')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('1285976321184235571');
      const row = new ActionRowBuilder().addComponents(guessButton);

      await	editMessage(channelManager, channelId, startMessageId, successWordGameComponent(rGuessWordGame, gameData.category, userId));

      response.status(200).send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: ` \n ${rounds} Round started! 🚀\n\n`,
          embeds: [embed.toJSON()],
          components: [
              row.toJSON()
          ],
          flags: 64, // Ephemeral message flag (only the user sees it)
        },
      });
      return;
    }
    
  // Add the buttons to an action row
    const row = new ActionRowBuilder().addComponents(button);
    response.status(200).send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [embed.toJSON()],
        components: [row.toJSON()],
        flags: 64, // Ephemeral message flag (only the user sees it)
      },
    });
  }
  // guess Emoji
  else if (message.data.custom_id === 'guess_emoji_modal') {
    var startMessageId = await redisHelper.get(`${guildId}_${channelId}_start_emoji_message_id`);
    const resEmojiGame = await guessEmojiGame(redisHelper, guildId, channelId, userId, word);

    const guessAgainBtn = new ButtonBuilder()
      .setCustomId('guess_emoji_button')
      .setLabel('Try again')
      .setStyle(ButtonStyle.Primary);
    const guessNextBtn = new ButtonBuilder()
      .setCustomId('guess_emoji_button')
      .setLabel('Guess')
      .setDisabled()
      .setStyle(ButtonStyle.Secondary);
    if (resEmojiGame.status === 200) {
      await	editMessage(channelManager, channelId, startMessageId, successEmojiGameComponent(resEmojiGame, userId));
      embed = new EmbedBuilder()
      .setTitle(`${resEmojiGame.title}`)
      .setDescription(`${resEmojiGame.message}`)
      .setColor(0xff0000);  // Optional: Set a color for the embed
      let component;
      if (resEmojiGame.won) {
        const role = await getRoleId(guildManager, guildId, 'prizeEmojiMaster');
        if (role) {
          await assignRole(userId, role);
        }

        component = {
          embeds: [embed.toJSON()],
          flags: 64, // Ephemeral message flag (only the user sees it)
        }
      }

      if (resEmojiGame.nextRound) {
        const row = new ActionRowBuilder().addComponents(guessNextBtn);
        component = {
          embeds: [embed.toJSON()],
          components: [row.toJSON()],
          flags: 64, // Ephemeral message flag (only the user sees it)          
        }
      }
      if (!resEmojiGame.won && !resEmojiGame.nextRound) {
        let userList = '';
        const successUsers = resEmojiGame.successUsers;
        for(let i = 0; i < successUsers.length; i++) {
          userList += `${i+1}. <@${successUsers[i]}>`;
          if(i!== successUsers.length - 1) {
            userList += '\n';
          }
        }
        embed = new EmbedBuilder()
        .setTitle(`:tada:Congratulations!:tada:`)
        .setDescription(`
          ${userList}\n
          **<@${userId}>** has guess the word!
          Let others continue guessing just allow 5 people or so to guess it.
          `)
        .setColor(0xff00ff);  // Optional: Set a color for the embed
        const row = new ActionRowBuilder().addComponents(guessAgainBtn);
        component = {
          embeds: [embed.toJSON()],
          components: [row.toJSON()],
          flags: 64, // Ephemeral message flag (only the user sees it)					
        }	
      }
      response.status(200).send({
        type: 4,
        data: component,
      });	
    }
    else if (resEmojiGame.status === 403) {
      response.status(200).send({
        type: 4,
        data: {
          content: resEmojiGame.message,
          flags: 64, // Ephemeral message flag (only the user sees it)
        },
      });
    }
    else if (resEmojiGame.status === 404) {
      response.status(200).send({
        type: 4,
        data: {
          content: resEmojiGame.message,
          flags: 64, // Ephemeral message flag (only the user sees it)
        },
      });
    }
    else {
      embed = new EmbedBuilder()
      .setTitle(`Guess again!`)
      .setDescription(`${resEmojiGame.message}`)
      .setColor(0xff0000);  // Optional: Set a color for the embed
      const row = new ActionRowBuilder().addComponents(guessAgainBtn);
      const component = {
        embeds: [embed.toJSON()],
        components: [row.toJSON()],
        flags: 64, // Ephemeral message flag (only the user sees it)					
      }
      response.status(200).send({
        type: 4,
        data: component,
      });
    }
  }
}