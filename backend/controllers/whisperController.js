const { transcribeAudio, formatRecipe } = require('../utils/openaiUtils');
const { deleteFile } = require('../utils/fileUtils');

const transcribeAndFormat = async (req, res, next) => {
  try {

    // console.log(req.file); 
    const filePath = req.file.path;
    // console.log(req.file.path);

    // Step 1: Transcribe audio
    const transcription = await transcribeAudio(filePath);
    // console.log(transcription);

    // Step 2: Format transcription into a recipe
    const formattedRecipe = await formatRecipe(transcription);
    // console.log(formattedRecipe);
    
    // Step 3: Clean up file
    deleteFile(filePath);
    console.log(formattedRecipe);
    res.json({ recipe: formattedRecipe });
  } catch (err) {
    next(err);
  }
};

module.exports = { transcribeAndFormat };
