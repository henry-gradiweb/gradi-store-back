export interface ProductFilters {
  first?: number;
  after?: string;
  name?: string;
  vendor?: string;
  product_type?: string;
  tags?: string[];
  category?: string | string[];
}

export interface DiscountCodePayload {
  discountCode: string;
  discountCodeTitle: string;
  discountValue: number;
  discountType: string;
}

export interface updateVariantStockCodePayload {
  variantId: string;
  newStock: number;
  locationId: string;
  name: string;
  reason: string;
}

export interface Product {
  node: {
    id: string;
    title: string;
    productType: string;
    tags: string[];
    images: {
      edges: {
        node: {
          originalSrc: string;
        };
      }[];
    };
    variants: {
      edges: {
        node: {
          inventoryQuantity: number;
        };
      }[];
    };
  };
}
