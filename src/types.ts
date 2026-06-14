/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ingredient {
  id: string;
  name: string;
  unit: string; // e.g., "g", "ml", "pcs", "slice"
  stock: number;
  minStock: number; // Alerts when stock <= minStock
  costPerUnit: number; // Food cost per unit
  branch?: 'Shegawan' | 'Teyim Shega';
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number; // Quantity needed for 1 portion of dish/variant
}

export interface DishVariant {
  name: string; // "Single" | "Double" | "Triple" or "Normal" | "Extra Large"
  price: number;
}

export interface Dish {
  id: string;
  name: string;
  category: string; // "Shega Traditional" | "Shega Bites" | "Shega Kitchen" | "Italian & Pizza" | "Dessert" | "Drinks" | "Kids Menu"
  subcategory: string; // e.g., "Burgers", "Pizza", "Traditional Dishes"
  description: string;
  basePrice: number;
  variants?: DishVariant[];
  recipe: RecipeIngredient[];
  yield?: number; // Batch servings yield for the recipe (defaults to 1 portion)
}

export interface Table {
  id: string;
  name: string; // "Table 1", "Table 2", "Takeaway"
  status: 'Empty' | 'Occupied' | 'Unclean';
  currentOrderId?: string;
  branch?: 'Shegawan' | 'Teyim Shega';
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';

export interface OrderItem {
  dishId: string;
  dishName: string;
  variantName?: string; // e.g. "Double"
  quantity: number;
  price: number; // Price per item (including variant adjustment)
}

export interface Order {
  id: string;
  orderNumber: number;
  tableId: string;
  tableName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  servedAt?: string;
  branch?: 'Shegawan' | 'Teyim Shega';
  waiterName?: string;
  specialNote?: string;
  extras?: { name: string; price: number }[];
}

export interface InventoryLog {
  id: string;
  ingredientId: string;
  ingredientName: string;
  amountChanged: number; // Negative for deduction, Positive for manual stock update
  type: 'Deduction' | 'Adjustment' | 'Restock';
  timestamp: string;
  reference?: string; // Order number or edit reason
  branch?: 'Shegawan' | 'Teyim Shega';
  actorName?: string;
  actorRole?: UserRole;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  branch: 'Shegawan' | 'Teyim Shega';
}

export type UserRole = 'Admin' | 'Chef' | 'Waiter';

export interface AuthUser {
  username: string;
  role: UserRole;
  branch: 'Shegawan' | 'Teyim Shega';
}

