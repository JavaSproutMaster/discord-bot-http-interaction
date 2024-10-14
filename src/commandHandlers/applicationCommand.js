import { InteractionResponseType } from "discord-interactions";
import { END_EMOJI_GAME, END_NUMBER_GAME, END_WORD_GAME, START_EMOJI_GAME, START_NUMBER_GAME, START_WORD_GAME } from "../commands/index.js";
import { startWordGameComponent } from "../components/wordGameComponents.js";
import { endNumberGame, startNumberGame } from "../utils/number.js";
import { endWordGame, startWordGame } from "../utils/word.js";
import { EmbedBuilder } from "discord.js";
import { endEmojiGame, startEmojiGame } from "../utils/emoji.js";
import { startEmojiGameComponent } from "../components/emojiGameComponents.js";

export const handleApplicationCommand = async (client, message, redisHelper, response) => {
  const guildId = message.guild_id;
  const channelId = message.channel_id;
  const userId = message.member.user.id;
  switch (
    message.data.name.toLowerCase() 
  ) {
    
    case START_NUMBER_GAME.name.toLowerCase():
      const res = await startNumberGame(redisHelper, message);
      response.status(200).send({
        type: 4, 
        data: {
          content: `*${res.msg}*`, 
        }, 
      });	
      break;
    case END_NUMBER_GAME.name.toLowerCase():
      const result = await endNumberGame(redisHelper, message);
      response.status(200).send({
        type: 4, 
        data: {
          content: `*${result}*`, 
        }, 
      });
      break;
    case START_WORD_GAME.name.toLowerCase():
        const category = message.data.options[0].value;
        const difficulty = message.data.options[1].value;
        const winners = message.data.options[2].value;

        const token = message.token;
        const resWordGame = await startWordGame(redisHelper, category, difficulty, guildId, channelId, winners, token);
        if (resWordGame.value) {
          client.users.fetch(message.member.user.id)
          .then(user => {
            user.send(`You started a word game with the word **${resWordGame.value}** at ${new Date().toLocaleString()}`)
            .then(() => console.log(`Sent a startgame status to ${user.tag}`))
            .catch(error => console.error('Error sending DM:', error));
          });
          response.status(200).send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, 
            data: startWordGameComponent(resWordGame.value, category, difficulty),
          }).then((a) => {
            console.log(`Message with source sent to ${channelId}`);
          });
        }
        else {
          response.status(200).send({
            type: 4, 
            data: {
              content: `*${resWordGame.message}*`, 
              flags: 64, // Ephemeral message flag (only the user sees it)
            }, 
          });
        }
      break;
    
    case END_WORD_GAME.name.toLowerCase():
      const rEndWord = await endWordGame(redisHelper, message);
      const endComponent = new EmbedBuilder()
      .setTitle(`${rEndWord}`)
      .setColor(0xff0000);  // Optional: Set a color for the embed

      response.status(200).send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [endComponent.toJSON()], 
        }, 
      });
      break;
    case START_EMOJI_GAME.name.toLowerCase():
      const categoryEmoji = message.data.options[0].value;
      const difficultyEmoji = message.data.options[1].value;
      const winnersEmoji = message.data.options[2].value;
      const resEmojiGame = await startEmojiGame(redisHelper, guildId, channelId, categoryEmoji, difficultyEmoji, winnersEmoji);

      if (resEmojiGame.value) {
        client.users.fetch(message.member.user.id)
          .then(user => {
            user.send(`You started a Emoji game with the emoji **${resEmojiGame.value.phrase}** at ${new Date().toLocaleString()}`)
            .then(() => console.log(`Sent a startgame status to ${user.tag}`))
            .catch(error => console.error('Error sending DM:', error));
          });

        response.status(200).send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, 
          data: startEmojiGameComponent(resEmojiGame.value),
        }).then((a) => {
          console.log(`Message with source sent to ${channelId}`);
        });
      }
      else {
        response.status(200).send({
          type: 4,
          data: {
            content: `*${resEmojiGame.msg}*`,
          },
        });
      }
      break;
    
    case END_EMOJI_GAME.name.toLowerCase():
      const resEndEmojiGame = await endEmojiGame(redisHelper, guildId, channelId);
      const endEmojiComponent = new EmbedBuilder()
      .setTitle(`${resEndEmojiGame}`)
      .setColor(0xffff00);  // Optional: Set a color for the embed

      response.status(200).send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [endEmojiComponent.toJSON()], 
        }, 
      });
      break;
    default:
      server.log.error("Unknown Command"); 
      response.status(400).send({ error: "Unknown Type" }); 
      break; 
  }
}

