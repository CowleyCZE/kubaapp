const express = require('express');
const cors = require('cors');
const path = require('path');
const textRoutes = require('./routes/textRoutes');

const app = express();
const PORT = 5000; // Fixní port pro nasazení

// Middleware
app.use(cors());
app.use(express.json());

// Statické soubory
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', textRoutes);

// Obsluha frontend aplikace - pošle index.html pro hlavní cestu
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Došlo k chybě na serveru.', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
