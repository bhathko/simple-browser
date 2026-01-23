import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/proxy', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing "url" query parameter');
  }

  try {
    const response = await axios.get(url, {
      responseType: 'text', // We want the raw HTML/text
      // Optional: Add headers to mimic a browser if needed
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SimpleBrowser/0.1)',
      }
    });
    
    res.send(response.data);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    res.status(500).send(`Error fetching URL: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
