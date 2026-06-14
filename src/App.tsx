/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Ingredient, Dish, Table, Order, OrderStatus, OrderItem, InventoryLog, AuthUser, UserRole, AuditLog } from './types';
import { 
  INITIAL_INGREDIENTS, 
  INITIAL_TABLES, 
  INITIAL_DISHES 
} from './data/menu';
import { generateSeedOrders, deductIngredientsForOrder } from './utils/helpers';
import PosDashboard from './components/PosDashboard';
import RecipeStockDashboard from './components/RecipeStockDashboard';
import KitchenDashboard from './components/KitchenDashboard';
import ReportsDashboard from './components/ReportsDashboard';
import LoginScreen from './components/LoginScreen';
import { isSupabaseConfigured, supabaseSync } from './lib/supabase';
import { useLanguage } from './lib/translations';
import { 
  Utensils, 
  ChefHat, 
  Layers, 
  UtensilsCrossed, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Scale,
  LogOut,
  MapPin,
  Building,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(() => {
    const cachedUser = localStorage.getItem('shega_user');
    return cachedUser ? JSON.parse(cachedUser) : null;
  });

  const [activeTab, setActiveTab] = useState<'POS' | 'Kitchen' | 'Recipes' | 'Reports'>('POS');
  
  // App States
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [supabaseLoading, setSupabaseLoading] = useState<boolean>(false);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const cachedAudits = localStorage.getItem('shega_audit_logs');
    if (cachedAudits) {
      return JSON.parse(cachedAudits);
    }
    return [
      {
        id: 'seed_audit_1',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        actorName: 'System',
        actorRole: 'Admin',
        action: 'System Bootstrapped',
        details: 'Initial database seeds and ingredients sync completed for branch Shegawan.',
        branch: 'Shegawan'
      },
      {
        id: 'seed_audit_2',
        timestamp: new Date(Date.now() - 360000 * 15).toISOString(),
        actorName: 'Abdi',
        actorRole: 'Waiter',
        action: 'Order #1001 Taken',
        details: 'Order initialized for Table "Table 1" containing 2x Special Burger. Total: 280 Br.',
        branch: 'Shegawan'
      },
      {
        id: 'seed_audit_3',
        timestamp: new Date(Date.now() - 360000 * 5).toISOString(),
        actorName: 'Chef Mary',
        actorRole: 'Chef',
        action: 'Stock Restock: Cheese',
        details: 'Restocked Cheese by +3.0kg. Current level: 5.0kg.',
        branch: 'Shegawan'
      }
    ];
  });

  const addAuditLog = (action: string, details: string) => {
    const activeBranch = user?.branch || 'Shegawan';
    const newAudit: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      actorName: user?.username || 'System',
      actorRole: user?.role || 'Waiter',
      action,
      details,
      branch: activeBranch
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  useEffect(() => {
    localStorage.setItem('shega_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Synchronize Tab on login
  useEffect(() => {
    if (user) {
      localStorage.setItem('shega_user', JSON.stringify(user));
      if (user.role === 'Chef') {
        setActiveTab('Kitchen');
      } else {
        setActiveTab('POS');
      }
    } else {
      localStorage.removeItem('shega_user');
    }
  }, [user]);

  // Initialize and Seed States on Load
  useEffect(() => {
    async function loadDataAndSeed() {
      // 1. Try pulling from Supabase first
      if (isSupabaseConfigured()) {
        setSupabaseLoading(true);
        try {
          const supIng = await supabaseSync.getIngredients();
          const supDishes = await supabaseSync.getDishes();
          const supTables = await supabaseSync.getTables();
          const supOrders = await supabaseSync.getOrders();
          const supLogs = await supabaseSync.getInventoryLogs();

          if (supIng && supIng.length > 0 && supDishes && supDishes.length > 0) {
            setIngredients(supIng);
            setDishes(supDishes);
            setTables(supTables || []);
            setOrders(supOrders || []);
            setInventoryLogs(supLogs || []);
            setSupabaseLoading(false);
            return;
          }
        } catch (err) {
          console.error("Failed to load starting data from Supabase", err);
        }
        setSupabaseLoading(false);
      }

      // 2. Fallback to default local storage behavior
      const cachedIngredients = localStorage.getItem('shega_ingredients');
      const cachedDishes = localStorage.getItem('shega_dishes');
      const cachedTables = localStorage.getItem('shega_tables');
      const cachedOrders = localStorage.getItem('shega_orders');
      const cachedLogs = localStorage.getItem('shega_inventory_logs');

      if (cachedIngredients && cachedDishes && cachedTables && cachedOrders && cachedLogs) {
        const parsedDishes = JSON.parse(cachedDishes);
        let parsedIngredients = JSON.parse(cachedIngredients);
        let parsedTables = JSON.parse(cachedTables);
        let parsedOrders = JSON.parse(cachedOrders);
        let parsedLogs = JSON.parse(cachedLogs);

        // Self-Healing logic: convert single-branch ingredients & tables to multi-branch if missing!
        const needsBranchSelfHealing = !parsedIngredients.some((i: any) => i.branch);
        if (needsBranchSelfHealing) {
          parsedIngredients = [
            ...parsedIngredients.map((i: any) => ({ ...i, branch: 'Shegawan' })),
            ...INITIAL_INGREDIENTS.map((i: any) => ({ ...i, branch: 'Teyim Shega' }))
          ];
          parsedTables = [
            ...INITIAL_TABLES.map((t: any) => ({ ...t, id: `shg_${t.id}`, branch: 'Shegawan' })),
            ...INITIAL_TABLES.map((t: any) => ({ ...t, id: `tym_${t.id}`, branch: 'Teyim Shega' }))
          ];
          // Simple tag for historic orders and logs
          parsedOrders = parsedOrders.map((o: any) => ({ ...o, branch: 'Shegawan' }));
          parsedLogs = parsedLogs.map((l: any) => ({ ...l, branch: 'Shegawan' }));
        }

        setIngredients(parsedIngredients);
        setDishes(parsedDishes);
        setTables(parsedTables);
        setOrders(parsedOrders);
        setInventoryLogs(parsedLogs);
      } else {
        // Seed branch-specific data independently for both
        const seedingShg = generateSeedOrders(INITIAL_DISHES, INITIAL_INGREDIENTS.map(i => ({ ...i, branch: 'Shegawan' as const })), 'Shegawan');
        const seedingTym = generateSeedOrders(INITIAL_DISHES, INITIAL_INGREDIENTS.map(i => ({ ...i, branch: 'Teyim Shega' as const })), 'Teyim Shega');
        
        const combinedIngredients = [...seedingShg.updatedIngredients, ...seedingTym.updatedIngredients];
        const combinedOrders = [...seedingShg.seededOrders, ...seedingTym.seededOrders];
        const combinedLogs = [...seedingShg.seededLogs, ...seedingTym.seededLogs];
        
        const combinedTables = [
          ...INITIAL_TABLES.map(t => ({ ...t, id: `shg_${t.id}`, branch: 'Shegawan' as const })),
          ...INITIAL_TABLES.map(t => ({ ...t, id: `tym_${t.id}`, branch: 'Teyim Shega' as const }))
        ];

        setIngredients(combinedIngredients);
        setDishes(INITIAL_DISHES);
        setTables(combinedTables);
        setOrders(combinedOrders);
        setInventoryLogs(combinedLogs);

        // State storage cache
        localStorage.setItem('shega_ingredients', JSON.stringify(combinedIngredients));
        localStorage.setItem('shega_dishes', JSON.stringify(INITIAL_DISHES));
        localStorage.setItem('shega_tables', JSON.stringify(combinedTables));
        localStorage.setItem('shega_orders', JSON.stringify(combinedOrders));
        localStorage.setItem('shega_inventory_logs', JSON.stringify(combinedLogs));

        if (isSupabaseConfigured()) {
          supabaseSync.saveIngredients(combinedIngredients);
          supabaseSync.saveDishes(INITIAL_DISHES);
          supabaseSync.saveTables(combinedTables);
          supabaseSync.saveAllOrders(combinedOrders);
          supabaseSync.saveAllInventoryLogs(combinedLogs);
        }
      }
    }

    loadDataAndSeed();
  }, []);

  // Save changes to localStorage and sync with Supabase on state edits
  useEffect(() => {
    if (ingredients.length > 0) {
      localStorage.setItem('shega_ingredients', JSON.stringify(ingredients));
      if (isSupabaseConfigured()) {
        supabaseSync.saveIngredients(ingredients);
      }
    }
  }, [ingredients]);

  useEffect(() => {
    if (dishes.length > 0) {
      localStorage.setItem('shega_dishes', JSON.stringify(dishes));
      if (isSupabaseConfigured()) {
        supabaseSync.saveDishes(dishes);
      }
    }
  }, [dishes]);

  useEffect(() => {
    if (tables.length > 0) {
      localStorage.setItem('shega_tables', JSON.stringify(tables));
      if (isSupabaseConfigured()) {
        supabaseSync.saveTables(tables);
      }
    }
  }, [tables]);

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('shega_orders', JSON.stringify(orders));
      if (isSupabaseConfigured()) {
        supabaseSync.saveAllOrders(orders);
      }
    }
  }, [orders]);

  useEffect(() => {
    if (inventoryLogs.length > 0) {
      localStorage.setItem('shega_inventory_logs', JSON.stringify(inventoryLogs));
      if (isSupabaseConfigured()) {
        supabaseSync.saveAllInventoryLogs(inventoryLogs);
      }
    }
  }, [inventoryLogs]);


  // RESET SYSTEM CONTROL
  const handleResetSystemData = () => {
    if (window.confirm("Are you sure you want to reset all inventory quantities, order records, and reports to fresh factory seeds?")) {
      localStorage.clear();
      const seedingShg = generateSeedOrders(INITIAL_DISHES, INITIAL_INGREDIENTS.map(i => ({ ...i, branch: 'Shegawan' as const })), 'Shegawan');
      const seedingTym = generateSeedOrders(INITIAL_DISHES, INITIAL_INGREDIENTS.map(i => ({ ...i, branch: 'Teyim Shega' as const })), 'Teyim Shega');
      
      const combinedIngredients = [...seedingShg.updatedIngredients, ...seedingTym.updatedIngredients];
      const combinedOrders = [...seedingShg.seededOrders, ...seedingTym.seededOrders];
      const combinedLogs = [...seedingShg.seededLogs, ...seedingTym.seededLogs];
      
      const combinedTables = [
        ...INITIAL_TABLES.map(t => ({ ...t, id: `shg_${t.id}`, branch: 'Shegawan' as const })),
        ...INITIAL_TABLES.map(t => ({ ...t, id: `tym_${t.id}`, branch: 'Teyim Shega' as const }))
      ];

      setIngredients(combinedIngredients);
      setDishes(INITIAL_DISHES);
      setTables(combinedTables);
      setOrders(combinedOrders);
      setInventoryLogs(combinedLogs);
      
      if (user?.role === 'Chef') {
        setActiveTab('Kitchen');
      } else {
        setActiveTab('POS');
      }
    }
  };

  // Branch switching mechanism for Admins/Owners
  const handleAdminBranchSwitch = (newBranch: 'Shegawan' | 'Teyim Shega') => {
    if (user && user.role === 'Admin') {
      const oldBranch = user.branch;
      setUser({
        ...user,
        branch: newBranch
      });
      
      const newAudit: AuditLog = {
        id: `audit_branch_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorName: user.username,
        actorRole: user.role,
        action: 'Branch Switched',
        details: `Switched perspective and operational focus from ${oldBranch} to ${newBranch}`,
        branch: newBranch
      };
      setAuditLogs(prev => [newAudit, ...prev]);
    }
  };

  // 1. Process New Order Intake
  const addOrder = (
    tableId: string,
    items: OrderItem[],
    waiterName?: string,
    specialNote?: string,
    extras?: { name: string; price: number }[]
  ) => {
    const activeBranch = user?.branch || 'Shegawan';
    const nextOrderNum = orders.length > 0 ? Math.max(...orders.map(o => o.orderNumber)) + 1 : 1001;
    const orderId = `ord_${Date.now()}`;
    const tableName = tables.find(t => t.id === tableId)?.name || 'Walkin';

    const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const extrasTotal = extras?.reduce((sum, ext) => sum + ext.price, 0) || 0;
    const orderTotal = cartTotal + extrasTotal;

    const newOrder: Order = {
      id: orderId,
      orderNumber: nextOrderNum,
      tableId,
      tableName,
      items,
      total: orderTotal,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      branch: activeBranch,
      waiterName,
      specialNote,
      extras
    };

    // Calculate recipe ingredients and deduct immediately upon order intake
    const deductions = deductIngredientsForOrder(newOrder, ingredients, dishes, activeBranch);
    setIngredients(deductions.updatedIngredients);
    
    // Tag logs with actor context
    const updatedLogs = deductions.logs.map(log => ({
      ...log,
      reference: `Order #${nextOrderNum} taken`,
      actorName: user?.username || 'Staff',
      actorRole: user?.role || 'Waiter'
    }));
    setInventoryLogs(prev => [...updatedLogs, ...prev]);

    // Update active order list
    setOrders(prev => [...prev, newOrder]);

    // Save system-level audit
    addAuditLog(
      `Order #${nextOrderNum} Created`,
      `Table "${tableName}" order submitted by ${waiterName || user?.username || 'Staff'} for ${items.reduce((a,i) => a + i.quantity, 0)} items. Total: ${orderTotal} Br.`
    );

    // Set Table as Occupied and connect active order tracking ID
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return { ...t, status: 'Occupied', currentOrderId: orderId };
      }
      return t;
    }));
  };

  // 2. Transition prep / serve states
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const activeBranch = user?.branch || 'Shegawan';
    const targetOrder = orders.find(o => o.id === orderId);

    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => {
        if (order.id === orderId) {
          const updated = { ...order, status: newStatus };
          if (newStatus === 'Served') {
            updated.servedAt = new Date().toISOString();
          }
          return updated;
        }
        return order;
      });

      return updatedOrders;
    });

    if (targetOrder) {
      addAuditLog(
        `Order #${targetOrder.orderNumber} ${newStatus}`,
        `Transitioned status to "${newStatus}" by ${user?.username || 'Staff'} (${user?.role || 'User'})`
      );
    }

    // If served, release the connected dining table (deductions already took place when order was taken)
    if (newStatus === 'Served') {
      setTimeout(() => {
        setTables(prevTables => prevTables.map(t => {
          if (t.currentOrderId === orderId) {
            return { ...t, status: 'Empty', currentOrderId: undefined };
          }
          return t;
        }));
      }, 50);
    }
  };

  // 3. Keep manual stock adjustment audits
  const logManualAdjustment = (ingredientId: string, oldQty: number, newQty: number, reason: string) => {
    const activeBranch = user?.branch || 'Shegawan';
    const ingName = ingredients.find(i => i.id === ingredientId)?.name || 'Unknown Item';
    const delta = Number((newQty - oldQty).toFixed(2));
    
    const newChangeLog: InventoryLog = {
      id: `manual_${Date.now()}`,
      ingredientId,
      ingredientName: ingName,
      amountChanged: delta,
      type: 'Adjustment',
      timestamp: new Date().toISOString(),
      reference: reason,
      branch: activeBranch,
      actorName: user?.username || 'System',
      actorRole: user?.role || 'Admin'
    };

    setInventoryLogs(prev => [newChangeLog, ...prev]);

    addAuditLog(
      `Stock Adjusted: ${ingName}`,
      `Stock of "${ingName}" changed by ${delta > 0 ? '+' : ''}${delta} (${ingredients.find(i => i.id === ingredientId)?.unit}). Reason: ${reason}`
    );
  };

  // Switch wrapper to allow ingredients edits to persist safely per-branch
  const handleSetIngredients = (updatedFiltered: Ingredient[] | ((prev: Ingredient[]) => Ingredient[])) => {
    const activeBranch = user?.branch || 'Shegawan';
    setIngredients(prev => {
      const branchOnly = prev.filter(i => i.branch === activeBranch);
      const resolved = typeof updatedFiltered === 'function' ? updatedFiltered(branchOnly) : updatedFiltered;
      
      return prev.map(originalItem => {
         if (originalItem.branch === activeBranch) {
            const match = resolved.find(r => r.id === originalItem.id);
            return match ? { ...match, branch: activeBranch } : originalItem;
         }
         return originalItem;
      });
    });
  };

  // Switch wrapper to allow tables state modification to persist safely per-branch
  const handleSetTables = (updatedFiltered: Table[] | ((prev: Table[]) => Table[])) => {
    const activeBranch = user?.branch || 'Shegawan';
    setTables(prev => {
      const branchOnly = prev.filter(t => t.branch === activeBranch);
      const resolved = typeof updatedFiltered === 'function' ? updatedFiltered(branchOnly) : updatedFiltered;
      
      return prev.map(originalItem => {
         if (originalItem.branch === activeBranch) {
            const match = resolved.find(r => r.id === originalItem.id);
            return match ? { ...match, branch: activeBranch } : originalItem;
         }
         return originalItem;
      });
    });
  };

  // If user is not logged in, render the securePIN selector screen first!
  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  // Branch specific reactive states filtering
  const currentBranch = user.branch || 'Shegawan';
  const filteredIngredients = ingredients.filter(i => i.branch === currentBranch);
  const filteredTables = tables.filter(t => t.branch === currentBranch);
  const filteredOrders = orders.filter(o => o.branch === currentBranch);
  const filteredLogs = inventoryLogs.filter(l => l.branch === currentBranch);

  const lowStockAlerts = filteredIngredients.filter(i => i.stock <= i.minStock);
  const pendingKitchenCount = filteredOrders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
  
  // Mapping active orders by tables
  const activeOrderIdByTable: Record<string, string> = {};
  filteredTables.forEach(t => {
    const activeOrd = filteredOrders.find(o => o.tableId === t.id && o.status !== 'Served');
    if (activeOrd) {
      activeOrderIdByTable[t.id] = activeOrd.id;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" id="root_app_canvas">
      
      {/* GLOBAL SYSTEM HEADER */}
      <header className="bg-white border-b border-gray-100 shadow-xs shrink-0 sticky top-0 z-45" id="primary_header">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between py-3.5 gap-4">
          
          {/* Brand Logo Identity and Branch info */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-gray-900 text-white rounded-xl shadow-xs">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs font-extrabold tracking-tight text-gray-900 leading-none">{t('brand_name')}</h1>
                  <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-200 uppercase flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> {t('pos_hub')}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium font-sans mt-1">{t('system_tagline')}</p>
              </div>
            </div>

            {/* Active Branch and Operator Badge */}
            <div className="flex items-center gap-2.5 bg-gray-100/75 border border-gray-180/40 p-2.5 py-1.5 rounded-xl font-medium text-xs">
              <div className="flex items-center gap-1 text-gray-800">
                <Building className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold underline decoration-amber-400 decoration-2">{currentBranch === 'Shegawan' ? t('shegawan_cafe') : t('teyim_shega')}</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1 text-gray-800">
                <UserIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold">{user.username}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1 py-0.2 rounded border border-emerald-200 uppercase text-center block">
                  {t(user.role.toLowerCase())}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabbed Pills Row (ROLES SPECIFIC EXTRACTION) */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto">
            
            {/* If Admin, they can quick-swap branch on the fly */}
            {user.role === 'Admin' && (
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg shrink-0">
                <span className="text-[9px] font-black uppercase text-gray-400 px-1.5">{t('branch')}:</span>
                <button
                  onClick={() => handleAdminBranchSwitch('Shegawan')}
                  className={`text-[10px] font-bold px-2 py-1 rounded cursor-pointer ${
                    currentBranch === 'Shegawan' 
                      ? 'bg-gray-900 text-white shadow-xs' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t('shegawan_cafe')}
                </button>
                <button
                  onClick={() => handleAdminBranchSwitch('Teyim Shega')}
                  className={`text-[10px] font-bold px-2 py-1 rounded cursor-pointer ${
                    currentBranch === 'Teyim Shega' 
                      ? 'bg-gray-900 text-white shadow-xs' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t('teyim_shega')}
                </button>
              </div>
            )}

            <nav className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-100 font-semibold text-xs text-gray-400 w-full sm:w-auto overflow-x-auto scrollbar-none justify-start sm:justify-center">
              
              {/* Waiter & Admin see POS */}
              {(user.role === 'Admin' || user.role === 'Waiter') && (
                <button
                  onClick={() => setActiveTab('POS')}
                  className={`px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                    activeTab === 'POS' 
                      ? 'bg-white shadow-xs text-gray-900 font-bold border border-gray-150/10' 
                      : 'hover:text-gray-900'
                  }`}
                >
                  <Utensils className="w-4 h-4" /> {t('pos_terminal')}
                </button>
              )}

              {/* Chef & Admin see Kitchen */}
              {(user.role === 'Admin' || user.role === 'Chef') && (
                <button
                  onClick={() => setActiveTab('Kitchen')}
                  className={`px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 relative ${
                    activeTab === 'Kitchen' 
                      ? 'bg-white shadow-xs text-gray-900 font-bold border border-gray-150/10' 
                      : 'hover:text-gray-900'
                  }`}
                >
                  <ChefHat className="w-4 h-4" /> {t('kitchen_monitor')}
                  {pendingKitchenCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-red-500 text-white font-black rounded-full font-mono text-[9px] animate-pulse">
                      {pendingKitchenCount}
                    </span>
                  )}
                </button>
              )}

              {/* ONLY Admin can see stock adjustment dashboards */}
              {user.role === 'Admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('Recipes')}
                    className={`px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 relative ${
                      activeTab === 'Recipes' 
                        ? 'bg-white shadow-xs text-gray-900 font-bold border border-gray-150/10' 
                        : 'hover:text-gray-900'
                    }`}
                  >
                    <Layers className="w-4 h-4" /> {t('recipes_stock')}
                    {lowStockAlerts.length > 0 && (
                      <span className="absolute -top-1 -right-1.5 p-1 bg-amber-500 rounded-full animate-bounce">
                        <span className="sr-only">Stock alert</span>
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('Reports')}
                    className={`px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                      activeTab === 'Reports' 
                        ? 'bg-white shadow-xs text-gray-900 font-bold border border-gray-150/10' 
                        : 'hover:text-gray-900'
                    }`}
                  >
                    <Scale className="w-4 h-4 text-emerald-600" /> {t('reports_audits')}
                  </button>
                </>
              )}
            </nav>

            {/* Core System Reset / Logout buttons */}
            <div className="flex items-center gap-2">
              {/* Direct English & Amharic switch pill */}
              <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded text-[9px] font-black transition-all cursor-pointer ${
                    language === 'en' 
                      ? 'bg-gray-900 text-white shadow-xs' 
                      : 'text-gray-550 hover:text-gray-900'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('am')}
                  className={`px-2 py-1 rounded text-[9px] font-bold transition-all cursor-pointer ${
                    language === 'am' 
                      ? 'bg-gray-900 text-white shadow-xs' 
                      : 'text-gray-555 hover:text-gray-900'
                  }`}
                >
                  አማ
                </button>
              </div>

              {user.role === 'Admin' && lowStockAlerts.length > 0 && (
                <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg font-bold flex items-center gap-1 animate-pulse shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" /> {lowStockAlerts.length} Alerts
                </div>
              )}
              
              {user.role === 'Admin' && (
                <button
                  onClick={handleResetSystemData}
                  title="Reset System Factory Data"
                  className="p-1.5 px-2.5 border border-gray-200 hover:border-gray-350 hover:bg-gray-50 text-gray-400 hover:text-gray-800 rounded-lg cursor-pointer transition-all flex items-center gap-1 text-[10px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> {t('re_seed')}
                </button>
              )}

              <button
                onClick={() => setUser(null)}
                title="Log out of Terminal"
                className="p-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-150 rounded-lg cursor-pointer transition-all flex items-center gap-1 text-[10px] font-black"
              >
                <LogOut className="w-3.5 h-3.5" /> {t('exit')}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* RENDER ACTIVE SCREEN CONTROLLER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-5 w-full min-h-0 relative">
        {/* Waiter restricted disclaimer if they try accessing raw routes */}
        {user.role === 'Waiter' && activeTab !== 'POS' && (
          <div className="bg-amber-50 rounded-2xl p-6 text-center border border-amber-100 max-w-md mx-auto my-12 shadow-sm space-y-3">
             <ShieldAlert className="w-12 h-12 text-amber-505 mx-auto" />
             <h3 className="font-extrabold text-sm text-gray-900 uppercase">{t('access_restricted')}</h3>
             <p className="text-xs text-gray-500 font-medium">{t('waiter_restricted_desc')}</p>
             <button onClick={() => setActiveTab('POS')} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg cursor-pointer">{t('return_pos')}</button>
          </div>
        )}

        {user.role === 'Chef' && activeTab !== 'Kitchen' && (
          <div className="bg-amber-50 rounded-2xl p-6 text-center border border-amber-100 max-w-md mx-auto my-12 shadow-sm space-y-3">
             <ShieldAlert className="w-12 h-12 text-amber-505 mx-auto" />
             <h3 className="font-extrabold text-sm text-gray-900 uppercase">{t('access_restricted')}</h3>
             <p className="text-xs text-gray-500 font-medium">{t('chef_restricted_desc')}</p>
             <button onClick={() => setActiveTab('Kitchen')} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg cursor-pointer">{t('return_kitchen')}</button>
          </div>
        )}

        {/* Regular views */}
        {((user.role === 'Admin' || user.role === 'Waiter') && activeTab === 'POS') && (
          <PosDashboard 
            dishes={dishes}
            tables={filteredTables}
            orders={filteredOrders}
            ingredients={ingredients}
            setTables={handleSetTables}
            addOrder={addOrder}
            activeOrderIdByTable={activeOrderIdByTable}
            user={user}
            updateOrderStatus={updateOrderStatus}
          />
        )}

        {((user.role === 'Admin' || user.role === 'Chef') && activeTab === 'Kitchen') && (
          <KitchenDashboard 
            orders={filteredOrders}
            updateOrderStatus={updateOrderStatus}
          />
        )}

        {(user.role === 'Admin' && activeTab === 'Recipes') && (
          <RecipeStockDashboard 
            ingredients={filteredIngredients}
            setIngredients={handleSetIngredients}
            dishes={dishes}
            setDishes={setDishes}
            logManualAdjustment={logManualAdjustment}
            addAuditLog={addAuditLog}
            user={user}
          />
        )}

        {(user.role === 'Admin' && activeTab === 'Reports') && (
          <ReportsDashboard 
            orders={filteredOrders}
            ingredients={filteredIngredients}
            dishes={dishes}
            inventoryLogs={filteredLogs}
            auditLogs={auditLogs.filter(a => a.branch === currentBranch)}
          />
        )}
      </main>

    </div>
  );
}
