import React, { useState } from 'react';
import { useTrade } from '../context/TradeContext';
import { api, formatINR } from '../services/api';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Filter,
  Layers,
  Search
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { orders, refreshData, navigateTo, setSelectedSymbol, theme } = useTrade();
  const [tab, setTab] = useState<'ALL' | 'OPEN' | 'EXECUTED' | 'CANCELLED'>('ALL');
  const [sideFilter, setSideFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const openOrders = orders.filter((o) => o.status === 'PENDING');
  const executedOrders = orders.filter((o) => o.status === 'EXECUTED');
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED');

  const filteredOrders = orders.filter((o) => {
    if (tab === 'OPEN' && o.status !== 'PENDING') return false;
    if (tab === 'EXECUTED' && o.status !== 'EXECUTED') return false;
    if (tab === 'CANCELLED' && o.status !== 'CANCELLED') return false;
    if (sideFilter !== 'ALL' && o.side !== sideFilter) return false;
    return true;
  });

  const handleCancelOrder = async (orderId: string) => {
    setCancellingId(orderId);
    setMsg(null);
    try {
      await api.cancelOrder(orderId);
      setMsg({
        type: 'success',
        text: 'Limit order successfully cancelled. Reserved virtual cash refunded to your balance.'
      });
      await refreshData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to cancel order' });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#00d09c]" />
            <span>Orders & Trades</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track active pending limit orders and historical virtual trade executions
          </p>
        </div>

        <button
          onClick={() => navigateTo('markets')}
          className="px-3.5 py-2 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 text-xs font-black transition-all shadow-md shadow-[#00d09c]/20 flex items-center gap-1.5 w-fit"
        >
          <span>Place New Order</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Alert banner */}
      {msg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
            msg.type === 'success'
              ? 'bg-[#00d09c]/10 border-[#00d09c]/30 text-[#00b386] dark:text-[#00d09c]'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
          }`}
        >
          <span>{msg.text}</span>
          <button
            onClick={() => setMsg(null)}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            id="orders-tab-all"
            onClick={() => setTab('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              tab === 'ALL'
                ? 'bg-[#00d09c] text-slate-950 shadow-sm'
                : theme === 'dark'
                ? 'bg-[#151922] text-slate-400 hover:text-white border border-slate-800'
                : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
            }`}
          >
            All Orders ({orders.length})
          </button>

          <button
            id="orders-tab-open"
            onClick={() => setTab('OPEN')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              tab === 'OPEN'
                ? 'bg-[#00d09c] text-slate-950 shadow-sm'
                : theme === 'dark'
                ? 'bg-[#151922] text-slate-400 hover:text-white border border-slate-800'
                : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Open ({openOrders.length})</span>
          </button>

          <button
            id="orders-tab-executed"
            onClick={() => setTab('EXECUTED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              tab === 'EXECUTED'
                ? 'bg-[#00d09c] text-slate-950 shadow-sm'
                : theme === 'dark'
                ? 'bg-[#151922] text-slate-400 hover:text-white border border-slate-800'
                : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Executed ({executedOrders.length})</span>
          </button>

          <button
            id="orders-tab-cancelled"
            onClick={() => setTab('CANCELLED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              tab === 'CANCELLED'
                ? 'bg-[#00d09c] text-slate-950 shadow-sm'
                : theme === 'dark'
                ? 'bg-[#151922] text-slate-400 hover:text-white border border-slate-800'
                : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled ({cancelledOrders.length})</span>
          </button>
        </div>

        {/* Side filter pills (All / Buy / Sell) */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Filter:</span>
          {(['ALL', 'BUY', 'SELL'] as const).map((side) => (
            <button
              key={side}
              onClick={() => setSideFilter(side)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                sideFilter === side
                  ? side === 'BUY'
                    ? 'bg-[#00d09c] text-slate-950'
                    : side === 'SELL'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {side}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table */}
      {filteredOrders.length > 0 ? (
        <div
          className={`rounded-3xl border overflow-hidden transition-all ${
            theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredOrders.map((order) => {
              const isBuy = order.side === 'BUY';
              const isPending = order.status === 'PENDING';
              const isExecuted = order.status === 'EXECUTED';
              const isCancelled = order.status === 'CANCELLED';

              return (
                <div
                  key={order.id}
                  id={`order-row-${order.id}`}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Left: Stock info, side pill, type */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isBuy
                          ? 'bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] border border-[#00d09c]/30'
                          : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                      }`}
                    >
                      {order.symbol.slice(0, 2)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => {
                            setSelectedSymbol(order.symbol);
                            navigateTo('stock-details', order.symbol);
                          }}
                          className="font-black text-sm hover:underline cursor-pointer tracking-tight"
                        >
                          {order.symbol}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            isBuy
                              ? 'bg-[#00d09c]/20 text-[#00b386] dark:text-[#00d09c]'
                              : 'bg-rose-500/20 text-rose-500'
                          }`}
                        >
                          {order.side}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                          {order.orderType}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>{order.quantity} Shares</span>
                        <span>•</span>
                        <span>
                          {order.orderType === 'LIMIT'
                            ? `Limit @ ${formatINR(order.price || 0)}`
                            : `Market Price`}
                        </span>
                        <span>•</span>
                        <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Order Value & Status */}
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="sm:text-right">
                      <span className="text-[11px] text-slate-400 block">Total Value</span>
                      <span className="text-sm font-black">
                        {formatINR(order.quantity * (order.executionPrice || order.price || 0))}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-500 border border-amber-400/20 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 animate-spin" />
                          <span>Pending Trigger</span>
                        </span>
                      )}

                      {isExecuted && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] border border-[#00d09c]/30 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Executed</span>
                        </span>
                      )}

                      {isCancelled && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5">
                          <XCircle className="w-3 h-3" />
                          <span>Cancelled</span>
                        </span>
                      )}

                      {/* Cancel button if pending */}
                      {isPending && (
                        <button
                          id={`cancel-order-${order.id}`}
                          disabled={cancellingId === order.id}
                          onClick={() => handleCancelOrder(order.id)}
                          title="Cancel limit order and refund virtual funds"
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className={`p-12 rounded-3xl border text-center space-y-4 ${
            theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold">No orders found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No orders found for the selected tab ({tab}). Place a simulated buy or sell order to
              see real-time execution in the order book.
            </p>
          </div>
          <button
            onClick={() => navigateTo('markets')}
            className="px-5 py-2.5 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs shadow-md shadow-[#00d09c]/20"
          >
            Explore Equities & Place Order
          </button>
        </div>
      )}
    </div>
  );
};
