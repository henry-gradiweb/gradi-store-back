import express from "express";
import dotenv from "dotenv";
import ngrok from "ngrok";
import { fetchProducts, updateVariantStock } from "./clients/client";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/api/products", async (req, res) => {
  const { first = 20, after = null, tags = [], title = "", category = "" } = req.body;

  try {
    const { soldOutProducts, pageInfo, message } = await fetchProducts({ first, after, tags, title, category });

    if (message) {
      return res.json({ message });
    }

    res.json({ products: soldOutProducts, pageInfo });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

app.post("/api/update-variant-stock", async (req, res) => {
  const { variantId, newStock } = req.body;
  
  // Asegúrate de que el ID es de una variante (ProductVariant)
  if (!variantId.startsWith("gid://shopify/ProductVariant/")) {
    return res.status(400).json({ error: "Invalid variant ID format. Must be a ProductVariant ID." });
  }

  console.log("variantId", variantId);
  console.log("newStock", newStock);

  try {
    if (!variantId || typeof newStock !== "number") {
      return res.status(400).json({ error: "Invalid input: variantId and newStock are required." });
    }

    const result = await updateVariantStock({ variantId, newStock });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}/api`);

  const url = await ngrok.connect(Number(PORT));
  console.log(`ngrok public URL: ${url}/api`);
});
