import { shopifyAPI } from "../shopify-api/shopify-api";

export const fetchLocations = async () => {
    const query = `query {
      locations(first: 5) {
        edges {
          node {
            id
          }
        }
      }
    }`;
  
    try {
      const response = await shopifyAPI.post("", { query });
      const localtionId = response.data.data.locations.edges[0].node.id;
      return { localtionId };
    } catch (error) {
      console.error("Error fetching products from Shopify:", error);
      throw new Error("Failed to fetch products");
    }
  };