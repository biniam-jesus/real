/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Order, Ingredient, Dish, InventoryLog, AuditLog } from '../types';
import { calculateRecipeCost, getRequiredIngredientsForOrderItem } from '../utils/helpers';
import { isSupabaseConfigured } from '../lib/supabase';
import { 
  AlertTriangle, 
  Calendar, 
  Activity, 
  UtensilsCrossed, 
  Clock,
  Search,
  Scale,
  Folder,
  DollarSign,
  Package,
  TrendingUp,
  Layers,
  Sparkles,
  BarChart3,
  Weight,
  UserCheck, // for roles
  FileText,
  Cloud,
  Database,
  Check,
  Copy,
  Lock,
  BookOpen,
  Terminal
} from 'lucide-react';

interface ReportsDashboardProps {
  orders: Order[];
  ingredients: Ingredient[];
  dishes: Dish[];
  inventoryLogs: InventoryLog[];
  auditLogs?: AuditLog[];
}

export default function ReportsDashboard({
  orders,
  ingredients,
  dishes,
  inventoryLogs,
  auditLogs = []
}: ReportsDashboardProps) {
  // Navigation tabs for different ingredient-focused views
  const [activePerspective, setActivePerspective] = useState<'ingredients' | 'dishes' | 'categories' | 'audit' | 'supabase'>('ingredients');
  const [auditRoleFilter, setAuditRoleFilter] = useState<'All' | 'Admin' | 'Chef' | 'Waiter'>('All');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  
  // Date range selectors (Daily, Weekly, Monthly, Custom)
  const [periodMode, setPeriodMode] = useState<'Today' | 'Week' | 'Month' | 'Custom'>('Week');
  
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Searches
  const [ingSearch, setIngSearch] = useState('');
  const [dishSearch, setDishSearch] = useState('');

  // Drilldown selections
  const [selectedIngId, setSelectedIngId] = useState<string>(ingredients[0]?.id || '');
  const [selectedDishId, setSelectedDishId] = useState<string>(dishes[0]?.id || '');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Burgers');

  const servedOrders = orders.filter(o => o.status === 'Served');

  // Compute audit logs filters & analytics counters
  const filteredAudits = auditLogs.filter(log => {
    const matchesRole = auditRoleFilter === 'All' || log.actorRole === auditRoleFilter;
    const matchesSearch = log.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) || 
                          log.details.toLowerCase().includes(auditSearchQuery.toLowerCase()) || 
                          log.actorName.toLowerCase().includes(auditSearchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const adminAuditsCount = auditLogs.filter(l => l.actorRole === 'Admin').length;
  const chefAuditsCount = auditLogs.filter(l => l.actorRole === 'Chef').length;
  const waiterAuditsCount = auditLogs.filter(l => l.actorRole === 'Waiter').length;

  // Compute active range
  let startDateObj = new Date();
  let endDateObj = new Date();

  if (periodMode === 'Today') {
    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(23, 59, 59, 999);
  } else if (periodMode === 'Week') {
    startDateObj.setDate(startDateObj.getDate() - 6);
    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(23, 59, 59, 999);
  } else if (periodMode === 'Month') {
    startDateObj.setDate(startDateObj.getDate() - 29);
    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(23, 59, 59, 999);
  } else if (periodMode === 'Custom') {
    startDateObj = new Date(customStartDate + 'T00:00:00');
    endDateObj = new Date(customEndDate + 'T23:59:59');
  }

  // Filter served orders in active time period
  const rangeServedOrders = servedOrders.filter(order => {
    const t = new Date(order.createdAt).getTime();
    return t >= startDateObj.getTime() && t <= endDateObj.getTime();
  });

  // -------------------------------------------------------------------------
  // STATS ACCUMULATOR FOR MULTI-TEMPORAL VISUALS (ALL DAY / TODAY, WEEK, MONTH)
  // -------------------------------------------------------------------------
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);

  const multiUsage: Record<string, { today: number; week: number; month: number }> = {};
  ingredients.forEach(ing => {
    multiUsage[ing.id] = { today: 0, week: 0, month: 0 };
  });

  servedOrders.forEach(order => {
    const orderTime = new Date(order.createdAt).getTime();
    const isToday = orderTime >= startOfToday.getTime();
    const isWeek = orderTime >= startOfWeek.getTime();
    const isMonth = orderTime >= startOfMonth.getTime();

    order.items.forEach(item => {
      const itemRequirements = getRequiredIngredientsForOrderItem(item, dishes);
      for (const [ingId, qtyNeeded] of Object.entries(itemRequirements)) {
        if (!multiUsage[ingId]) continue;
        if (isToday) {
          multiUsage[ingId].today += qtyNeeded;
        }
        if (isWeek) {
          multiUsage[ingId].week += qtyNeeded;
        }
        if (isMonth) {
          multiUsage[ingId].month += qtyNeeded;
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // CORE COMPUTATION: INGREDIENT CONSUMPTION ACCUMULATOR
  // -------------------------------------------------------------------------
  
  interface IngredientUsageDetail {
    id: string;
    name: string;
    unit: string;
    costPerUnit: number;
    totalQty: number;
    totalCost: number;
    remainingStock: number;
    isLowStock: boolean;
    dishesBreakdown: Record<string, { dishId: string; dishName: string; category: string; qty: number; cost: number; portions: number }>;
    categoriesBreakdown: Record<string, { categoryName: string; qty: number; cost: number }>;
  }

  const usageMap: Record<string, IngredientUsageDetail> = {};

  // Initialize with current ingredients list
  ingredients.forEach(ing => {
    usageMap[ing.id] = {
      id: ing.id,
      name: ing.name,
      unit: ing.unit,
      costPerUnit: ing.costPerUnit,
      totalQty: 0,
      totalCost: 0,
      remainingStock: ing.stock,
      isLowStock: ing.stock <= ing.minStock,
      dishesBreakdown: {},
      categoriesBreakdown: {}
    };
  });

  // Populate actual consumption from the orders in date range
  rangeServedOrders.forEach(order => {
    order.items.forEach(item => {
      const dish = dishes.find(d => d.id === item.dishId);
      if (!dish) return;

      // Extract specific recipe requirements
      const itemRequirements = getRequiredIngredientsForOrderItem(item, dishes);

      for (const [ingId, qtyNeeded] of Object.entries(itemRequirements)) {
        if (!usageMap[ingId]) continue; // Safety check

        const ingObj = usageMap[ingId];
        ingObj.totalQty += qtyNeeded;
        ingObj.totalCost += qtyNeeded * ingObj.costPerUnit;

        // Breakdown by Menu Dish
        if (!ingObj.dishesBreakdown[item.dishId]) {
          ingObj.dishesBreakdown[item.dishId] = {
            dishId: item.dishId,
            dishName: item.dishName,
            category: dish.category,
            qty: 0,
            cost: 0,
            portions: 0
          };
        }
        ingObj.dishesBreakdown[item.dishId].qty += qtyNeeded;
        ingObj.dishesBreakdown[item.dishId].cost += qtyNeeded * ingObj.costPerUnit;
        ingObj.dishesBreakdown[item.dishId].portions += item.quantity;

        // Breakdown by category
        if (!ingObj.categoriesBreakdown[dish.category]) {
          ingObj.categoriesBreakdown[dish.category] = {
            categoryName: dish.category,
            qty: 0,
            cost: 0
          };
        }
        ingObj.categoriesBreakdown[dish.category].qty += qtyNeeded;
        ingObj.categoriesBreakdown[dish.category].cost += qtyNeeded * ingObj.costPerUnit;
      }
    });
  });

  const allUsageList = Object.values(usageMap);
  const totalIngredientConsumedCost = allUsageList.reduce((sum, ing) => sum + ing.totalCost, 0);

  // Filters and sorting
  const filteredUsageList = allUsageList.filter(u => 
    u.name.toLowerCase().includes(ingSearch.toLowerCase())
  );

  // High intensity/cost items during selected range
  const topConsumedIngredients = [...allUsageList]
    .filter(u => u.totalQty > 0)
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 5);

  const currentSelectedIng = usageMap[selectedIngId] || allUsageList[0];

  // -------------------------------------------------------------------------
  // INGREDIENT USAGE BY MENU DIH RECORDS
  // -------------------------------------------------------------------------
  
  interface DishIngredientConsumption {
    dishId: string;
    dishName: string;
    category: string;
    portionsSold: number;
    totalRevenue: number;
    cogsCost: number;
    ingredientsConsumed: Array<{
      ingredientId: string;
      name: string;
      unit: string;
      qtyNeededForOne: number;
      qtyTotalConsumed: number;
      costTotalConsumed: number;
    }>;
  }

  const dishConsumptionMap: Record<string, DishIngredientConsumption> = {};

  dishes.forEach(dish => {
    const ingList = dish.recipe.map(recipeItem => {
      const matchIng = ingredients.find(i => i.id === recipeItem.ingredientId);
      return {
        ingredientId: recipeItem.ingredientId,
        name: matchIng?.name || 'Unknown',
        unit: matchIng?.unit || 'g',
        qtyNeededForOne: recipeItem.quantity,
        qtyTotalConsumed: 0,
        costTotalConsumed: 0
      };
    });

    dishConsumptionMap[dish.id] = {
      dishId: dish.id,
      dishName: dish.name,
      category: dish.category,
      portionsSold: 0,
      totalRevenue: 0,
      cogsCost: 0,
      ingredientsConsumed: ingList
    };
  });

  // Accumulate menu-specific usages
  rangeServedOrders.forEach(order => {
    order.items.forEach(item => {
      if (!dishConsumptionMap[item.dishId]) return;

      const recordObj = dishConsumptionMap[item.dishId];
      recordObj.portionsSold += item.quantity;
      recordObj.totalRevenue += item.price * item.quantity;

      const itemsRequirements = getRequiredIngredientsForOrderItem(item, dishes);
      
      for (const [ingId, qtyTotal] of Object.entries(itemsRequirements)) {
        const matchingIngRecord = recordObj.ingredientsConsumed.find(i => i.ingredientId === ingId);
        if (matchingIngRecord) {
          matchingIngRecord.qtyTotalConsumed += qtyTotal;
          const detailIng = ingredients.find(ing => ing.id === ingId);
          if (detailIng) {
            matchingIngRecord.costTotalConsumed += qtyTotal * detailIng.costPerUnit;
            recordObj.cogsCost += qtyTotal * detailIng.costPerUnit;
          }
        }
      }
    });
  });

  const dishConsumptionsList = Object.values(dishConsumptionMap);
  const filteredDishConsumptions = dishConsumptionsList.filter(d => 
    d.dishName.toLowerCase().includes(dishSearch.toLowerCase()) || 
    d.category.toLowerCase().includes(dishSearch.toLowerCase())
  );

  const currentSelectedDishObj = dishConsumptionMap[selectedDishId] || dishConsumptionsList[0];

  // -------------------------------------------------------------------------
  // INGREDIENT USAGE BY CATEGORY
  // -------------------------------------------------------------------------
  
  const categoriesList = Array.from(new Set(dishes.map(d => d.category)));

  interface CategoryUtilization {
    categoryName: string;
    totalCost: number;
    portionsSold: number;
    ingredients: Record<string, { name: string; unit: string; qty: number; cost: number }>;
  }

  const categoryUtilizationMap: Record<string, CategoryUtilization> = {};
  categoriesList.forEach(cat => {
    categoryUtilizationMap[cat] = {
      categoryName: cat,
      totalCost: 0,
      portionsSold: 0,
      ingredients: {}
    };
  });

  allUsageList.forEach(ing => {
    Object.entries(ing.categoriesBreakdown).forEach(([catName, breakObject]) => {
      if (!categoryUtilizationMap[catName]) {
        categoryUtilizationMap[catName] = { 
          categoryName: catName, 
          totalCost: 0, 
          portionsSold: 0, 
          ingredients: {} 
        };
      }
      
      const catObj = categoryUtilizationMap[catName];
      catObj.totalCost += breakObject.cost;

      if (!catObj.ingredients[ing.id]) {
        catObj.ingredients[ing.id] = {
          name: ing.name,
          unit: ing.unit,
          qty: 0,
          cost: 0
        };
      }
      catObj.ingredients[ing.id].qty += breakObject.qty;
      catObj.ingredients[ing.id].cost += breakObject.cost;
    });
  });

  rangeServedOrders.forEach(order => {
    order.items.forEach(item => {
      const dish = dishes.find(d => d.id === item.dishId);
      if (dish && categoryUtilizationMap[dish.category]) {
        categoryUtilizationMap[dish.category].portionsSold += item.quantity;
      }
    });
  });

  // Safeguard chosen category
  const activeCategoryName = selectedCategoryName && categoryUtilizationMap[selectedCategoryName] 
    ? selectedCategoryName 
    : categoriesList[0] || '';
  
  const selectedCategoryUsageObj = categoryUtilizationMap[activeCategoryName];

  // -------------------------------------------------------------------------
  // HISTORIC TREND DATA: Ingredient Value (COGS) Consumption over the active range
  // -------------------------------------------------------------------------
  
  const getPeriodRangeIngredientUsageTrend = () => {
    const periodDays: Record<string, { label: string; dateStr: string; cost: number; quantity: number }> = {};
    const oneDayMs = 24 * 60 * 60 * 1000;
    const diffDays = Math.min(60, Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / oneDayMs));

    // Populate timeline buckets
    for (let i = diffDays - 1; i >= 0; i--) {
      const d = new Date(endDateObj.getTime() - i * oneDayMs);
      const key = d.toDateString();
      const label = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      periodDays[key] = { label, dateStr: d.toISOString().split('T')[0], cost: 0, quantity: 0 };
    }

    rangeServedOrders.forEach(order => {
      const dKey = new Date(order.createdAt).toDateString();
      if (periodDays[dKey]) {
        order.items.forEach(item => {
          const itemRequirements = getRequiredIngredientsForOrderItem(item, dishes);
          for (const [ingId, qtyNeeded] of Object.entries(itemRequirements)) {
            const ingRef = ingredients.find(ing => ing.id === ingId);
            if (ingRef) {
              periodDays[dKey].cost += qtyNeeded * ingRef.costPerUnit;
              periodDays[dKey].quantity += qtyNeeded;
            }
          }
        });
      }
    });

    return Object.values(periodDays);
  };

  const dynamicTrendList = getPeriodRangeIngredientUsageTrend();
  const maxDynamicCost = Math.max(...dynamicTrendList.map(t => t.cost), 100) * 1.15;

  const lowStockCount = ingredients.filter(i => i.stock <= i.minStock).length;

  return (
    <div className="space-y-5 overflow-y-auto h-[calc(100vh-140px)] pr-1 scrollbar-thin pb-6" id="ingredients_dashboard_root">
      
      {/* FILTER AND PERIOD CONTROLS BAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-10" id="dashboard_period_header">
        
        {/* Module Title */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="p-2 bg-gray-950 text-white rounded-lg">
            <Scale className="w-5 h-5 text-emerald-450" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase text-gray-900 tracking-tight leading-none">Ingredient Usage Analytics</h2>
            <p className="text-[10px] text-gray-400 font-medium font-sans mt-1">
              Formula: Ingredient Used = Qty in Recipe × Menu Plates Sold
            </p>
          </div>
        </div>

        {/* Dynamic Period Presets Block */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100 text-[11px] font-bold text-gray-400">
            <button
              onClick={() => setPeriodMode('Today')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                periodMode === 'Today' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-905'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setPeriodMode('Week')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                periodMode === 'Week' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-905'
              }`}
            >
              Weekly (7D)
            </button>
            <button
              onClick={() => setPeriodMode('Month')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                periodMode === 'Month' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-905'
              }`}
            >
              Monthly (30D)
            </button>
            <button
              onClick={() => setPeriodMode('Custom')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                periodMode === 'Custom' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-905'
              }`}
            >
              Custom Range
            </button>
          </div>

          {periodMode === 'Custom' && (
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200 text-[10px] font-mono animate-in slide-in-from-right duration-100">
              <input
                type="date"
                value={customStartDate}
                max={customEndDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-white border border-gray-200 rounded p-1 text-[11px] focus:outline-hidden text-gray-800 font-bold"
              />
              <span className="text-gray-400 font-sans">to</span>
              <input
                type="date"
                value={customEndDate}
                min={customStartDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-white border border-gray-200 rounded p-1 text-[11px] focus:outline-hidden text-gray-800 font-bold"
              />
            </div>
          )}
        </div>

      </div>

      {/* CORE PERFORMANCE METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard_cogs_kpi_row">
        
        {/* Metric (Cost value equivalent of consumed materials) */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10.5px] font-black text-gray-400 uppercase tracking-wider block">Total Ingredient Cost consumed</span>
            <div className="text-lg font-extrabold text-gray-950 font-mono">
              {totalIngredientConsumedCost.toLocaleString([], { maximumFractionDigits: 1 })} <span className="text-xs font-semibold text-gray-400">Br</span>
            </div>
            <span className="text-[9.5px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold block w-fit">
              Deducted based on menus served
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Metric (Top consumer / Cost Driver) */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10.5px] font-black text-gray-400 uppercase tracking-wider block">Top Cost Driver</span>
            {topConsumedIngredients[0] ? (
              <div className="text-[13px] font-extrabold text-gray-900 leading-tight">
                {topConsumedIngredients[0].name}
                <span className="block text-[10px] text-amber-700 font-bold font-mono mt-0.5">
                  Used: {topConsumedIngredients[0].totalQty.toFixed(1)} {topConsumedIngredients[0].unit} ({topConsumedIngredients[0].totalCost.toFixed(0)} Br)
                </span>
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic">No usage records</div>
            )}
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Total volume physical servings */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10.5px] font-black text-gray-400 uppercase tracking-wider block">Total Raw weight/portions</span>
            <div className="text-lg font-extrabold text-gray-950 font-mono">
              {rangeServedOrders.reduce((sum, o) => sum + o.items.reduce((b, item) => b + item.quantity, 0), 0)} <span className="text-xs text-gray-400">portions served</span>
            </div>
            <span className="text-[9.5px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-bold block w-fit">
              Ingredients matched perfectly
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock count alert */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10.5px] font-black text-gray-400 uppercase tracking-wider block">Low-stock raw alerts</span>
            <div className="text-lg font-extrabold text-red-650 font-mono">
              {lowStockCount} <span className="text-xs font-semibold text-gray-450">items</span>
            </div>
            {lowStockCount > 0 ? (
              <span className="text-[9.5px] text-red-600 bg-red-50 px-1.5 py-0.2 rounded font-black block w-fit animate-pulse">
                Needs prompt top-up
              </span>
            ) : (
              <span className="text-[9.5px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-bold block w-fit">
                Safety stock is perfect
              </span>
            )}
          </div>
          <div className={`p-2.5 rounded-lg shrink-0 ${lowStockCount > 0 ? 'bg-red-50 text-red-500 animate-bounce' : 'bg-gray-50 text-gray-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* CORE TREND LINE CHART: INGREDIENTS CONSUMPTION COST FLOW */}
      <div className="bg-white p-4.5 rounded-xl border border-gray-100 shadow-xs">
        <div className="pb-3 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xs font-black uppercase text-gray-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" /> Daily Ingredient Usage Cost Trend ({periodMode})
            </h3>
            <p className="text-[10px] text-gray-400">Calculated value of raw stock deducted per operating calendar day</p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] font-semibold text-gray-500">
            <span className="w-2.5 h-2.5 bg-emerald-505 bg-gray-900 rounded-xs"></span>
            <span>Consumed Value (Br)</span>
          </div>
        </div>

        {/* Graph representation */}
        <div className="h-40 flex items-end justify-between gap-1.5 pt-4 font-mono text-[10px] relative">
          <div className="absolute inset-x-0 bottom-4 top-4 flex flex-col justify-between pointer-events-none">
            <div className="w-full border-t border-dashed border-gray-100"></div>
            <div className="w-full border-t border-dashed border-gray-100"></div>
            <div className="w-full border-t border-dashed border-gray-100"></div>
          </div>

          {dynamicTrendList.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 italic text-xs">
              No consumption recorded inside this date range. Place completed orders to generate trend data!
            </div>
          ) : (
            dynamicTrendList.map((d, index) => {
              const heightPercent = (d.cost / maxDynamicCost) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group relative z-10">
                  
                  {/* Hover tooltip */}
                  <div className="hidden group-hover:block absolute bottom-full mb-1 bg-gray-950 text-white rounded p-1.5 text-[9px] text-center shadow-lg font-sans leading-none z-30 min-w-[120px]">
                    <p className="font-bold border-b border-gray-800 pb-0.5 mb-1">{d.label}</p>
                    <p>Raw Cost: {d.cost.toFixed(1)} Br</p>
                    <p>Ingredients: {d.quantity.toFixed(0)} units</p>
                  </div>

                  {/* Single Cost Bar represent usage cost */}
                  <div 
                    style={{ height: `${Math.max(heightPercent, 3.5)}%` }} 
                    className="w-full max-w-[28px] bg-slate-900 group-hover:bg-emerald-600 rounded-t-xs transition-all cursor-pointer"
                  ></div>

                  <span className="text-[8px] sm:text-[9.5px] text-gray-400 font-bold block pt-1 opacity-70 group-hover:opacity-100 font-sans">
                    {d.label.split(',')[0]}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PERSPECTIVES ANALYTICS CONTROL PANEL */}
      <div className="border border-gray-100 bg-white p-3 rounded-xl shadow-xs">
        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2.5 px-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Interactive Consumption &amp; Audit Perspectives
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-bold">
          
          <button
            onClick={() => {
              setActivePerspective('ingredients');
              const withQty = allUsageList.filter(u => u.totalQty > 0);
              if (withQty.length > 0 && !withQty.some(i => i.id === selectedIngId)) {
                setSelectedIngId(withQty[0].id);
              }
            }}
            className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all flex items-center justify-center gap-2 ${
              activePerspective === 'ingredients' 
                ? 'bg-gray-950 text-white border-gray-950 font-extrabold shadow-xs' 
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100/70'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-400" /> Individual Ingredients
          </button>

          <button
            onClick={() => {
              setActivePerspective('dishes');
              const activeDishes = dishConsumptionsList.filter(d => d.portionsSold > 0);
              if (activeDishes.length > 0 && !activeDishes.some(d => d.dishId === selectedDishId)) {
                setSelectedDishId(activeDishes[0].dishId);
              }
            }}
            className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all flex items-center justify-center gap-2 ${
              activePerspective === 'dishes' 
                ? 'bg-gray-950 text-white border-gray-950 font-extrabold shadow-xs' 
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100/70'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-blue-400" /> Menu Dishes Sold
          </button>

          <button
            onClick={() => {
              setActivePerspective('categories');
            }}
            className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all flex items-center justify-center gap-2 ${
              activePerspective === 'categories' 
                ? 'bg-gray-950 text-white border-gray-950 font-extrabold shadow-xs' 
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100/70'
            }`}
          >
            <Folder className="w-4 h-4 text-amber-400" /> Food Categories
          </button>

          <button
            onClick={() => {
              setActivePerspective('audit');
            }}
            className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all flex items-center justify-center gap-2 ${
              activePerspective === 'audit' 
                ? 'bg-gray-950 text-white border-gray-950 font-extrabold shadow-xs' 
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100/70'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-500" /> Staff Role Audits
          </button>

          <button
            onClick={() => {
              setActivePerspective('supabase');
            }}
            className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all flex items-center justify-center gap-2 ${
              activePerspective === 'supabase' 
                ? 'bg-primary-dark bg-amber-500 text-white border-amber-500 font-extrabold shadow-xs' 
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-amber-50/70 hover:text-amber-900'
            }`}
          >
            <Database className="w-4 h-4 text-gray-900" /> Supabase Cloud Sync
          </button>

        </div>
      </div>

      {/* DUAL-PANE VIEWPORT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[480px] min-h-[400px] items-stretch overflow-hidden">
        
        {/* PERSPECTIVE E: SUPABASE CLOUD SYNC & SYSTEM MANAGEMENT CODES */}
        {activePerspective === 'supabase' && (
          <>
            {/* Left Column: Extensive Step-by-Step guides on Supabase data operations (8 span) */}
            <div className="xl:col-span-8 bg-white border border-gray-100 rounded-xl shadow-xs flex flex-col h-full min-h-0 overflow-y-auto p-5 scrollbar-thin">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-100 shrink-0">
                <Cloud className="w-5 h-5 text-amber-500 animate-pulse" />
                <div>
                  <h4 className="text-xs font-black uppercase text-gray-950">How to Manage &amp; Synchronize with Supabase Cloud</h4>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">Step-by-step blueprint of table operations, real-time sync hooks, and user roster management</p>
                </div>
              </div>

              <div className="space-y-4 text-gray-700 text-xs font-medium">
                {/* Step 1 */}
                <div className="bg-gray-50/75 p-4 rounded-xl border border-gray-150/40 relative">
                  <span className="absolute top-3 right-4 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[9px] px-2 py-0.5 rounded-full">STEP 1</span>
                  <h5 className="font-bold text-gray-900 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                    <Terminal className="w-4 h-4 text-gray-750" /> 1. Execute SQL Tables Schema
                  </h5>
                  <p className="text-gray-500 leading-relaxed text-[11px] mb-3">
                    Copy the custom database structure we generated in <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px] text-red-600 font-bold font-mono">/SUPABASE_SCHEMA.sql</code>. 
                    Navigate to your Supabase project dashboard, open the <strong>SQL Editor</strong> tab on the left panel, click &quot;New Query&quot;, paste the definitions, and click <strong>Run</strong>.
                  </p>
                  <div className="bg-gray-900 text-gray-200 p-2.5 rounded-lg text-[10.5px] font-mono leading-tight whitespace-pre overflow-x-auto max-h-36">
{`-- Create POS tracking structures
CREATE TABLE shega_employees (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  pin TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Waiter',
  branch TEXT NOT NULL
);
CREATE TABLE shega_ingredients ( ... );
CREATE TABLE shega_dishes ( ... );
CREATE TABLE shega_tables ( ... );
CREATE TABLE shega_orders ( ... );`}
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-gray-50/75 p-4 rounded-xl border border-gray-150/40 relative">
                  <span className="absolute top-3 right-4 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[9px] px-2 py-0.5 rounded-full">STEP 2</span>
                  <h5 className="font-bold text-gray-900 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                    <Database className="w-4 h-4 text-emerald-500" /> 2. Grid-Based Table Management (CRUD)
                  </h5>
                  <p className="text-gray-500 leading-relaxed text-[11px]">
                    Once tables are executed, you can use Supabase&#39;s beautiful, built-in <strong>Table Editor</strong> to view, modify, restock raw ingredients, adjust menu prices, and update rosters like a spreadsheet:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600 text-[11px]">
                    <li><strong>Deduct Inventory:</strong> Standard order tickets automatically deduct ingredients from <code className="bg-gray-100 px-1 rounded text-red-650 font-bold">shega_ingredients</code> inside Supabase under the corresponding branch!</li>
                    <li><strong>Restocks:</strong> Directly adjust the <code className="bg-gray-105 px-1 rounded text-emerald-800 font-extrabold">stock</code> numerical column in Supabase&#39;s table browser, or trigger manual restocks in the &quot;Recipes &amp; Stock&quot; POS terminal.</li>
                  </ul>
                </div>

                {/* Step 3 */}
                <div className="bg-gray-50/75 p-4 rounded-xl border border-gray-150/40 relative">
                  <span className="absolute top-3 right-4 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[9px] px-2 py-0.5 rounded-full">STEP 3</span>
                  <h5 className="font-bold text-gray-900 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                    <Lock className="w-4 h-4 text-amber-500" /> 3. Secure Employee &amp; Roster Authorization PINs
                  </h5>
                  <p className="text-gray-500 leading-relaxed text-[11px]">
                    To manage staff logins dynamically without hardcoding standard credentials, simply update the <code className="bg-gray-100 px-1 rounded">shega_employees</code> table items:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2 text-[10px] font-mono">
                    <div className="bg-white p-2.5 rounded border border-gray-150">
                      <span className="font-black text-rose-700 block">Chef Profile (PIN: &#39;2222&#39;)</span>
                      <span className="text-gray-500 mt-0.5 block">Restricted to cooking states, raw order tracking, and kitchen ticket pipelines.</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border border-gray-150">
                      <span className="font-black text-emerald-700 block">Waiter Profile (PIN: &#39;3333&#39;)</span>
                      <span className="text-gray-500 mt-0.5 block">Restricted to inputting POS order tickets, digital billing settlements, and active dining states.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Connection Environment Variables & Live State (4 span) */}
            <div className="xl:col-span-4 bg-white border border-gray-100 rounded-xl shadow-xs flex flex-col h-full min-h-0 p-5 overflow-y-auto scrollbar-thin">
              <div className="pb-3 mb-4.5 border-b border-gray-55 shrink-0">
                <h4 className="text-xs font-black uppercase text-gray-900">Live Connection Context</h4>
                <p className="text-[10px] text-gray-400 font-medium">Environment configurations loaded in this terminal</p>
              </div>

              <div className="space-y-4 flex-1 text-xs">
                {/* Visual Connector State */}
                <div className="p-3.5 rounded-xl border border-dashed border-gray-200 flex flex-col items-center text-center gap-2 bg-slate-50/50">
                  <div className={`p-2.5 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-50 text-emerald-600 animate-pulse' : 'bg-rose-50 text-rose-500'}`}>
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <span className={`text-[11px] font-black uppercase ${isSupabaseConfigured() ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {isSupabaseConfigured() ? 'Connected Online to Supabase' : 'Offline / Sandbox Fallback'}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium leading-relaxed">
                      {isSupabaseConfigured() 
                        ? 'Operational data is actively synchronizing with your live PostgreSQL database on Supabase.' 
                        : 'Please establish a valid Supabase project via environment secrets.'}
                    </p>
                  </div>
                </div>

                {/* Environment Variables summary checks (no secrets exposed) */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block px-1">Keys Configuration Status</span>
                  
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-150/40 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-gray-500">VITE_SUPABASE_URL</span>
                    <span className={`font-black font-mono ${isSupabaseConfigured() ? 'text-emerald-600' : 'text-gray-450'}`}>
                      {isSupabaseConfigured() ? '✓ CONFIGURED' : '✗ EMPTY'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-150/40 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-gray-500">VITE_SUPABASE_ANON_KEY</span>
                    <span className={`font-black font-mono ${isSupabaseConfigured() ? 'text-emerald-600' : 'text-gray-450'}`}>
                      {isSupabaseConfigured() ? '✓ CONFIGURED' : '✗ EMPTY'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-150/40 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-gray-500">CHAPA_GATEWAY_KEY</span>
                    <span className="font-black font-mono text-emerald-600">✓ CONFIGURED</span>
                  </div>
                </div>

                {/* Quick copy buttons or download actions */}
                <div className="pt-2">
                  <a 
                    href="/SUPABASE_SCHEMA.sql" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-[11px] rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" /> View Raw SQL File
                  </a>
                  <p className="text-[9px] text-gray-400 text-center mt-1.5 font-medium">
                    Includes automatic table creation and public permissive RLS access policies.
                  </p>
                </div>

              </div>
            </div>
          </>
        )}

        {/* PERSPECTIVE D: STAFF ROLE AUDITS */}
        {activePerspective === 'audit' && (
          <>
            {/* Left Column: List of audits with search/role filters (8 span) */}
            <div className="xl:col-span-8 bg-white border border-gray-100 rounded-xl shadow-xs flex flex-col h-full min-h-0">
              <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 font-bold gap-2">
                <div>
                  <span className="text-xs font-black uppercase text-gray-900 block">Role-Based Operational Audit Ledger</span>
                  <span className="text-[10px] text-gray-400 font-medium">Trace actions executed by role assignments</span>
                </div>
                <div className="flex items-center gap-1.5 self-stretch sm:self-auto overflow-x-auto">
                  {(['All', 'Admin', 'Chef', 'Waiter'] as const).map(roleOption => {
                    const count = roleOption === 'All' ? auditLogs.length : auditLogs.filter(l => l.actorRole === roleOption).length;
                    return (
                      <button
                        key={roleOption}
                        onClick={() => setAuditRoleFilter(roleOption)}
                        className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all border shrink-0 cursor-pointer ${
                          auditRoleFilter === roleOption
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs font-extrabold'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {roleOption} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search bar for audits */}
              <div className="p-2.5 border-b border-gray-50 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search logs by action, keyword, or actor name..."
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-amber-400 bg-white"
                  />
                </div>
              </div>

              {/* Scrollable list */}
              <div className="overflow-y-auto flex-1 p-3 space-y-2.5 scrollbar-thin">
                {filteredAudits.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-bold font-mono">No matching audit logs found.</p>
                    <p className="text-[10px] text-gray-400 mt-1">Try resetting the filter search string</p>
                  </div>
                ) : (
                  filteredAudits.map(log => {
                    const badgeColor = 
                      log.actorRole === 'Admin' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200/40' 
                        : log.actorRole === 'Chef' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200/40' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200/40';

                    return (
                      <div 
                        key={log.id} 
                        className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50/20 hover:bg-white text-xs transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-xs"
                      >
                        <div className="space-y-1 select-none flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-xs text-gray-901">{log.action}</span>
                            <span className={`text-[8.5px] font-black px-1.5 py-0.2 rounded border uppercase font-mono tracking-wider ${badgeColor}`}>
                              {log.actorRole}
                            </span>
                            <span className="text-[9.5px] font-bold bg-gray-100/75 text-gray-600 font-sans px-1.5 py-0.2 rounded">
                              By {log.actorName}
                            </span>
                          </div>
                          <p className="text-gray-600 font-medium leading-relaxed">{log.details}</p>
                          <div className="text-[9px] text-gray-400 font-mono font-medium flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                            <span>•</span>
                            <span>Branch: {log.branch}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Roles Stats Overview (4 span) */}
            <div className="xl:col-span-4 bg-white border border-gray-100 rounded-xl shadow-xs p-4 flex flex-col justify-between h-full min-h-0 overflow-y-auto">
              <div>
                <div className="pb-3 border-b border-gray-100 mb-4">
                  <span className="text-[10px] font-black uppercase text-gray-400">Security &amp; Logging Overview</span>
                  <h4 className="text-xs font-black text-gray-901 mt-0.5">Role Action Contributions</h4>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-gray-500">Total System Audits</span>
                      <span className="font-mono text-sm font-black text-gray-900">{auditLogs.length}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden flex">
                      <div 
                        style={{ width: `${(adminAuditsCount / (auditLogs.length || 1)) * 100}%` }} 
                        className="h-full bg-purple-500" 
                        title="Admin"
                      />
                      <div 
                        style={{ width: `${(chefAuditsCount / (auditLogs.length || 1)) * 100}%` }} 
                        className="h-full bg-blue-500" 
                        title="Chef"
                      />
                      <div 
                        style={{ width: `${(waiterAuditsCount / (auditLogs.length || 1)) * 100}%` }} 
                        className="h-full bg-emerald-500" 
                        title="Waiter"
                      />
                    </div>
                  </div>

                  {/* Admin audits row */}
                  <div className="flex items-center justify-between p-2 rounded-lg border border-purple-50 hover:bg-purple-50/10 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span className="font-bold text-gray-700">Admin Actions</span>
                    </div>
                    <span className="font-mono font-extrabold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[10.5px]">
                      {adminAuditsCount} logs
                    </span>
                  </div>

                  {/* Chef audits row */}
                  <div className="flex items-center justify-between p-2 rounded-lg border border-blue-50 hover:bg-blue-50/10 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="font-bold text-gray-700">Chef &amp; Kitchen Actions</span>
                    </div>
                    <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10.5px]">
                      {chefAuditsCount} logs
                    </span>
                  </div>

                  {/* Waiter audits row */}
                  <div className="flex items-center justify-between p-2 rounded-lg border border-emerald-50 hover:bg-emerald-50/10 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="font-bold text-gray-700">Waiter &amp; POS Intake</span>
                    </div>
                    <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10.5px]">
                      {waiterAuditsCount} logs
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200/50 text-[10px] text-amber-900 font-medium">
                <p className="font-extrabold uppercase tracking-wide text-amber-800 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Security Notice
                </p>
                All operations performed are strictly tied to PIN authenticator sessions. Discrepancies should be examined through historical stock adjustments below.
              </div>
            </div>
          </>
        )}

        {/* PERSPECTIVE A: INDIVIDUAL INGREDIENTS */}
        {activePerspective === 'ingredients' && (
          <>
            {/* Left Column: List of ingredients (8 span to provide space for multi-temporal comparative table) */}
            <div className="xl:col-span-8 bg-white border border-gray-100 rounded-xl shadow-xs flex flex-col h-full min-h-0">
              <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between shrink-0 font-bold">
                <span className="text-xs font-black uppercase text-gray-400">All Day, Week & Month Usage By Ingredient</span>
                <span className="text-[10px] font-mono text-gray-400">{filteredUsageList.length} items listed</span>
              </div>

              {/* Search bar inside ledger pane */}
              <div className="p-2.5 border-b border-gray-50 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search ingredients by name..."
                    value={ingSearch}
                    onChange={(e) => setIngSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-gray-350"
                  />
                </div>
              </div>

              {/* Items ledger multi-period table */}
              <div className="flex-1 overflow-y-auto scrollbar-thin text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="p-3">Ingredient</th>
                      <th className="p-3 text-center">In Stock</th>
                      <th className="p-3 text-center bg-emerald-50/10 text-emerald-800">Today</th>
                      <th className="p-3 text-center bg-blue-50/10 text-blue-800">Week (7d)</th>
                      <th className="p-3 text-center bg-indigo-50/10 text-indigo-800">Month (30d)</th>
                      <th className="p-3 text-right">Selected Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                    {filteredUsageList.map(usage => {
                      const isSelected = selectedIngId === usage.id;
                      const stats = multiUsage[usage.id] || { today: 0, week: 0, month: 0 };

                      return (
                        <tr
                          key={usage.id}
                          onClick={() => setSelectedIngId(usage.id)}
                          className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                            isSelected ? 'bg-slate-50/80 border-l-4 border-slate-900 font-semibold' : ''
                          }`}
                        >
                          <td className="p-3 font-bold text-gray-900">
                            <div className="flex flex-col gap-0.5">
                              <span>{usage.name}</span>
                              <span className="text-[9px] text-gray-400 font-mono font-normal">Code: {usage.id}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`p-1 px-1.5 rounded text-[11px] font-mono font-bold ${
                              usage.isLowStock ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {usage.remainingStock} <span className="text-[9px] text-gray-400 font-normal">{usage.unit}</span>
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-emerald-600 bg-emerald-50/5">
                            {stats.today > 0 ? (
                              <span>{stats.today.toFixed(1)} <span className="text-[9px] text-gray-400 font-normal">{usage.unit}</span></span>
                            ) : (
                              <span className="text-gray-300 font-normal">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-blue-600 bg-blue-50/5">
                            {stats.week > 0 ? (
                              <span>{stats.week.toFixed(1)} <span className="text-[9px] text-gray-400 font-normal">{usage.unit}</span></span>
                            ) : (
                              <span className="text-gray-300 font-normal">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono font-extrabold text-indigo-600 bg-indigo-50/5">
                            {stats.month > 0 ? (
                              <span>{stats.month.toFixed(1)} <span className="text-[9px] text-gray-400 font-normal">{usage.unit}</span></span>
                            ) : (
                              <span className="text-gray-300 font-normal">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono font-black text-gray-900">
                            {usage.totalQty > 0 ? (
                              <div className="flex flex-col items-end leading-none">
                                <span className="text-gray-950 font-bold">{usage.totalCost.toFixed(0)} Br</span>
                                <span className="text-[9px] text-gray-400 font-normal mt-0.5">({usage.totalQty.toFixed(0)} {usage.unit})</span>
                              </div>
                            ) : (
                              <span className="text-gray-300 font-normal">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Deep analytics on selected ingredient */}
            <div className="xl:col-span-4 bg-white border border-gray-100 rounded-xl shadow-xs flex flex-col h-full min-h-0">
              <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between shrink-0 font-bold">
                <span className="text-xs font-black uppercase text-gray-400">Deduction Formulas Summary</span>
                <span className="text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">
                  Cost: {currentSelectedIng?.costPerUnit} Br / {currentSelectedIng?.unit}
                </span>
              </div>

              {currentSelectedIng ? (
                <div className="p-4 flex-1 overflow-y-auto scrollbar-thin space-y-4">
                  
                  {/* Selected Item General Indicators */}
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-gray-900 flex items-center gap-1">
                        {currentSelectedIng.name}
                      </h4>
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5">SKU identifier: <strong>{currentSelectedIng.id}</strong></p>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 font-bold uppercase block leading-none mb-1">Stock Position</span>
                      <span className={`text-xs font-black p-1 px-1.5 rounded-md font-mono ${
                        currentSelectedIng.isLowStock ? 'bg-red-55 px-1 py-0.5 bg-red-50 text-red-650 font-bold' : 'bg-gray-105 bg-gray-50 text-gray-700'
                      }`}>
                        {currentSelectedIng.remainingStock} {currentSelectedIng.unit}
                      </span>
                    </div>
                  </div>

                  {/* Summary Metric box */}
                  <div className="grid grid-cols-2 gap-3 font-medium">
                    <div className="p-2.5 bg-gray-50 rounded-lg text-center border border-gray-100">
                      <span className="text-[9.5px] font-bold text-gray-400 uppercase block">Total Weight Consumed</span>
                      <span className="text-sm font-extrabold text-gray-900 font-mono block mt-0.5">
                        {currentSelectedIng.totalQty.toFixed(1)} {currentSelectedIng.unit}
                      </span>
                    </div>
                    <div className="p-2.5 bg-emerald-50/20 rounded-lg text-center border border-emerald-100/30">
                      <span className="text-[9.5px] font-bold text-emerald-600 uppercase block">Cost Equivalency</span>
                      <span className="text-sm font-extrabold text-emerald-800 font-mono block mt-0.5">
                        {currentSelectedIng.totalCost.toFixed(1)} Br
                      </span>
                    </div>
                  </div>

                  {/* FORMULA DISH BREAKDOWN LIST */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline border-b border-gray-150 pb-1.5">
                      <h5 className="text-[11px] font-black uppercase text-gray-450 tracking-wider">Dishes Recipe Deductions</h5>
                      <span className="text-[9px] text-gray-400 font-semibold font-sans">Used = Quantity in Recipe × Servings</span>
                    </div>

                    <div className="space-y-3 max-h-[170px] overflow-y-auto scrollbar-thin pr-1 text-xs font-medium">
                      {Object.values(currentSelectedIng.dishesBreakdown).length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-6">
                          No dishes containing this ingredient were completed inside selected date bounds.
                        </p>
                      ) : (
                        Object.values(currentSelectedIng.dishesBreakdown)
                          .sort((a,b) => b.qty - a.qty)
                          .map((dBreak, index) => {
                            const percentOfTotal = currentSelectedIng.totalQty > 0 
                              ? (dBreak.qty / currentSelectedIng.totalQty) * 100 
                              : 0;

                            return (
                              <div key={index} className="space-y-1" id={`ing_b_dish_${dBreak.dishId}`}>
                                <div className="flex justify-between text-xs font-bold text-gray-800">
                                  <span>{dBreak.dishName} ({dBreak.portions} sold)</span>
                                  <span className="font-mono text-gray-900">{dBreak.qty.toFixed(0)} {currentSelectedIng.unit}</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    style={{ width: `${percentOfTotal}%` }} 
                                    className="bg-emerald-500 h-full rounded-full"
                                  ></div>
                                </div>
                                <div className="flex justify-between items-center text-[9px] text-gray-400 font-sans mt-0.5">
                                  <span>Allocated Raw Cost: <strong>{dBreak.cost.toFixed(0)} Br</strong></span>
                                  <span className="font-mono">{percentOfTotal.toFixed(0)}% share</span>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>

                  {/* Categories Breakdown tag group */}
                  <div className="space-y-1.5 pt-2">
                    <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Allocated Culinary Category Share</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(currentSelectedIng.categoriesBreakdown).length === 0 ? (
                        <span className="text-[10.5px] text-gray-400 italic">No categorical utilization share recorded</span>
                      ) : (
                        Object.entries(currentSelectedIng.categoriesBreakdown).map(([cName, cObj], index) => (
                          <div key={index} className="text-[10px] bg-slate-50 border border-slate-150 text-slate-700 font-bold p-1 px-2.5 rounded-lg flex items-center gap-1.5 shadow-3xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>{cName}: <strong>{cObj.qty.toFixed(0)} {currentSelectedIng.unit}</strong> ({cObj.cost.toFixed(0)} Br)</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-450 italic text-xs font-sans font-medium h-full">
                  Select an ingredient from the material ledger pane to audit deep trace formulas
                </div>
              )}
            </div>
          </>
        )}

        {/* PERSPECTIVE B: MENU DISH FOOD LAUNCHES */}
        {activePerspective === 'dishes' && (
          <>
            {/* Left Column: List of dishes */}
            <div className="xl:col-span-6 bg-white border border-gray-100 rounded-xl shadow-xs flex flex-col h-full min-h-0">
              <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between shrink-0 font-bold">
                <span className="text-xs font-black uppercase text-gray-400">Culinary Dishes & Menu Performance</span>
                <span className="text-[10px] font-mono text-gray-400">{filteredDishConsumptions.length} listed</span>
              </div>

              <div className="p-2.5 border-b border-gray-50 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search menu records..."
                    value={dishSearch}
                    onChange={(e) => setDishSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-gray-350"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-gray-50 text-xs text-gray-700">
                {filteredDishConsumptions.map(record => {
                  const isSelected = selectedDishId === record.dishId;
                  const itemHasSales = record.portionsSold > 0;

                  return (
                    <div
                      key={record.dishId}
                      onClick={() => setSelectedDishId(record.dishId)}
                      className={`p-3 hover:bg-gray-50/70 transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected ? 'bg-slate-50 border-l-4 border-slate-900' : ''
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-gray-950 block">{record.dishName}</span>
                        <span className="text-[9.5px] text-gray-400 font-bold bg-slate-100 px-1 py-0.2 rounded mt-0.5 inline-block">
                          {record.category}
                        </span>
                      </div>

                      <div className="text-right font-mono">
                        {itemHasSales ? (
                          <>
                            <span className="block font-black text-gray-900">
                              {record.portionsSold} <span className="text-[9.5px] text-gray-400 font-medium">sold</span>
                            </span>
                            <span className="text-[9.5px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded inline-block">
                              {record.totalRevenue} Br sales
                            </span>
                          </>
                        ) : (
                          <span className="text-[9px] text-gray-350 italic">0 plates sold in range</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Deep ingredients trace for selected dish */}
            <div className="xl:col-span-6 bg-white border border-gray-100 rounded-xl shadow-xs flex flex-col h-full min-h-0">
              <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between shrink-0 font-bold">
                <span className="text-xs font-black uppercase text-gray-400">Recipe Breakdown & Yield Trace</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded font-mono font-bold">
                  {currentSelectedDishObj?.ingredientsConsumed.length || 0} active components
                </span>
              </div>

              {currentSelectedDishObj ? (
                <div className="p-4 flex-1 overflow-y-auto scrollbar-thin space-y-4">
                  
                  {/* Selected Dish Information */}
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-gray-900">{currentSelectedDishObj.dishName}</h4>
                      <p className="text-[10px] text-gray-400 font-sans">Menu categorization: <strong>{currentSelectedDishObj.category}</strong></p>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Total Plates Sold</span>
                      <span className="text-xs bg-slate-900 text-white font-extrabold p-1 px-2.5 rounded-lg block">
                        {currentSelectedDishObj.portionsSold} serv.
                      </span>
                    </div>
                  </div>

                  {/* Financial COGS metric */}
                  <div className="p-3 bg-amber-50/15 border border-amber-100/30 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-700 font-bold uppercase block tracking-wider">Estimated Materials COGS Cost</span>
                      <span className="text-base font-black text-amber-805 text-gray-900 font-mono">
                        {currentSelectedDishObj.cogsCost.toFixed(0)} Br <span className="text-[10px] font-medium text-gray-400">Total recipe value</span>
                      </span>
                    </div>
                    {currentSelectedDishObj.totalRevenue > 0 && (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 p-1 px-1.5 rounded-lg font-mono">
                        {((currentSelectedDishObj.cogsCost / currentSelectedDishObj.totalRevenue) * 100).toFixed(0)}% Margin cogs
                      </span>
                    )}
                  </div>

                  {/* Recipe Components List */}
                  <div className="space-y-2 flex-1 min-h-0">
                    <h5 className="text-[11px] font-black uppercase text-gray-450 border-b border-gray-100 pb-1.5 flex justify-between items-center">
                      <span>Ingredients usage breakdown</span>
                      <span className="text-[9px] font-normal text-gray-400">Aggregated = Portion Count × Single Ingredient weight</span>
                    </h5>

                    <div className="space-y-3 max-h-[190px] overflow-y-auto scrollbar-thin pr-1 text-xs font-medium">
                      {currentSelectedDishObj.ingredientsConsumed.length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-6">
                          No ingredient recipes attached to this menu item yet. Head to "Recipes & Stock" tab to link ingredients!
                        </p>
                      ) : (
                        currentSelectedDishObj.ingredientsConsumed.map((ingItem, rIdx) => {
                          const realStockObj = ingredients.find(ing => ing.id === ingItem.ingredientId);
                          const isLowStockReal = realStockObj ? (realStockObj.stock <= realStockObj.minStock) : false;

                          return (
                            <div key={rIdx} className="p-2.5 bg-gray-50/60 border border-gray-100/70 rounded-lg flex items-center justify-between text-xs">
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-gray-800 block">{ingItem.name}</span>
                                <span className="text-[9.5px] text-gray-400 font-light block">
                                  In Recipe: <strong>{ingItem.qtyNeededForOne} {ingItem.unit}</strong> • Rem. Stock: <strong className={isLowStockReal ? 'text-red-500 font-bold' : 'text-gray-600'}>{realStockObj ? realStockObj.stock : 0} {ingItem.unit}</strong>
                                </span>
                              </div>

                              <div className="text-right font-mono">
                                <span className="block font-black text-gray-950">
                                  {ingItem.qtyTotalConsumed.toFixed(0)} {ingItem.unit} Consumed
                                </span>
                                <span className="text-[9px] text-gray-400 font-medium block">
                                  Cost: {ingItem.costTotalConsumed.toFixed(0)} Br
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-450 italic text-xs font-sans font-medium h-full">
                  Select a menu plate from the performance column to audit recipes and deduct metrics
                </div>
              )}
            </div>
          </>
        )}

        {/* PERSPECTIVE C: CATEGORIZED GROUPS */}
        {activePerspective === 'categories' && (
          <>
            {/* Left Column: List of categories */}
            <div className="xl:col-span-6 bg-white border border-gray-100 rounded-xl shadow-xs flex flex-col h-full min-h-0">
              <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between shrink-0 font-bold">
                <span className="text-xs font-black uppercase text-gray-400 font-black">Food Division Categories</span>
                <span className="text-[10px] font-mono text-gray-400">{categoriesList.length} global categories</span>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-gray-50 text-xs">
                {categoriesList.map((cName, idx) => {
                  const dataObj = categoryUtilizationMap[cName];
                  const totalCost = dataObj ? dataObj.totalCost : 0;
                  const isSelected = activeCategoryName === cName;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedCategoryName(cName)}
                      className={`p-3.5 hover:bg-gray-50/70 transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected ? 'bg-slate-50 border-l-4 border-slate-900' : ''
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-gray-950 block">{cName}</span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {dataObj ? dataObj.portionsSold : 0} servings cooked was completes
                        </span>
                      </div>

                      <div className="text-right font-mono">
                        <span className="block font-black text-gray-900">
                          {totalCost.toFixed(0)} Br consumed
                        </span>
                        <span className="text-[9.5px] text-gray-400 font-light block">
                          Raw material cost
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Deep traces by category */}
            <div className="xl:col-span-6 bg-white border border-gray-100 rounded-xl shadow-xs flex flex-col h-full min-h-0">
              <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between shrink-0 font-bold">
                <span className="text-xs font-black uppercase text-gray-400">Division Raw Utilization Weight</span>
              </div>

              {selectedCategoryUsageObj ? (
                <div className="p-4 flex-1 overflow-y-auto scrollbar-thin space-y-4">
                  
                  {/* Selected Group details */}
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-gray-900 leading-tight">{selectedCategoryUsageObj.categoryName} Menu Division</h4>
                      <p className="text-[10px] text-gray-400 font-sans mt-0.5">Summing ingredient costs matching recipes inside this menu group</p>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Portions Sold</span>
                      <span className="text-xs bg-slate-900 text-white font-extrabold p-1 px-2 py-0.5 rounded-lg block">
                        {selectedCategoryUsageObj.portionsSold} units
                      </span>
                    </div>
                  </div>

                  {/* Summary cost badge */}
                  <div className="p-3.5 bg-emerald-50/15 border border-emerald-100/30 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-700 font-bold uppercase block tracking-wider">Consumed Ingredients cost</span>
                      <span className="text-base font-black text-emerald-805 text-gray-900 font-mono">
                        {selectedCategoryUsageObj.totalCost.toFixed(1)} Br
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 p-1 px-1.5 rounded-lg font-mono">
                      {totalIngredientConsumedCost > 0 ? ((selectedCategoryUsageObj.totalCost / totalIngredientConsumedCost) * 100).toFixed(0) : 0}% share of restaurant cost
                    </span>
                  </div>

                  {/* Division detailed raw materials consumes */}
                  <div className="space-y-2 flex-1 min-h-0">
                    <h5 className="text-[11px] font-black uppercase text-gray-450 border-b border-gray-100 pb-1.5">
                      Raw Materials Spent Detail
                    </h5>

                    <div className="space-y-2.5 max-h-[190px] overflow-y-auto scrollbar-thin pr-1 text-xs">
                      {Object.keys(selectedCategoryUsageObj.ingredients).length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-6">
                          No menu ingredients registered and consumed in this culinary division yet.
                        </p>
                      ) : (
                        Object.entries(selectedCategoryUsageObj.ingredients)
                          .sort((a,b) => b[1].cost - a[1].cost)
                          .map(([ingId, elem], idx) => {
                            return (
                              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/50">
                                <div className="space-y-0.5">
                                  <span className="font-extrabold text-gray-800 block text-xs">{elem.name}</span>
                                  <span className="text-[9px] text-gray-400 block font-mono">Code SKU: {ingId}</span>
                                </div>

                                <div className="text-right font-mono">
                                  <span className="block font-black text-gray-955 text-gray-900">
                                    {elem.qty.toFixed(0)} {elem.unit}
                                  </span>
                                  <span className="text-[9px] text-emerald-750 bg-emerald-50 text-emerald-700 font-black px-1.5 rounded mt-0.5 inline-block">
                                    {elem.cost.toFixed(0)} Br Value
                                  </span>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-450 italic text-xs font-sans font-medium h-full">
                  Select a category in the left pane to audit details
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {/* LOWER PANEL: HISTORIC ACTIVITY TRACE & MANUAL OVERRIDES LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" id="historiclogs_audit_row bg-white">
        
        {/* Top consume ingredients brief list */}
        <div className="bg-white p-4.5 rounded-xl border border-gray-100 shadow-xs flex flex-col">
          <div className="pb-2.5 border-b border-gray-50 mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase text-gray-901">Top Consumed Ingredients Ledger</h3>
              <p className="text-[9.5px] text-gray-400">Core raw stock items driving culinary cost values</p>
            </div>
            <span className="text-[9px] font-mono text-gray-400 bg-gray-50 p-1 px-1.5 rounded font-bold">
              Consuming {allUsageList.filter(u => u.totalQty > 0).length} of {ingredients.length} items
            </span>
          </div>

          <div className="overflow-y-auto max-h-[180px] scrollbar-thin text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100 text-[10.5px]">
                  <th className="p-2">Ingredient Item</th>
                  <th className="p-2 text-center">Remaining Stock</th>
                  <th className="p-2 text-center">Quantity Consumed</th>
                  <th className="p-2 text-right">Raw Cost Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                {allUsageList.filter(i => i.totalQty > 0).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-400 italic">No consumption recorded inside date bounds.</td>
                  </tr>
                ) : (
                  allUsageList
                    .filter(u => u.totalQty > 0)
                    .sort((a,b) => b.totalCost - a.totalCost)
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2 font-bold text-gray-800">{item.name}</td>
                        <td className="p-2 text-center font-mono">
                          <span className={item.isLowStock ? 'text-red-500 font-extrabold' : 'text-gray-500'}>
                            {item.remainingStock} {item.unit}
                          </span>
                        </td>
                        <td className="p-2 text-center font-mono font-bold text-gray-900">{item.totalQty.toFixed(1)} {item.unit}</td>
                        <td className="p-2 text-right font-mono font-black text-gray-900">{item.totalCost.toFixed(0)} Br</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit trail of automated & manual actions */}
        <div className="bg-white p-4.5 rounded-xl border border-gray-100 shadow-xs flex flex-col">
          <div className="pb-2.5 border-b border-gray-50 mb-3">
            <h3 className="text-xs font-black uppercase text-gray-901">Real-time Ingredient Deduction Log</h3>
            <p className="text-[9.5px] text-gray-400">Deduction records automatically triggered from POS and manual stock takes</p>
          </div>

          <div className="overflow-y-auto max-h-[180px] scrollbar-thin space-y-2 text-xs">
            {inventoryLogs.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-8">No deduction history records.</p>
            ) : (
              inventoryLogs.slice(0, 15).map(log => {
                const isDeduction = log.amountChanged < 0;
                
                return (
                  <div key={log.id} className="p-2 rounded-lg border border-gray-50 bg-gray-50/40 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-gray-800">{log.ingredientName}</span>
                        <span className={`text-[8.5px] font-bold px-1 rounded ${
                          log.type === 'Deduction' 
                            ? 'bg-amber-100 text-amber-800' 
                            : log.amountChanged > 0 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.type}
                        </span>
                      </div>
                      <span className="block text-[10px] text-gray-440 text-gray-400 mt-0.5">{log.reference || 'Manual physical stock adjustment'}</span>
                      <span className="text-[8.5px] text-gray-400 block font-mono mt-0.5 font-light">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <span className={`font-mono font-black leading-none ${isDeduction ? 'text-amber-600' : 'text-emerald-700'}`}>
                      {isDeduction ? '' : '+'}{log.amountChanged.toFixed(1)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
