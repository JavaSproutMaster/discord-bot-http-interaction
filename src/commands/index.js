export const SLAP_COMMAND = {
  name: "slap",
  description: "Sometimes you gotta slap a person with a large trout",
  options: [
    {
      name: "user",
      description: "The user to slap",
      type: 6,
      required: true,
    }
  ]
}

export const INVITE_COMMAND = {
  name: "invite",
  description: "Get an invite link to add the bot to your server",
}

export const START_NUMBER_GAME = {
  name: "startnumbergame",
  description: " Starts the game with the speciﬁed range. ",
  options: [
    {
      name: "range",
      description: "The range of the number",
      type: 4,
      required: true,
    }
  ]
}

export const GUESS_NUMBER = {
  name: "guessnumber",
  description: " User submits their guess. ",
  options: [
    {
      name: "number",
      description: "The value of the number",
      type: 4,
      required: true,
    }
  ]
}

export const END_NUMBER_GAME = {
  name: "endnumbergame",
  description: " Ends the current game session. ",
}

export const START_WORD_GAME  = {
  name: "startwordgame",
  description: " Starts a word guessing game with speciﬁed category and difficulty. ",
  options: [
    {
      name: "category",
      description: "Choose the category of words",
      type: 3, // STRING
      required: true,
      choices: [
        {
          name: "Animals",
          value: "animals"
        },
        {
          name: "Food",
          value: "food"
        },
        {
          name: "Countries",
          value: "countries"
        },
        {
          name: "Sports",
          value: "sports"
        },
        {
          name: "Movies",
          value: "movies"
        },
        {
          name: "Technology",
          value: "technology"
        },
        {
          name: "Colors",
          value: "colors"
        },
        {
          name: "Space",
          value: "space"
        },
        {
          name: "Professions",
          value: "professions"
        },
        {
          name: "Music",
          value: "music"
        },
      ]
    },
    {
      name: "difficulty",
      description: "Select the difficulty level",
      type: 3, // STRING
      required: true,
      choices: [
        {
          name: "Easy",
          value: "easy"
        },
        {
          name: "Medium",
          value: "medium"
        },
        {
          name: "Hard",
          value: "hard"
        }
      ]
    }
  ]
}

export const GUESS_LETTER = {
  name: "guessletter",
  description: " User guesses a letter. ",
  options: [
    {
      name: "letter",
      description: "Enter a single letter to guess",
      type: 3, // STRING
      required: true,
    }
  ]
}

export const GUESS_WORD = {
  name: "guessword",
  description: " User guesses the entire word. ",
  options: [
    {
      name: "word",
      description: "The range of the number",
      type: 3,
      required: true,
    }
  ]
}
export const END_WORD_GAME = {
  name: "endwordgame",
  description: " Ends the current game session. ",
}
export const START_EMOJI_GAME  = {
  name: "startemojigame",
  description: " Starts a word guessing game with speciﬁed category and difficulty. ",
}

export const GUESS_EMOJI = {
  name: " guessemoji",
  description: " User guesses an emoji. ",
  options: [
    {
      name: "emoji",
      description: "The range of the number",
      type: 3,
      required: true,
    }
  ]
}
export const END_EMOJI_GAME = {
  name: "endemojigame",
  description: " Ends the current game session. ",
}
