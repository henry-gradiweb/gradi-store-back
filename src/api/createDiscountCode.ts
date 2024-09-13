import { shopifyAPI } from "../shopify-api/shopify-api";

export const createDiscountCode = async ({
    discountCode,
    discountType,
    discountValue,
    tag,
  }: {
    discountCode: string;
    discountType: string;
    discountValue: number;
    tag: string[];
  }) => {
    try {
      const filters = tag.map((t) => `tag:${t}`).join(" AND ");
  
      const productsResponse = await shopifyAPI.post("", {
        query: `
          query ($filters: String!) {
            products(first: 5, query: $filters) {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
        `,
        variables: { filters },
      });
  
      const productEdges = productsResponse.data.data?.products.edges || [];
      const productIDs = productEdges.map((product: any) => product.node.id);
  
      if (productIDs.length === 0) {
        throw new Error("No products found with the specified tag.");
      }
  
      const limitedProductIDs = productIDs.slice(0, 5);
  
      const mutation = `
        mutation ($discountCode: String!, $discountValue: Float!, $productIDs: [ID!]!) {
          discountCodeBasicCreate(basicCodeDiscount: {
            title: $discountCode
            startsAt: "2024-09-12T00:00:00Z"
            customerGets: {
              value: {
                percentage: $discountValue
              }
              items: {
                products: {
                  productsToAdd: $productIDs
                }
              }
            }
            appliesOncePerCustomer: true
            code: $discountCode
          }) {
            codeDiscountNode {
              id
              codeDiscount {
                codes(first: 1) {
                  edges {
                    node {
                      code
                    }
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
  
      const mutationVariables = {
        discountCode,
        discountValue: discountValue,
        productIDs: limitedProductIDs,
      };
  
      const response = await shopifyAPI.post("", { query: mutation, variables: mutationVariables });
  
      console.log("Response from Shopify:", JSON.stringify(response.data, null, 2));
  
      const userErrors = response.data.data?.discountCodeBasicCreate?.userErrors;
      if (userErrors && userErrors.length > 0) {
        console.error("Shopify User Errors:", userErrors);
        throw new Error(userErrors.map((error: any) => `${error.field}: ${error.message}`).join(", "));
      }
  
      const discountCodeData = response.data.data?.discountCodeBasicCreate?.codeDiscountNode;
      if (!discountCodeData) {
        throw new Error("No discount code data returned.");
      }
  
      return {
        discountID: discountCodeData.id,
        discountCode: discountCodeData.codeDiscount.codes.edges[0].node.code,
        productIDs: limitedProductIDs,
        message: "Discount code created successfully.",
      };
    } catch (error) {
      console.error("Error creating discount code:", error);
      throw new Error("Failed to create discount code");
    }
  };