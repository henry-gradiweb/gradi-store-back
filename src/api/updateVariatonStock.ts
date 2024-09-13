import { shopifyAPI } from "../shopify-api/shopify-api";

export const updateVariantStock = async ({
  variantId,
  newStock,
  locationId,
  name,
  reason,
}: {
  variantId: string;
  newStock: number;
  locationId: string;
  name: string;
  reason: string;
}) => {
  if (newStock < 0) {
    throw new Error("Stock value cannot be negative.");
  }

  const query = `
    query ($id: ID!) {
      productVariant(id: $id) {
        id
        inventoryItem {
          id
        }
        inventoryQuantity
        availableForSale
      }
    }
  `;

  const variables = { id: variantId };

  try {
    const response = await shopifyAPI.post("", { query, variables });
    const variant = response.data.data?.productVariant;

    if (!variant) {
      throw new Error("Variant not found or invalid ID.");
    }

    const inventoryItemId = variant.inventoryItem?.id;
    if (!inventoryItemId) {
      throw new Error("Inventory item ID not found.");
    }

    if (!variant.availableForSale) {
      throw new Error("Cannot update stock for a variant that is not available for sale.");
    }

    const mutation = `
        mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
          inventoryAdjustQuantities(input: $input) {
            userErrors {
              field
              message
            }
            inventoryAdjustmentGroup {
              createdAt
              reason
              referenceDocumentUri
              changes {
                name
                delta
              }
            }
          }
      }
    `;

    const mutationVariables = {
        reason: reason,
        name: name,
        changes: [
          {
            inventoryItemId: inventoryItemId,
            locationId: locationId,
            delta: newStock,
          },
        ],
    };

    const mutationResponse = await shopifyAPI.post("", { query: mutation, variables: { input: mutationVariables } });
    
    const updatedInventory = mutationResponse.data.data?.inventoryAdjustQuantities?.inventoryAdjustmentGroup;

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
