export interface Product {
    id: string;
    name: string;
    description: string;
    brand: string;
    price: number;
    regularPrice: number;
    discountPercentage: number;
    category: string;
    size: string;
    quantity: number;
    photoIds: string[];
}
