import {getProducts} from '../utils/shopifyClient';

const root = {
    products: async () => {
      try {
        const products = await getProducts();
        
        return products.map((product: any) => ({
          id: product.id,
          title: product.title,
          body_html: product.body_html,
          vendor: product.vendor,
          product_type: product.product_type,
          created_at: product.created_at,
        }));
      } catch (error) {
        console.error('Error obteniendo los productos:', error);
        throw new Error('No se pudieron obtener los productos');
      }
    }
  };

export default root;
