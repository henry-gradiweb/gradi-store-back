import { shopifyAPI } from "../shopify-api/shopify-api";

export const updateVariantStock = async ({
  variantId,
  newStock,
  locationId,
}: {
  variantId: string;
  newStock: number;
  locationId: string;
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

    if (!variant.availableForSale) {
      throw new Error("Cannot update stock for a variant that is not available for sale.");
    }

    const inventoryItemId = variant.inventoryItem?.id;

    if (!inventoryItemId) {
      throw new Error("Inventory item not found.");
    }

    const mutation = `
      mutation inventoryAdjustQuantities($changes: [InventoryAdjustQuantityInput!]!) {
        inventoryAdjustQuantities(input: {
          changes: $changes
        }) {
          inventoryLevels {
            available
          }
        }
      }
    `;

    const mutationVariables = {
      changes: [
        {
          inventoryItemId,
          locationId,
          delta: newStock,
        },
      ],
    };

    const mutationResponse = await shopifyAPI.post("", {
      query: mutation,
      variables: mutationVariables,
    });
    const updatedInventory = mutationResponse.data.data?.inventoryAdjustQuantities?.inventoryLevels?.[0]?.available;

    if (updatedInventory === undefined) {
      throw new Error("Failed to update stock.");
    }

    return {
      message: `Stock updated successfully to ${updatedInventory} units.`,
      updatedInventory,
    };
  } catch (error) {
    console.error("Error updating variant stock:", error);
    throw new Error("Error updating variant stock.");
  }
};
