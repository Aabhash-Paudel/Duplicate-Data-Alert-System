const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: 'daredx',
  host: 'localhost',
  database: 'your_db_name',
  password: 'new_password',
  port: 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database connected successfully");
  }
});

app.post('/check-duplicate', async (req, res) => {
  console.log("Received request:", req.body);
  const { filename, fileSize, url } = req.body;
  const fileHash = crypto.createHash('md5').update(url).digest('hex');

  try {
    const result = await pool.query(
      'SELECT * FROM files WHERE file_hash = $1 OR (file_name = $2 AND file_size = $3)',
      [fileHash, filename, fileSize]
    );

    if (result.rows.length > 0) {
      console.log("Duplicate found:", result.rows[0]);
      res.json({
        isDuplicate: true,
        originalFile: result.rows[0].file_name
      });
    } else {
      console.log("No duplicate found, inserting new record");
      await pool.query(
        'INSERT INTO files (file_name, file_size, file_hash, download_url) VALUES ($1, $2, $3, $4)',
        [filename, fileSize, fileHash, url]
      );
      res.json({ isDuplicate: false });
    }
  } catch (err) {
    console.error("Error in /check-duplicate:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
