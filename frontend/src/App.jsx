import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_URL}/notes`);
      setNotes(res.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const res = await axios.post(`${API_URL}/notes`, { text: newNote });
      setNotes([res.data, ...notes]);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const summarizeNote = async (id) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/summarize/${id}`);
      setNotes(notes.map(note => 
        note._id === id ? { ...note, summary: res.data.summary } : note
      ));
    } catch (error) {
      console.error('Error summarizing note:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📝 Notes App</h1>
      
      
      <div style={{ marginBottom: '30px' }}>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Enter your note here..."
          style={{
            width: '100%',
            height: '100px',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <button
          onClick={addNote}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            fontSize: '18px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Add Note
        </button>
      </div>

   
      <div>
        <h2>Your Notes</h2>
        {notes.length === 0 ? (
          <p>No notes yet. Add your first note!</p>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              style={{
                border: '1px solid #ddd',
                padding: '15px',
                marginBottom: '15px',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <p style={{ margin: '0 0 10px 0' }}>{note.text}</p>
              
              {note.summary && (
                <div style={{
                  padding: '10px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '4px',
                  marginTop: '10px'
                }}>
                  <strong>Summary:</strong> {note.summary}
                </div>
              )}
              
              <button
                onClick={() => summarizeNote(note._id)}
                disabled={loading}
                style={{
                  marginTop: '10px',
                  padding: '5px 15px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Summarizing...' : 'Summarize'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;