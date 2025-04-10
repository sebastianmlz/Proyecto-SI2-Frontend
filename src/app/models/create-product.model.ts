export interface CreateProduct {
    brand_id: number;
    category_id: number;
    warranty_id: number;
    name: string;
    description: string;
    active: boolean;
    image_url: File; // CAMBIADO: antes era string
    model_3d_url?: string; // OPCIONAL
    ar_url?: string;       // OPCIONAL
    technical_specifications: string;
}
