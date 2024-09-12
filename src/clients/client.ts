import { shopifyAPI } from "../api/shopify-api";

export const fetchProducts = async ({ first = 20, after = null, tags = [], title = '', category = '' }) => {
  const filters: string[] = [];
  
  // Aplicar los filtros según los parámetros
  if (tags.length > 0) {
    filters.push(`tag:${tags.join(' OR ')}`);
  }
  if (category) {
    filters.push(`product_type:${category}`);
  }
  if (title) {
    filters.push(`title:*${title}*`);
  }
  
  // Crear el query de filtros si existen
  const queryFilter = filters.length > 0 ? `(${filters.join(' AND ')})` : '';

  // Definir la consulta GraphQL
  const query = `
    query ($first: Int!, $after: String) {
      products(first: $first, after: $after, query: "${queryFilter}") {
        edges {
          cursor
          node {
            id
            title
            productType
            tags
            images(first: 1) {
              edges {
                node {
                  originalSrc
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  inventoryQuantity
                  price
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const variables = {
    first,
    after,
  };

  try {
    // Hacer la petición a Shopify
    const response = await shopifyAPI.post('', { query, variables });
    const products = response.data.data?.products;

    // Si no hay productos, retornar un error controlado
    if (!products.edges.length) {
      return { message: 'No products found', products: [], pageInfo: null };
    }

    // Filtrar los productos cuyas variantes estén agotadas
    const soldOutProducts = products.edges.filter((product: any) =>
      product.node.variants.edges.some((variant: any) => variant.node.inventoryQuantity <= 0)
    );

    if (!soldOutProducts.length) {
      return { message: 'No sold out products found', products: [], pageInfo: products.pageInfo };
    }

    // Retornar productos agotados y paginación
    return { soldOutProducts, pageInfo: products.pageInfo };
  } catch (error) {
    console.error("Error fetching products from Shopify:", error);
    throw new Error("Failed to fetch products");
  }
};
