export interface ProductWithInventory {
    id: number;
    name: string;
    active: boolean;
    image_url: string;
    category: string;
    category_id: number,
    brand_id: number;
    warranty_id: number;
    technical_specifications: string;
    description: string;
    price_usd: number;
    stock: number;
    model_3d_url: string;
    ar_url: string;
    inventory_id: number;
}
