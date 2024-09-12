export interface ProductFilters {
    first?: number;
    after?: string;
    name?: string;
    vendor?: string;
    product_type?: string;
    tags?: string[];
    category?: string | string[];
  }