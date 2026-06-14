/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Ingredient, Dish, RecipeIngredient, AuthUser } from '../types';
import { calculateRecipeCost } from '../utils/helpers';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  Edit3, 
  Layers, 
  Trash2, 
  Coins, 
  Scale, 
  SlidersHorizontal,
  PlusCircle,
  HelpCircle,
  Check,
  Sparkles,
  BookOpen,
  Percent,
  TrendingUp,
  Gauge,
  ArrowRight,
  Info
} from 'lucide-react';

interface CatalogPreset {
  name: string;
  category: string;
  unit: string;
  costPerUnit: number;
  minStock: number;
  emoji: string;
}

const CATALOG_PRESETS: CatalogPreset[] = [
  { name: 'Ground Beef', category: 'Meat & Seafood', unit: 'g', costPerUnit: 0.35, minStock: 1000, emoji: '🥩' },
  { name: 'Chicken Breast', category: 'Meat & Seafood', unit: 'g', costPerUnit: 0.28, minStock: 1000, emoji: '🍗' },
  { name: 'Fish Fillet', category: 'Meat & Seafood', unit: 'g', costPerUnit: 0.38, minStock: 800, emoji: '🐟' },
  { name: 'Cheddar Cheese', category: 'Dairy & Eggs', unit: 'g', costPerUnit: 0.45, minStock: 1000, emoji: '🧀' },
  { name: 'Fresh Milk', category: 'Dairy & Eggs', unit: 'ml', costPerUnit: 0.08, minStock: 2000, emoji: '🥛' },
  { name: 'Butter', category: 'Dairy & Eggs', unit: 'g', costPerUnit: 0.32, minStock: 500, emoji: '🧈' },
  { name: 'Eggs', category: 'Dairy & Eggs', unit: 'pcs', costPerUnit: 12.0, minStock: 50, emoji: '🥚' },
  { name: 'Burger Buns', category: 'Bakery', unit: 'pcs', costPerUnit: 15.0, minStock: 100, emoji: '🍔' },
  { name: 'Pizza Dough', category: 'Bakery', unit: 'pcs', costPerUnit: 25.0, minStock: 50, emoji: '🍕' },
  { name: 'Tortilla Wraps', category: 'Bakery', unit: 'pcs', costPerUnit: 18.0, minStock: 50, emoji: '🫓' },
  { name: 'Tomato', category: 'Produce', unit: 'g', costPerUnit: 0.06, minStock: 3000, emoji: '🍅' },
  { name: 'Onion', category: 'Produce', unit: 'g', costPerUnit: 0.04, minStock: 3000, emoji: '🧅' },
  { name: 'Garlic', category: 'Produce', unit: 'g', costPerUnit: 0.12, minStock: 500, emoji: '🧄' },
  { name: 'Lettuce', category: 'Produce', unit: 'g', costPerUnit: 0.05, minStock: 2000, emoji: '🥬' },
  { name: 'Potato', category: 'Produce', unit: 'g', costPerUnit: 0.08, minStock: 5000, emoji: '🥔' },
  { name: 'Vegetable Oil', category: 'Oils & Condiments', unit: 'ml', costPerUnit: 0.12, minStock: 2000, emoji: '🫗' },
  { name: 'Tomato Paste', category: 'Oils & Condiments', unit: 'g', costPerUnit: 0.15, minStock: 1000, emoji: '🥫' },
  { name: 'Mayonnaise', category: 'Oils & Condiments', unit: 'g', costPerUnit: 0.18, minStock: 1000, emoji: '🥣' },
  { name: 'Coffee Beans', category: 'Drinks & Grains', unit: 'g', costPerUnit: 0.14, minStock: 2000, emoji: '☕' },
  { name: 'Teabag', category: 'Drinks & Grains', unit: 'pcs', costPerUnit: 3.5, minStock: 100, emoji: '🍵' },
  { name: 'Sugar', category: 'Drinks & Grains', unit: 'g', costPerUnit: 0.05, minStock: 2000, emoji: '🍬' },
  { name: 'Salt', category: 'Drinks & Grains', unit: 'g', costPerUnit: 0.02, minStock: 1000, emoji: '🧂' },
];

interface RecipeStockDashboardProps {
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  dishes: Dish[];
  setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
  logManualAdjustment: (ingredientId: string, oldQty: number, newQty: number, reason: string) => void;
  addAuditLog?: (action: string, details: string) => void;
  user?: AuthUser;
}

