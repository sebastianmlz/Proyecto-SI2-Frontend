export interface Inventory {
    id: number;
    product_id: number;
    stock: number;
    price_usd: number;
    price_bs: number;
    active: boolean;
    created_at: string;
    updated_at: string;

    product: {
        id: number;
        uuid: string;
        brand_id: number;
        brand: {
            id: number;
            name: string;
            active: boolean;
        };
        category_id: number;
        category: {
            id: number;
            name: string;
            active: boolean;
        };
        name: string;
        description: string;
        active: boolean;
        image_url: string;
        model_3d_url: string;
        ar_url: string;
        technical_specifications: string;
        warranty: {
            id: number;
            description: string;
            duration_months: number;
        };
    };
}
