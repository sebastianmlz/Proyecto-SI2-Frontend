import { Brand } from "./brand.model";
import { Category } from "./category.model";
import { Inventory } from "./inventario.model";
import { Warranty } from "./warranty.model";

export interface Product {
    id: number;
    name: string;
    active: boolean;
    image_url: string;
    category: Category;
    brand: Brand;
    warranty: Warranty; // Nuevo
    inventory: Inventory; // Nuevo
    stock: number;      // Nuevo
    technical_specifications: string;
    description: string;
    price_usd: number;
    created_at: string;
}
