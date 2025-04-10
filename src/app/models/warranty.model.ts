export interface Warranty {
    id: number;
    name: string;
    description: string;
    duration_months: number;
    created_at: string;   // formato ISO string (puede ser Date si luego lo parseas)
    updated_at: string;
}
