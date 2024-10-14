
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
    },
    {
      name: "winners",
      description: "Select the number of winners.",
      type: 4, // INTEGER
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
  description: " Starts a emoji guessing game with speciﬁed category and difficulty. ",
  options: [
    {
      name: "category",
      description: "Choose the category of emojis",
      type: 3, // STRING
      required: true,
      choices: [
        {
          name: "Food",
          value: "food"
        },
        {
          name: "Movies",
          value: "movies"
        },
        {
          name: "Animals",
          value: "animals"
        },
        {
          name: "Places",
          value: "places"
        },
        {
          name: "Professions",
          value: "professions"
        },
        {
          name: "Entertainment",
          value: "entertainment"
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
    },
    {
      name: "winners",
      description: "Select the number of winners.",
      type: 4, // INTEGER
      required: true,
    }
  ]
}

export const END_EMOJI_GAME = {
  name: "endemojigame",
  description: " Ends the current game session. ",
}
