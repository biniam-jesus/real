/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ingredient, Dish, Table } from '../types';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: 'ing_beef', name: 'Raw Beef / Patty', unit: 'g', stock: 15000, minStock: 2000, costPerUnit: 1.2 },
  { id: 'ing_chicken', name: 'Chicken Meat', unit: 'g', stock: 18000, minStock: 1500, costPerUnit: 1.0 },
  { id: 'ing_cheese', name: 'Mozzarella & Cheddar', unit: 'g', stock: 8500, minStock: 1000, costPerUnit: 0.8 },
  { id: 'ing_bun', name: 'Premium Burger Bun', unit: 'pcs', stock: 150, minStock: 15, costPerUnit: 12.0 },
  { id: 'ing_lettuce', name: 'Fresh Lettuce & Veggies', unit: 'g', stock: 5000, minStock: 400, costPerUnit: 0.15 },
  { id: 'ing_tomato', name: 'Fresh Tomato', unit: 'g', stock: 8000, minStock: 500, costPerUnit: 0.12 },
  { id: 'ing_onion', name: 'Onion Red', unit: 'g', stock: 9500, minStock: 600, costPerUnit: 0.08 },
  { id: 'ing_mayo', name: 'Mayonnaise & Dips', unit: 'ml', stock: 6000, minStock: 400, costPerUnit: 0.2 },
  { id: 'ing_egg', name: 'Fresh Eggs', unit: 'pcs', stock: 80, minStock: 15, costPerUnit: 15.0 },
  { id: 'ing_potato', name: 'Idaho Potatoes', unit: 'g', stock: 25000, minStock: 3000, costPerUnit: 0.05 },
  { id: 'ing_sausage', name: 'Beef Sausage', unit: 'pcs', stock: 120, minStock: 10, costPerUnit: 25.0 },
  { id: 'ing_enjera', name: 'Enjera Flatbread', unit: 'pcs', stock: 350, minStock: 20, costPerUnit: 14.0 },
  { id: 'ing_berbere', name: 'Berbere Chili Spice', unit: 'ml', stock: 5000, minStock: 500, costPerUnit: 0.15 },
  { id: 'ing_tuna', name: 'Canned Tuna Flakes', unit: 'pcs', stock: 85, minStock: 6, costPerUnit: 85.0 },
  { id: 'ing_pasta', name: 'Premium Pasta Sheets/Noodles', unit: 'g', stock: 15000, minStock: 2000, costPerUnit: 0.08 },
  { id: 'ing_rice', name: 'Basmati Rice', unit: 'g', stock: 18000, minStock: 2000, costPerUnit: 0.07 },
  { id: 'ing_quanta', name: 'Dried Beef Quanta', unit: 'g', stock: 3500, minStock: 400, costPerUnit: 2.2 },
  { id: 'ing_flour', name: 'Pizza Dough & Baking Flour', unit: 'g', stock: 20000, minStock: 3000, costPerUnit: 0.04 },
  { id: 'ing_shir_pow', name: 'Shiro Gram Flour Blend', unit: 'g', stock: 12000, minStock: 500, costPerUnit: 0.35 },
  
  // Drinks, Sweets & Kids Additions
  { id: 'ing_avocado', name: 'Ripe Avocado', unit: 'pcs', stock: 180, minStock: 10, costPerUnit: 18.0 },
  { id: 'ing_mango', name: 'Sweet Mango', unit: 'pcs', stock: 150, minStock: 10, costPerUnit: 22.0 },
  { id: 'ing_papaya', name: 'Fresh Papaya', unit: 'pcs', stock: 120, minStock: 8, costPerUnit: 15.0 },
  { id: 'ing_pineapple', name: 'Fresh Pineapple', unit: 'pcs', stock: 90, minStock: 8, costPerUnit: 35.0 },
  { id: 'ing_orange', name: 'Fresh Orange', unit: 'pcs', stock: 140, minStock: 15, costPerUnit: 12.0 },
  { id: 'ing_strawberry', name: 'Strawberry Fruit Syrup', unit: 'g', stock: 5000, minStock: 500, costPerUnit: 0.25 },
  { id: 'ing_watermelon', name: 'Fresh Watermelon', unit: 'g', stock: 20000, minStock: 2000, costPerUnit: 0.05 },
  { id: 'ing_bread', name: 'Toasted Sandwich Bread', unit: 'pcs', stock: 240, minStock: 40, costPerUnit: 5.0 },
  { id: 'ing_coffee', name: 'Roasted Coffee Espresso Beans', unit: 'g', stock: 6000, minStock: 300, costPerUnit: 0.4 },
  { id: 'ing_milk', name: 'Fresh Milk', unit: 'ml', stock: 12000, minStock: 1000, costPerUnit: 0.09 },
  { id: 'ing_mojito_mint', name: 'Fresh Mint & Limestone Syrup', unit: 'g', stock: 1500, minStock: 100, costPerUnit: 0.3 },
  { id: 'ing_sugar', name: 'Refined Sugar Syrup', unit: 'g', stock: 15000, minStock: 1000, costPerUnit: 0.02 },
  { id: 'ing_chocolate', name: 'Premium Cocoa / Chocolate Sauce', unit: 'ml', stock: 4000, minStock: 400, costPerUnit: 0.15 },
  { id: 'ing_tea', name: 'Organic Tea Leaves', unit: 'pcs', stock: 500, minStock: 50, costPerUnit: 3.5 },

  // Packaging and Soft Drink Raw Materials
  { id: 'ing_takeaway', name: 'Takeaway Box container', unit: 'pcs', stock: 500, minStock: 30, costPerUnit: 15 },
  { id: 'ing_foil', name: 'Heavy Duty Foil Wrap', unit: 'pcs', stock: 300, minStock: 20, costPerUnit: 10 },
  { id: 'ing_cup', name: 'Beverage Cup with Lid', unit: 'pcs', stock: 650, minStock: 40, costPerUnit: 8 },
  { id: 'ing_softdrink', name: 'Soft Drink Standard Cans', unit: 'pcs', stock: 480, minStock: 30, costPerUnit: 40.0 },
  { id: 'ing_ambo', name: 'Ambo Mineral Water Cans', unit: 'pcs', stock: 250, minStock: 20, costPerUnit: 45.0 },
  { id: 'ing_sofi', name: 'Premium Bottled Malt Drinks', unit: 'pcs', stock: 320, minStock: 20, costPerUnit: 50.0 },
  { id: 'ing_water500ml', name: 'Bottled Mineral Water 500ml', unit: 'pcs', stock: 600, minStock: 50, costPerUnit: 15.0 },
  { id: 'ing_water1l', name: 'Bottled Mineral Water 1L', unit: 'pcs', stock: 400, minStock: 30, costPerUnit: 20.0 },
  { id: 'ing_water2l', name: 'Bottled Mineral Water 2L', unit: 'pcs', stock: 250, minStock: 20, costPerUnit: 28.0 }
];

export const INITIAL_TABLES: Table[] = [
  { id: 'tb1', name: 'Table 1', status: 'Empty' },
  { id: 'tb2', name: 'Table 2', status: 'Empty' },
  { id: 'tb3', name: 'Table 3', status: 'Empty' },
  { id: 'tb4', name: 'Table 4', status: 'Empty' },
  { id: 'tb5', name: 'Table 5', status: 'Empty' },
  { id: 'tb6', name: 'Table 6', status: 'Empty' },
  { id: 'tb7', name: 'Table 7', status: 'Empty' },
  { id: 'tb8', name: 'Table 8', status: 'Empty' },
  { id: 'tb_bar', name: 'Bar Counter', status: 'Empty' },
  { id: 'tb_tk', name: 'Takeaway', status: 'Empty' },
];

