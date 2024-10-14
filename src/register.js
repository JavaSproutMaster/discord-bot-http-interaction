import fetch from "node-fetch";
import {  
  START_NUMBER_GAME, 
  END_NUMBER_GAME, 
  END_WORD_GAME, 
  END_EMOJI_GAME, 
  START_WORD_GAME, 
  START_EMOJI_GAME, 
} from "./commands/index.js";

const response = await fetch(
  `https://discord.com/api/v8/applications/${process.env.APPLICATION_ID}/commands`,
  {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bot ${process.env.TOKEN}`,
    },
    method: "PUT",
    body: JSON.stringify([
      START_NUMBER_GAME,
      START_WORD_GAME,
      START_EMOJI_GAME,
      END_NUMBER_GAME,
      END_WORD_GAME, 
      END_EMOJI_GAME, 
    ]),
  }
)
if (response.ok) {
  console.log("Registered all commands");
} else {
  console.error("Error registering commands");
  const text = await response.text();
  console.error(text);
}
