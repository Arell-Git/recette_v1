const express = require('express');
const dotenv = require('dotenv');
const uploadRoutes = require('./routes/uploadRoute');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', uploadRoutes);

app.post('/api/process-tiktok', (req, res) => {
  const { tiktokUrl } = req.body;

  if (!tiktokUrl) {
    return res.status(400).json({ error: 'TikTok URL is required' });
  }

  const command = `bash -c "source myvenv/bin/activate && python3 get-audio-from-url.py ${tiktokUrl}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Python script error: ${stderr || error.message}`);
      return res.status(500).json({ error: 'Error processing TikTok URL. Please try again.' });
    }

    try {
      const parsedOutput = JSON.parse(stdout);

      if (parsedOutput.error) {
        // Error from the Python script
        return res.status(400).json({ error: parsedOutput.error });
      }

      res.json(parsedOutput);
    } catch (parseError) {
      console.error(`JSON parse error: ${parseError.message}`);
      res.status(500).json({ error: 'Invalid TikTok URL.' });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
