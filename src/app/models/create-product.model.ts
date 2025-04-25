export interface CreateProduct {
    brand_id: number;
    category_id: number;
    warranty_id: number;
    name: string;
    description: string;
    active: boolean;
    image_url: File; // CAMBIADO: antes era string
    technical_specifications: string;
    price_usd: number;
    created_at: string
    stock: number
}
