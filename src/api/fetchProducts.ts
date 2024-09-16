import { shopifyAPI } from "../shopify-api/shopify-api";

export const fetchProducts = async ({ first = 20, after = null, tags = [], title = "", category = "" }) => {
  const filters: string[] = [];

  if (tags.length > 0) {
    filters.push(`tag:${tags.join(" AND ")}`);
  }
  if (category) {
    filters.push(`product_type:${category}`);
  }
  if (title) {
    filters.push(`title:*${title}*`);
  }

  filters.push(`published_status:published`);

  const queryFilter = filters.length > 0 ? `(${filters.join(" AND ")})` : "";

  const query = `
    query ($first: Int!, $after: String) {
      products(first: $first, after: $after, query: "${queryFilter}") {
        edges {
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
            variants(first: 1) {
              edges {
                node {
                  inventoryQuantity
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

  const variables = { first, after };

  try {
    const response = await shopifyAPI.post("", { query, variables });
    const products = response.data.data?.products;

    if (!products.edges.length) {
      return { message: "No products found", products: [], pageInfo: null };
    }

    const filteredProducts = products.edges.map((product: any) => ({
      id: product.node.id,
      title: product.node.title,
      category: product.node.productType,
      tags: product.node.tags,
      image: product.node.images.edges[0]?.node.originalSrc || null,
      stock: product.node.variants.edges[0]?.node.inventoryQuantity || 0,
    }));

    return { products: filteredProducts, pageInfo: products.pageInfo };
  } catch (error) {
    console.error("Error fetching products from Shopify:", error);
    throw new Error("Failed to fetch products");
  }
};
