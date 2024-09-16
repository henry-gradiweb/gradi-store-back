import { DiscountCodePayload } from "./../../types/index";
import { shopifyAPI } from "../shopify-api/shopify-api";
import { discountPercentage } from "../utils";

export const createDiscountCode = async ({
  discountCode,
  discountCodeTitle,
  discountValue,
  discountType,
}: DiscountCodePayload) => {
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

    const discount = discountType === "percentage" ? discountPercentage(discountValue) : discountValue;

    const mutationVariables = {
      basicCodeDiscount: {
        title: discountCodeTitle,
        code: discountCode,
        startsAt: "2022-06-21T00:00:00Z",
        endsAt: "2022-09-21T00:00:00Z",
        customerSelection: {
          all: true,
        },
        customerGets: {
          value: {
            percentage: discount,
          },
          items: {
            all: true,
          },
        },
        appliesOncePerCustomer: true,
      },
    };

    const response = await shopifyAPI.post("", {
      query: mutation,
      variables: mutationVariables,
    });

    const userErrors = response.data.data?.discountCodeBasicCreate?.userErrors[0]?.message;

    if (userErrors) {
      return {
        error: userErrors,
      };
    }

    const discountCodeData = response.data?.data.discountCodeBasicCreate;

    if (!discountCodeData) {
      throw new Error("No discount code data returned.");
    }

    const createdCode = discountCodeData.codeDiscountNode.codeDiscount;

    return {
      discountCode: createdCode,
      message: `Discount code created successfully`,
    };
  } catch (error) {
    console.error("Error creating discount code:", error);
    throw new Error("Failed to create discount code");
  }
};
