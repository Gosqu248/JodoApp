export interface ProductFilters {
    brands: string[];
    categories: string[];
    sizes: string[];
}

export interface FilterState {
    brand?: string;
    category?: string;
    productSize?: string;
}
