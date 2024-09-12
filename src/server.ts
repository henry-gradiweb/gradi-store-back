import express from 'express';
import dotenv from 'dotenv';
import ngrok from 'ngrok';
import { fetchProducts } from './clients/client';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/api/products', async (req, res) => {
  const { first = 20, after = null, tags = [], title = '', category = '' } = req.body;

  try {
    const { soldOutProducts, pageInfo, message } = await fetchProducts({ first, after, tags, title, category });
    
    if (message) {
      return res.json({ message });
    }

    res.json({ products: soldOutProducts, pageInfo });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}/api`);

  const url = await ngrok.connect(Number(PORT));
  console.log(`ngrok public URL: ${url}/api`);
});
