import express from "express";
import dotenv from "dotenv";
import ngrok from "ngrok";
import { fetchProducts } from "./api/fetchProducts";
import { fetchLocations } from "./api/fetchLocations";
import { createDiscountCode } from "./api/createDiscountCode";
import { updateVariantStock } from "./api/updateVariatonStock";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/api/products", async (req, res) => {
  const { first = 20, after = null, tags = [], title = "", category = "" } = req.body;

  try {
    const { products, pageInfo, message } = await fetchProducts({ first, after, tags, title, category });

    if (message) {
      return res.json({ message });
    }

    res.json({ products, pageInfo });
  } catch (error) {
    res.status(500).json({ error: "Error fetching products" });
  }
});

app.post("/api/update-variant-stock", async (req, res) => {
  const { variantId, newStock, locationId, name, reason } = req.body;

  if (!variantId.startsWith("gid://shopify/ProductVariant/")) {
    return res.status(400).json({ error: "Invalid variant ID format. Must be a ProductVariant ID." });
  }

  try {
    if (!variantId || typeof newStock !== "number" || !locationId) {
      return res.status(400).json({ error: "Invalid input: variantId, newStock, and locationId are required." });
    }

    const result = await updateVariantStock({ variantId, newStock, locationId, name, reason });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.post("/api/create-discount", async (req, res) => {
  const { discountCode, discountCodeTitle, discountType, discountValue } = req.body;

  if (!discountCode || !discountType || discountValue === undefined) {
    return res.status(400).json({ error: "Invalid input: All fields are required and tag must be a non-empty array." });
  }

  try {
    const result = await createDiscountCode({ discountCode, discountCodeTitle, discountType, discountValue });
    res.json(result);
  } catch (error) {
    console.error("Error creating discount code:", error);
    res.status(500).json(error);
  }
});

app.get("/api/locations", async (req, res) => {
  try {
    const locations = await fetchLocations();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener locations" });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}/api`);

  const url = await ngrok.connect(Number(PORT));
  console.log(`ngrok public URL: ${url}/api`);
});
