const axios = require('axios');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config(); 

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//transcription and format functions via OpenAI APIs

const transcribeAudio = async (filePath) => {
 
  //transcribe audio file with whisper 
  const audio_transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-1",
  });
  
  return audio_transcription.text;
};

const formatRecipe = async (transcription) => {

  //format transcription into a nice recipe
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
        { role: "developer", content: "You are a helpful assistant." },
        {
            role: "user",
            content: //could improve prompt engineering here to give a better recipe. Also, build secuirty for if auido does not havee sufficent directions, return "Not enough recipe info"
            `Please format the given transcription into a recipe only if the transcription contains text related to cooking or recipes.
            Reply only with the recipe, such as:
            
            [Recipe Title]

            Ingredients
            [Section Title]:

            [Ingredient 1]
            [Ingredient 2]
            [Ingredient 3]
            [Section Title (Optional)]:

            [Ingredient 1]
            [Ingredient 2]
            Instructions
            [Step 1]
            [Step 2]
            [Step 3]
            [Section Title (Optional)]:

            [Step 1]
            [Step 2]
            Notes
            [Optional Note 1]
            [Optional Note 2]

            If the text is unrelated to cooking, or if the transcription does not contain sufficent cooking information to create a 
            recipe, please reply with "The given video does not have sufficent recipe information".

            Transcription:
             ${transcription}`,
        },
    ],
});
  // console.log(response.choices[0].message.content);
  return response.choices[0].message.content;
};

module.exports = { transcribeAudio, formatRecipe };
