export interface Warranty {
    id: number;
    name: string;
    description: string;
    duration_months: number;
    brand: {
        id: number;
        name: string;
        active: boolean;
    };
    created_at: string;
    updated_at: string;
}