export const INITIAL_DISHES: Dish[] = [
  // ----------------------------------------------------
  // 1. Shega Traditional (9 Core Dishes, 7 Extras, 6 Drinks)
  // ----------------------------------------------------
  {
    id: 'trad_normal_firfir',
    name: 'Normal Firfir',
    category: 'Shega Traditional',
    subcategory: 'Dishes',
    description: 'Shredded enjera mixed with spice berbere sauce.',
    basePrice: 255,
    recipe: [
      { ingredientId: 'ing_enjera', quantity: 2.5 },
      { ingredientId: 'ing_berbere', quantity: 150 },
      { ingredientId: 'ing_onion', quantity: 50 }
    ]
  },
  {
    id: 'trad_tibs_firfir',
    name: 'Tibs Firfir',
    category: 'Shega Traditional',
    subcategory: 'Dishes',
    description: 'Shredded enjera mixed with spice berbere sauce and beef tibs.',
    basePrice: 375,
    recipe: [
      { ingredientId: 'ing_enjera', quantity: 2.5 },
      { ingredientId: 'ing_berbere', quantity: 150 },
      { ingredientId: 'ing_beef', quantity: 150 },
      { ingredientId: 'ing_onion', quantity: 60 }
    ]
  },
  {
    id: 'trad_quanta_firfir',
    name: 'Quanta Firfir',
    category: 'Shega Traditional',
    subcategory: 'Dishes',
    description: 'Shredded enjera mixed with spice berbere sauce with dried beef.',
    basePrice: 375,
    recipe: [
      { ingredientId: 'ing_enjera', quantity: 2.5 },
      { ingredientId: 'ing_berbere', quantity: 150 },
      { ingredientId: 'ing_quanta', quantity: 60 },
      { ingredientId: 'ing_onion', quantity: 50 }
    ]
  },
  {
    id: 'trad_tuna_firfir',
    name: 'Tuna Firfir',
    category: 'Shega Traditional',
    subcategory: 'Dishes',
    description: 'Shredded enjera mixed with spice berbere sauce and tuna.',
    basePrice: 430,
    recipe: [
      { ingredientId: 'ing_enjera', quantity: 2.5 },
      { ingredientId: 'ing_berbere', quantity: 150 },
      { ingredientId: 'ing_tuna', quantity: 1 },
      { ingredientId: 'ing_onion', quantity: 50 }
    ]
  },
  {
    id: 'trad_dirkosh_firfir',
    name: 'Dirkosh Firfir',
    category: 'Shega Traditional',
    subcategory: 'Dishes',
    description: 'Dried shredded enjera mixed with spice berbere sauce.',
    basePrice: 275,
    recipe: [
      { ingredientId: 'ing_enjera', quantity: 3.0 },
      { ingredientId: 'ing_berbere', quantity: 180 },
      { ingredientId: 'ing_onion', quantity: 60 }
    ]
  },
  {
    id: 'trad_chekena_tibs',
    name: 'Chekena Tibs',
    category: 'Shega Traditional',
    subcategory: 'Dishes',
    description: 'Pieces of chekena with onions and green peppers served with enjera.',
    basePrice: 420,
    recipe: [
      { ingredientId: 'ing_beef', quantity: 220 },
      { ingredientId: 'ing_enjera', quantity: 2.0 },
      { ingredientId: 'ing_onion', quantity: 80 },
      { ingredientId: 'ing_lettuce', quantity: 30 }
    ]
  },
  {
    id: 'trad_bozena',
    name: 'Bozena Shiro',
    category: 'Shega Traditional',
    subcategory: 'Dishes',
    description: 'Enjera with 2 sauces, tibs, egg, rice with meat.',
    basePrice: 385,
    recipe: [
      { ingredientId: 'ing_enjera', quantity: 2.0 },
      { ingredientId: 'ing_shir_pow', quantity: 40 },
      { ingredientId: 'ing_beef', quantity: 80 },
      { ingredientId: 'ing_egg', quantity: 1 },
      { ingredientId: 'ing_rice', quantity: 80 }
    ]
  },
  {
    id: 'trad_tegabino',
    name: 'Tegabino',
    category: 'Shega Traditional',
    subcategory: 'Dishes',
    description: 'Sauce made by thick shiro served with enjera.',
    basePrice: 310,
    recipe: [
      { ingredientId: 'ing_shir_pow', quantity: 65 },
      { ingredientId: 'ing_enjera', quantity: 2.0 },
      { ingredientId: 'ing_onion', quantity: 50 }
    ]
  },
  {
    id: 'trad_shiro',
    name: 'Shiro',
    category: 'Shega Traditional',
    subcategory: 'Dishes',
    description: 'Sauce with shiro and served with enjera.',
    basePrice: 255,
    recipe: [
      { ingredientId: 'ing_shir_pow', quantity: 45 },
      { ingredientId: 'ing_enjera', quantity: 2.0 },
      { ingredientId: 'ing_onion', quantity: 40 }
    ]
  },
  // Extras
  {
    id: 'ext_takeaway',
    name: 'Takeaway Box Extra',
    category: 'Shega Traditional',
    subcategory: 'Extras',
    description: 'Standard cardboard takeaway box container.',
    basePrice: 45,
    recipe: [{ ingredientId: 'ing_takeaway', quantity: 1 }]
  },
  {
    id: 'ext_cup',
    name: 'Cup Extra',
    category: 'Shega Traditional',
    subcategory: 'Extras',
    description: 'Extra custom takeaway cup with lid.',
    basePrice: 35,
    recipe: [{ ingredientId: 'ing_cup', quantity: 1 }]
  },
  {
    id: 'ext_foil',
    name: 'Foil Packaging Extra',
    category: 'Shega Traditional',
    subcategory: 'Extras',
    description: 'Heavy duty aluminum foil wrap.',
    basePrice: 50,
    recipe: [{ ingredientId: 'ing_foil', quantity: 1 }]
  },
  {
    id: 'ext_cheese',
    name: 'Cheese Extra Add-on',
    category: 'Shega Traditional',
    subcategory: 'Extras',
    description: 'Side portion of extra mozzarella & cheddar cheese.',
    basePrice: 60,
    recipe: [{ ingredientId: 'ing_cheese', quantity: 60 }]
  },
  {
    id: 'ext_bread',
    name: 'Bread Extra',
    category: 'Shega Traditional',
    subcategory: 'Extras',
    description: 'Extra loaf or slices of white bread toast.',
    basePrice: 35,
    recipe: [{ ingredientId: 'ing_bread', quantity: 3 }]
  },
  {
    id: 'ext_mayonnaise',
    name: 'Mayonnaise Extra',
    category: 'Shega Traditional',
    subcategory: 'Extras',
    description: 'Extra serving of signature dipping mayo.',
    basePrice: 60,
    recipe: [{ ingredientId: 'ing_mayo', quantity: 80 }]
  },
  {
    id: 'ext_enjera_single',
    name: 'Enjera Extra Piece',
    category: 'Shega Traditional',
    subcategory: 'Extras',
    description: 'Extra portion of authentic flat enjera.',
    basePrice: 35,
    recipe: [{ ingredientId: 'ing_enjera', quantity: 1 }]
  },
  // Soft Drinks (Traditional Page)
  {
    id: 'db_soft_normal',
    name: 'Soft Drinks',
    category: 'Shega Traditional',
    subcategory: 'Soft Drinks',
    description: 'Standard carbonated soft beverage can.',
    basePrice: 70,
    recipe: [{ ingredientId: 'ing_softdrink', quantity: 1 }]
  },
  {
    id: 'db_ambo_water',
    name: 'Ambo Water',
    category: 'Shega Traditional',
    subcategory: 'Soft Drinks',
    description: 'Refreshing carbonated mineral sparkling water.',
    basePrice: 80,
    recipe: [{ ingredientId: 'ing_ambo', quantity: 1 }]
  },
  {
    id: 'db_sofi_malt',
    name: 'Sofi Malt / Ngus / Sinq / Bertat',
    category: 'Shega Traditional',
    subcategory: 'Soft Drinks',
    description: 'Selection of delicious local malt energy drinks.',
    basePrice: 90,
    recipe: [{ ingredientId: 'ing_sofi', quantity: 1 }]
  },
  {
    id: 'db_water_500',
    name: 'Water 500 ml',
    category: 'Shega Traditional',
    subcategory: 'Soft Drinks',
    description: 'Standard bottled pure spring water 500ml.',
    basePrice: 50,
    recipe: [{ ingredientId: 'ing_water500ml', quantity: 1 }]
  },
  {
    id: 'db_water_1l',
    name: 'Water 1 Liter',
    category: 'Shega Traditional',
    subcategory: 'Soft Drinks',
    description: 'Large bottled pure spring water 1L.',
    basePrice: 60,
    recipe: [{ ingredientId: 'ing_water1l', quantity: 1 }]
  },
  {
    id: 'db_water_2l',
    name: 'Water 2 Liter',
    category: 'Shega Traditional',
    subcategory: 'Soft Drinks',
    description: 'Extra large family bottled spring water 2L.',
    basePrice: 75,
    recipe: [{ ingredientId: 'ing_water2l', quantity: 1 }]
  },

  // ----------------------------------------------------
  // 2. Shega Bites (5 Burgers, 6 Sandwiches, 7 Wraps/Burritos)
  // ----------------------------------------------------
  // Burgers
  {
    id: 'bite_shega_style_burger',
    name: 'Shega Style Burger',
    category: 'Shega Bites',
    subcategory: 'Burgers',
    description: 'Bread, beef sausage, beef, cheese, egg, vegetables, and mayo.',
    basePrice: 540,
    variants: [
      { name: 'Single', price: 540 },
      { name: 'Double', price: 695 },
      { name: 'Triple', price: 895 }
    ],
    recipe: [
      { ingredientId: 'ing_bun', quantity: 1 },
      { ingredientId: 'ing_beef', quantity: 150 },
      { ingredientId: 'ing_sausage', quantity: 1 },
      { ingredientId: 'ing_cheese', quantity: 20 },
      { ingredientId: 'ing_egg', quantity: 1 },
      { ingredientId: 'ing_lettuce', quantity: 15 },
      { ingredientId: 'ing_mayo', quantity: 15 }
    ]
  },
  {
    id: 'bite_chicken_burger',
    name: 'Chicken Burger',
    category: 'Shega Bites',
    subcategory: 'Burgers',
    description: 'Bread, chicken, cheese, sausage, vegetables, mayo.',
    basePrice: 565,
    variants: [
      { name: 'Single', price: 565 },
      { name: 'Double', price: 730 },
      { name: 'Triple', price: 885 }
    ],
    recipe: [
      { ingredientId: 'ing_bun', quantity: 1 },
      { ingredientId: 'ing_chicken', quantity: 140 },
      { ingredientId: 'ing_cheese', quantity: 20 },
      { ingredientId: 'ing_sausage', quantity: 1 },
      { ingredientId: 'ing_lettuce', quantity: 15 },
      { ingredientId: 'ing_mayo', quantity: 15 }
    ]
  },
  {
    id: 'bite_cheese_burger',
    name: 'Cheese Burger',
    category: 'Shega Bites',
    subcategory: 'Burgers',
    description: 'Bread, extra cheese, beef, vegetables, mayo.',
    basePrice: 495,
    variants: [
      { name: 'Single', price: 495 },
      { name: 'Double', price: 650 },
      { name: 'Triple', price: 820 }
    ],
    recipe: [
      { ingredientId: 'ing_bun', quantity: 1 },
      { ingredientId: 'ing_beef', quantity: 150 },
      { ingredientId: 'ing_cheese', quantity: 40 },
      { ingredientId: 'ing_lettuce', quantity: 15 },
      { ingredientId: 'ing_mayo', quantity: 15 }
    ]
  },
  {
    id: 'bite_beef_burger_menu',
    name: 'Beef Burger',
    category: 'Shega Bites',
    subcategory: 'Burgers',
    description: 'Bread, beef, vegetables, mayo.',
    basePrice: 445,
    variants: [
      { name: 'Single', price: 445 },
      { name: 'Double', price: 595 },
      { name: 'Triple', price: 710 }
    ],
    recipe: [
      { ingredientId: 'ing_bun', quantity: 1 },
      { ingredientId: 'ing_beef', quantity: 150 },
      { ingredientId: 'ing_lettuce', quantity: 15 },
      { ingredientId: 'ing_mayo', quantity: 15 }
    ]
  },
  {
    id: 'bite_juicy_burger',
    name: 'Juicy Burger',
    category: 'Shega Bites',
    subcategory: 'Burgers',
    description: 'Similar with Shega Style but extra juicy sauces.',
    basePrice: 585,
    variants: [
      { name: 'Single', price: 585 },
      { name: 'Double', price: 740 },
      { name: 'Triple', price: 935 }
    ],
    recipe: [
      { ingredientId: 'ing_bun', quantity: 1 },
      { ingredientId: 'ing_beef', quantity: 160 },
      { ingredientId: 'ing_sausage', quantity: 1 },
      { ingredientId: 'ing_cheese', quantity: 25 },
      { ingredientId: 'ing_egg', quantity: 1 },
      { ingredientId: 'ing_mayo', quantity: 30 }
    ]
  },
  {
    id: 'bite_fries_standard',
    name: 'French Fries',
    category: 'Shega Bites',
    subcategory: 'Burgers',
    description: 'Fried potatoes served with ketchup.',
    basePrice: 280,
    recipe: [
      { ingredientId: 'ing_potato', quantity: 250 },
      { ingredientId: 'ing_tomato', quantity: 20 }
    ]
  },
  // Sandwiches
  {
    id: 'bite_club_sandwich',
    name: 'Club Sandwich',
    category: 'Shega Bites',
    subcategory: 'Sandwiches',
    description: 'Toasted bread with beef, egg, mayo, vegetables, and French fries.',
    basePrice: 480,
    recipe: [
      { ingredientId: 'ing_bread', quantity: 3 },
      { ingredientId: 'ing_beef', quantity: 80 },
      { ingredientId: 'ing_egg', quantity: 1 },
      { ingredientId: 'ing_mayo', quantity: 20 },
      { ingredientId: 'ing_potato', quantity: 100 }
    ]
  },
  {
    id: 'bite_chicken_sandwich',
    name: 'Chicken Sandwich',
    category: 'Shega Bites',
    subcategory: 'Sandwiches',
    description: 'Grilled chicken breast sandwiched in sliced bread, added vegetables, sauces, and fries.',
    basePrice: 595,
    recipe: [
      { ingredientId: 'ing_bread', quantity: 3 },
      { ingredientId: 'ing_chicken', quantity: 100 },
      { ingredientId: 'ing_mayo', quantity: 20 },
      { ingredientId: 'ing_potato', quantity: 100 }
    ]
  },
  {
    id: 'bite_steak_sandwich',
    name: 'Steak Sandwich',
    category: 'Shega Bites',
    subcategory: 'Sandwiches',
    description: 'Grilled beef sandwiched in sliced bread, added vegetables, sauces, and fries.',
    basePrice: 550,
    recipe: [
      { ingredientId: 'ing_bread', quantity: 3 },
      { ingredientId: 'ing_beef', quantity: 100 },
      { ingredientId: 'ing_mayo', quantity: 20 },
      { ingredientId: 'ing_potato', quantity: 100 }
    ]
  },
  {
    id: 'bite_tuna_sandwich',
    name: 'Tuna Sandwich',
    category: 'Shega Bites',
    subcategory: 'Sandwiches',
    description: 'Sliced bread, canned tuna, signature sauces, vegetables served with fries.',
    basePrice: 590,
    recipe: [
      { ingredientId: 'ing_bread', quantity: 3 },
      { ingredientId: 'ing_tuna', quantity: 1 },
      { ingredientId: 'ing_mayo', quantity: 20 },
      { ingredientId: 'ing_potato', quantity: 100 }
    ]
  },
  {
    id: 'bite_egg_sandwich',
    name: 'Egg Sandwich',
    category: 'Shega Bites',
    subcategory: 'Sandwiches',
    description: 'Omelet eggs sandwiched with bread and sauces.',
    basePrice: 340,
    recipe: [
      { ingredientId: 'ing_bread', quantity: 2 },
      { ingredientId: 'ing_egg', quantity: 2 },
      { ingredientId: 'ing_mayo', quantity: 12 }
    ]
  },
  {
    id: 'bite_veg_sandwich',
    name: 'Vegetable Sandwich',
    category: 'Shega Bites',
    subcategory: 'Sandwiches',
    description: 'Fresh and seasonal vegetables with bread served with fries.',
    basePrice: 385,
    recipe: [
      { ingredientId: 'ing_bread', quantity: 3 },
      { ingredientId: 'ing_lettuce', quantity: 40 },
      { ingredientId: 'ing_tomato', quantity: 40 },
      { ingredientId: 'ing_potato', quantity: 100 }
    ]
  },
  // Wraps & Burritos
  {
    id: 'bite_shega_wrap',
    name: 'Shega Wrap',
    category: 'Shega Bites',
    subcategory: 'Wraps & Burritos',
    description: 'Chicken, beef, egg, cheese, vegetables, sauces wrapped with a pita and fries.',
    basePrice: 660,
    recipe: [
      { ingredientId: 'ing_chicken', quantity: 60 },
      { ingredientId: 'ing_beef', quantity: 60 },
      { ingredientId: 'ing_egg', quantity: 1 },
      { ingredientId: 'ing_cheese', quantity: 15 },
      { ingredientId: 'ing_potato', quantity: 100 }
    ]
  },
  {
    id: 'bite_chicken_wrap',
    name: 'Chicken Wrap',
    category: 'Shega Bites',
    subcategory: 'Wraps & Burritos',
    description: 'Chicken, vegetables, and sauces wrapped with fresh pita and fries.',
    basePrice: 580,
    recipe: [
      { ingredientId: 'ing_chicken', quantity: 100 },
      { ingredientId: 'ing_lettuce', quantity: 25 },
      { ingredientId: 'ing_potato', quantity: 100 }
    ]
  },
  {
    id: 'bite_beef_wrap',
    name: 'Beef Wrap',
    category: 'Shega Bites',
    subcategory: 'Wraps & Burritos',
    description: 'Beef, vegetables, and sauces wrapped with pita and fries.',
    basePrice: 530,
    recipe: [
      { ingredientId: 'ing_beef', quantity: 100 },
      { ingredientId: 'ing_lettuce', quantity: 25 },
      { ingredientId: 'ing_potato', quantity: 100 }
    ]
  },
  {
    id: 'bite_veg_wrap',
    name: 'Vegetable Wrap',
    category: 'Shega Bites',
    subcategory: 'Wraps & Burritos',
    description: 'Fresh vegetables wrapped with pita and fries.',
    basePrice: 395,
    recipe: [
      { ingredientId: 'ing_lettuce', quantity: 60 },
      { ingredientId: 'ing_tomato', quantity: 40 },
      { ingredientId: 'ing_potato', quantity: 100 }
    ]
  },
  {
    id: 'bite_shega_burrito',
    name: 'Shega Burrito',
    category: 'Shega Bites',
    subcategory: 'Wraps & Burritos',
    description: 'Chicken, beef, vegetables, rice, egg, cheese, wrapped and baked served with fries.',
    basePrice: 780,
    recipe: [
      { ingredientId: 'ing_chicken', quantity: 60 },
      { ingredientId: 'ing_beef', quantity: 60 },
      { ingredientId: 'ing_rice', quantity: 50 },
      { ingredientId: 'ing_egg', quantity: 1 },
      { ingredientId: 'ing_cheese', quantity: 15 },
      { ingredientId: 'ing_potato', quantity: 100 }
    ]
  },
  {
    id: 'bite_chicken_burrito',
    name: 'Chicken Burrito',
    category: 'Shega Bites',
    subcategory: 'Wraps & Burritos',
    description: 'Chicken, vegetables, rice, cheese, egg, wrapped and baked served with fries.',
    basePrice: 690,
    recipe: [
      { ingredientId: 'ing_chicken', quantity: 100 },
      { ingredientId: 'ing_rice', quantity: 55 },
      { ingredientId: 'ing_cheese', quantity: 15 },
      { ingredientId: 'ing_egg', quantity: 1 },
      { ingredientId: 'ing_potato', quantity: 100 }
    ]
  },
  {
    id: 'bite_beef_burrito',
    name: 'Beef Burrito',
    category: 'Shega Bites',
    subcategory: 'Wraps & Burritos',
    description: 'Beef, vegetables, rice, cheese, egg, wrapped and baked served with fries.',
    basePrice: 660,
    recipe: [
      { ingredientId: 'ing_beef', quantity: 100 },
      { ingredientId: 'ing_rice', quantity: 55 },
      { ingredientId: 'ing_cheese', quantity: 15 },
      { ingredientId: 'ing_egg', quantity: 1 },
      { ingredientId: 'ing_potato', quantity: 100 }
    ]
  },

  // ----------------------------------------------------
  // 3. Shega Kitchen (6 Chicken, 5 Rice Dishes)
  // ----------------------------------------------------
  // Chicken
  {
    id: 'kit_roasted_chicken',
    name: 'Roasted Chicken',
    category: 'Shega Kitchen',
    subcategory: 'Chicken',
    description: 'Oven-roasted chicken, with side rice and vegetables.',
    basePrice: 1600,
    variants: [
      { name: 'Half', price: 1600 },
      { name: 'Full', price: 2200 }
    ],
    recipe: [
      { ingredientId: 'ing_chicken', quantity: 600 },
      { ingredientId: 'ing_rice', quantity: 150 },
      { ingredientId: 'ing_onion', quantity: 50 }
    ]
  },
  {
    id: 'kit_chicken_breast',
    name: 'Chicken Breast',
    category: 'Shega Kitchen',
    subcategory: 'Chicken',
    description: 'Grilled chicken breast sided with rice and vegetables.',
    basePrice: 655,
    recipe: [
      { ingredientId: 'ing_chicken', quantity: 200 },
      { ingredientId: 'ing_rice', quantity: 120 },
      { ingredientId: 'ing_lettuce', quantity: 30 }
    ]
  },
  {
    id: 'kit_chicken_leg',
    name: 'Chicken Leg',
    category: 'Shega Kitchen',
    subcategory: 'Chicken',
    description: 'Grilled leg of chicken served with rice and vegetables.',
    basePrice: 640,
    recipe: [
      { ingredientId: 'ing_chicken', quantity: 220 },
      { ingredientId: 'ing_rice', quantity: 120 },
      { ingredientId: 'ing_tomato', quantity: 30 }
    ]
  },
  {
    id: 'kit_chicken_cutlet',
    name: 'Chicken Cutlet',
    category: 'Shega Kitchen',
    subcategory: 'Chicken',
    description: 'Crispy fried chicken fillet served with rice.',
    basePrice: 690,
    recipe: [
      { ingredientId: 'ing_chicken', quantity: 180 },
      { ingredientId: 'ing_rice', quantity: 120 },
      { ingredientId: 'ing_flour', quantity: 20 }
    ]
  },
  {
    id: 'kit_loaded_chicken',
    name: 'Loaded Chicken',
    category: 'Shega Kitchen',
    subcategory: 'Chicken',
    description: 'Crispy fried chicken with French fries and melted cheese.',
    basePrice: 630,
    recipe: [
      { ingredientId: 'ing_chicken', quantity: 150 },
      { ingredientId: 'ing_potato', quantity: 180 },
      { ingredientId: 'ing_cheese', quantity: 35 }
    ]
  },
  {
    id: 'kit_chicken_nuggets',
    name: 'Chicken Nuggets',
    category: 'Shega Kitchen',
    subcategory: 'Chicken',
    description: 'Golden brown bite-sized fried chicken with fries and mayo.',
    basePrice: 680,
    recipe: [
      { ingredientId: 'ing_chicken', quantity: 160 },
      { ingredientId: 'ing_potato', quantity: 150 },
      { ingredientId: 'ing_mayo', quantity: 15 }
    ]
  },
  // Rice Dishes
  {
    id: 'kit_rice_sauce',
    name: 'Rice with sauce',
    category: 'Shega Kitchen',
    subcategory: 'Rice Dishes',
    description: 'Rice with tomato sauce, seasoned with herbs and spices.',
    basePrice: 280,
    recipe: [
      { ingredientId: 'ing_rice', quantity: 180 },
      { ingredientId: 'ing_tomato', quantity: 90 },
      { ingredientId: 'ing_onion', quantity: 25 }
    ]
  },
  {
    id: 'kit_rice_meat',
    name: 'Rice with meat',
    category: 'Shega Kitchen',
    subcategory: 'Rice Dishes',
    description: 'Rice with minced meat, in a flavored sauce.',
    basePrice: 345,
    recipe: [
      { ingredientId: 'ing_rice', quantity: 180 },
      { ingredientId: 'ing_beef', quantity: 80 },
      { ingredientId: 'ing_tomato', quantity: 45 }
    ]
  },
  {
    id: 'kit_rice_veg',
    name: 'Rice with vegetables',
    category: 'Shega Kitchen',
    subcategory: 'Rice Dishes',
    description: 'Rice with colorful seasonal vegetables.',
    basePrice: 285,
    recipe: [
      { ingredientId: 'ing_rice', quantity: 180 },
      { ingredientId: 'ing_tomato', quantity: 30 },
      { ingredientId: 'ing_lettuce', quantity: 40 }
    ]
  },
  {
    id: 'kit_rice_tuna',
    name: 'Rice with tuna',
    category: 'Shega Kitchen',
    subcategory: 'Rice Dishes',
    description: 'Rice with tuna and light vegetables.',
    basePrice: 410,
    recipe: [
      { ingredientId: 'ing_rice', quantity: 180 },
      { ingredientId: 'ing_tuna', quantity: 1 },
      { ingredientId: 'ing_lettuce', quantity: 20 }
    ]
  },
  {
    id: 'kit_rice_chicken',
    name: 'Rice with Chicken',
    category: 'Shega Kitchen',
    subcategory: 'Rice Dishes',
    description: 'Rice with seasoned chicken and vegetables.',
    basePrice: 445,
    recipe: [
      { ingredientId: 'ing_rice', quantity: 180 },
      { ingredientId: 'ing_chicken', quantity: 90 },
      { ingredientId: 'ing_lettuce', quantity: 25 }
    ]
  },

  // ----------------------------------------------------
  // 4. Italian Dishes & Pizza (9 Pizzas & Custom Addons, 12 Pasta item variations)
  // ----------------------------------------------------
  // Pizza
  {
    id: 'ital_pizza_shega',
    name: 'Shega Pizza',
    category: 'Italian & Pizza',
    subcategory: 'Pizza',
    description: 'Mozzarella cheese, tomato sauce, chicken & beef sausage, onion, tomato, egg.',
    basePrice: 620,
    variants: [
      { name: 'Normal', price: 620 },
      { name: 'Extra Large', price: 740 }
    ],
    recipe: [
      { ingredientId: 'ing_flour', quantity: 200 },
      { ingredientId: 'ing_cheese', quantity: 120 },
      { ingredientId: 'ing_chicken', quantity: 40 },
      { ingredientId: 'ing_sausage', quantity: 1 },
      { ingredientId: 'ing_egg', quantity: 1 }
    ]
  },
  {
    id: 'ital_pizza_meat_lover',
    name: 'Meat Lover',
    category: 'Italian & Pizza',
    subcategory: 'Pizza',
    description: 'Beef, chicken, tuna, sausage, mozzarella, onion, tomato.',
    basePrice: 650,
    variants: [
      { name: 'Normal', price: 650 },
      { name: 'Extra Large', price: 780 }
    ],
    recipe: [
      { ingredientId: 'ing_flour', quantity: 200 },
      { ingredientId: 'ing_beef', quantity: 40 },
      { ingredientId: 'ing_chicken', quantity: 40 },
      { ingredientId: 'ing_tuna', quantity: 0.5 },
      { ingredientId: 'ing_sausage', quantity: 1 },
      { ingredientId: 'ing_cheese', quantity: 120 }
    ]
  },
  {
    id: 'ital_pizza_chicken',
    name: 'Chicken Pizza',
    category: 'Italian & Pizza',
    subcategory: 'Pizza',
    description: 'Chicken, tomato sauce, mozzarella, chili.',
    basePrice: 680,
    variants: [
      { name: 'Normal', price: 680 },
      { name: 'Extra Large', price: 820 }
    ],
    recipe: [
      { ingredientId: 'ing_flour', quantity: 200 },
      { ingredientId: 'ing_chicken', quantity: 100 },
      { ingredientId: 'ing_cheese', quantity: 120 },
      { ingredientId: 'ing_tomato', quantity: 30 }
    ]
  },
  {
    id: 'ital_pizza_beef',
    name: 'Beef Pizza',
    category: 'Italian & Pizza',
    subcategory: 'Pizza',
    description: 'Meat, thyme, tomato sauce.',
    basePrice: 510,
    variants: [
      { name: 'Normal', price: 510 },
      { name: 'Extra Large', price: 595 }
    ],
    recipe: [
      { ingredientId: 'ing_flour', quantity: 200 },
      { ingredientId: 'ing_beef', quantity: 100 },
      { ingredientId: 'ing_tomato', quantity: 40 }
    ]
  },
  {
    id: 'ital_pizza_margarita',
    name: 'Margarita Pizza',
    category: 'Italian & Pizza',
    subcategory: 'Pizza',
    description: 'Mozzarella cheese, tomato sauce, onion, tomato.',
    basePrice: 495,
    variants: [
      { name: 'Normal', price: 495 },
      { name: 'Extra Large', price: 585 }
    ],
    recipe: [
      { ingredientId: 'ing_flour', quantity: 200 },
      { ingredientId: 'ing_cheese', quantity: 130 },
      { ingredientId: 'ing_tomato', quantity: 40 }
    ]
  },
  {
    id: 'ital_pizza_veg',
    name: 'Vegetable Pizza',
    category: 'Italian & Pizza',
    subcategory: 'Pizza',
    description: 'Onion, tomato, spinach, tomato sauce, carrot, garlic, basil.',
    basePrice: 450,
    variants: [
      { name: 'Normal', price: 450 },
      { name: 'Extra Large', price: 510 }
    ],
    recipe: [
      { ingredientId: 'ing_flour', quantity: 200 },
      { ingredientId: 'ing_lettuce', quantity: 60 },
      { ingredientId: 'ing_tomato', quantity: 40 }
    ]
  },
  {
    id: 'ital_pizza_tuna',
    name: 'Tuna Pizza',
    category: 'Italian & Pizza',
    subcategory: 'Pizza',
    description: 'Tuna, tomato sauce, pepper, tomato, onion, olive.',
    basePrice: 560,
    variants: [
      { name: 'Normal', price: 560 },
      { name: 'Extra Large', price: 680 }
    ],
    recipe: [
      { ingredientId: 'ing_flour', quantity: 200 },
      { ingredientId: 'ing_tuna', quantity: 1 },
      { ingredientId: 'ing_cheese', quantity: 100 }
    ]
  },
  {
    id: 'ital_pizza_cheese_addon',
    name: 'With Cheese Add-on',
    category: 'Italian & Pizza',
    subcategory: 'Pizza',
    description: 'Pizza variants with secondary loaded double crust cheese.',
    basePrice: 660,
    variants: [
      { name: 'Normal', price: 660 },
      { name: 'Extra Large', price: 780 }
    ],
    recipe: [
      { ingredientId: 'ing_flour', quantity: 200 },
      { ingredientId: 'ing_cheese', quantity: 190 }
    ]
  },
  {
    id: 'ital_pizza_veg_addon',
    name: 'With Vegetable Add-on',
    category: 'Italian & Pizza',
    subcategory: 'Pizza',
    description: 'Pizza variants with extra garden vegetables topping.',
    basePrice: 590,
    variants: [
      { name: 'Normal', price: 590 },
      { name: 'Extra Large', price: 695 }
    ],
    recipe: [
      { ingredientId: 'ing_flour', quantity: 200 },
      { ingredientId: 'ing_cheese', quantity: 110 },
      { ingredientId: 'ing_lettuce', quantity: 90 }
    ]
  },
  // Pasta & Special Pasta
  {
    id: 'ital_lasagna',
    name: 'Lasagna',
    category: 'Italian & Pizza',
    subcategory: 'Pasta & Special Pasta',
    description: 'Lasagna layer, rich meat sauce, creamy béchamel, mozzarella.',
    basePrice: 750,
    recipe: [
      { ingredientId: 'ing_pasta', quantity: 150 },
      { ingredientId: 'ing_beef', quantity: 120 },
      { ingredientId: 'ing_cheese', quantity: 80 }
    ]
  },
  {
    id: 'ital_tagliatelle_bol',
    name: 'Tegliatelle Bolognese',
    category: 'Italian & Pizza',
    subcategory: 'Pasta & Special Pasta',
    description: 'Tagliatelle, beef, tomato ragu, cheese.',
    basePrice: 490,
    recipe: [
      { ingredientId: 'ing_pasta', quantity: 140 },
      { ingredientId: 'ing_beef', quantity: 100 },
      { ingredientId: 'ing_cheese', quantity: 20 }
    ]
  },
  {
    id: 'ital_fettuccine_alfredo',
    name: 'Fettuccine Alfredo',
    category: 'Italian & Pizza',
    subcategory: 'Pasta & Special Pasta',
    description: 'Fettuccine, creamy sauce, butter, cheese.',
    basePrice: 490,
    variants: [
      { name: 'Classic', price: 490 },
      { name: 'With chicken', price: 630 }
    ],
    recipe: [
      { ingredientId: 'ing_pasta', quantity: 140 },
      { ingredientId: 'ing_milk', quantity: 100 },
      { ingredientId: 'ing_cheese', quantity: 20 }
    ]
  },
  {
    id: 'ital_penne_bolognese',
    name: 'Penne Bolognese',
    category: 'Italian & Pizza',
    subcategory: 'Pasta & Special Pasta',
    description: 'Penne pasta, minced beef, tomato, herbs.',
    basePrice: 490,
    recipe: [
      { ingredientId: 'ing_pasta', quantity: 140 },
      { ingredientId: 'ing_beef', quantity: 100 }
    ]
  },
  {
    id: 'ital_farfalle_alfredo',
    name: 'Farfalle Alfredo',
    category: 'Italian & Pizza',
    subcategory: 'Pasta & Special Pasta',
    description: 'Bow-tie pasta, creamy Alfredo, butter, cheese.',
    basePrice: 490,
    variants: [
      { name: 'Classic', price: 490 },
      { name: 'With chicken', price: 630 }
    ],
    recipe: [
      { ingredientId: 'ing_pasta', quantity: 140 },
      { ingredientId: 'ing_milk', quantity: 100 },
      { ingredientId: 'ing_cheese', quantity: 20 }
    ]
  },
  {
    id: 'ital_pasta_sauce',
    name: 'Pasta with sauce',
    category: 'Italian & Pizza',
    subcategory: 'Pasta & Special Pasta',
    description: 'Classic pasta served with tomato sauce.',
    basePrice: 265,
    variants: [
      { name: 'Normal', price: 265 },
      { name: 'Large', price: 280 }
    ],
    recipe: [
      { ingredientId: 'ing_pasta', quantity: 140 },
      { ingredientId: 'ing_tomato', quantity: 60 }
    ]
  },
  {
    id: 'ital_pasta_meat',
    name: 'Pasta with meat',
    category: 'Italian & Pizza',
    subcategory: 'Pasta & Special Pasta',
    description: 'Tender pasta, minced meat, tomato-based sauce.',
    basePrice: 345,
    recipe: [
      { ingredientId: 'ing_pasta', quantity: 140 },
      { ingredientId: 'ing_beef', quantity: 80 }
    ]
  },
  {
    id: 'ital_pasta_veg',
    name: 'Pasta with vegetable',
    category: 'Italian & Pizza',
    subcategory: 'Pasta & Special Pasta',
    description: 'Colorful seasonal vegetables tossed with pasta.',
    basePrice: 290,
    recipe: [
      { ingredientId: 'ing_pasta', quantity: 140 },
      { ingredientId: 'ing_lettuce', quantity: 45 }
    ]
  },
  {
    id: 'ital_pasta_tuna',
    name: 'Pasta with tuna',
    category: 'Italian & Pizza',
    subcategory: 'Pasta & Special Pasta',
    description: 'Pasta mixed with tuna, cherry tomato sauce.',
    basePrice: 410,
    recipe: [
      { ingredientId: 'ing_pasta', quantity: 140 },
      { ingredientId: 'ing_tuna', quantity: 1 }
    ]
  },

  // ----------------------------------------------------
  // 5. Dessert Menu (12 Cakes/Baked goods, 3 Dessert Cups)
  // ----------------------------------------------------
  // Cakes & Baked Goods
  {
    id: 'des_white_forest',
    name: 'White Forest Cake',
    category: 'Dessert Menu',
    subcategory: 'Cakes & Baked Goods',
    description: 'Bite or slice of fluffy vanilla cake with cream coating.',
    basePrice: 180,
    recipe: [{ ingredientId: 'ing_sugar', quantity: 20 }]
  },
  {
    id: 'des_black_forest',
    name: 'Black Forest Cake',
    category: 'Dessert Menu',
    subcategory: 'Cakes & Baked Goods',
    description: 'Traditional rich chocolate slice with cherry hints.',
    basePrice: 210,
    recipe: [{ ingredientId: 'ing_sugar', quantity: 25 }]
  },
  {
    id: 'des_chocolate_cake',
    name: 'Chocolate Cake',
    category: 'Dessert Menu',
    subcategory: 'Cakes & Baked Goods',
    description: 'Decadent chocolate fudge coating cake.',
    basePrice: 250,
    recipe: [{ ingredientId: 'ing_chocolate', quantity: 30 }]
  },
  {
    id: 'des_caramel_cake',
    name: 'Caramel Cake',
    category: 'Dessert Menu',
    subcategory: 'Cakes & Baked Goods',
    description: 'Rich cooked sugar caramel drip cake slice.',
    basePrice: 230,
    recipe: [{ ingredientId: 'ing_sugar', quantity: 40 }]
  },
  {
    id: 'des_red_velvet',
    name: 'Red Velvet Cake',
    category: 'Dessert Menu',
    subcategory: 'Cakes & Baked Goods',
    description: 'Elegant textured velvet sponge cocoa hint slice.',
    basePrice: 220,
    recipe: [{ ingredientId: 'ing_sugar', quantity: 20 }]
  },
  {
    id: 'des_english_cake',
    name: 'English Cake',
    category: 'Dessert Menu',
    subcategory: 'Cakes & Baked Goods',
    description: 'English pound cake perfect side for high tea.',
    basePrice: 110,
    recipe: [{ ingredientId: 'ing_sugar', quantity: 15 }]
  },
  {
    id: 'des_cheese_cake',
    name: 'Cheese Cake',
    category: 'Dessert Menu',
    subcategory: 'Cakes & Baked Goods',
    description: 'Heavy standard baked cream cheese cake.',
    basePrice: 350,
    recipe: [{ ingredientId: 'ing_cheese', quantity: 50 }]
  },
  {
    id: 'des_cup_cake',
    name: 'Cup Cake',
    category: 'Dessert Menu',
    subcategory: 'Cakes & Baked Goods',
    description: 'Individual sized sweet cupcake topped with frosting.',
    basePrice: 110,
    recipe: [{ ingredientId: 'ing_sugar', quantity: 15 }]
  },
  {
    id: 'des_cream_puff',
    name: 'Cream Puff',
    category: 'Dessert Menu',
    subcategory: 'Cakes & Baked Goods',
    description: 'Classic choux pastry filled with sweet custard cream.',
    basePrice: 110,
    recipe: [{ ingredientId: 'ing_sugar', quantity: 10 }]
  },
  {
    id: 'des_donut',
    name: 'Donut',
    category: 'Dessert Menu',
    subcategory: 'Cakes & Baked Goods',
    description: 'Glazed sweet circular fried donut.',
    basePrice: 140,
    recipe: [{ ingredientId: 'ing_sugar', quantity: 18 }]
  },
  {
    id: 'des_mille_foglie',
    name: 'Mille Foglie',
    category: 'Dessert Menu',
    subcategory: 'Cakes & Baked Goods',
    description: 'Flaky puff layers alternating with vanilla cream.',
    basePrice: 130,
    recipe: [{ ingredientId: 'ing_sugar', quantity: 12 }]
  },
  {
    id: 'des_croissant',
    name: 'Croissant',
    category: 'Dessert Menu',
    subcategory: 'Cakes & Baked Goods',
    description: 'Butter-loaded golden crescent pastry.',
    basePrice: 120,
    recipe: [{ ingredientId: 'ing_flour', quantity: 60 }]
  },
  // Dessert Cups
  {
    id: 'des_cup_oreo',
    name: 'Oreo Dessert Cup',
    category: 'Dessert Menu',
    subcategory: 'Dessert Cups',
    description: 'Crushed cookies layered with sweet cream in a cup.',
    basePrice: 120,
    recipe: [{ ingredientId: 'ing_sugar', quantity: 20 }]
  },
  {
    id: 'des_cup_fruit',
    name: 'Fruit Dessert Cup',
    category: 'Dessert Menu',
    subcategory: 'Dessert Cups',
    description: 'Assorted seasonal fresh tropical fruits cup.',
    basePrice: 100,
    recipe: [{ ingredientId: 'ing_mango', quantity: 0.5 }]
  },
  {
    id: 'des_cup_chocolate',
    name: 'Chocolate Dessert Cup',
    category: 'Dessert Menu',
    subcategory: 'Dessert Cups',
    description: 'Rich chocolate mousse dessert in a cup.',
    basePrice: 120,
    recipe: [{ ingredientId: 'ing_chocolate', quantity: 45 }]
  },

  // ----------------------------------------------------
  // 6. Drinks (8 Juices, 6 Shakes, 5 Smoothies, 5 Iced Coffee, 5 Iced Tea, 5 Mojitos)
  // ----------------------------------------------------
  // Juices
  {
    id: 'dr_mixed_juice',
    name: 'Mixed Juice',
    category: 'Drinks',
    subcategory: 'Juices',
    description: 'Artfully muddled layered mixed tropical fruit nectars.',
    basePrice: 250,
    recipe: [
      { ingredientId: 'ing_mango', quantity: 0.5 },
      { ingredientId: 'ing_avocado', quantity: 0.5 },
      { ingredientId: 'ing_cup', quantity: 1 }
    ]
  },
  {
    id: 'dr_mango_juice',
    name: 'Mango Juice',
    category: 'Drinks',
    subcategory: 'Juices',
    description: 'Thick organic mango fruit juice.',
    basePrice: 220,
    recipe: [
      { ingredientId: 'ing_mango', quantity: 1.5 },
      { ingredientId: 'ing_cup', quantity: 1 }
    ]
  },
  {
    id: 'dr_papaya_juice',
    name: 'Papaya Juice',
    category: 'Drinks',
    subcategory: 'Juices',
    description: 'Rich and smooth papaya nectar.',
    basePrice: 190,
    recipe: [
      { ingredientId: 'ing_papaya', quantity: 1.2 },
      { ingredientId: 'ing_cup', quantity: 1 }
    ]
  },
  {
    id: 'dr_avocado_juice',
    name: 'Avocado Juice',
    category: 'Drinks',
    subcategory: 'Juices',
    description: 'Creamy local avocado puree.',
    basePrice: 230,
    recipe: [
      { ingredientId: 'ing_avocado', quantity: 1.5 },
      { ingredientId: 'ing_cup', quantity: 1 }
    ]
  },
  {
    id: 'dr_pineapple_juice',
    name: 'Pineapple Juice',
    category: 'Drinks',
    subcategory: 'Juices',
    description: 'Fresh pineapple juice.',
    basePrice: 260,
    recipe: [
      { ingredientId: 'ing_pineapple', quantity: 0.8 },
      { ingredientId: 'ing_cup', quantity: 1 }
    ]
  },
  {
    id: 'dr_orange_juice',
    name: 'Orange Juice',
    category: 'Drinks',
    subcategory: 'Juices',
    description: 'Freshly squeezed orange juice.',
    basePrice: 290,
    recipe: [
      { ingredientId: 'ing_orange', quantity: 3.5 },
      { ingredientId: 'ing_cup', quantity: 1 }
    ]
  },
  {
    id: 'dr_watermelon_juice',
    name: 'Watermelon Juice',
    category: 'Drinks',
    subcategory: 'Juices',
    description: 'Hydrating fresh watermelon juice.',
    basePrice: 240,
    recipe: [
      { ingredientId: 'ing_watermelon', quantity: 200 },
      { ingredientId: 'ing_cup', quantity: 1 }
    ]
  },
  {
    id: 'dr_strawberry_juice',
    name: 'Strawberry Juice',
    category: 'Drinks',
    subcategory: 'Juices',
    description: 'Sweet berry strawberry drink.',
    basePrice: 290,
    recipe: [
      { ingredientId: 'ing_strawberry', quantity: 80 },
      { ingredientId: 'ing_cup', quantity: 1 }
    ]
  },
  // Milkshakes
  {
    id: 'dr_shake_chocolate',
    name: 'Chocolate Milkshake',
    category: 'Drinks',
    subcategory: 'Milkshakes',
    description: 'Creamy milk blended with chocolate sauce and gelato.',
    basePrice: 290,
    recipe: [
      { ingredientId: 'ing_milk', quantity: 200 },
      { ingredientId: 'ing_chocolate', quantity: 35 }
    ]
  },
  {
    id: 'dr_shake_oreo',
    name: 'Oreo Milkshake',
    category: 'Drinks',
    subcategory: 'Milkshakes',
    description: 'Delicious cookies & cream milkshake.',
    basePrice: 295,
    recipe: [
      { ingredientId: 'ing_milk', quantity: 200 },
      { ingredientId: 'ing_sugar', quantity: 20 }
    ]
  },
  {
    id: 'dr_shake_strawberry',
    name: 'Strawberry Milkshake',
    category: 'Drinks',
    subcategory: 'Milkshakes',
    description: 'Vanilla ice cream blended with strawberry fruit purée.',
    basePrice: 340,
    recipe: [
      { ingredientId: 'ing_milk', quantity: 200 },
      { ingredientId: 'ing_strawberry', quantity: 80 }
    ]
  },
  {
    id: 'dr_shake_mango',
    name: 'Mango Shake',
    category: 'Drinks',
    subcategory: 'Milkshakes',
    description: 'Creamy blended milk and sweet mango.',
    basePrice: 280,
    recipe: [
      { ingredientId: 'ing_milk', quantity: 150 },
      { ingredientId: 'ing_mango', quantity: 1 }
    ]
  },
  {
    id: 'dr_shake_papaya',
    name: 'Papaya Shake',
    category: 'Drinks',
    subcategory: 'Milkshakes',
    description: 'Bespoke papaya and cold whole milk shake.',
    basePrice: 240,
    recipe: [
      { ingredientId: 'ing_milk', quantity: 150 },
      { ingredientId: 'ing_papaya', quantity: 1 }
    ]
  },
  {
    id: 'dr_shake_avocado',
    name: 'Avocado Shake',
    category: 'Drinks',
    subcategory: 'Milkshakes',
    description: 'Nutritious thick rich avocado milkshake.',
    basePrice: 280,
    recipe: [
      { ingredientId: 'ing_milk', quantity: 150 },
      { ingredientId: 'ing_avocado', quantity: 1 }
    ]
  },
  // Smoothies
  {
    id: 'dr_smooth_banana',
    name: 'Banana Smoothie',
    category: 'Drinks',
    subcategory: 'Smoothies',
    description: 'Blended banana base milkshake smoothie.',
    basePrice: 220,
    recipe: [
      { ingredientId: 'ing_milk', quantity: 200 },
      { ingredientId: 'ing_sugar', quantity: 10 }
    ]
  },
  {
    id: 'dr_smooth_st_banana',
    name: 'Strawberry Banana Smoothie',
    category: 'Drinks',
    subcategory: 'Smoothies',
    description: 'Blended strawberry and bananas smoothie.',
    basePrice: 310,
    recipe: [
      { ingredientId: 'ing_milk', quantity: 150 },
      { ingredientId: 'ing_strawberry', quantity: 60 }
    ]
  },
  {
    id: 'dr_smooth_ch_peabutter',
    name: 'Chocolate Peanut Butter',
    category: 'Drinks',
    subcategory: 'Smoothies',
    description: 'Smooth peanut butter blended with cocoa syrup.',
    basePrice: 295,
    recipe: [
      { ingredientId: 'ing_milk', quantity: 200 },
      { ingredientId: 'ing_chocolate', quantity: 40 }
    ]
  },
  {
    id: 'dr_smooth_green',
    name: 'Tropical Green Smoothie',
    category: 'Drinks',
    subcategory: 'Smoothies',
    description: 'Vitamins rich spinach and sweet green fruits.',
    basePrice: 280,
    recipe: [
      { ingredientId: 'ing_lettuce', quantity: 50 },
      { ingredientId: 'ing_mango', quantity: 0.5 }
    ]
  },
  {
    id: 'dr_smooth_berry_chia',
    name: 'Berry Chia (Protein) Smoothie',
    category: 'Drinks',
    subcategory: 'Smoothies',
    description: 'Protein rich berry shake with energy holding chia seeds.',
    basePrice: 350,
    recipe: [
      { ingredientId: 'ing_milk', quantity: 200 },
      { ingredientId: 'ing_strawberry', quantity: 80 }
    ]
  },
  // Iced Coffee
  {
    id: 'dr_iced_latte',
    name: 'Iced Latte',
    category: 'Drinks',
    subcategory: 'Iced Coffee',
    description: 'Espresso shot with chilled milk over ice cubes.',
    basePrice: 185,
    recipe: [
      { ingredientId: 'ing_coffee', quantity: 18 },
      { ingredientId: 'ing_milk', quantity: 180 },
      { ingredientId: 'ing_cup', quantity: 1 }
    ]
  },
  {
    id: 'dr_iced_caramel',
    name: 'Iced Caramel',
    category: 'Drinks',
    subcategory: 'Iced Coffee',
    description: 'Espresso with rich caramel syrup and ice.',
    basePrice: 220,
    recipe: [
      { ingredientId: 'ing_coffee', quantity: 18 },
      { ingredientId: 'ing_milk', quantity: 180 },
      { ingredientId: 'ing_sugar', quantity: 30 }
    ]
  },
  {
    id: 'dr_iced_chocolate',
    name: 'Iced Chocolate',
    category: 'Drinks',
    subcategory: 'Iced Coffee',
    description: 'Sweet iced cold double chocolate milk.',
    basePrice: 230,
    recipe: [
      { ingredientId: 'ing_milk', quantity: 200 },
      { ingredientId: 'ing_chocolate', quantity: 30 }
    ]
  },
  {
    id: 'dr_iced_mocha',
    name: 'Iced Mocha',
    category: 'Drinks',
    subcategory: 'Iced Coffee',
    description: 'Double espresso blended with cocoa chocolate.',
    basePrice: 250,
    recipe: [
      { ingredientId: 'ing_coffee', quantity: 18 },
      { ingredientId: 'ing_milk', quantity: 150 },
      { ingredientId: 'ing_chocolate', quantity: 20 }
    ]
  },
  {
    id: 'dr_iced_coffee',
    name: 'Iced Coffee',
    category: 'Drinks',
    subcategory: 'Iced Coffee',
    description: 'Fresh black coffee poured over ice.',
    basePrice: 160,
    recipe: [
      { ingredientId: 'ing_coffee', quantity: 18 },
      { ingredientId: 'ing_cup', quantity: 1 }
    ]
  },
  // Iced Tea
  {
    id: 'dr_tea_strawberry',
    name: 'Strawberry Iced Tea',
    category: 'Drinks',
    subcategory: 'Iced Tea',
    description: 'Brewed black tea with sweet strawberry purée.',
    basePrice: 185,
    recipe: [
      { ingredientId: 'ing_tea', quantity: 1 },
      { ingredientId: 'ing_strawberry', quantity: 40 }
    ]
  },
  {
    id: 'dr_tea_orange',
    name: 'Orange Iced Tea',
    category: 'Drinks',
    subcategory: 'Iced Tea',
    description: 'Brewed black iced tea with orange slice and squeeze.',
    basePrice: 175,
    recipe: [
      { ingredientId: 'ing_tea', quantity: 1 },
      { ingredientId: 'ing_orange', quantity: 1 }
    ]
  },
  {
    id: 'dr_tea_lemon',
    name: 'Lemon Iced Tea',
    category: 'Drinks',
    subcategory: 'Iced Tea',
    description: 'Chilled iced tea flavored with refreshing lime.',
    basePrice: 165,
    recipe: [
      { ingredientId: 'ing_tea', quantity: 1 },
      { ingredientId: 'ing_sugar', quantity: 15 }
    ]
  },
  {
    id: 'dr_tea_pineapple',
    name: 'Pineapple Iced Tea',
    category: 'Drinks',
    subcategory: 'Iced Tea',
    description: 'Chilled black iced tea with sweet pineapple hints.',
    basePrice: 175,
    recipe: [
      { ingredientId: 'ing_tea', quantity: 1 },
      { ingredientId: 'ing_pineapple', quantity: 0.3 }
    ]
  },
  {
    id: 'dr_tea_standard',
    name: 'Iced Tea',
    category: 'Drinks',
    subcategory: 'Iced Tea',
    description: 'Classic cold black iced tea.',
    basePrice: 125,
    recipe: [
      { ingredientId: 'ing_tea', quantity: 1 },
      { ingredientId: 'ing_cup', quantity: 1 }
    ]
  },
  // Mojitos
  {
    id: 'dr_mojito_classic',
    name: 'Classic Mojito',
    category: 'Drinks',
    subcategory: 'Mojitos',
    description: 'Refreshing muddled mint, lime, and standard soda.',
    basePrice: 260,
    recipe: [
      { ingredientId: 'ing_mojito_mint', quantity: 20 },
      { ingredientId: 'ing_cup', quantity: 1 }
    ]
  },
  {
    id: 'dr_mojito_lemon',
    name: 'Lemon Mojito',
    category: 'Drinks',
    subcategory: 'Mojitos',
    description: 'Lime loaded sparkling muddled beverage.',
    basePrice: 230,
    recipe: [
      { ingredientId: 'ing_mojito_mint', quantity: 10 },
      { ingredientId: 'ing_cup', quantity: 1 }
    ]
  },
  {
    id: 'dr_mojito_strawberry',
    name: 'Strawberry Mojito',
    category: 'Drinks',
    subcategory: 'Mojitos',
    description: 'Berry loaded sweet muddled mint mojito.',
    basePrice: 270,
    recipe: [
      { ingredientId: 'ing_mojito_mint', quantity: 15 },
      { ingredientId: 'ing_strawberry', quantity: 40 }
    ]
  },
  {
    id: 'dr_mojito_pineapple',
    name: 'Pineapple Mojito',
    category: 'Drinks',
    subcategory: 'Mojitos',
    description: 'Tangy sweet muddled mint and pineapple mojito.',
    basePrice: 250,
    recipe: [
      { ingredientId: 'ing_mojito_mint', quantity: 15 },
      { ingredientId: 'ing_pineapple', quantity: 0.3 }
    ]
  },
  {
    id: 'dr_mojito_cinnamon',
    name: 'Cinnamon Mojito',
    category: 'Drinks',
    subcategory: 'Mojitos',
    description: 'Muddled mint mojito with a warm spice hint of cinnamon.',
    basePrice: 220,
    recipe: [
      { ingredientId: 'ing_mojito_mint', quantity: 15 },
      { ingredientId: 'ing_sugar', quantity: 12 }
    ]
  },

  // ----------------------------------------------------
  // 7. የልጆች Menu (Kids Menu) (5 Breakfast, 5 Lunch/Dinner, 3 Juice/Drinks)
  // ----------------------------------------------------
  // ቁርስ (Breakfast)
  {
    id: 'kid_pancake',
    name: 'ሰነክ ፓንኬክ (Pancake Snack)',
    category: 'Kids Menu',
    subcategory: 'ቁርስ (Breakfast)',
    description: 'Mini bite-sized fluffy milk pancake snack.',
    basePrice: 225,
    recipe: [
      { ingredientId: 'ing_flour', quantity: 50 },
      { ingredientId: 'ing_milk', quantity: 60 },
      { ingredientId: 'ing_egg', quantity: 0.5 }
    ]
  },
  {
    id: 'kid_sweet_pasta',
    name: 'ስዊት ፓስታ ፎር ኪድስ (Sweet Pasta for Kids)',
    category: 'Kids Menu',
    subcategory: 'ቁርስ (Breakfast)',
    description: 'Fun sweet style pasta for children.',
    basePrice: 195,
    recipe: [
      { ingredientId: 'ing_pasta', quantity: 90 },
      { ingredientId: 'ing_sugar', quantity: 10 }
    ]
  },
  {
    id: 'kid_fruity_toast',
    name: 'ፍሩቲ ቶስት (Fruity Toast)',
    category: 'Kids Menu',
    subcategory: 'ቁርስ (Breakfast)',
    description: 'Toasted bread loaded with fresh chopped fruits.',
    basePrice: 195,
    recipe: [
      { ingredientId: 'ing_bread', quantity: 2 },
      { ingredientId: 'ing_mango', quantity: 0.3 }
    ]
  },
  {
    id: 'kid_mini_pizza',
    name: 'ሚኒ ፒዛ (Mini Pizza)',
    category: 'Kids Menu',
    subcategory: 'ቁርስ (Breakfast)',
    description: 'Bite-sized pepperoni and cheese pizza.',
    basePrice: 215,
    recipe: [
      { ingredientId: 'ing_flour', quantity: 80 },
      { ingredientId: 'ing_cheese', quantity: 40 }
    ]
  },
  {
    id: 'kid_scrambled_egg',
    name: 'ስካምብልድ ኤግ (Scrambled Egg)',
    category: 'Kids Menu',
    subcategory: 'ቁርስ (Breakfast)',
    description: 'Fluffy butter-scrambled eggs with toast.',
    basePrice: 285,
    recipe: [
      { ingredientId: 'ing_egg', quantity: 2 },
      { ingredientId: 'ing_bread', quantity: 1 }
    ]
  },
  // ምሳ / እራት (Lunch / Dinner)
  {
    id: 'kid_crab_burger',
    name: 'ሚስተር ክራብ በርገር (Mr. Crab Burger)',
    category: 'Kids Menu',
    subcategory: 'ምሳ / እራት (Lunch / Dinner)',
    description: 'Fun crab-shaped delicious burger with fries.',
    basePrice: 355,
    recipe: [
      { ingredientId: 'ing_bun', quantity: 1 },
      { ingredientId: 'ing_beef', quantity: 75 },
      { ingredientId: 'ing_potato', quantity: 60 }
    ]
  },
  {
    id: 'kid_mouse_pizza',
    name: 'ሚኒ ማውዝ ፒዛ (Minnie Mouse Pizza)',
    category: 'Kids Menu',
    subcategory: 'ምሳ / እራት (Lunch / Dinner)',
    description: 'Creative mouse shape cheese pizza.',
    basePrice: 385,
    recipe: [
      { ingredientId: 'ing_flour', quantity: 100 },
      { ingredientId: 'ing_cheese', quantity: 60 }
    ]
  },
  {
    id: 'kid_minion_nugget',
    name: 'ሚኒዮን ኑጌት (Minion Nuggets)',
    category: 'Kids Menu',
    subcategory: 'ምሳ / እራት (Lunch / Dinner)',
    description: 'Minion shape bite chicken nuggets with fries.',
    basePrice: 395,
    recipe: [
      { ingredientId: 'ing_chicken', quantity: 100 },
      { ingredientId: 'ing_potato', quantity: 80 }
    ]
  },
  {
    id: 'kid_tom_jerry',
    name: 'ቶም ኤንድ ጄሪ ቺክን (Tom & Jerry Chicken)',
    category: 'Kids Menu',
    subcategory: 'ምሳ / እራት (Lunch / Dinner)',
    description: 'Crispy custom fried chicken pieces.',
    basePrice: 390,
    recipe: [
      { ingredientId: 'ing_chicken', quantity: 120 },
      { ingredientId: 'ing_potato', quantity: 60 }
    ]
  },
  {
    id: 'kid_donald_fries',
    name: 'የዶናልድ ዳክ ፍራይስ (Donald Duck Fries)',
    category: 'Kids Menu',
    subcategory: 'ምሳ / እራት (Lunch / Dinner)',
    description: 'Golden smile-shaped fries with ketchup.',
    basePrice: 320,
    recipe: [
      { ingredientId: 'ing_potato', quantity: 200 }
    ]
  },
  // ጁስ (Juice / Drinks)
  {
    id: 'kid_straw_milk',
    name: 'ስትሮበሪ ሚልክ (Strawberry Milk)',
    category: 'Kids Menu',
    subcategory: 'ጁስ (Juice / Drinks)',
    description: 'Pink sweet strawberry flavored milk cup.',
    basePrice: 200,
    recipe: [
      { ingredientId: 'ing_milk', quantity: 150 },
      { ingredientId: 'ing_strawberry', quantity: 30 }
    ]
  },
  {
    id: 'kid_choco_milk',
    name: 'ቾኮሌት ሚልክ (Chocolate Milk)',
    category: 'Kids Menu',
    subcategory: 'ጁስ (Juice / Drinks)',
    description: 'Sweet creamy cocoa flavored cold milk cup.',
    basePrice: 180,
    recipe: [
      { ingredientId: 'ing_milk', quantity: 150 },
      { ingredientId: 'ing_chocolate', quantity: 20 }
    ]
  },
  {
    id: 'kid_orange_milk',
    name: 'ኦሬንጅ ሚልክ (Orange Milk)',
    category: 'Kids Menu',
    subcategory: 'ጁስ (Juice / Drinks)',
    description: 'Orange cream style refreshing thick beverage.',
    basePrice: 190,
    recipe: [
      { ingredientId: 'ing_milk', quantity: 120 },
      { ingredientId: 'ing_orange', quantity: 0.5 }
    ]
  }
];
