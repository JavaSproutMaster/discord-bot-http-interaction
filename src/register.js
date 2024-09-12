import fetch from "node-fetch";
import { 
  SLAP_COMMAND, 
  INVITE_COMMAND, 
  START_NUMBER_GAME, 
  GUESS_NUMBER, 
  END_NUMBER_GAME, 
  END_WORD_GAME, 
  END_EMOJI_GAME, 
  START_WORD_GAME, 
  GUESS_LETTER, 
  GUESS_WORD, 
  START_EMOJI_GAME, 
  GUESS_EMOJI
} from "./commands/index.js";

const response = await fetch(
  `https://discord.com/api/v8/applications/1280507296195153960/commands`,
  {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bot MTI4MDUwNzI5NjE5NTE1Mzk2MA.GSU6ok.Ne5LO9-aCOJXguDpmUGnuAb9R-CxLCHhFV4iLE`,
    },
    method: "PUT",
    body: JSON.stringify([
      SLAP_COMMAND, 
      INVITE_COMMAND,
      START_NUMBER_GAME,
      GUESS_NUMBER,
      END_NUMBER_GAME,
      START_WORD_GAME,
      GUESS_LETTER,
      GUESS_WORD,
      START_EMOJI_GAME,
      GUESS_EMOJI,
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
