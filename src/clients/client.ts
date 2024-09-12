import { shopifyAPI } from "../api/shopify-api";

export const fetchProducts = async ({ first = 20, after = null, tags = [], title = "", category = "" }) => {
  const filters: string[] = [];

  // Aplicar los filtros según los parámetros
  if (tags.length > 0) {
    filters.push(`tag:${tags.join(" OR ")}`);
  }
  if (category) {
    filters.push(`product_type:${category}`);
  }
  if (title) {
    filters.push(`title:*${title}*`);
  }

  // Filtro para obtener solo productos activos (publicados)
  filters.push(`published_status:published`);

  // Crear el query de filtros si existen
  const queryFilter = filters.length > 0 ? `(${filters.join(" AND ")})` : "";

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
    const response = await shopifyAPI.post("", { query, variables });
    const products = response.data.data?.products;

    // Si no hay productos, retornar un error controlado
    if (!products.edges.length) {
      return { message: "No products found", products: [], pageInfo: null };
    }

    // Filtrar los productos cuyas variantes estén agotadas
    const soldOutProducts = products.edges.filter((product: any) =>
      product.node.variants.edges.some((variant: any) => variant.node.inventoryQuantity <= 0 || variant.node.availableForSale)
    );

    if (!soldOutProducts.length) {
      return { message: "No sold out products found", products: [], pageInfo: products.pageInfo };
    }

    // Retornar productos agotados y paginación
    return { soldOutProducts, pageInfo: products.pageInfo };
  } catch (error) {
    console.error("Error fetching products from Shopify:", error);
    throw new Error("Failed to fetch products");
  }
};


//  update variation product request
export const updateVariantStock = async ({ variantId, newStock }: { variantId: string; newStock: number }) => {
  // Validación: Verificar si newStock es un valor positivo
  if (newStock < 0) {
    throw new Error("Stock value cannot be negative.");
  }

  // Query para obtener la variante y verificar si está agotada y activa
  const query = `
    query ($id: ID!) {
      productVariant(id: $id) {
        id
        inventoryQuantity
        availableForSale
      }
    }
  `;

  const variables = { id: variantId };

  try {
    // Hacer la petición para obtener la variante
    const response = await shopifyAPI.post("", { query, variables });
    const variant = response.data.data?.productVariant;
    console.log("variant", variant);
    console.log("response update", response.data.data);

    if (!variant) {
      throw new Error("Variant not found or invalid ID.");
    }


    if (!variant.availableForSale) {
      throw new Error("Cannot update stock for a variant that is not active.");
    }

    // Mutación para actualizar el inventario
    const mutation = `
      mutation ($id: ID!, $quantity: Int!) {
        inventoryAdjustQuantity(input: {inventoryItemId: $id, availableDelta: $quantity}) {
          inventoryLevel {
            available
          }
        }
      }
    `;

    const mutationVariables = {
      id: variantId,
      quantity: newStock,
    };

    const mutationResponse = await shopifyAPI.post("", { query: mutation, variables: mutationVariables });

    const updatedInventory = mutationResponse.data.data?.inventoryAdjustQuantity?.inventoryLevel?.available;

    if (updatedInventory === undefined) {
      throw new Error("Failed to update stock.");
    }

    return {
      message: `Stock updated successfully to ${updatedInventory} units.`,
      updatedInventory,
    };
  } catch (error) {
    console.error("Error updating variant stock:", error);
    throw new Error("error updating variant stock");
  }
};


