import { InteractionResponseType } from "discord-interactions";

import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export const handleMessageComponentCommand = async (message, redisHelper, response) => {
  // show modal
  const btnId = message.data.custom_id;
  const messageId = message.message.id;
  const key = `${message.guild_id}_${message.channel_id}`;

  const gameData = await redisHelper.get(key);
  if (!gameData) {
    response.status(200).send({
      type: 4,
      data: {
        content: `*Game not started yet!*`,
        flags: 64, // Ephemeral message flag (only the user sees it)
      },
    });
  }
    
  if (btnId === 'guess_word_button' || btnId === 'start_guess_word_button') {
    if (btnId === 'start_guess_word_button') {
      await redisHelper.set(`${key}_start_word_message_id`, messageId);
    }
    if (gameData && JSON.parse(gameData)) {
      const value = JSON.parse(gameData).value;
      const textInput = new TextInputBuilder()
        .setCustomId('word_input')
        .setLabel("Enter your guess")
        .setMinLength(value.length)
        .setMaxLength(value.length)
        .setStyle(TextInputStyle.Short) // Single line input
        .setRequired(true);

        const component = new ActionRowBuilder().addComponents(textInput);
      const mb = new ModalBuilder()
        .setTitle("Guess the Word")
        .setCustomId('guess_word_modal')
        .addComponents(component);

      response.status(200).send({
          type: InteractionResponseType.MODAL, // Ensure this is the correct response type for a modal
          data: mb.toJSON() // Use .toJSON() to serialize the modal object properly
      });
    }
    else {
      response.status(200).send({
        type: 4,
        data: {
          content: `*Game not started yet!*`,
          flags: 64, // Ephemeral message flag (only the user sees it)
        },
      });
    }
  }
  else if (btnId === 'guess_emoji_button' || btnId === 'start_guess_emoji_button') {
    if (btnId === 'start_guess_emoji_button') {
      await redisHelper.set(`${key}_start_emoji_message_id`, messageId);
    }

    if (gameData && JSON.parse(gameData) && JSON.parse(gameData).value) {
      const value = JSON.parse(gameData).value.phrase;
      const textInput = new TextInputBuilder()
        .setCustomId('emoji_input')
        .setLabel("Enter your guess")
        .setMinLength(value.length)
        .setMaxLength(value.length)
        .setStyle(TextInputStyle.Short) // Single line input
        .setRequired(true);
      // Wrap the text input in an Action Row
      const component = new ActionRowBuilder().addComponents(textInput);
      const mb = new ModalBuilder()
        .setTitle("Guess the Emoji")
        .setCustomId('guess_emoji_modal')
        .addComponents(component);
      // Send the modal as a response to the interaction
      response.status(200).send({
          type: InteractionResponseType.MODAL, // Ensure this is the correct response type for a modal
          data: mb.toJSON() // Use .toJSON() to serialize the modal object properly
      });
    }
  }
  
}