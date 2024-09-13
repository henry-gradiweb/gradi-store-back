import { shopifyAPI } from "../shopify-api/shopify-api";

export const createDiscountCode = async ({
  discountCode,
  discountCodeTitle,
  discountValue,
  discountType,
}: {
  discountCode: string;
  discountCodeTitle: string;
  discountValue: number;
  discountType: string;
}) => {
  try {
    const mutation = `
     mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode {
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              codes(first: 10) {
                nodes {
                  code
                }
              }
              startsAt
              endsAt
              customerSelection {
                ... on DiscountCustomerAll {
                  allCustomers
                }
              }
              customerGets {
                value {
                  ... on DiscountPercentage {
                    percentage
                  }
                }
                items {
                  ... on AllDiscountItems {
                    allItems
                  }
                }
              }
              appliesOncePerCustomer
            }
          }
        }
        userErrors {
          field
          code
          message
        }
      }
    }
    `;

    const mutationVariables = {
      basicCodeDiscount: {
        "title": discountCodeTitle,
        "code": discountCode,
        "startsAt": "2022-06-21T00:00:00Z",
        "endsAt": "2022-09-21T00:00:00Z",
        "customerSelection": {
          "all": true
        },
        "customerGets": {
          "value": {
            "percentage": discountValue
          },
          "items": {
            "all": true
          }
        },
        "appliesOncePerCustomer": true
      },
    };

    const response = await shopifyAPI.post("", {
      query: mutation,
      variables: mutationVariables,
    });

    console.log(response.data);

    const userErrors = response.data.data?.discountCodeBasicCreate?.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.error("Shopify User Errors:", userErrors);
      throw new Error(userErrors.map((error: any) => `${error.field}: ${error.message}`).join(", "));
    }

    const discountCodeData = response.data.data?.discountCodeBasicCreate?.codeDiscountNode?.codeDiscount;
    if (!discountCodeData) {
      throw new Error("No discount code data returned.");
    }

    return {
      discountCode: discountCodeData.codes.nodes[0].code,
      message: "Discount code created successfully.",
    };
  } catch (error) {
    console.error("Error creating discount code:", error);
    throw new Error("Failed to create discount code");
  }
};
