/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ingredient, Dish, Order, OrderItem, InventoryLog } from '../types';

/**
 * Calculates the total food cost of a recipe based on current ingredient costs
 */
export function calculateRecipeCost(dish: Dish, variantName: string | undefined, ingredients: Ingredient[], branchName?: 'Shegawan' | 'Teyim Shega'): number {
  let cost = 0;
  let multiplier = 1.0;

  if (variantName) {
    if (variantName === 'Double') multiplier = 2.0;
    if (variantName === 'Triple') multiplier = 3.0;
    if (variantName === 'Extra Large') multiplier = 1.5;
    if (variantName === 'Full') multiplier = 2.0;
  }

  for (const item of dish.recipe) {
    const ing = ingredients.find(i => i.id === item.ingredientId && (!branchName || i.branch === branchName));
    if (ing) {
      let qty = item.quantity * multiplier;
      
      // Special override cases
      if (dish.id === 'ital_fettuccine_alfredo' && variantName === 'With Chicken' && item.ingredientId === 'ing_chicken') {
        qty = 150; // Add 150g chicken
      }
      
      cost += qty * ing.costPerUnit;
    }
  }
  return Number(cost.toFixed(2));
}

/**
 * Calculates total cost of an entire order item list
 */
export function calculateOrderCost(items: OrderItem[], dishes: Dish[], ingredients: Ingredient[], branchName?: 'Shegawan' | 'Teyim Shega'): number {
  return items.reduce((sum, item) => {
    const dish = dishes.find(d => d.id === item.dishId);
    if (!dish) return sum;
    return sum + (calculateRecipeCost(dish, item.variantName, ingredients, branchName) * item.quantity);
  }, 0);
}

/**
 * Automatically calculates ingredient quantity to deduct for an order item
 */
export function getRequiredIngredientsForOrderItem(item: OrderItem, dishes: Dish[]): { [ingredientId: string]: number } {
  const requirements: { [ingredientId: string]: number } = {};
  const dish = dishes.find(d => d.id === item.dishId);
  if (!dish) return requirements;

  let multiplier = 1.0;
  const variantName = item.variantName;
  if (variantName) {
    if (variantName === 'Double') multiplier = 2.0;
    if (variantName === 'Triple') multiplier = 3.0;
    if (variantName === 'Extra Large') multiplier = 1.5;
    if (variantName === 'Full') multiplier = 2.0;
  }

  for (const recipeItem of dish.recipe) {
    let qty = recipeItem.quantity * multiplier;

    // Special override cases
    if (dish.id === 'ital_fettuccine_alfredo' && variantName === 'With Chicken' && recipeItem.ingredientId === 'ing_chicken') {
      qty = 150; // extra chicken
    }

    requirements[recipeItem.ingredientId] = (requirements[recipeItem.ingredientId] || 0) + (qty * item.quantity);
  }

  return requirements;
}

/**
 * Deducts ingredients from current inventory and returns updated inventory + logs
 */
/**
 * Deducts ingredients from current inventory and returns updated inventory + logs
 */
export function deductIngredientsForOrder(
  order: Order,
  ingredients: Ingredient[],
  dishes: Dish[],
  branchName?: 'Shegawan' | 'Teyim Shega'
): { updatedIngredients: Ingredient[]; logs: InventoryLog[] } {
  const updatedIngredients = [...ingredients.map(ing => ({ ...ing }))];
  const logs: InventoryLog[] = [];
  const activeBranch = branchName || order.branch || 'Shegawan';

  for (const item of order.items) {
    const requirements = getRequiredIngredientsForOrderItem(item, dishes);
    
    for (const [ingId, qtyNeeded] of Object.entries(requirements)) {
      const ingIndex = updatedIngredients.findIndex(i => i.id === ingId && (i.branch === activeBranch));
      if (ingIndex !== -1) {
        updatedIngredients[ingIndex].stock = Math.max(0, Number((updatedIngredients[ingIndex].stock - qtyNeeded).toFixed(2)));
        
        logs.push({
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          ingredientId: ingId,
          ingredientName: updatedIngredients[ingIndex].name,
          amountChanged: -qtyNeeded,
          type: 'Deduction',
          timestamp: new Date().toISOString(),
          reference: `Order #${order.orderNumber} served`,
          branch: activeBranch
        });
      }
    }
  }

  return { updatedIngredients, logs };
}

