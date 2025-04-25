export interface Inventory {
    id?: number;
    product: number;  // 🔁 este es el ID del producto relacionado
    stock: number;
    created_at?: string;
    updated_at?: string;
}
