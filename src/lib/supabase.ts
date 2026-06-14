/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Ingredient, Dish, Table, Order, InventoryLog } from '../types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase Client if credentials are provided in the environment
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Checks if Supabase integration is active.
 */
export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};

/**
 * Supabase synchronization helpers. 
 * If Supabase is configured, it pulls and pushes actual real-time records.
 * If not, it returns null, letting the app gracefully fallback to localStorage.
 */
export const supabaseSync = {
  // --- INGREDIENTS ---
  async getIngredients(): Promise<Ingredient[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('shega_ingredients')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Ingredient[];
    } catch (err) {
      console.error('Error fetching ingredients from Supabase:', err);
      return null;
    }
  },

  async saveIngredients(ingredients: Ingredient[]): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('shega_ingredients')
        .upsert(ingredients);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error saving ingredients to Supabase:', err);
      return false;
    }
  },

  // --- DISHES ---
  async getDishes(): Promise<Dish[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('shega_dishes')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Dish[];
    } catch (err) {
      console.error('Error fetching dishes from Supabase:', err);
      return null;
    }
  },

  async saveDishes(dishes: Dish[]): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('shega_dishes')
        .upsert(dishes);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error saving dishes to Supabase:', err);
      return false;
    }
  },

  // --- TABLES ---
  async getTables(): Promise<Table[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('shega_tables')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Table[];
    } catch (err) {
      console.error('Error fetching tables from Supabase:', err);
      return null;
    }
  },

  async saveTables(tables: Table[]): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('shega_tables')
        .upsert(tables);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error saving tables to Supabase:', err);
      return false;
    }
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('shega_orders')
        .select('*')
        .order('createdAt', { ascending: false });
      if (error) throw error;
      return data as Order[];
    } catch (err) {
      console.error('Error fetching orders from Supabase:', err);
      return null;
    }
  },

  async saveOrder(order: Order): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('shega_orders')
        .upsert(order);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error saving order to Supabase:', err);
      return false;
    }
  },

  async saveAllOrders(orders: Order[]): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('shega_orders')
        .upsert(orders);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error saving all orders to Supabase:', err);
      return false;
    }
  },

  // --- INVENTORY LOGS ---
  async getInventoryLogs(): Promise<InventoryLog[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('shega_inventory_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as InventoryLog[];
    } catch (err) {
      console.error('Error fetching inventory logs from Supabase:', err);
      return null;
    }
  },

  async saveInventoryLog(log: InventoryLog): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('shega_inventory_logs')
        .upsert(log);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error saving inventory log to Supabase:', err);
      return false;
    }
  },

  async saveAllInventoryLogs(logs: InventoryLog[]): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('shega_inventory_logs')
        .upsert(logs);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error saving all logs to Supabase:', err);
      return false;
    }
  },

  // --- EMPLOYEES & ROLE-BASED ACCESS ---
  async getEmployees(): Promise<any[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('shega_employees')
        .select('*')
        .order('username');
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching employees from Supabase:', err);
      return null;
    }
  },

  async saveEmployee(employee: any): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('shega_employees')
        .upsert(employee);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error saving employee to Supabase:', err);
      return false;
    }
  },

  async saveAllEmployees(employees: any[]): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('shega_employees')
        .upsert(employees);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error saving all employees to Supabase:', err);
      return false;
    }
  }
};
