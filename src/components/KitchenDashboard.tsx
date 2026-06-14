/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderStatus } from '../types';
import { useLanguage } from '../lib/translations';
import { 
  ChefHat, 
  Clock, 
  Check, 
  Timer, 
  UtensilsCrossed, 
  Utensils, 
  CheckCircle2, 
  TrendingUp,
  AlertCircle,
  X
} from 'lucide-react';

interface KitchenDashboardProps {
  orders: Order[];
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

interface KitchenToast {
  id: string;
  orderNumber: number;
  tableName: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  timestamp: Date;
}

export default function KitchenDashboard({ orders, updateOrderStatus }: KitchenDashboardProps) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'Active' | 'Completed'>('Active');
  const [toasts, setToasts] = useState<KitchenToast[]>([]);

  const handleStatusChange = (
    orderId: string, 
    orderNumber: number, 
    tableName: string, 
    oldStatus: OrderStatus, 
    newStatus: OrderStatus
  ) => {
    updateOrderStatus(orderId, newStatus);

    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast: KitchenToast = {
      id,
      orderNumber,
      tableName,
      oldStatus,
      newStatus,
      timestamp: new Date()
    };

    setToasts(prev => [newToast, ...prev]);

    // Cleanup toast automatically
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getToastStyle = (status: OrderStatus) => {
    switch (status) {
      case 'Preparing':
        return 'border-blue-200 bg-blue-50/95 text-blue-950 shadow-md';
      case 'Ready':
        return 'border-emerald-200 bg-emerald-50/95 text-emerald-950 shadow-md';
      case 'Served':
        return 'border-gray-855 bg-gray-900/95 text-white shadow-md';
      default:
        return 'border-gray-200 bg-white/95 text-gray-950 shadow-md';
    }
  };

  const getToastIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Preparing':
        return <ChefHat className="w-5 h-5 text-blue-600 shrink-0" />;
      case 'Ready':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'Served':
        return <Check className="w-5 h-5 text-emerald-400 shrink-0" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />;
    }
  };

  // Active cooking orders
  const activeOrders = orders.filter(o => 
    o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Ready'
  ).sort((a,b) => {
    // Sort so Pending/Preparing come on top
    const statusPriority: Record<OrderStatus, number> = {
      'Pending': 1,
      'Preparing': 2,
      'Ready': 3,
      'Served': 4,
      'Cancelled': 5
    };
    return (statusPriority[a.status] || 9) - (statusPriority[b.status] || 9);
  });

  // Completed orders
  const completedOrders = orders.filter(o => o.status === 'Served').sort((a,b) => 
    new Date(b.servedAt || b.createdAt).getTime() - new Date(a.servedAt || a.createdAt).getTime()
  );

  const displayedOrders = viewMode === 'Active' ? activeOrders : completedOrders;

  const getOrderStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return <AlertCircle className="w-5 h-5 text-amber-500 animate-pulse" />;
      case 'Preparing':
        return <ChefHat className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'Ready':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'Served':
        return <Check className="w-5 h-5 text-gray-500" />;
      default:
        return <Utensils className="w-5 h-5 text-gray-400" />;
    }
  };

  const getOrderStatusCardClass = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'border-amber-200 bg-amber-50/10 shadow-amber-50/50';
      case 'Preparing':
        return 'border-blue-200 bg-blue-50/10 shadow-blue-50/50';
      case 'Ready':
        return 'border-emerald-200 bg-emerald-50/10 shadow-emerald-50/50';
      case 'Served':
        return 'border-gray-200 bg-white/70 shadow-xs opacity-80';
      default:
        return 'border-gray-150';
    }
  };

  // Human friendly waiting times estimation
  const getWaitingTimeStr = (createdAt: string) => {
    const elapsedMs = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(elapsedMs / 1000 / 60);

    if (mins <= 2) return <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Clock className="w-3 h-3"/> {t('just_now_badge')}</span>;
    if (mins >= 15) return <span className="text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse"><Clock className="w-3 h-3"/> {t('delayed_badge')} ({mins}m)</span>;
    return <span className="text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Clock className="w-3 h-3"/> {t('waiting_badge')} {mins}m</span>;
  };

  return (
    <div className="flex flex-col gap-5 h-[calc(100vh-140px)] min-h-[600px] overflow-hidden" id="kitchen_container">
      
      {/* Header controls select tabs */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-row items-center justify-between shrink-0">
        <div>
          <h2 className="text-md font-bold text-gray-900 flex items-center gap-1.5">
            <ChefHat className="w-5 h-5 text-gray-700" /> {t('kitchen_expo_title')}
          </h2>
          <p className="text-[11px] text-gray-400">{t('kitchen_expo_desc')}</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-100 p-1 rounded-lg flex gap-1 font-semibold text-xs transition-all">
          <button
            onClick={() => setViewMode('Active')}
            className={`px-4 py-1.5 rounded-md cursor-pointer ${
              viewMode === 'Active' 
                ? 'bg-white shadow-xs text-gray-900 font-bold' 
                : 'text-gray-500 hover:text-gray-950'
            }`}
          >
            {t('active_tickets_btn')} ({activeOrders.length})
          </button>
          <button
            onClick={() => setViewMode('Completed')}
            className={`px-4 py-1.5 rounded-md cursor-pointer ${
              viewMode === 'Completed' 
                ? 'bg-white shadow-xs text-gray-900 font-bold' 
                : 'text-gray-500 hover:text-gray-950'
            }`}
          >
            {t('served_tickets_btn')} ({completedOrders.length})
          </button>
        </div>
      </div>

      {/* Grid of Tickets cards */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {displayedOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-250 text-gray-400">
            <UtensilsCrossed className="w-12 h-12 stroke-1 mb-3 animate-bounce" />
            <h3 className="font-bold text-gray-900 text-sm">{t('no_tickets_found')}</h3>
            <p className="text-xs text-center text-gray-400 max-w-xs mt-1">
              {viewMode === 'Active' 
                ? t('waiters_no_tickets_active') 
                : t('no_completed_tickets_history')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {displayedOrders.map(order => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -20, transition: { duration: 0.25 } }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  id={`kitchen_card_${order.id}`}
                  className={`border rounded-2xl flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 bg-white ${getOrderStatusCardClass(order.status)}`}
                >
                  
                  {/* Visual Card Top Header */}
                  <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono font-bold text-gray-700">{t('ticket_label')} #{order.orderNumber}</span>
                      <h4 className="font-extrabold text-sm text-gray-900">{order.tableName}</h4>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="flex items-center gap-1">
                        {getOrderStatusIcon(order.status)}
                      </span>
                      {order.status !== 'Served' && getWaitingTimeStr(order.createdAt)}
                    </div>
                  </div>

                  {/* Items listing */}
                  <div className="p-4 flex-1 space-y-3 font-medium">
                    {order.items.map((item, id) => (
                      <div key={id} className="flex justify-between items-start text-xs border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-extrabold text-sm text-gray-900">
                              {item.quantity}x
                            </span>
                            <span className="font-bold text-gray-800">
                              {item.dishName}
                            </span>
                          </div>
                          {item.variantName && (
                            <span className="text-[9px] bg-gray-150 text-gray-600 px-1 py-0.2 rounded font-medium mt-1 inline-block">
                              {t('option_prefix')}: {item.variantName}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Waiter's Name, Special Note, Extras details for Cook/Chefs */}
                    {(order.waiterName || order.specialNote || (order.extras && order.extras.length > 0)) && (
                      <div className="mt-4 pt-3 border-t border-dashed border-gray-150 space-y-2">
                        {order.waiterName && (
                          <div className="text-[10px] text-gray-500 font-bold flex justify-between">
                            <span>{t('waiter_label')}:</span>
                            <span className="text-gray-800">{order.waiterName}</span>
                          </div>
                        )}
                        
                        {order.specialNote && (
                          <div className="p-2 bg-amber-50 text-amber-800 rounded-lg text-[10px] leading-relaxed border border-amber-100 font-medium">
                            <span className="font-extrabold uppercase text-[9px] block mb-0.5 text-amber-950">{t('special_note_label')}:</span>
                            {order.specialNote}
                          </div>
                        )}
                        
                        {order.extras && order.extras.length > 0 && (
                          <div className="p-2 bg-gray-50 rounded-lg text-[10px] border border-gray-250">
                            <span className="font-bold text-gray-500 uppercase text-[9px] block mb-1">{t('extras_requested')}:</span>
                            <div className="flex flex-wrap gap-1">
                              {order.extras.map((ext, idx) => (
                                <span key={idx} className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-700 font-bold text-[9px]">
                                  {ext.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status action control foot */}
                  <div className="p-3 bg-gray-50/80 border-t border-gray-50">
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => handleStatusChange(order.id, order.orderNumber, order.tableName, order.status, 'Preparing')}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-blue-100 transition-all"
                      >
                        <ChefHat className="w-4 h-4 animate-spin" /> {t('start_cooking')}
                      </button>
                    )}

                    {order.status === 'Preparing' && (
                      <button
                        onClick={() => handleStatusChange(order.id, order.orderNumber, order.tableName, order.status, 'Ready')}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-emerald-100 transition-all"
                      >
                        <Check className="w-4 h-4" /> {t('ready_to_serve')}
                      </button>
                    )}

                    {order.status === 'Ready' && (
                      <button
                        onClick={() => handleStatusChange(order.id, order.orderNumber, order.tableName, order.status, 'Served')}
                        className="w-full py-2 bg-gray-950 hover:bg-gray-800 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      >
                        <Utensils className="w-4 h-4" /> {t('consumable_served')}
                      </button>
                    )}

                    {order.status === 'Served' && (
                      <div className="text-[10px] text-gray-400 font-mono text-center flex flex-col gap-0.5 leading-none">
                        <span>{t('deductions_finalized_at')}:</span>
                        <span className="text-gray-600 font-medium">
                          {order.servedAt ? new Date(order.servedAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Kitchen Toasts Alert Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none" id="kitchen_toasts_container">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              layout
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-start gap-4 w-80 text-xs font-semibold relative overflow-hidden backdrop-blur-xs select-none ${getToastStyle(toast.newStatus)}`}
              id={`toast_${toast.id}`}
            >
              {getToastIcon(toast.newStatus)}
              <div className="flex-1 space-y-1 pr-4">
                <h4 className="font-extrabold tracking-tight leading-none text-xs">
                  {t('ticket_updated_toast')} #{toast.orderNumber}
                </h4>
                <p className="text-[10.5px] opacity-90 leading-relaxed font-bold">
                  {t('table')} <span className="font-black bg-black/5 px-1 py-0.2 rounded border border-black/5">{toast.tableName}</span> {t('table_changed_to_toast')}{' '}
                  <span className="font-black underline decoration-[1.5px] decoration-current">{t((toast.newStatus || 'Pending').toLowerCase()) || toast.newStatus}</span>
                </p>
                <span className="block text-[8.5px] opacity-60 font-mono font-medium">
                  {toast.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="absolute top-3.5 right-3.5 p-1 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