/**
 * Pre-seeds 7 days of realistic history for reports for a particular branch
 */
export function generateSeedOrders(
  dishes: Dish[],
  ingredients: Ingredient[],
  branchName: 'Shegawan' | 'Teyim Shega'
): { seededOrders: Order[]; updatedIngredients: Ingredient[]; seededLogs: InventoryLog[] } {
  const seededOrders: Order[] = [];
  let currentIngredients = [...ingredients.map(ing => ({ ...ing }))];
  const seededLogs: InventoryLog[] = [];
  
  // Create orders over last 7 days
  const now = new Date();
  let orderNumber = branchName === 'Shegawan' ? 1001 : 5001;

  // Let's seed simple order frequencies per dish
  // Days of replication: last 7 days
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // 3 to 6 orders per day
    const ordersToday = 4 + Math.floor(Math.random() * 4);

    for (let o = 0; o < ordersToday; o++) {
      // Pick random time during open hours (11:00 to 22:00)
      const hour = 11 + Math.floor(Math.random() * 11);
      const minute = Math.floor(Math.random() * 60);
      const orderTime = new Date(targetDate);
      orderTime.setHours(hour, minute, 0, 0);

      // Random table
      const isTakeaway = Math.random() > 0.4;
      const tableId = isTakeaway ? 'tb_tk' : `tb${Math.floor(Math.random() * 8) + 1}`;
      const tableName = isTakeaway ? 'Takeaway' : `Table ${tableId.replace('tb', '')}`;

      // 1 to 3 items in order
      const itemsCount = 1 + Math.floor(Math.random() * 3);
      const items: OrderItem[] = [];
      let orderTotal = 0;

      // Ensure we don't pick duplicate items in same order
      const chosenDishes = new Set<string>();

      for (let itemIdx = 0; itemIdx < itemsCount; itemIdx++) {
        const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
        if (chosenDishes.has(randomDish.id)) continue;
        chosenDishes.add(randomDish.id);

        let price = randomDish.basePrice;
        let variantName: string | undefined = undefined;

        if (randomDish.variants && randomDish.variants.length > 0) {
          const variant = randomDish.variants[Math.floor(Math.random() * randomDish.variants.length)];
          variantName = variant.name;
          price = variant.price;
        }

        const quantity = 1 + Math.floor(Math.random() * 2);
        
        items.push({
          dishId: randomDish.id,
          dishName: randomDish.name,
          variantName,
          quantity,
          price
        });
        
        orderTotal += price * quantity;
      }

      const orderId = `seed_${branchName === 'Shegawan' ? 'shg' : 'tym'}_${orderNumber}`;
      const mockOrder: Order = {
        id: orderId,
        orderNumber: orderNumber++,
        tableId: branchName === 'Shegawan' ? `shg_${tableId}` : `tym_${tableId}`,
        tableName,
        items,
        total: orderTotal,
        status: 'Served', // Seeded orders are historic and already served
        createdAt: orderTime.toISOString(),
        servedAt: new Date(orderTime.getTime() + 15 * 60 * 1000).toISOString(), // 15 mins later
        branch: branchName
      };

      // Deduct ingredients for this seeded order
      const deduction = deductIngredientsForOrder(mockOrder, currentIngredients, dishes, branchName);
      currentIngredients = deduction.updatedIngredients;
      seededLogs.push(...deduction.logs.map(log => ({ ...log, timestamp: orderTime.toISOString(), branch: branchName })));
      seededOrders.push(mockOrder);
    }
  }

  return { seededOrders, updatedIngredients: currentIngredients, seededLogs };
}
