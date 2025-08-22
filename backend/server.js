import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notesdb')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Note schema
const noteSchema = new mongoose.Schema({
  text: String,
  summary: String,
  createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', noteSchema);

// Summarize function using public model
async function summarizeWithHF(text) {
  const apiKey = process.env.HF_API_KEY || ""; // optional
  const modelName = "facebook/bart-large-cnn";
  const url = `https://api-inference.huggingface.co/models/${modelName}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': apiKey ? `Bearer ${apiKey}` : undefined,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: `Summarize this note in 2-3 sentences: ${text}`,
        parameters: { max_new_tokens: 100 }
      })
    });

    const data = await response.json();

    if (data[0]?.summary_text) {
      return data[0].summary_text;
    } else if (data[0]?.generated_text) {
      return data[0].generated_text;
    } else {
      console.error('Unexpected Hugging Face response:', data);
      return `Could not generate summary: ${text.substring(0, 50)}...`;
    }

  } catch (error) {
    console.error('Hugging Face API error:', error);
    return `Mock Summary: ${text.substring(0, 50)}...`;
  }
}

// Routes
app.get('/api/notes', async (req, res) => {
  const notes = await Note.find().sort({ createdAt: -1 });
  res.json(notes);
});

app.post('/api/notes', async (req, res) => {
  const note = new Note({ text: req.body.text });
  await note.save();
  res.json(note);
});

app.post('/api/summarize/:id', async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });

  const summary = await summarizeWithHF(note.text);
  note.summary = summary;
  await note.save();

  res.json({ summary });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
