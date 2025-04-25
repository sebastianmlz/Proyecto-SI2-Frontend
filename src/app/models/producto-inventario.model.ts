export interface ProductWithInventory {
    id: number;
    name: string;
    active: boolean;
    image_url: string;
    category: number; // ← cambio aquí
    technical_specifications: string;
    description: string;
    price_usd: number;
    stock: number;
}
