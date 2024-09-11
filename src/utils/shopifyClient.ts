import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SHOP_NAME = process.env.SHOPIFY_SHOP_NAME;
const ACCESS_TOKEN = process.env.SHOPIFY_API_KEY;

const shopifyAPI = axios.create({
  baseURL: `https://${SHOP_NAME}.myshopify.com/admin/api/2023-04`,
  headers: {
    'X-Shopify-Access-Token': ACCESS_TOKEN,
    'Content-Type': 'application/json'
  }
});

export const getProducts = async () => {
    console.log("SHOP_NAME", SHOP_NAME)
    console.log("ACCESS_TOKEN", ACCESS_TOKEN)

  try {
    const response = await shopifyAPI.get('/products.json');
    return response.data.products;
  } catch (error) {
    console.error('Error al obtener los productos de Shopify:', error);
    throw error;
  }
};