export default function RecipeStockDashboard({
  ingredients,
  setIngredients,
  dishes,
  setDishes,
  logManualAdjustment,
  addAuditLog,
  user
}: RecipeStockDashboardProps) {
  const [ingSearch, setIngSearch] = useState('');
  const [dishSearch, setDishSearch] = useState('');
  const [mobileTab, setMobileTab] = useState<'inventory' | 'recipes'>('inventory');
  
  // Dashboard mode and calculators state
  const [dashboardTab, setDashboardTab] = useState<'formulas' | 'yieldMargins'>('formulas');
  const [inflationPercent, setInflationPercent] = useState<number>(0);
  const [selectedMarginDish, setSelectedMarginDish] = useState<Dish | null>(null);
  const [marginDishSearch, setMarginDishSearch] = useState('');
  const [targetMarginGoal, setTargetMarginGoal] = useState<number>(70);
  const [selectedMarginAddIngId, setSelectedMarginAddIngId] = useState('');
  const [selectedMarginAddQty, setSelectedMarginAddQty] = useState(10);
  
  // Create / Edit Ingredient Form state
  const [showIngModal, setShowIngModal] = useState(false);
  const [editingIng, setEditingIng] = useState<Ingredient | null>(null);
  const [ingForm, setIngForm] = useState({
    name: '',
    unit: 'g',
    stock: 0,
    minStock: 250,
    costPerUnit: 0.1
  });

  // Ingredient creation mode state (Preset catalog vs custom specs)
  const [ingCreationTab, setIngCreationTab] = useState<'presets' | 'custom'>('presets');
  const [presetSearch, setPresetSearch] = useState('');
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<string>('All');
  const [pickedPreset, setPickedPreset] = useState<CatalogPreset | null>(null);

  // Manual Stock Quick Adjustment state (single click)
  const [quickAdjustIngId, setQuickAdjustIngId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Manual Restock');

  // Food margin sandbox simulation states
  const [simulatedRecipe, setSimulatedRecipe] = useState<RecipeIngredient[]>([]);
  const [simulatedPrice, setSimulatedPrice] = useState<number>(0);
  const [simulatedYield, setSimulatedYield] = useState<number>(1);

  React.useEffect(() => {
    if (selectedMarginDish) {
      setSimulatedRecipe([...selectedMarginDish.recipe]);
      setSimulatedPrice(selectedMarginDish.basePrice);
      setSimulatedYield(selectedMarginDish.yield || 1);
    } else {
      setSimulatedRecipe([]);
      setSimulatedPrice(0);
      setSimulatedYield(1);
    }
  }, [selectedMarginDish?.id]);

  const handleSimulateAddIngredient = () => {
    if (!selectedMarginAddIngId) return;
    const qty = Number(selectedMarginAddQty) || 10;
    
    setSimulatedRecipe(prev => {
      const existingIdx = prev.findIndex(item => item.ingredientId === selectedMarginAddIngId);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + qty
        };
        return updated;
      } else {
        return [...prev, { ingredientId: selectedMarginAddIngId, quantity: qty }];
      }
    });

    // Reset selection input
    setSelectedMarginAddIngId('');
  };

  const handleSimulateRemoveIngredient = (ingId: string) => {
    setSimulatedRecipe(prev => prev.filter(item => item.ingredientId !== ingId));
  };

  const handleSimulateQtyChange = (ingId: string, value: number) => {
    setSimulatedRecipe(prev => prev.map(item => {
      if (item.ingredientId === ingId) {
        return { ...item, quantity: Math.max(0, value) };
      }
      return item;
    }));
  };

  const handleSaveSimulatedSpecs = (dishId: string, currentPrice: number, currentYield: number) => {
    setDishes(prev => prev.map(d => {
      if (d.id === dishId) {
        return {
          ...d,
          basePrice: currentPrice,
          yield: currentYield,
          recipe: [...simulatedRecipe]
        };
      }
      return d;
    }));
    if (addAuditLog) {
      addAuditLog('Sandbox Formulas Saved', `Committed simulated sandbox recipe and portion price updates to standard menu folder.`);
    }
  };

  // Create Menu Dish Form state
  const [showDishModal, setShowDishModal] = useState(false);
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'Shega Bites',
    subcategory: 'Burgers',
    description: '',
    basePrice: 100
  });

  const handleDishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishForm.name.trim()) return;

    const newDish: Dish = {
      id: `dish_${Date.now()}`,
      name: dishForm.name.trim(),
      category: dishForm.category,
      subcategory: dishForm.subcategory.trim(),
      description: dishForm.description.trim(),
      basePrice: Number(dishForm.basePrice),
      recipe: []
    };

    setDishes(prev => [...prev, newDish]);
    if (addAuditLog) {
      addAuditLog(
        "Menu Dish Added",
        `Created new dish "${newDish.name}" under category "${newDish.category}" at Base Price: ${newDish.basePrice} Br.`
      );
    }
    setShowDishModal(false);
    setDishForm({
      name: '',
      category: 'Shega Bites',
      subcategory: 'Burgers',
      description: '',
      basePrice: 100
    });
  };

  // Recipe definition mode
  const [selectedRecipeDish, setSelectedRecipeDish] = useState<Dish | null>(null);
  const [addedRecipeItem, setAddedRecipeItem] = useState<{ ingredientId: string; quantity: number }>({
    ingredientId: ingredients[0]?.id || '',
    quantity: 10
  });

  // State to track if creating a completely new ingredient inline
  const [isCreatingNewIngInline, setIsCreatingNewIngInline] = useState(false);
  const [newIngInlineName, setNewIngInlineName] = useState('');
  const [newIngInlineUnit, setNewIngInlineUnit] = useState('g');
  const [newIngInlineCost, setNewIngInlineCost] = useState(0.1);

  // Sync default ingredient selected ID when list changes or added
  React.useEffect(() => {
    if (ingredients.length > 0 && !addedRecipeItem.ingredientId) {
      setAddedRecipeItem(prev => ({
        ...prev,
        ingredientId: ingredients[0].id
      }));
    }
  }, [ingredients, addedRecipeItem.ingredientId]);

  // Handle Ingredient Form Submit
  const handleIngSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingForm.name.trim()) return;

    if (editingIng) {
      // Edit
      const oldQty = editingIng.stock;
      const newQty = Number(ingForm.stock);
      setIngredients(prev => prev.map(ing => {
        if (ing.id === editingIng.id) {
          return {
            ...ing,
            name: ingForm.name,
            unit: ingForm.unit,
            stock: newQty,
            minStock: Number(ingForm.minStock),
            costPerUnit: Number(ingForm.costPerUnit)
          };
        }
        return ing;
      }));

      if (oldQty !== newQty) {
        logManualAdjustment(editingIng.id, oldQty, newQty, 'Updated in Profile Edit');
      }
    } else {
      // Create new
      const newId = `ing_${Date.now()}`;
      const newIng: Ingredient = {
        id: newId,
        name: ingForm.name,
        unit: ingForm.unit,
        stock: Number(ingForm.stock),
        minStock: Number(ingForm.minStock),
        costPerUnit: Number(ingForm.costPerUnit)
      };
      setIngredients(prev => [...prev, newIng]);
      logManualAdjustment(newId, 0, newIng.stock, 'Initial Intake');
    }

    setShowIngModal(false);
    setEditingIng(null);
    setIngForm({ name: '', unit: 'g', stock: 0, minStock: 250, costPerUnit: 0.1 });
  };

  // Open Edit modal
  const handleEditIng = (ing: Ingredient) => {
    setEditingIng(ing);
    setIngForm({
      name: ing.name,
      unit: ing.unit,
      stock: ing.stock,
      minStock: ing.minStock,
      costPerUnit: ing.costPerUnit
    });
    setShowIngModal(true);
  };

  // Quick adjustment submission 
  const submitQuickAdjustment = (ingId: string) => {
    const ing = ingredients.find(i => i.id === ingId);
    if (!ing || adjustAmount === 0) return;

    const oldQty = ing.stock;
    const newQty = Math.max(0, Number((oldQty + adjustAmount).toFixed(2)));

    setIngredients(prev => prev.map(item => {
      if (item.id === ingId) {
        return { ...item, stock: newQty };
      }
      return item;
    }));

    logManualAdjustment(ingId, oldQty, newQty, adjustReason);
    setQuickAdjustIngId(null);
    setAdjustAmount(0);
    setAdjustReason('Manual Restock');
  };

  // Recipe edits functions
  const handleUpdateRecipeIngredientQty = (ingredientId: string, newQty: number) => {
    if (!selectedRecipeDish || newQty < 0) return;

    setDishes(prev => prev.map(dish => {
      if (dish.id === selectedRecipeDish.id) {
        const updatedRecipe = dish.recipe.map(r => {
          if (r.ingredientId === ingredientId) {
            return { ...r, quantity: newQty };
          }
          return r;
        });
        const updatedDish = { ...dish, recipe: updatedRecipe };
        setSelectedRecipeDish(updatedDish);
        return updatedDish;
      }
      return dish;
    }));
  };

  const handleCreateAndAddIngredientInline = () => {
    if (!selectedRecipeDish || !newIngInlineName.trim() || addedRecipeItem.quantity <= 0) return;

    const lowerName = newIngInlineName.trim().toLowerCase().replace(/\s+/g, '_');
    const newId = `ing_${lowerName}_${Date.now()}`;
    const newIng: Ingredient = {
      id: newId,
      name: newIngInlineName.trim(),
      unit: newIngInlineUnit,
      stock: 500, // Safe default stock
      minStock: 50,
      costPerUnit: Number(newIngInlineCost)
    };

    // Register active inventory
    setIngredients(prev => [...prev, newIng]);
    logManualAdjustment(newId, 0, 500, `Created inline for dish: ${selectedRecipeDish.name}`);

    // Link recipe
    setDishes(prev => prev.map(dish => {
      if (dish.id === selectedRecipeDish.id) {
        let updatedRecipe = [...dish.recipe];
        const existingIdx = updatedRecipe.findIndex(r => r.ingredientId === newId);
        if (existingIdx !== -1) {
          updatedRecipe[existingIdx].quantity = Number(addedRecipeItem.quantity);
        } else {
          updatedRecipe.push({
            ingredientId: newId,
            quantity: Number(addedRecipeItem.quantity)
          });
        }
        const updatedDish = { ...dish, recipe: updatedRecipe };
        setSelectedRecipeDish(updatedDish);
        return updatedDish;
      }
      return dish;
    }));

    // Reset inline forms
    setNewIngInlineName('');
    setIsCreatingNewIngInline(false);
    // Point selection to the newly saved item
    setAddedRecipeItem({
      ingredientId: newId,
      quantity: 10
    });
  };

  const handleAddRecipeIngredient = () => {
    if (!selectedRecipeDish || !addedRecipeItem.ingredientId) return;

    setDishes(prev => prev.map(dish => {
      if (dish.id === selectedRecipeDish.id) {
        const existingIdx = dish.recipe.findIndex(r => r.ingredientId === addedRecipeItem.ingredientId);
        let updatedRecipe = [...dish.recipe];
        
        if (existingIdx !== -1) {
          updatedRecipe[existingIdx].quantity = Number(addedRecipeItem.quantity);
        } else {
          updatedRecipe.push({
            ingredientId: addedRecipeItem.ingredientId,
            quantity: Number(addedRecipeItem.quantity)
          });
        }
        
        // Return updated dish
        const updatedDish = { ...dish, recipe: updatedRecipe };
        setSelectedRecipeDish(updatedDish);
        return updatedDish;
      }
      return dish;
    }));
  };

  const handleRemoveRecipeIngredient = (ingredientId: string) => {
    if (!selectedRecipeDish) return;

    setDishes(prev => prev.map(dish => {
      if (dish.id === selectedRecipeDish.id) {
        const updatedRecipe = dish.recipe.filter(r => r.ingredientId !== ingredientId);
        const updatedDish = { ...dish, recipe: updatedRecipe };
        setSelectedRecipeDish(updatedDish);
        return updatedDish;
      }
      return dish;
    }));
  };

  // Filter Ingredients
  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(ingSearch.toLowerCase())
  );

  // Filter Dishes
  const filteredDishes = dishes.filter(dish => 
    dish.name.toLowerCase().includes(dishSearch.toLowerCase()) ||
    dish.category.toLowerCase().includes(dishSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 h-full w-full overflow-hidden" id="recipe_stock_container">
      
      {/* UPPER SYSTEM TABS SWITCHER */}
      <div className="flex bg-gray-100 p-1.5 rounded-xl self-start shrink-0 border border-gray-200 gap-1.5 select-none font-bold text-xs">
        <button
          type="button"
          onClick={() => setDashboardTab('formulas')}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            dashboardTab === 'formulas'
              ? 'bg-gray-950 text-white shadow-xs font-black'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Raw Stock & Formulas</span>
        </button>
        <button
          type="button"
          onClick={() => setDashboardTab('yieldMargins')}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            dashboardTab === 'yieldMargins'
              ? 'bg-gray-950 text-white shadow-xs font-black'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Percent className="w-3.5 h-3.5 text-amber-500 font-bold" />
          <span>Cost Yields & Margins simulation</span>
        </button>
      </div>

      {dashboardTab === 'formulas' ? (
        <div className="flex-1 flex flex-col xl:grid xl:grid-cols-12 gap-4 h-full overflow-hidden">
      
      {/* MOBILE RESPONSIVE TABS SWITCH (Only visible below xl) */}
      <div className="xl:hidden flex gap-2 p-1 bg-gray-100 rounded-xl font-bold text-xs shrink-0 select-none">
        <button
          type="button"
          onClick={() => setMobileTab('inventory')}
          className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mobileTab === 'inventory'
              ? 'bg-gray-950 text-white shadow-xs font-black'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Scale className="w-4 h-4 text-emerald-500" />
          <span>Raw Stock ({ingredients.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('recipes')}
          className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mobileTab === 'recipes'
              ? 'bg-gray-950 text-white shadow-xs font-black'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Menu Recipes ({dishes.length})</span>
        </button>
      </div>

      {/* LEFT PANEL: Ingredients Stock Tracker Table (7 Columns on desktop) */}
      <div className={`${mobileTab === 'inventory' ? 'flex' : 'hidden xl:flex'} xl:col-span-7 bg-white rounded-xl border border-gray-100 flex-col h-full min-h-0 shadow-xs`}>
        
        {/* Panel Header */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-md font-bold text-gray-900 flex items-center gap-1.5">
              <Scale className="w-5 h-5 text-gray-700" /> Raw Inventory & Stock Rooms
            </h2>
            <p className="text-[11px] text-gray-400">Manage stock totals, set safety levels, and examine current values</p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                setEditingIng(null);
                setIngForm({ name: '', unit: 'g', stock: 1000, minStock: 200, costPerUnit: 0.1 });
                setIngCreationTab('presets');
                setPresetSearch('');
                setSelectedPresetCategory('All');
                setPickedPreset(null);
                setShowIngModal(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-gray-950 hover:bg-gray-800 text-white rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </div>

        {/* Search Input bar */}
        <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search raw ingredients..."
              value={ingSearch}
              onChange={(e) => setIngSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
            />
          </div>
        </div>

        {/* In-stock ingredient matrix table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs min-w-[500px] sm:min-w-[400px] md:min-w-0">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <th className="p-3.5">Ingredient</th>
                <th className="p-3.5">Unit Cost</th>
                <th className="p-3.5 text-center">Warn At</th>
                <th className="p-3.5 text-right">Running Total</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {filteredIngredients.map(ing => {
                const isLow = ing.stock <= ing.minStock;
                const quickAdjustActive = quickAdjustIngId === ing.id;

                return (
                  <React.Fragment key={ing.id}>
                    <tr className={`hover:bg-gray-50/50 ${isLow ? 'bg-red-50/20' : ''}`}>
                      <td className="p-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-gray-900">{ing.name}</span>
                          <span className="text-[10px] font-mono text-gray-400">ID: {ing.id}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-gray-500 font-mono">
                        {ing.costPerUnit} Br/<span className="text-[10px]">{ing.unit}</span>
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        {ing.minStock}{ing.unit}
                      </td>
                      <td className="p-3.5 text-right font-mono">
                        <div className="flex flex-col items-end">
                          <span className={`font-bold ${isLow ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                            {ing.stock} <span className="text-[10px] font-medium text-gray-400">{ing.unit}</span>
                          </span>
                          {isLow && (
                            <span className="text-[9px] text-red-500 font-bold bg-red-100/50 px-1 rounded flex items-center gap-0.5 mt-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setQuickAdjustIngId(quickAdjustActive ? null : ing.id);
                              setAdjustAmount(0);
                            }}
                            className={`p-1.5 border rounded-md text-[10px] font-semibold flex items-center gap-0.2 px-2 transition-colors cursor-pointer ${
                              quickAdjustActive 
                                ? 'bg-gray-100 border-gray-300 text-gray-700' 
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust
                          </button>
                          <button
                            onClick={() => handleEditIng(ing)}
                            className="p-1 px-1.5 border border-gray-100 hover:border-gray-200 text-gray-500 hover:text-gray-850 rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Quick Adjustment Drawdown */}
                    {quickAdjustActive && (
                      <tr className="bg-gray-50/70 border-b border-gray-100">
                        <td colSpan={5} className="p-3.5">
                          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-800">Stock Adjustment:</span>
                              <div className="flex items-center border border-gray-200 bg-white rounded-lg overflow-hidden font-mono">
                                <button
                                  onClick={() => setAdjustAmount(prev => prev - 100)}
                                  className="p-1 px-2 text-xs font-bold bg-gray-50 hover:bg-gray-100 cursor-pointer border-r border-gray-100 text-gray-500 hover:text-gray-900"
                                >
                                  -100
                                </button>
                                <button
                                  onClick={() => setAdjustAmount(prev => prev - 10)}
                                  className="p-1 px-1.5 text-xs font-bold bg-gray-50 hover:bg-gray-100 cursor-pointer border-r border-gray-100 text-gray-500 hover:text-gray-900"
                                >
                                  -10
                                </button>
                                <input
                                  type="number"
                                  value={adjustAmount || ''}
                                  placeholder="0"
                                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                                  className="w-16 text-center text-xs font-bold focus:outline-hidden"
                                />
                                <button
                                  onClick={() => setAdjustAmount(prev => prev + 10)}
                                  className="p-1 px-1.5 text-xs font-bold bg-gray-50 hover:bg-gray-100 cursor-pointer border-l border-gray-100 text-gray-500 hover:text-gray-900"
                                >
                                  +10
                                </button>
                                <button
                                  onClick={() => setAdjustAmount(prev => prev + 100)}
                                  className="p-1 px-2 text-xs font-bold bg-gray-50 hover:bg-gray-100 cursor-pointer border-l border-gray-100 text-gray-500 hover:text-gray-900"
                                >
                                  +100
                                </button>
                              </div>
                              <span className="text-xs font-mono text-gray-400">({ing.unit})</span>
                            </div>

                            <div className="flex items-center gap-2.5 w-full sm:w-auto">
                              <select
                                value={adjustReason}
                                onChange={(e) => setAdjustReason(e.target.value)}
                                className="text-xs border rounded-lg p-1.5 bg-white font-medium"
                              >
                                <option value="Manual Restock">Restock Intake</option>
                                <option value="Audit Adjustment">Stock Taking Audit</option>
                                <option value="Spoilage Disposal">Spill & Spoilage Use</option>
                              </select>

                              <button
                                onClick={() => submitQuickAdjustment(ing.id)}
                                disabled={adjustAmount === 0}
                                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-250 disabled:cursor-not-allowed rounded-lg shrink-0 shadow-xs cursor-pointer"
                              >
                                Save Stock
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT PANEL: Recipes Analyzer & Cost breakdown (5 Columns) */}
      <div className={`${mobileTab === 'recipes' ? 'flex' : 'hidden xl:flex'} xl:col-span-5 flex-col gap-4 h-full min-h-0`}>
        
        {/* Dishes and Recipe Config block */}
        <div className={`${selectedRecipeDish ? 'hidden xl:flex' : 'flex'} bg-white rounded-xl border border-gray-100 flex-col flex-1 min-h-0 shadow-xs`}>
          
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 shrink-0 flex items-center justify-between">
            <div>
              <h2 className="text-md font-bold text-gray-900 flex items-center gap-1.5">
                <Layers className="w-5 h-5 text-gray-700" /> Menu Recipes & Yield Margin
              </h2>
              <p className="text-[11px] text-gray-400">Manage ingredients & margins</p>
            </div>
            <button
              onClick={() => setShowDishModal(true)}
              className="px-2.5 py-1.5 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-1 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Menu Item
            </button>
          </div>

          <div className="p-3 border-b border-gray-50 flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={dishSearch}
                onChange={(e) => setDishSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-gray-50">
            {filteredDishes.map(dish => {
              // Calculate recipe cost for first variant if present, or base
              const varName = dish.variants && dish.variants.length > 0 ? dish.variants[0].name : undefined;
              const recipeCost = calculateRecipeCost(dish, varName, ingredients);
              const price = dish.variants && dish.variants.length > 0 ? dish.variants[0].price : dish.basePrice;
              const margin = price - recipeCost;
              const marginPercent = price > 0 ? ((margin / price) * 100).toFixed(0) : '0';

              const isSelected = selectedRecipeDish?.id === dish.id;

              return (
                <div 
                  key={dish.id} 
                  className={`p-3.5 hover:bg-gray-50/50 transition-colors flex flex-col gap-2 cursor-pointer ${
                    isSelected ? 'bg-gray-50 border-l-4 border-gray-900 pl-2.5' : ''
                  }`}
                  onClick={() => setSelectedRecipeDish(dish)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs leading-none">{dish.name}</h4>
                      <span className="text-[9px] font-semibold text-gray-400 bg-gray-100 px-1 py-0.2 rounded mt-1 inline-block">
                        {dish.category} • {dish.subcategory}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right font-mono text-xs">
                        <span className="block font-bold mt-0.5 text-gray-900">
                          {price} Br
                        </span>
                        <span className="text-[10px] text-gray-400">Base Price</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete "${dish.name}" from the menu?`)) {
                            setDishes(prev => prev.filter(d => d.id !== dish.id));
                            if (addAuditLog) {
                              addAuditLog(
                                "Menu Dish Deleted",
                                `Removed dish "${dish.name}" from category list "${dish.category}"`
                              );
                            }
                            if (selectedRecipeDish?.id === dish.id) {
                              setSelectedRecipeDish(null);
                            }
                          }
                        }}
                        className="p-1 text-gray-300 hover:text-red-500 rounded hover:bg-red-50 transition-all cursor-pointer"
                        title="Delete Menu Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono mt-1 text-gray-500 bg-gray-50/50 p-1 px-2 rounded border border-gray-100">
                    <div>
                      Cost: <strong className="text-gray-900 font-bold">{recipeCost} Br</strong>
                    </div>
                    <div>
                      Margin Ratio: <strong className="text-emerald-700 font-bold">{marginPercent}%</strong>
                    </div>
                    <div>
                      Ingredients: <strong className="text-gray-900 font-bold">{dish.recipe.length} items</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Recipe Composition Detail and Modification Drawer */}
        {selectedRecipeDish && (
          <div className="bg-white rounded-xl border border-gray-150 p-4 shadow-sm flex flex-col flex-1 xl:flex-none xl:shrink-0 min-h-0" id="recipe_modify_drawer">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 mb-3 gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-sans">Configure Recipe</h3>
                <h2 className="text-sm font-extrabold text-gray-800 line-clamp-1">{selectedRecipeDish.name} Formula Elements</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecipeDish(null)}
                className="text-xs bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 border border-gray-200 text-gray-700 font-bold rounded-lg flex items-center gap-1 transition-all shrink-0 cursor-pointer"
              >
                ← Back
              </button>
            </div>

            {/* List Current Ingredients in recipe with in-place quantity modifier inputs */}
            <div className="space-y-2.5 mb-4 max-h-[30vh] xl:max-h-[175px] overflow-y-auto scrollbar-thin pr-1 flex-1 xl:flex-none">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Recipe Ingredients & Amounts</label>
              {selectedRecipeDish.recipe.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic text-center py-4 bg-gray-50/50 rounded-lg">No ingredients defined yet for this recipe.</p>
              ) : (
                selectedRecipeDish.recipe.map(item => {
                  const matchingIng = ingredients.find(i => i.id === item.ingredientId);
                  if (!matchingIng) return null;

                  return (
                    <div 
                      key={item.ingredientId} 
                      className="flex items-center justify-between bg-gray-50/70 p-2 rounded-lg border border-gray-100 gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-extrabold text-gray-905 text-xs block truncate">{matchingIng.name}</span>
                        <span className="text-[9px] text-gray-450 block font-mono">Cost: {matchingIng.costPerUnit} Br per {matchingIng.unit}</span>
                      </div>

                      {/* Interactive Amount custom Input */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={item.quantity || ''}
                          placeholder="0"
                          onChange={(e) => handleUpdateRecipeIngredientQty(item.ingredientId, Number(e.target.value))}
                          className="w-16 p-1 text-center font-mono font-black text-xs border border-gray-250 bg-white rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <span className="text-[10.5px] font-mono font-bold text-gray-500">{matchingIng.unit}</span>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveRecipeIngredient(item.ingredientId)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer shrink-0"
                        title="Delete ingredient from recipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dynamic Form to append an existing ingredient OR create a fresh item inline */}
            <div className="pt-3 border-t border-gray-150 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Add Ingredient Tag</span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewIngInline(!isCreatingNewIngInline)}
                  className="text-[10px] text-emerald-600 hover:text-emerald-800 font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  {isCreatingNewIngInline ? "← Pick from existing catalog" : "＋ Create New ingredient inline"}
                </button>
              </div>

              {!isCreatingNewIngInline ? (
                <div className="flex items-end gap-2.5">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 block">Select ingredient</label>
                    <select
                      value={addedRecipeItem.ingredientId}
                      onChange={(e) => setAddedRecipeItem(prev => ({ ...prev, ingredientId: e.target.value }))}
                      className="w-full text-xs border border-gray-200 rounded-lg p-1.5 bg-white font-semibold focus:outline-hidden"
                    >
                      {ingredients.map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24 space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 block">Amount needed</label>
                    <input
                      type="number"
                      value={addedRecipeItem.quantity || ''}
                      placeholder="e.g. 100"
                      onChange={(e) => setAddedRecipeItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                      className="w-full text-xs border border-gray-200 rounded-lg p-1.5 bg-white font-extrabold font-mono focus:outline-hidden text-center"
                    />
                  </div>

                  <button
                    onClick={handleAddRecipeIngredient}
                    disabled={!addedRecipeItem.ingredientId || addedRecipeItem.quantity <= 0}
                    className="p-1.5 px-3 bg-gray-950 hover:bg-gray-800 disabled:bg-gray-150 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" /> Save Tag
                  </button>
                </div>
              ) : (
                <div className="space-y-2 border border-emerald-100 p-2.5 rounded-lg bg-emerald-50/10">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-gray-500 block">New ingredient name</label>
                      <input
                        type="text"
                        value={newIngInlineName}
                        placeholder="e.g., Oregano, Salmon"
                        onChange={(e) => setNewIngInlineName(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg p-1 bg-white focus:outline-hidden font-medium"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-gray-500 block">Unit Type</label>
                      <select
                        value={newIngInlineUnit}
                        onChange={(e) => setNewIngInlineUnit(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg p-1 bg-white font-medium"
                      >
                        <option value="g">Grams (g)</option>
                        <option value="ml">Milliliters (ml)</option>
                        <option value="pcs">Pieces (pcs)</option>
                        <option value="slice">Slices</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-gray-500 block col-span-1">Cost / unit (Br)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newIngInlineCost || ''}
                        placeholder="0.1"
                        onChange={(e) => setNewIngInlineCost(Number(e.target.value))}
                        className="w-full text-xs border border-gray-200 rounded-lg p-1 bg-white focus:outline-hidden font-mono"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-emerald-600 block col-span-1">Amount Needed</label>
                      <input
                        type="number"
                        value={addedRecipeItem.quantity || ''}
                        placeholder="e.g. 50"
                        onChange={(e) => setAddedRecipeItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                        className="w-full text-xs border border-emerald-200 font-extrabold rounded-lg p-1 bg-white focus:outline-hidden font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleCreateAndAddIngredientInline}
                      disabled={!newIngInlineName.trim() || addedRecipeItem.quantity <= 0}
                      className="p-1 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors h-[28px]"
                    >
                      <Plus className="w-3.5 h-3.5" /> Save New
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
      ) : (
        <div className="flex-1 flex flex-col xl:grid xl:grid-cols-12 gap-4 h-full overflow-hidden">
          
          {/* LEFT SIDEBAR: Menu select list */}
          <div className="xl:col-span-4 bg-white rounded-xl border border-gray-100 flex flex-col h-full min-h-0 shadow-xs">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 font-sans">
                <Percent className="w-4 h-4 text-amber-500" />
                Menu Yield Optimizer & Margins
              </h2>
              <p className="text-[11px] text-gray-405">Select an item to run portion cost simulations & adjust price margins</p>
            </div>

            <div className="p-3 border-b border-gray-50 flex items-center gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by name or category..."
                  value={marginDishSearch}
                  onChange={(e) => setMarginDishSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
              {dishes.filter(dish =>
                dish.name.toLowerCase().includes(marginDishSearch.toLowerCase()) ||
                dish.category.toLowerCase().includes(marginDishSearch.toLowerCase())
              ).length === 0 ? (
                <p className="text-xs text-center text-gray-405 p-8 italic font-semibold">No matching menu dishes found.</p>
              ) : (
                dishes.filter(dish =>
                  dish.name.toLowerCase().includes(marginDishSearch.toLowerCase()) ||
                  dish.category.toLowerCase().includes(marginDishSearch.toLowerCase())
                ).map(dish => {
                  const isSelected = selectedMarginDish?.id === dish.id;
                  
                  // Calculate dynamic cost of current recipe
                  const baseCost = dish.recipe.reduce((sum, item) => {
                    const ing = ingredients.find(i => i.id === item.ingredientId);
                    if (!ing) return sum;
                    return sum + (item.quantity * ing.costPerUnit);
                  }, 0);

                  const dishYield = dish.yield || 1;
                  const unitPortionCost = baseCost / dishYield;
                  const price = dish.basePrice;
                  const marginPercent = price > 0 ? (((price - unitPortionCost) / price) * 105 - 5).toFixed(0) : '0';

                  return (
                    <div
                      key={dish.id}
                      onClick={() => setSelectedMarginDish(dish)}
                      className={`p-3.5 hover:bg-gray-50/50 transition-all flex flex-col gap-1.5 cursor-pointer border-l-3 ${
                        isSelected 
                          ? 'bg-amber-50/40 border-amber-500 pl-3' 
                          : 'border-transparent pl-3.5'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-gray-900 text-xs">{dish.name}</h4>
                          <span className="text-[9px] text-gray-400 font-semibold">{dish.category} • Yield: {dishYield} portion{dishYield > 1 ? 's' : ''}</span>
                        </div>
                        <div className="text-right font-mono text-xs">
                          <strong className="text-gray-900 font-extrabold">{price} Br</strong>
                          <span className="block text-[8px] text-gray-450 font-sans leading-none">Price Spec</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mt-1 bg-gray-55/40 p-1 px-2 rounded border border-gray-150">
                        <span>Unit Cost: <strong className="text-gray-900 font-black">{unitPortionCost.toFixed(2)} Br</strong></span>
                        <span className={`font-black ${Number(marginPercent) >= targetMarginGoal ? 'text-emerald-700' : 'text-amber-605'}`}>
                          Margin: {marginPercent}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT WORKSPACE PANELS: Cost Sheet Sandbox */}
          <div className="xl:col-span-8 flex flex-col h-full min-h-0">
            {!selectedMarginDish ? (
              <div className="flex-1 bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center p-8 text-center shadow-xs">
                <div className="bg-amber-50 p-4 rounded-full text-amber-500 mb-3 animate-pulse">
                  <Percent className="w-10 h-10 stroke-[2.5]" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm tracking-tight">Food Portions Margins Simulator</h3>
                <p className="text-xs text-gray-450 max-w-sm mt-1.5 leading-relaxed font-medium">
                  Select a menu item from the sidebar to launch the sandbox simulation workspace. 
                  Model inflation spikes, adjust portion sizes, scale yields, and find optimal target menu pricing dynamically!
                </p>
              </div>
            ) : (
              <div className="flex-1 bg-white rounded-xl border border-gray-150 flex flex-col h-full min-h-0 shadow-xs overflow-hidden">
                {/* Header info */}
                <div className="p-4 border-b border-gray-100 bg-amber-50/15 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500 rounded-lg text-white">
                      <TrendingUp className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-black tracking-widest text-amber-700">Sandbox Playground</h4>
                      <h3 className="text-sm font-black text-gray-950">{selectedMarginDish.name}</h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMarginDish(null)}
                    className="text-xs bg-white hover:bg-gray-100 px-3 py-1.5 border border-gray-200 text-gray-700 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    ✕ Close Sandbox
                  </button>
                </div>

                {/* Main simulation dashboard split layout inside sandbox */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  
                  {/* Global Simulation Drivers Card */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                          Simulate Price Inflation
                        </label>
                        <span className={`text-xs font-mono font-black ${inflationPercent > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                          {inflationPercent > 0 ? `+${inflationPercent}%` : `${inflationPercent}%`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="-50"
                          max="150"
                          step="5"
                          value={inflationPercent}
                          onChange={(e) => setInflationPercent(Number(e.target.value))}
                          className="flex-1 accent-rose-500 cursor-pointer"
                        />
                        <input
                          type="number"
                          value={inflationPercent}
                          onChange={(e) => setInflationPercent(Number(e.target.value))}
                          className="w-16 p-1 text-center font-mono font-bold text-xs border border-gray-250 bg-white rounded-md text-gray-800"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium leading-none">Simulates systemic raw food cost price spikes or supplier catalog deflation factors.</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5 text-blue-500" />
                          Target Margin Objective
                        </label>
                        <span className="text-xs font-mono font-black text-blue-600">{targetMarginGoal}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="10"
                          max="95"
                          step="5"
                          value={targetMarginGoal}
                          onChange={(e) => setTargetMarginGoal(Number(e.target.value))}
                          className="flex-1 accent-blue-600 cursor-pointer"
                        />
                        <input
                          type="number"
                          value={targetMarginGoal}
                          onChange={(e) => setTargetMarginGoal(Number(e.target.value))}
                          className="w-16 p-1 text-center font-mono font-bold text-xs border border-gray-255 bg-white rounded-md text-gray-800"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium leading-none">Standard industry gross margin targets are around 70% (30% food cost ratio).</p>
                    </div>
                  </div>

                  {/* Split sandbox grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    
                    {/* LEFT PANEL: Live Formula modifier (lg:col-span-7) */}
                    <div className="lg:col-span-7 space-y-3.5">
                      
                      {/* Portion Specifications Card */}
                      <div className="bg-white border border-gray-150 p-4 rounded-xl space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1 font-sans">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                          Portion Controls
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 block">Batch Portions Yield</label>
                            <input
                              type="number"
                              min="1"
                              max="1000"
                              value={simulatedYield || ''}
                              onChange={(e) => setSimulatedYield(Math.max(1, Number(e.target.value)))}
                              className="w-full p-2 text-xs border border-gray-200 rounded-lg font-mono font-bold bg-white text-gray-800"
                              placeholder="e.g. 10"
                            />
                            <p className="text-[9px] text-gray-400 font-medium">Total portions cooked in one batch yield.</p>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 block">Simulated Sale Price (Br)</label>
                            <input
                              type="number"
                              min="0"
                              value={simulatedPrice || ''}
                              onChange={(e) => setSimulatedPrice(Math.max(0, Number(e.target.value)))}
                              className="w-full p-2 text-xs border border-gray-200 rounded-lg font-mono font-bold bg-white text-gray-800"
                              placeholder="e.g. 200"
                            />
                            <p className="text-[9px] text-gray-400 font-medium">Customer face price spec.</p>
                          </div>
                        </div>
                      </div>

                      {/* Simulated Ingredients Composition list */}
                      <div className="bg-white border border-gray-150 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl border border-gray-100 mb-1">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-750 block">Simulated Recipe Scaling</h4>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                            {simulatedRecipe.length} item{simulatedRecipe.length === 1 ? '' : 's'}
                          </span>
                        </div>

                        <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
                          {simulatedRecipe.length === 0 ? (
                            <p className="text-xs italic text-gray-450 bg-gray-50 rounded-lg p-4 text-center">Simulated recipe is empty. Add ingredients below.</p>
                          ) : (
                            simulatedRecipe.map(item => {
                              const matchingIng = ingredients.find(i => i.id === item.ingredientId);
                              if (!matchingIng) return null;

                              // Cost calculations with simulated inflation
                              const baseUnitCost = matchingIng.costPerUnit;
                              const inflatedUnitCost = baseUnitCost * (1 + inflationPercent / 100);
                              const totalCost = item.quantity * inflatedUnitCost;

                              return (
                                <div key={item.ingredientId} className="flex items-center justify-between border border-gray-100 p-2.5 rounded-lg bg-gray-50/50 gap-2.5">
                                  <div className="flex-1 min-w-0">
                                    <strong className="text-xs text-slate-800 font-extrabold block truncate">{matchingIng.name}</strong>
                                    <span className="text-[9px] text-gray-455 block font-mono">
                                      Raw: {baseUnitCost.toFixed(2)} Br/unit
                                      {inflationPercent !== 0 && ` • Inflated: ${inflatedUnitCost.toFixed(2)} Br/unit`}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 font-bold">
                                    <input
                                      type="number"
                                      min="0"
                                      value={item.quantity || ''}
                                      onChange={(e) => handleSimulateQtyChange(item.ingredientId, Number(e.target.value))}
                                      className="w-16 p-1 text-center text-xs font-mono bg-white border border-gray-250 rounded-md text-gray-800"
                                      placeholder="0"
                                    />
                                    <span className="text-[10.5px] text-gray-450 font-mono w-6">{matchingIng.unit}</span>
                                  </div>

                                  <div className="text-right font-mono min-w-[50px] text-xs">
                                    <span className="text-gray-900 font-extrabold block">{totalCost.toFixed(1)} Br</span>
                                    <span className="text-[8px] text-gray-400">Total cost</span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleSimulateRemoveIngredient(item.ingredientId)}
                                    className="p-1 text-gray-300 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Add simulated ingredient trigger box */}
                        <div className="pt-3 border-t border-gray-100 space-y-2 bg-amber-50/5 p-2 rounded-lg">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider">Inject alternate ingredient to test margins</label>
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                            <div className="sm:col-span-7">
                              <select
                                value={selectedMarginAddIngId}
                                onChange={(e) => setSelectedMarginAddIngId(e.target.value)}
                                className="w-full text-xs p-1.5 border border-gray-250 bg-white rounded-lg font-semibold text-gray-800"
                              >
                                <option value="">-- Choose Ingredient --</option>
                                {ingredients.map(i => (
                                  <option key={i.id} value={i.id}>
                                    {i.name} ({i.unit}) - {i.costPerUnit.toFixed(2)} Br
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="sm:col-span-3 flex items-center border border-gray-200 rounded-lg overflow-hidden font-mono bg-white">
                              <input
                                type="number"
                                value={selectedMarginAddQty || ''}
                                onChange={(e) => setSelectedMarginAddQty(Number(e.target.value))}
                                className="w-full text-center text-xs focus:outline-hidden font-bold text-gray-800"
                                placeholder="Qty"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleSimulateAddIngredient}
                              disabled={!selectedMarginAddIngId || selectedMarginAddQty <= 0}
                              className="sm:col-span-2 py-1.5 bg-gray-900 hover:bg-gray-850 disabled:bg-gray-150 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <PlusCircle className="w-4 h-4" /> Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT PANEL: Live Projections (lg:col-span-5) */}
                    <div className="lg:col-span-5 flex flex-col gap-3.5">
                      
                      {/* Metric Card */}
                      {(() => {
                        const simulatedBatchCost = simulatedRecipe.reduce((sum, item) => {
                          const ing = ingredients.find(i => i.id === item.ingredientId);
                          if (!ing) return sum;
                          const inflatedCostUnit = ing.costPerUnit * (1 + inflationPercent / 100);
                          return sum + (item.quantity * inflatedCostUnit);
                        }, 0);

                        const simulatedPortionCost = simulatedBatchCost / simulatedYield;
                        const simulatedMarginValue = simulatedPrice - simulatedPortionCost;
                        const simulatedMarginRatio = simulatedPrice > 0 ? (simulatedMarginValue / simulatedPrice) * 100 : 0;
                        const meetsTarget = simulatedMarginRatio >= targetMarginGoal;

                        const idealPricingForMargin = targetMarginGoal < 100 
                          ? (simulatedPortionCost / (1 - targetMarginGoal / 100)) 
                          : simulatedPortionCost;

                        return (
                          <>
                            <div className="bg-white border border-gray-150 rounded-xl p-4 space-y-4 shadow-3xs">
                              <h4 className="text-xs font-black uppercase tracking-wider text-gray-550 flex items-center gap-1">
                                <Coins className="w-4 h-4 text-emerald-500" />
                                Live Forecast Sheets
                              </h4>
                              
                              {/* Batch Cost Spec */}
                              <div className="space-y-3 font-semibold text-xs">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2 border-dashed">
                                  <span className="text-gray-500">Total Batch Yield Cost</span>
                                  <span className="font-mono font-black text-gray-900">{simulatedBatchCost.toFixed(2)} Br</span>
                                </div>

                                <div className="flex justify-between items-center border-b border-gray-100 pb-2 border-dashed">
                                  <span className="text-gray-500">Simulated Cost / Portion</span>
                                  <div className="text-right">
                                    <span className="font-mono font-black text-gray-900">{simulatedPortionCost.toFixed(2)} Br</span>
                                    <span className="block text-[8px] text-gray-400 font-sans font-bold">({simulatedYield} portion{simulatedYield > 1 ? 's' : ''})</span>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center border-b border-gray-105 pb-2 bg-blue-50/20 p-1 rounded-lg">
                                  <span className="text-blue-900 font-extrabold text-[11px]">Ideal Sales Price</span>
                                  <div className="text-right">
                                    <span className="font-mono font-black text-blue-700 block text-xs">
                                      {idealPricingForMargin.toFixed(2)} Br
                                    </span>
                                    <span className="block text-[8px] text-blue-500 font-sans font-bold">To achieve {targetMarginGoal}% margin</span>
                                  </div>
                                </div>
                              </div>

                              {/* Target margin indicator gauge block */}
                              <div className="p-3 bg-gray-50 rounded-lg space-y-2 border border-gray-200 text-center">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Projections Results</span>
                                <div className="flex justify-center items-baseline gap-1">
                                  <span className={`text-3xl font-mono font-black ${meetsTarget ? 'text-emerald-700' : 'text-amber-600'}`}>
                                    {simulatedMarginRatio.toFixed(0)}%
                                  </span>
                                  <span className="text-[10px] text-gray-450 font-sans font-bold">Margin Rate</span>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      meetsTarget ? 'bg-emerald-600' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(0, simulatedMarginRatio))}%` }}
                                  />
                                </div>

                                <div className="flex items-center justify-center gap-1.5 pt-1">
                                  {meetsTarget ? (
                                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                      <Check className="w-3 h-3 text-emerald-600" /> Meets Goal Target!
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                                      <Info className="w-3" /> Below target. Rec. Price: {idealPricingForMargin.toFixed(0)} Br
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions layout card to commit simulated changes */}
                            <div className="bg-gray-55/40 border border-gray-200 p-4 rounded-xl space-y-2.5">
                              <h5 className="text-[11px] font-extrabold uppercase text-gray-700 tracking-wider">Commit Sandbox Updates</h5>
                              <p className="text-[10.5px] text-gray-400 font-semibold leading-relaxed">
                                Save this simulated portion yield count, recipes composition, and pricing adjustments directly to your operational catalog.
                              </p>
                              <button
                                type="button"
                                onClick={() => handleSaveSimulatedSpecs(selectedMarginDish.id, simulatedPrice, simulatedYield)}
                                className="w-full py-2.5 text-xs text-white bg-amber-500 hover:bg-amber-600 font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                              >
                                <Check className="w-4 h-4" /> Save Sandbox Specs to Menu
                              </button>
                            </div>
                          </>
                        );
                      })()}

                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT INGREDIENT MODAL POPUP */}
      {showIngModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 transition-all">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in scale-in duration-100 flex flex-col max-h-[90vh] sm:max-h-[85vh]">
            
            {/* Header */}
            <div className="bg-gray-950 text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <div>
                  <h3 className="font-extrabold tracking-tight text-sm uppercase">
                    {editingIng ? 'Modify Raw Ingredient' : 'Raw Stock Intake'}
                  </h3>
                  <p className="text-[10px] text-gray-450">
                    {editingIng ? `Updating specs for ${editingIng.name}` : 'Introduce items from preset catalog or create custom specifications'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowIngModal(false);
                  setEditingIng(null);
                  setPickedPreset(null);
                }}
                className="text-white/60 hover:text-white bg-gray-900 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Editing mode bypasses tabs */}
            {!editingIng && (
              <div className="flex border-b border-gray-100 bg-gray-50/50 shrink-0 font-bold text-xs select-none">
                <button
                  type="button"
                  onClick={() => {
                    setIngCreationTab('presets');
                    setPickedPreset(null);
                  }}
                  className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    ingCreationTab === 'presets'
                      ? 'border-emerald-600 text-emerald-800 bg-white font-black'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  Pick Preset Catalog
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIngCreationTab('custom');
                    setPickedPreset(null);
                    setIngForm({ name: '', unit: 'g', stock: 1000, minStock: 250, costPerUnit: 0.1 });
                  }}
                  className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    ingCreationTab === 'custom'
                      ? 'border-amber-600 text-amber-800 bg-white font-black'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Edit3 className="w-4 h-4 text-amber-500" />
                  Create Custom Inline
                </button>
              </div>
            )}

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 min-h-0">
              
              {/* TAB A: CATALOG PRESETS */}
              {!editingIng && ingCreationTab === 'presets' && (
                <div className="space-y-4">
                  {/* Category Fast Filters & Search */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search catalog presets (Beef, Cheese, Tomato)..."
                        value={presetSearch}
                        onChange={(e) => setPresetSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden bg-white"
                      />
                    </div>
                    {/* Category Selector */}
                    <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1 font-bold text-[10px]">
                      {['All', 'Meat & Seafood', 'Dairy & Eggs', 'Bakery', 'Produce', 'Oils & Condiments', 'Drinks & Grains'].map(cat => {
                        const isSel = selectedPresetCategory === cat;
                        const labelShort = cat === 'Meat & Seafood' ? '🥩 Meat' 
                                         : cat === 'Dairy & Eggs' ? '🥛 Dairy'
                                         : cat === 'Bakery' ? '🍞 Bakery'
                                         : cat === 'Produce' ? '🍅 Produce'
                                         : cat === 'Oils & Condiments' ? '🫗 Oils/Condi'
                                         : cat === 'Drinks & Grains' ? '☕ Drinks'
                                         : '✨ All';
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => setSelectedPresetCategory(cat)}
                            className={`px-2.5 py-1 rounded-md border shrink-0 cursor-pointer transition-all ${
                              isSel 
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs font-extrabold' 
                                : 'bg-white border-gray-250 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {labelShort}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preset Grid Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto border border-gray-100 p-2 rounded-xl bg-gray-50/50 scrollbar-thin">
                    {CATALOG_PRESETS.filter(p => {
                      const matchesCat = selectedPresetCategory === 'All' || p.category === selectedPresetCategory;
                      const matchesSearch = p.name.toLowerCase().includes(presetSearch.toLowerCase()) || p.category.toLowerCase().includes(presetSearch.toLowerCase());
                      return matchesCat && matchesSearch;
                    }).map(preset => {
                      const isSelected = pickedPreset?.name === preset.name;
                      const alreadyExists = ingredients.some(ing => ing.name.toLowerCase() === preset.name.toLowerCase());
                      
                      return (
                        <button
                          type="button"
                          key={preset.name}
                          onClick={() => {
                            setPickedPreset(preset);
                            // Set initial form values based on preset
                            setIngForm({
                              name: preset.name,
                              unit: preset.unit,
                              stock: preset.unit === 'pcs' ? 50 : 1000,
                              minStock: preset.minStock,
                              costPerUnit: preset.costPerUnit
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 shadow-xs'
                              : 'bg-white border-gray-200 hover:border-emerald-300 shadow-2xs hover:bg-emerald-50/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xl select-none">{preset.emoji}</span>
                            {alreadyExists && (
                              <span className="text-[8px] px-1 font-black bg-emerald-100 text-emerald-800 rounded tracking-wide uppercase font-mono">
                                In Stock
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-gray-901 line-clamp-1">{preset.name}</h4>
                            <div className="flex justify-between items-center text-[9px] text-gray-400 mt-0.5 font-mono">
                              <span>Per {preset.unit}</span>
                              <span className="text-emerald-700 font-bold">{preset.costPerUnit} Br</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Preset Selected Configurator Panel */}
                  {pickedPreset ? (
                    <div className="bg-emerald-50/30 p-3.5 border border-emerald-100 rounded-xl animate-in fade-in duration-200 space-y-3">
                      <div className="flex items-center justify-between pb-1.5 border-b border-emerald-100/40">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl select-none">{pickedPreset.emoji}</span>
                          <div>
                            <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wide block">Configure Preset Entry</span>
                            <h4 className="text-xs font-bold text-gray-800">{pickedPreset.name} (Unit: {pickedPreset.unit})</h4>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPickedPreset(null)}
                          className="text-[10px] text-emerald-800 hover:text-emerald-950 font-black cursor-pointer bg-emerald-100 px-2 py-0.5 rounded-md"
                        >
                          Reset Choice
                        </button>
                      </div>

                      {/* Warnings if item exists */}
                      {ingredients.some(ing => ing.name.toLowerCase() === pickedPreset.name.toLowerCase()) && (
                        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/50 text-[10px] text-amber-900 font-semibold flex items-center gap-1.5 select-none">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>
                            Note: "{pickedPreset.name}" is already in stock. Appending values will add to current quantities!
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 block">Intake Stock</label>
                          <input
                            type="number"
                            required
                            value={ingForm.stock || ''}
                            onChange={(e) => setIngForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden bg-white font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 block">Min Stock Warning</label>
                          <input
                            type="number"
                            required
                            value={ingForm.minStock || ''}
                            onChange={(e) => setIngForm(prev => ({ ...prev, minStock: Number(e.target.value) }))}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden bg-white font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 block">Cost Per Unit (Br)</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={ingForm.costPerUnit || ''}
                            onChange={(e) => setIngForm(prev => ({ ...prev, costPerUnit: Number(e.target.value) }))}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden bg-white font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const preset = pickedPreset;
                          const customStock = Number(ingForm.stock);
                          const customMin = Number(ingForm.minStock);
                          const customCost = Number(ingForm.costPerUnit);
                          
                          const existing = ingredients.find(ing => ing.name.toLowerCase() === preset.name.toLowerCase());
                          if (existing) {
                            const oldQty = existing.stock;
                            const newQty = oldQty + customStock;
                            setIngredients(prev => prev.map(item => {
                              if (item.id === existing.id) {
                                return {
                                  ...item,
                                  stock: newQty,
                                  costPerUnit: customCost,
                                  minStock: customMin
                                };
                              }
                              return item;
                            }));
                            logManualAdjustment(existing.id, oldQty, newQty, 'Catalog Add-On Intake');
                            if (addAuditLog) {
                              addAuditLog('Ingredient Stock Appended', `Added ${customStock} ${preset.unit} of "${preset.name}" from catalog. New total: ${newQty} ${preset.unit}.`);
                            }
                          } else {
                            const newId = `ing_${Date.now()}`;
                            const newIng: Ingredient = {
                              id: newId,
                              name: preset.name,
                              unit: preset.unit,
                              stock: customStock,
                              minStock: customMin,
                              costPerUnit: customCost
                            };
                            setIngredients(prev => [...prev, newIng]);
                            logManualAdjustment(newId, 0, customStock, 'Initial Catalog Intake');
                            if (addAuditLog) {
                              addAuditLog('Ingredient Added from Catalog', `Created raw ingredient "${preset.name}" at default stock of ${customStock} ${preset.unit}.`);
                            }
                          }
                          setShowIngModal(false);
                          setPickedPreset(null);
                        }}
                        disabled={ingForm.stock < 0 || ingForm.costPerUnit <= 0}
                        className="w-full py-2.5 rounded-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-xs cursor-pointer shadow-2xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Confirm Catalog Intake for {pickedPreset.name}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-gray-200 bg-gray-50/30 rounded-xl">
                      <Scale className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-bounce duration-1000" />
                      <p className="text-xs font-bold text-gray-500">Pick an Ingredient Card above to customize</p>
                      <p className="text-[10px] text-gray-400 mt-1">Preset ratios, units, and average costs fill automatically</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB B: CUSTOM INLINE OR MODIFY / EDITING */}
              {(editingIng || ingCreationTab === 'custom') && (
                <form onSubmit={handleIngSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 block">Ingredient Name</label>
                    <input
                      type="text"
                      required
                      value={ingForm.name}
                      onChange={(e) => setIngForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Cheddar Cheese, Chicken thighs"
                      className="w-full p-2.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 block">Unit Type</label>
                      <select
                        value={ingForm.unit}
                        onChange={(e) => setIngForm(prev => ({ ...prev, unit: e.target.value }))}
                        className="w-full p-2.5 text-xs rounded-lg border border-gray-200 bg-white"
                      >
                        <option value="g">Grams (g)</option>
                        <option value="ml">Milliliters (ml)</option>
                        <option value="pcs">Pieces (pcs)</option>
                        <option value="slice">Slices</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 block">
                        {editingIng ? 'Current Stock Level' : 'Initial Stock Quantity'}
                      </label>
                      <input
                        type="number"
                        required
                        value={ingForm.stock || ''}
                        onChange={(e) => setIngForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                        placeholder="e.g. 500"
                        className="w-full p-2.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 block">Unit Purchase Cost (Br)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={ingForm.costPerUnit || ''}
                        onChange={(e) => setIngForm(prev => ({ ...prev, costPerUnit: Number(e.target.value) }))}
                        placeholder="e.g., 0.15"
                        className="w-full p-2.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden bg-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 block">Low Stock Alert Limit</label>
                      <input
                        type="number"
                        required
                        value={ingForm.minStock || ''}
                        onChange={(e) => setIngForm(prev => ({ ...prev, minStock: Number(e.target.value) }))}
                        placeholder="e.g., 100"
                        className="w-full p-2.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowIngModal(false);
                        setEditingIng(null);
                      }}
                      className="flex-1 py-2.5 rounded-lg border border-gray-200 font-semibold text-gray-700 bg-white hover:bg-gray-100 text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-lg font-semibold text-white bg-gray-950 hover:bg-gray-800 text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      {editingIng ? 'Save Changes' : 'Create Custom Ingredient'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer containing quick helper text (only shown when picking presets with no preset selected) */}
            {!editingIng && ingCreationTab === 'presets' && !pickedPreset && (
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 shrink-0 select-none">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Select presets to instantly auto-populate properties & cost calculations.
                </span>
                <span className="font-bold text-gray-500">{CATALOG_PRESETS.length} presets configured</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW MENU DISH MODAL POPUP */}
      {showDishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-all">
          <form 
            onSubmit={handleDishSubmit}
            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in scale-in duration-105 flex flex-col"
          >
            {/* Header */}
            <div className="bg-amber-500 text-white p-4 flex justify-between items-center">
              <span className="font-bold tracking-tight text-sm uppercase">
                Add New Menu Dish
              </span>
              <button 
                type="button"
                onClick={() => setShowDishModal(false)}
                className="text-white/80 hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Input fields */}
            <div className="p-5 space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 block">Dish Name</label>
                <input
                  type="text"
                  required
                  value={dishForm.name}
                  onChange={(e) => setDishForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Special Double Beef Burger"
                  className="w-full p-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden bg-white text-gray-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 block">Category</label>
                  <select
                    value={dishForm.category}
                    onChange={(e) => setDishForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 text-xs rounded-lg border border-gray-200 bg-white font-medium text-gray-800"
                  >
                    <option value="Shega Traditional">Shega Traditional</option>
                    <option value="Shega Bites">Shega Bites</option>
                    <option value="Shega Kitchen">Shega Kitchen</option>
                    <option value="Italian & Pizza">Italian & Pizza</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Kids Menu">Kids Menu</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 block">Subcategory</label>
                  <input
                    type="text"
                    required
                    value={dishForm.subcategory}
                    onChange={(e) => setDishForm(prev => ({ ...prev, subcategory: e.target.value }))}
                    placeholder="e.g., Burgers, Pasta, Beef"
                    className="w-full p-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-800 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 block">Base Price (Birr)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={dishForm.basePrice || ''}
                  onChange={(e) => setDishForm(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                  placeholder="e.g., 250"
                  className="w-full p-2 text-xs rounded-lg border border-gray-200 bg-white font-bold text-gray-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 block col-span-2">Description</label>
                <textarea
                  rows={2}
                  value={dishForm.description}
                  onChange={(e) => setDishForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief listing description text..."
                  className="w-full p-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 resize-none font-medium"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDishModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 font-semibold text-gray-700 bg-white hover:bg-gray-100 text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg font-semibold text-white bg-amber-500 hover:bg-amber-605 text-xs cursor-pointer shadow-xs transition-colors"
              >
                Save Menu Item
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
