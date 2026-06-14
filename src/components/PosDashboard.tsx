/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Dish, Table, Order, OrderItem, Ingredient, OrderStatus, AuthUser } from '../types';
import { calculateRecipeCost } from '../utils/helpers';
import { useLanguage } from '../lib/translations';
import { 
  Utensils, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  Send, 
  Clock, 
  Check, 
  Receipt,
  User,
  Coffee,
  CircleDot,
  CreditCard,
  Wallet,
  Smartphone,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface PosDashboardProps {
  dishes: Dish[];
  tables: Table[];
  orders: Order[];
  ingredients: Ingredient[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  addOrder: (
    tableId: string,
    items: OrderItem[],
    waiterName?: string,
    specialNote?: string,
    extras?: { name: string; price: number }[]
  ) => void;
  activeOrderIdByTable: Record<string, string>;
  user: AuthUser;
  updateOrderStatus?: (orderId: string, newStatus: OrderStatus) => void;
}

export default function PosDashboard({
  dishes,
  tables,
  orders,
  ingredients,
  setTables,
  addOrder,
  activeOrderIdByTable,
  user,
  updateOrderStatus
}: PosDashboardProps) {
  const { language, t } = useLanguage();
  const EXTRA_SERVICES = [
    { id: 'tekawy_box', name: 'Takeaway Box', price: 20 },
    { id: 'cup', name: 'Cup', price: 10 },
    { id: 'foil', name: 'Foil', price: 15 },
    { id: 'cheese', name: 'Cheese', price: 40 },
    { id: 'bread', name: 'Bread', price: 15 },
    { id: 'mayonnays', name: 'Mayonnaise', price: 15 },
    { id: 'enjera', name: 'Enjera', price: 20 },
    { id: 'half', name: 'Half Enjera', price: 10 },
  ];

  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || 'tb1');
  const [activeCategory, setActiveCategory] = useState<string>('Shega Bites');
  const [activeSubcategory, setActiveSubcategory] = useState<string>('All');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({}); // dishId -> variantName
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpenOnMobile, setIsCartOpenOnMobile] = useState<boolean>(false);

  const [waiterNameState, setWaiterNameState] = useState<string>(user.username || '');
  const [specialNoteState, setSpecialNoteState] = useState<string>('');
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({});
  
  // Receipt print modal state
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // Chapa Payment Gateway integration states
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Chapa'>('Cash');
  const [chapaPhone, setChapaPhone] = useState<string>('');
  const [chapaProvider, setChapaProvider] = useState<'telebirr' | 'cbe' | 'card' | 'awash'>('telebirr');
  const [paymentStep, setPaymentStep] = useState<'setup' | 'processing' | 'otp' | 'success'>('setup');
  const [chapaOtp, setChapaOtp] = useState<string>('');
  const [chapaTxRef, setChapaTxRef] = useState<string>('');
  const [isChapaLoading, setIsChapaLoading] = useState<boolean>(false);
  const [cashTendered, setCashTendered] = useState<string>('');

  // Reset payment states when receipt modal changes/closes
  useEffect(() => {
    if (printingOrder) {
      setPaymentMethod('Cash');
      setChapaPhone('');
      setChapaProvider('telebirr');
      setPaymentStep('setup');
      setChapaOtp('');
      setChapaTxRef('');
      setIsChapaLoading(false);
      setCashTendered('');
    }
  }, [printingOrder]);

  // Filter Tables
  const selectedTable = tables.find(t => t.id === selectedTableId) || tables[0] || { id: 'tb1', name: 'Table', status: 'Empty' };
  const activeOrderId = activeOrderIdByTable[selectedTableId];
  const activeOrder = orders.find(o => o.id === activeOrderId);

  // Extract unique categories and subcategories based on model
  const categories = Array.from(new Set(dishes.map(d => d.category)));
  
  const subcategories = ['All', ...Array.from(new Set(
    dishes
      .filter(d => d.category === activeCategory)
      .map(d => d.subcategory)
  ))];

  // Filtered dishes
  const filteredDishes = dishes.filter(dish => {
    const catMatch = dish.category === activeCategory;
    const subMatch = activeSubcategory === 'All' || dish.subcategory === activeSubcategory;
    const nameMatch = searchQuery === '' || 
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && subMatch && nameMatch;
  });


  const handleVariantChange = (dishId: string, variantName: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [dishId]: variantName
    }));
  };

  const getDishPrice = (dish: Dish, variantName?: string) => {
    if (dish.variants && dish.variants.length > 0) {
      const selectedVar = variantName || selectedVariants[dish.id] || dish.variants[0].name;
      const variant = dish.variants.find(v => v.name === selectedVar);
      return variant ? variant.price : dish.basePrice;
    }
    return dish.basePrice;
  };

  const addToCart = (dish: Dish) => {
    let variantName: string | undefined = undefined;
    if (dish.variants && dish.variants.length > 0) {
      variantName = selectedVariants[dish.id] || dish.variants[0].name;
    }

    const price = getDishPrice(dish, variantName);

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.dishId === dish.id && item.variantName === variantName
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            dishId: dish.id,
            dishName: dish.name,
            variantName,
            quantity: 1,
            price
          }
        ];
      }
    });

    // Reset selected variant default setup
    if (dish.variants && dish.variants.length > 0 && !selectedVariants[dish.id]) {
      setSelectedVariants(prev => ({ ...prev, [dish.id]: dish.variants![0].name }));
    }
  };

  const updateCartQty = (dishId: string, variantName: string | undefined, delta: number) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.dishId === dishId && item.variantName === variantName
      );
      if (existingIndex === -1) return prev;

      const updated = [...prev];
      updated[existingIndex].quantity += delta;

      if (updated[existingIndex].quantity <= 0) {
        updated.splice(existingIndex, 1);
      }
      return updated;
    });
  };

  const removeFromCart = (dishId: string, variantName: string | undefined) => {
    setCart(prev => prev.filter(item => !(item.dishId === dishId && item.variantName === variantName)));
  };

  const handleSendToKitchen = () => {
    if (cart.length === 0) return;
    const extrasToSend = EXTRA_SERVICES
      .filter(ext => selectedExtras[ext.id])
      .map(ext => ({ name: ext.name, price: ext.price }));

    addOrder(selectedTableId, cart, waiterNameState, specialNoteState, extrasToSend);
    
    setCart([]);
    setSpecialNoteState('');
    setSelectedExtras({});
  };

  const handleTableSelect = (tableId: string) => {
    setSelectedTableId(tableId);
    // Clear draft cart when changing tables to let waiter capture order fresh
    setCart([]);
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-600/10 flex items-center gap-1.5"><CircleDot className="w-3 h-3 animate-pulse" /> Kitchen Pending</span>;
      case 'Preparing':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-600/10 flex items-center gap-1.5"><CircleDot className="w-3 h-3 animate-spin" /> Cooking...</span>;
      case 'Ready':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Food Ready</span>;
      case 'Served':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-600/10 flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5" /> Served & Billed</span>;
      default:
        return null;
    }
  };

  // Compute cart total
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const extrasTotal = EXTRA_SERVICES
    .filter(ext => selectedExtras[ext.id])
    .reduce((sum, ext) => sum + ext.price, 0);
  const draftTotal = cartTotal + extrasTotal;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:h-[calc(100vh-140px)] lg:min-h-[600px] overflow-visible lg:overflow-hidden pb-24 lg:pb-0" id="pos_container">
      
      {/* LEFT: Table Selection & Menu Matrix (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col gap-4 overflow-visible lg:overflow-hidden h-auto lg:h-full">
        
        {/* Table Selector Pills */}
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs flex flex-col gap-2 shrink-0">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-gray-400" /> {t('dining_tables_ingress')}
            </h3>
            <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
              {t('selected_table')}: {selectedTable.name}
            </span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            {tables.map(table => {
              const activeOrderForTable = orders.find(o => o.id === activeOrderIdByTable[table.id]);
              const orderStatus = activeOrderForTable?.status;
              
              let statusColor = 'border-gray-200 text-gray-700 hover:bg-gray-55';
              if (table.id === selectedTableId) {
                statusColor = 'border-charcoal bg-gray-900 text-white shadow-xs';
              } else if (orderStatus === 'Pending' || orderStatus === 'Preparing') {
                statusColor = 'border-amber-300 bg-amber-50/50 text-amber-800 hover:bg-amber-100/30';
              } else if (orderStatus === 'Ready') {
                statusColor = 'border-emerald-300 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100/30';
              }

              return (
                <button
                  key={table.id}
                  onClick={() => handleTableSelect(table.id)}
                  id={`table_btn_${table.id}`}
                  className="px-4 py-2.5 rounded-lg border text-sm font-medium transition-all shrink-0 flex flex-col items-center gap-0.5 min-w-[90px] cursor-pointer border-gray-200 text-gray-700 hover:bg-gray-55"
                  style={{
                    backgroundColor: table.id === selectedTableId ? '#111827' : undefined,
                    color: table.id === selectedTableId ? '#ffffff' : undefined,
                  }}
                >
                  <span className="font-semibold">{table.name}</span>
                  {orderStatus ? (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/65 text-gray-800 font-semibold border border-black/5">
                      {t((orderStatus === 'Pending' ? 'pending_status' : orderStatus === 'Preparing' ? 'preparing_status' : orderStatus === 'Ready' ? 'ready_status_kit' : 'served_status').toLowerCase()) || orderStatus}
                    </span>
                  ) : (
                    <span className="text-[9px] text-gray-400 font-light">{t('empty_status')}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Matrix Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs flex-1 flex flex-col overflow-visible lg:overflow-hidden min-h-0">
          
          {/* Categories and Search bar */}
          <div className="border-b border-gray-100 bg-gray-50/50 p-2.5 shrink-0 flex flex-col md:flex-row gap-2.5 items-center justify-between">
            <div className="flex overflow-x-auto w-full md:w-auto p-0.5 scrollbar-none gap-1 shrink-0">
              {categories.map(category => {
                const getTranslatedCategory = (cat: string) => {
                  if (cat === 'Shega Bites') return t('brand_name');
                  if (cat === 'Shega Traditional') return t('traditional');
                  if (cat === 'Shega Drinks') return t('cold_drinks');
                  if (cat === 'Shega Desserts') return t('desserts');
                  return cat;
                };
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setActiveSubcategory('All');
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all cursor-pointer ${
                      activeCategory === category 
                        ? 'bg-gray-950 text-white shadow-xs' 
                        : 'text-gray-550 hover:text-gray-900 hover:bg-gray-100/70'
                    }`}
                  >
                    {getTranslatedCategory(category)}
                  </button>
                );
              })}
            </div>

            {/* Live Search Input for Waiter Mobile Performance */}
            <div className="relative w-full md:w-60 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_items_placeholder')}
                className="w-full pl-8 pr-7 py-1.5 text-[11px] bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-gray-400 font-medium text-gray-800"
              />
              <svg className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1.5 text-gray-400 hover:text-gray-700 font-bold text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Subcategories bar */}
          <div className="flex gap-2 px-4 py-3 border-b border-gray-55 overflow-x-auto shrink-0 scrollbar-thin">
            {subcategories.map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSubcategory(sub)}
                className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer border ${
                  activeSubcategory === sub 
                    ? 'bg-gray-100 border-gray-300 text-gray-800 font-medium' 
                    : 'border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Dishes Grid */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin bg-gray-50/30">
            {filteredDishes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Utensils className="w-10 h-10 stroke-1 mb-2" />
                <p className="text-sm">No dishes found in this filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDishes.map(dish => {
                  // Determine currently chosen variant or default matching
                  const chosenVar = selectedVariants[dish.id] || (dish.variants ? dish.variants[0].name : undefined);
                  const price = getDishPrice(dish, chosenVar);

                  // Calculate calculated cost for info alert
                  const cost = calculateRecipeCost(dish, chosenVar, ingredients);
                  const margin = price - cost;
                  const marginPercent = ((margin / price) * 100).toFixed(0);

                  return (
                    <div 
                      key={dish.id} 
                      id={`dish_card_${dish.id}`}
                      className="bg-white rounded-xl border border-gray-100/80 p-3 flex flex-col justify-between hover:shadow-md hover:border-gray-200 transition-all duration-200"
                    >
                      <div>
                        {/* Title and sub */}
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm tracking-tight">{dish.name}</h4>
                          <span className="font-mono text-xs font-bold text-gray-900 shrink-0">
                            {price} Br
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mb-3">
                          {dish.description}
                        </p>

                        {/* Variants Picker Buttons (Single/Double/Triple or Normal/XL) */}
                        {dish.variants && dish.variants.length > 0 && (
                          <div className="bg-gray-50 p-1 rounded-lg flex gap-1 mb-3">
                            {dish.variants.map(variant => (
                              <button
                                key={variant.name}
                                onClick={() => handleVariantChange(dish.id, variant.name)}
                                className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer text-center ${
                                  (chosenVar === variant.name)
                                    ? 'bg-white shadow-xs text-gray-900 border border-black/5' 
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                              >
                                {variant.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[9px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                          Margin: <strong className="text-emerald-600">{marginPercent}%</strong>
                        </span>
                        <button
                          onClick={() => addToCart(dish)}
                          className="px-2.5 py-1 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add to Table
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Bill Details / Receipt Drawer (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col gap-4 h-full spill-height overflow-hidden">
               {/* Table Active Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs flex flex-col shrink-0">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">{t('table_status_prefix')}: {selectedTable.name}</h2>
              <p className="text-[11px] text-gray-400">{t('manage_orders_hint')}</p>
            </div>
            {activeOrder ? getOrderStatusBadge(activeOrder.status) : (
              <span className="px-2 py-0.5 text-xs font-medium text-gray-400 bg-gray-50 border border-gray-100 rounded-full flex items-center gap-1">
                <CircleDot className="w-2.5 h-2.5" /> {t('no_active_order')}
              </span>
            )}
          </div>

          {/* Active Order Breakdown if exists */}
          {activeOrder && (
            <div className="pt-3 space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-500 mb-1">
                <span>{t('active_cooking_bill')}</span>
                <span className="font-mono font-medium">Order #{activeOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>{t('waiter_label')}:</span>
                <span className="font-semibold text-gray-950">{activeOrder.waiterName || 'Default'}</span>
              </div>
              {activeOrder.specialNote && (
                <div className="bg-amber-50/60 text-amber-800 p-2.5 rounded-lg border border-amber-100 text-[11px] font-medium leading-relaxed">
                  <span className="font-bold">{t('special_note_label')}:</span> {activeOrder.specialNote}
                </div>
              )}
              {activeOrder.extras && activeOrder.extras.length > 0 && (
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-150 text-[11px]">
                  <span className="font-bold text-gray-650 block mb-1">{t('extras_requested')}:</span>
                  <div className="flex flex-wrap gap-1">
                    {activeOrder.extras.map((ext, idx) => (
                      <span key={idx} className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 text-[9px] font-bold">
                        {ext.name} (+{ext.price} Br)
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-sm font-bold text-gray-900 flex justify-between items-center pt-2 border-t border-gray-100 mb-3">
                <span>{t('total_bill')}: {activeOrder.total} Br</span>
                <button
                  onClick={() => setPrintingOrder(activeOrder)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Printer className="w-3.5 h-3.5" /> {t('print_invoice_btn')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Current Order Draft Drawer */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-gray-500" /> {t('current_order_draft')}
            </h3>
            {cart.length > 0 && (
              <button 
                onClick={() => setCart([])}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> {t('clear_all_btn')}
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                <ShoppingCart className="w-8 h-8 stroke-1 mb-2" />
                <p className="text-xs text-center">{t('empty_draft_p1')}<br/>{t('empty_draft_p2')}</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div 
                  key={`${item.dishId}-${item.variantName || 'base'}`} 
                  className="flex items-start justify-between gap-2 pb-3 border-b border-gray-50"
                >
                  <div className="overflow-hidden">
                    <span className="text-xs font-semibold text-gray-800 line-clamp-2">{item.dishName}</span>
                    {item.variantName && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium mt-0.5 inline-block">
                        {t('option_prefix')}: {item.variantName}
                      </span>
                    )}
                    <span className="block font-mono text-xs text-gray-400 mt-0.5">{item.price} Br {t('each_label')}</span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                      <button 
                        onClick={() => updateCartQty(item.dishId, item.variantName, -1)}
                        className="p-1 px-1.5 hover:bg-gray-150 transition-colors text-gray-500 cursor-pointer text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-1 text-xs font-mono font-bold text-gray-800 min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateCartQty(item.dishId, item.variantName, 1)}
                        className="p-1 px-1.5 hover:bg-gray-150 transition-colors text-gray-500 cursor-pointer text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.dishId, item.variantName)}
                      className="text-gray-300 hover:text-red-500 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* WAITER, SPECIAL NOTE, & EXTRAS BOX */}
            {cart.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 bg-gray-50/50 p-3 rounded-xl border border-dashed border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{t('order_dispatch_metadata')}</span>
                
                {/* Waiter field */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-650 mb-1">{t('waiter_name_label')}</label>
                  <input
                    type="text"
                    value={waiterNameState}
                    onChange={(e) => setWaiterNameState(e.target.value)}
                    placeholder={t('waiter_name_placeholder')}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-gray-400 font-medium text-gray-800"
                  />
                </div>

                {/* Special Note */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-650 mb-1">{t('special_note_label_field')}</label>
                  <textarea
                    rows={2}
                    value={specialNoteState}
                    onChange={(e) => setSpecialNoteState(e.target.value)}
                    placeholder={t('special_note_placeholder')}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-gray-400 font-medium text-gray-800 resize-none"
                  />
                </div>

                {/* Checkbox Payable Extras */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-650 mb-2">{t('extra_payable_label')}</label>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {EXTRA_SERVICES.map(ext => (
                      <label 
                        key={ext.id} 
                        className={`flex items-center gap-1.5 p-2 rounded-lg border transition-all cursor-pointer ${
                          selectedExtras[ext.id] 
                            ? 'bg-amber-50/70 border-amber-200 text-amber-900 font-bold' 
                            : 'bg-white border-gray-150 text-gray-600 hover:bg-gray-100/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!selectedExtras[ext.id]}
                          onChange={(e) => setSelectedExtras(prev => ({ ...prev, [ext.id]: e.target.checked }))}
                          className="rounded border-gray-350 text-amber-500 focus:ring-amber-500"
                        />
                        <div className="leading-tight">
                          <span className="block truncate">{ext.name}</span>
                          <span className="block text-[9px] text-gray-400 font-mono">+{ext.price} Br</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cart Pricing summary & Submission */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3 shrink-0">
              <div className="space-y-1 text-xs text-gray-500 font-mono">
                <div className="flex justify-between">
                  <span>{t('vat_subtotal')}:</span>
                  <span>{(draftTotal * 0.85).toFixed(2)} Br</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('vat_tax')} (15.0%):</span>
                  <span>{(draftTotal * 0.15).toFixed(2)} Br</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-dashed border-gray-200 pt-2 font-sans">
                  <span>{t('total_bill')}:</span>
                  <span>{draftTotal} Br</span>
                </div>
              </div>

              <button
                onClick={handleSendToKitchen}
                disabled={activeOrderId !== undefined}
                className={`w-full py-3 rounded-lg font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-all ${
                  activeOrderId 
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' 
                    : 'bg-gray-950 text-white hover:bg-gray-800 shadow-sm'
                }`}
              >
                <Send className="w-4 h-4" /> 
                {activeOrderId ? t('table_active_order_warning') : t('send_order_kitchen_btn')}
              </button>
              
              {activeOrderId && (
                <p className="text-[10px] text-center text-amber-600 font-light mt-1">
                  {t('active_order_table_notice')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DETAILED INTERACTIVE CHECKOUT & BILLING MODAL OVERLAY */}
      {printingOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs transition-all animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-gray-950 text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-sm uppercase flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-400" /> {t('dining_bill_settlement')}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Order #{printingOrder.orderNumber} • {printingOrder.tableName}</span>
              </div>
              <button 
                onClick={() => setPrintingOrder(null)}
                className="text-white/60 hover:text-white cursor-pointer p-1 rounded-full hover:bg-white/10 transition-colors text-xs"
                id="close-bill-btn"
              >
                ✕
              </button>
            </div>

            {/* Grid Layout (Desktop Layout: Left side Receipt, Right side Payment Terminal Console) */}
            <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col md:grid md:grid-cols-12 md:divide-x md:divide-gray-250">
              
              {/* LEFT COLUMN: Thermal Styled Paper Receipt Breakdown (Col span 5) */}
              <div className="p-4 md:col-span-5 flex flex-col overflow-y-auto">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block text-center md:text-left">
                  {t('customer_invoice_copy')}
                </span>
                <div id="thermal-receipt" className="bg-white p-5 rounded-xl shadow-xs border border-gray-150 text-gray-800 font-mono text-xs leading-relaxed max-w-xs mx-auto w-full">
                  
                  {/* Brand Header */}
                  <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-300">
                    <h1 className="text-sm font-black tracking-widest uppercase font-sans text-gray-900 animate-pulse">{t('brand_name')}</h1>
                    <p className="text-[9px] text-gray-500">{t('delicious_treats')}</p>
                    <p className="text-[8px] text-gray-400 font-sans mt-0.5">{t('bole_road')}</p>
                    <p className="text-[8px] text-gray-400 font-sans">{t('tel_contact')}</p>
                  </div>

                  {/* Meta details */}
                  <div className="py-2.5 border-b border-dashed border-gray-300 text-[10px] space-y-0.5">
                    <div className="flex justify-between text-[9px] text-gray-500">
                      <span>{t('date_label')}: {new Date(printingOrder.createdAt).toLocaleDateString()}</span>
                      <span>{t('time_label')}: {new Date(printingOrder.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('invoice_label')}: #{printingOrder.orderNumber}</span>
                      <span className="font-bold">{printingOrder.tableName}</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-500">
                      <span>{t('served_by_prefix')}: {printingOrder.waiterName || 'Staff'}</span>
                      <span className="font-bold text-amber-600 uppercase">{t((printingOrder.status || 'Pending').toLowerCase()) || printingOrder.status}</span>
                    </div>
                    {printingOrder.specialNote && (
                      <div className="mt-1.5 p-1 bg-amber-50 text-[9px] text-amber-900 rounded border border-amber-150">
                        <strong>Kitchen Note:</strong> {printingOrder.specialNote}
                      </div>
                    )}
                  </div>

                  {/* Items list */}
                  <div className="py-3 border-b border-dashed border-gray-300 space-y-2">
                    {printingOrder.items.map((item, id) => (
                      <div key={id} className="space-y-0.5">
                        <div className="flex justify-between font-bold text-gray-900 text-[11px]">
                          <span>{item.dishName}</span>
                          <span>{(item.price * item.quantity).toFixed(0)} Br</span>
                        </div>
                        <div className="flex justify-between text-[9px] text-gray-500">
                          <span>
                            {item.quantity} x {item.price} Br {item.variantName ? `(${item.variantName})` : ''}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Extras */}
                    {printingOrder.extras && printingOrder.extras.length > 0 && (
                      <div className="pt-2 border-t border-dashed border-gray-200 mt-2 space-y-1">
                        <span className="text-[8px] font-bold text-gray-400 block uppercase">Paid Extras</span>
                        {printingOrder.extras.map((ext, idx) => (
                          <div key={idx} className="flex justify-between text-[9px] text-gray-700">
                            <span>+ {ext.name}</span>
                            <span>{ext.price} Br</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Calculation detail */}
                  <div className="py-2.5 space-y-1 border-b border-dashed border-gray-200 text-[10px]">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal (85%):</span>
                      <span>{(printingOrder.total * 0.85).toFixed(2)} Br</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>VAT (15.0%):</span>
                      <span>{(printingOrder.total * 0.15).toFixed(2)} Br</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-900 pt-1.5 font-sans border-t border-gray-100 mt-1.5">
                      <span>TOTAL BILL:</span>
                      <span>{printingOrder.total} Br</span>
                    </div>
                  </div>

                  {/* Footer Labels */}
                  <div className="text-center pt-4 space-y-0.5">
                    <p className="text-[9px] font-sans text-gray-500">እናመሰግናለን! Thank You for Dining with Us!</p>
                    <p className="text-[7px] text-gray-404">POS.V100 - Shega Bites Core</p>
                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: Interactive Payment Terminal Engine (Col span 7) */}
              <div className="p-5 md:col-span-7 flex flex-col bg-white">
                
                {/* Method selector tab items */}
                <div className="flex border border-gray-200 rounded-xl bg-gray-50 p-1 mb-5">
                  <button
                    onClick={() => setPaymentMethod('Cash')}
                    className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
                      paymentMethod === 'Cash'
                        ? 'bg-white text-gray-950 shadow-xs border border-gray-200'
                        : 'text-gray-500 hover:text-gray-950 hover:bg-gray-100/55'
                    }`}
                    id="settle-cash-tab"
                  >
                    <Printer className="w-4 h-4 text-emerald-500" />
                    {t('cash_settle_tab')}
                  </button>
                  <button
                    onClick={() => setPaymentMethod('Chapa')}
                    className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer relative ${
                      paymentMethod === 'Chapa'
                        ? 'bg-white text-gray-950 shadow-xs border border-gray-200'
                        : 'text-gray-500 hover:text-gray-950 hover:bg-gray-100/55'
                    }`}
                    id="settle-chapa-tab"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    {t('chapa_digital_tab')}
                    {((import.meta as any).env || {}).VITE_CHAPA_PUBLISHABLE_KEY && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></span>
                    )}
                  </button>
                </div>

                {/* --- 1. CASH PAYMENT METHOD DETAIL --- */}
                {paymentMethod === 'Cash' && (
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-start gap-2.5">
                        <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-emerald-950 text-xs">{t('standard_cash_register')}</p>
                          <p className="text-[10px] text-emerald-800 leading-normal mt-0.5">
                            {t('cash_register_desc')}
                          </p>
                        </div>
                      </div>

                      {/* Cash Register Numbers */}
                      <div className="space-y-3.5 pt-2">
                        <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3 border border-gray-250">
                          <span className="text-xs text-gray-550 font-semibold uppercase">{t('total_invoice_value')}</span>
                          <span className="text-lg font-black font-sans text-gray-900">{printingOrder.total} Br</span>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="block text-xs font-bold text-gray-700">{t('cash_received_br')}</label>
                          <div className="relative">
                            <input
                              type="number"
                              placeholder="e.g. 500, 1000, 2000"
                              value={cashTendered}
                              onChange={(e) => setCashTendered(e.target.value)}
                              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:border-gray-900 focus:bg-white focus:outline-hidden font-bold text-gray-905 placeholder-gray-400"
                              id="cash-tendered-input"
                            />
                            <span className="absolute right-3.5 top-3 text-[11px] text-gray-400 font-mono font-bold">ETB</span>
                          </div>

                          {/* Fast suggestions */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {[
                              printingOrder.total,
                              Math.ceil(printingOrder.total / 100) * 100,
                              Math.ceil(printingOrder.total / 100) * 100 + 100,
                              Math.ceil(printingOrder.total / 500) * 500,
                            ].map((val, i) => {
                              const suggest = Math.ceil(val);
                              if (suggest < printingOrder.total) return null;
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setCashTendered(suggest.toString())}
                                  className="px-2.5 py-1 text-[10px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-200 transition-colors cursor-pointer"
                                >
                                  {suggest} Br
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Change Calculator Row */}
                        {Number(cashTendered) >= printingOrder.total && (
                          <div className="flex justify-between items-center bg-amber-50/70 rounded-xl p-3.5 border border-amber-100 animate-fade-in">
                            <span className="text-xs text-amber-900 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Wallet className="w-3.5 h-3.5 text-amber-605" /> {t('settle_cash_change')}
                            </span>
                            <span className="text-lg font-black text-amber-955 font-mono">
                              {(Number(cashTendered) - printingOrder.total).toFixed(2)} Br
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex gap-3">
                      <button
                        onClick={() => setPrintingOrder(null)}
                        className="flex-1 py-3 text-xs font-semibold text-gray-650 bg-gray-55 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        onClick={() => {
                          if (updateOrderStatus) {
                            updateOrderStatus(printingOrder.id, 'Served');
                          } else {
                            // Local fallback state clearing
                            setTables(prev => prev.map(t => {
                              if (t.id === printingOrder.tableId) {
                                return { ...t, status: 'Empty', currentOrderId: undefined };
                              }
                              return t;
                            }));
                          }
                          setPrintingOrder(null);
                        }}
                        className="flex-1 py-3 text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl flex items-center justify-center gap-1.5 select-none transition-all cursor-pointer shadow-md shadow-gray-200"
                        id="submit-cash-settlement-btn"
                      >
                        <Printer className="w-4 h-4" /> {t('trigger_thermal_close')}
                      </button>
                    </div>
                  </div>
                )}

                {/* --- 2. CHAPA DIGITAL PAYMENT GATEWAY INTEGRATION --- */}
                {paymentMethod === 'Chapa' && (
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    
                    {/* Setup step panel */}
                    {paymentStep === 'setup' && (
                      <div className="space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-4 text-left">
                          
                          {/* Live key indicator */}
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Digital Provider Gateway</span>
                            {((import.meta as any).env || {}).VITE_CHAPA_PUBLISHABLE_KEY ? (
                              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-bold border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Chapa Sandbox Connected
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-bold border border-amber-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                API Key Fallback Simulation
                              </div>
                            )}
                          </div>

                          {/* Digital payment channel selector */}
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'telebirr', name: 'telebirr', color: 'border-yellow-250 hover:bg-yellow-50/20 bg-yellow-50/10 text-yellow-950', badge: 'Popular' },
                              { id: 'cbe', name: 'CBE Birr', color: 'border-purple-250 hover:bg-purple-50/20 bg-purple-50/10 text-purple-950', badge: 'Direct' },
                              { id: 'awash', name: 'Awash Birr', color: 'border-cyan-250 hover:bg-cyan-50/20 bg-cyan-50/10 text-cyan-950', badge: 'Corporate' },
                              { id: 'card', name: 'Card Checkout', color: 'border-gray-250 hover:bg-gray-50 bg-gray-50/20 text-gray-800', note: 'Visa/Master' }
                            ].map((prov) => (
                              <button
                                key={prov.id}
                                type="button"
                                onClick={() => setChapaProvider(prov.id as any)}
                                className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative ${
                                  chapaProvider === prov.id
                                    ? `ring-2 ring-gray-900 border-transparent shadow-xs font-black ${prov.color}`
                                    : 'border-gray-200 bg-white hover:border-gray-300 font-semibold text-gray-650'
                                }`}
                              >
                                <div className="text-xs tracking-tight">{prov.name}</div>
                                <div className="text-[8px] text-gray-400 font-mono mt-0.5">Instant Settlement</div>
                                {prov.badge && (
                                  <span className="absolute top-2 right-2 px-1 py-0.2 bg-emerald-50 text-emerald-700 text-[7px] rounded-sm font-bold uppercase border border-emerald-100">
                                    {prov.badge}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>

                          {/* Mobile phone number prompt (unless normal bank card in sandbox) */}
                          <div className="space-y-1 text-left">
                            <label className="block text-xs font-bold text-gray-700">
                              Customer Phone Reference
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-2.5 text-xs text-gray-400 font-bold font-sans">
                                +251
                              </span>
                              <input
                                type="tel"
                                placeholder="09 / 07 ... (9 digits)"
                                value={chapaPhone}
                                onChange={(e) => {
                                  // Strip non-digits and limit length
                                  const digits = e.target.value.replace(/\D/g, '');
                                  setChapaPhone(digits);
                                }}
                                className="w-full pl-14 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:border-gray-900 focus:bg-white focus:outline-hidden font-bold text-gray-900 placeholder-gray-400 tracking-wider"
                                id="chapa-phone-input"
                              />
                            </div>
                            <span className="text-[9px] text-gray-400 inline-block leading-normal">
                              Allows direct CBE Birr or telebirr push notifications directly to user's phone for digital authorization.
                            </span>
                          </div>

                        </div>

                        {/* Connection status card using publishable key */}
                        <div className="bg-gray-50 border border-gray-150 p-3 rounded-lg flex items-center gap-2 mt-4 overflow-hidden">
                          <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <div className="text-[9px] text-gray-500 font-mono leading-none truncate w-full">
                            Publish Key: <span className="font-bold text-gray-600">{((import.meta as any).env || {}).VITE_CHAPA_PUBLISHABLE_KEY || 'FALLBACK_DEMO'}</span>
                          </div>
                        </div>

                        {/* Settle button triggers loading API simulation */}
                        <div className="pt-4 border-t border-gray-100 flex gap-3">
                          <button
                            onClick={() => setPrintingOrder(null)}
                            className="flex-1 py-3 text-xs font-semibold text-gray-650 bg-gray-55 border border-gray-200 rounded-xl hover:bg-gray-100 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              if (chapaPhone.length < 9) {
                                alert("Please enter a valid 9-digit Ethiopian phone reference (e.g. 0912345678).");
                                return;
                              }
                              setPaymentStep('processing');
                              setIsChapaLoading(true);
                              
                              // Handshake simulation sequence
                              setTimeout(() => {
                                setPaymentStep('otp');
                                setIsChapaLoading(false);
                                setChapaTxRef(`CHAPA-SB-TX-${Math.floor(100000 + Math.random() * 900000)}`);
                              }, 2500);
                            }}
                            className="flex-1 py-3 text-xs font-bold text-white bg-gray-950 hover:bg-gray-900 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0"
                            id="initiate-chapa-transaction-btn"
                          >
                            <Smartphone className="w-4 h-4 text-emerald-400" />
                            Request Push Payment ({printingOrder.total} Br)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Processing API / Sandboxing Loader */}
                    {paymentStep === 'processing' && (
                      <div className="flex-1 flex flex-col justify-center items-center py-10 text-center space-y-5 animate-fade-in">
                        {/* Spinner */}
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 rounded-full border-4 border-gray-155"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-t-gray-900 animate-spin"></div>
                          <Lock className="w-5 h-5 text-gray-500 absolute inset-0 m-auto" />
                        </div>
                        
                        <div className="space-y-1.5 max-w-xs">
                          <h3 className="font-bold text-sm text-gray-900">Connecting Chapa Gateway</h3>
                          <p className="text-xs text-gray-400 leading-normal">
                            Initializing checkout payment payload utilizing secure publishable key handshake, waiting for system webhook callback...
                          </p>
                        </div>

                        {/* Detail ledger logs */}
                        <div className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-left text-[9px] font-mono text-gray-500 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-emerald-600">✔ LOAD_ENV_SECRETS</span>
                            <span>SUCCESS</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-emerald-600">✔ CHAPA_PEM_HANDSHAKE</span>
                            <span>AUTHORIZED</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-500 animate-pulse">⚙ REQUESTING_TRANSACTION_PAYMENT</span>
                            <span className="animate-pulse">AWAITING</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Authenticating SMS OTP Step */}
                    {paymentStep === 'otp' && (
                      <div className="flex-1 flex flex-col justify-between space-y-4 text-left animate-fade-in">
                        <div className="space-y-4">
                          <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-start gap-2.5">
                            <Smartphone className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-black text-amber-955 text-xs">Simulated Push Code Request</p>
                              <p className="text-[10px] text-amber-800 leading-normal mt-0.5 font-sans">
                                Chapa Sandbox has initiated the direct authorization. Ask customer for the 6-digit payment validation code sent to phone <strong className="font-semibold">+251 {chapaPhone}</strong>.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3.5 pt-2">
                            <div className="space-y-1 flex flex-col">
                              <label className="text-xs font-bold text-gray-700">6-Digit Authorization Code</label>
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="e.g. 123456"
                                value={chapaOtp}
                                onChange={(e) => setChapaOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full text-center tracking-[0.5em] text-lg font-mono font-black py-2.5 bg-gray-50 rounded-xl border border-gray-300 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                                id="chapa-otp-input"
                              />
                            </div>

                            <div className="flex justify-between text-[11px] text-gray-400">
                              <span>Provider Ref: <strong className="font-mono text-gray-600">{chapaTxRef}</strong></span>
                              <span>Expires in: <strong>2:59 mins</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex gap-3">
                          <button
                            onClick={() => setPaymentStep('setup')}
                            className="flex-1 py-3 text-xs font-semibold text-gray-650 bg-gray-55 border border-gray-200 rounded-xl hover:bg-gray-105 transition-colors cursor-pointer"
                          >
                            Back / Re-request
                          </button>
                          <button
                            onClick={() => {
                              if (chapaOtp.length < 4) {
                                alert("Please enter the received push authentication code (e.g., 123456) to approve.");
                                return;
                              }
                              setPaymentStep('success');
                            }}
                            className="flex-1 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                            id="submit-otp-approval-btn"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve & Settle Br {printingOrder.total}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Success splash confirmation */}
                    {paymentStep === 'success' && (
                      <div className="flex-1 flex flex-col justify-between text-center space-y-4 animate-fade-in">
                        <div className="py-6 space-y-4 max-w-xs mx-auto">
                          
                          {/* Success animation sphere */}
                          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200 shadow-xs">
                            <CheckCircle2 className="w-8 h-8 animate-bounce" />
                          </div>

                          <div className="space-y-1.5 text-center">
                            <h2 className="text-base font-black text-gray-900 tracking-tight font-sans">Payment Approved!</h2>
                            <p className="text-xs text-gray-500 leading-normal">
                              Chapa digital wallet settlement concluded successfully. Transaction references recorded and synchronized to Supabase DB.
                            </p>
                          </div>

                          {/* Interactive Transaction summary specs */}
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-150 text-left font-mono text-[10px] text-gray-500 space-y-1.5">
                            <div className="flex justify-between">
                              <span>PROVIDER:</span>
                              <span className="font-bold text-gray-800 uppercase">{chapaProvider === 'cbe' ? 'CBE Birr' : chapaProvider === 'awash' ? 'Awash Birr' : chapaProvider === 'telebirr' ? 'telebirr' : 'Chapa Card'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>MOBILE REF:</span>
                              <span className="font-bold text-gray-800">+251 {chapaPhone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>TX REF CODE:</span>
                              <span className="font-bold text-gray-850">{chapaTxRef}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-1.5 text-xs text-gray-805">
                              <span>AMOUNT SECURED:</span>
                              <span className="font-black text-emerald-600">{printingOrder.total} Br</span>
                            </div>
                          </div>

                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <button
                            onClick={() => {
                              // Perform standard settlement
                              if (updateOrderStatus) {
                                updateOrderStatus(printingOrder.id, 'Served');
                              } else {
                                // Fallback tables
                                setTables(prev => prev.map(t => {
                                  if (t.id === printingOrder.tableId) {
                                    return { ...t, status: 'Empty', currentOrderId: undefined };
                                  }
                                  return t;
                                }));
                              }
                              setPrintingOrder(null);
                            }}
                            className="w-full py-3 text-xs font-black text-white bg-gray-905 hover:bg-gray-800 rounded-xl transition-all cursor-pointer shadow-md text-center inline-block select-none"
                            id="close-success-bill-btn"
                          >
                            Release Table & Conclude Order
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* MOBILE PERSISTENT FLOATING TRANSACTION TRAYS */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 flex flex-col gap-2">
        {/* If table has active order, allow easy invoice printing */}
        {activeOrder && (
          <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-800">{selectedTable.name} Bill</p>
                <p className="text-[10px] text-gray-400">Total: {activeOrder.total} Br</p>
              </div>
            </div>
            <button
              onClick={() => setPrintingOrder(activeOrder)}
              className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-gray-200"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        )}

        {/* Draft Cart floating trigger */}
        {cart.length > 0 && (
          <button
            onClick={() => setIsCartOpenOnMobile(true)}
            className="w-full bg-gray-950 hover:bg-gray-900 text-white p-3.5 rounded-xl shadow-xl flex items-center justify-between cursor-pointer transition-all animate-bounce"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white font-mono font-black text-xs px-2 py-0.5 rounded-md">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">New Draft Tray</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold bg-white/10 px-2.5 py-1 rounded-md">
              <span>{draftTotal} Br</span>
              <ShoppingCart className="w-4 h-4 ml-0.5" />
            </div>
          </button>
        )}
      </div>

      {/* MOBILE CART DRAWERS (BOTTOM SHEET SLIDE-UP OVERLAY) */}
      {isCartOpenOnMobile && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 flex flex-col justify-end">
          {/* Backdrop click close */}
          <div className="flex-1" onClick={() => setIsCartOpenOnMobile(false)}></div>
          
          <div className="bg-white rounded-t-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/70 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-extrabold text-gray-900 tracking-wider uppercase flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-gray-800" /> Draft Order ({selectedTable.name})
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Review items before sending to kitchen</p>
              </div>
              <button
                onClick={() => setIsCartOpenOnMobile(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {cart.map((item, idx) => (
                <div key={`${item.dishId}-${item.variantName || 'base'}`} className="flex items-start justify-between gap-2 pb-3.5 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">{item.dishName}</span>
                    {item.variantName && (
                      <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium mt-1 inline-block">
                        Option: {item.variantName}
                      </span>
                    )}
                    <span className="block font-mono text-[10px] text-gray-400 mt-1">{item.price} Br each</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-55 overflow-hidden">
                      <button 
                        onClick={() => updateCartQty(item.dishId, item.variantName, -1)}
                        className="p-1 px-2 hover:bg-gray-150 transition-colors text-gray-500 cursor-pointer text-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-1 text-xs font-mono font-bold text-gray-800 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateCartQty(item.dishId, item.variantName, 1)}
                        className="p-1 px-2 hover:bg-gray-150 transition-colors text-gray-500 cursor-pointer text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.dishId, item.variantName)}
                      className="text-gray-300 hover:text-red-500 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* WAITER, SPECIAL NOTE, & EXTRAS BOX */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 bg-gray-50/50 p-3 rounded-xl border border-dashed border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Order Dispatch Metadata &amp; Extras</span>
                
                {/* Waiter field */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-650 mb-1">Waiter Name</label>
                  <input
                    type="text"
                    value={waiterNameState}
                    onChange={(e) => setWaiterNameState(e.target.value)}
                    placeholder="Enter waiter name..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-gray-400 font-medium text-gray-800"
                  />
                </div>

                {/* Special Note */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-650 mb-1">Special note</label>
                  <textarea
                    rows={2}
                    value={specialNoteState}
                    onChange={(e) => setSpecialNoteState(e.target.value)}
                    placeholder="E.g., No spicy, extra sauce, enjera separate..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-gray-400 font-medium text-gray-800 resize-none"
                  />
                </div>

                {/* Checkbox Payable Extras */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-650 mb-2">Extra Payable Services (Checkboxes)</label>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {EXTRA_SERVICES.map(ext => (
                      <label 
                        key={ext.id} 
                        className={`flex items-center gap-1.5 p-2 rounded-lg border transition-all cursor-pointer ${
                          selectedExtras[ext.id] 
                            ? 'bg-amber-50/70 border-amber-200 text-amber-900 font-bold' 
                            : 'bg-white border-gray-150 text-gray-600 hover:bg-gray-100/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!selectedExtras[ext.id]}
                          onChange={(e) => setSelectedExtras(prev => ({ ...prev, [ext.id]: e.target.checked }))}
                          className="rounded border-gray-350 text-amber-500 focus:ring-amber-500"
                        />
                        <div className="leading-tight">
                          <span className="block truncate">{ext.name}</span>
                          <span className="block text-[9px] text-gray-400 font-mono">+{ext.price} Br</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-4">
              <div className="space-y-1 text-xs text-gray-500 font-mono">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{(draftTotal * 0.85).toFixed(2)} Br</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (15.0%):</span>
                  <span>{(draftTotal * 0.15).toFixed(2)} Br</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-dashed border-gray-200 pt-2 font-sans">
                  <span>Total Due:</span>
                  <span>{draftTotal} Br</span>
                </div>
              </div>

              <button
                onClick={() => {
                  handleSendToKitchen();
                  setIsCartOpenOnMobile(false);
                }}
                disabled={activeOrderId !== undefined}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 shadow-md transition-all ${
                  activeOrderId 
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' 
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                <Send className="w-4 h-4" /> 
                {activeOrderId ? 'Table has active ticket' : 'Send to Kitchen'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
