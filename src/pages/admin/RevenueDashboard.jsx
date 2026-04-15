import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const SOURCE_COLORS = {
  ferry_commission: '#2E86C1',
  rental_commission: '#27AE60',
  lodging_commission: '#8E44AD',
  parking_fee: '#F39C12',
  ad_impression: '#E74C3C',
  shop_commission: '#16A085',
  other: '#95A5A6',
};

const SOURCE_LABELS = {
  ferry_commission: 'Ferry',
  rental_commission: 'Rentals',
  lodging_commission: 'Lodging',
  parking_fee: 'Parking',
  ad_impression: 'Ads',
  shop_commission: 'Shops',
  other: 'Other',
};

const FILTER_OPTIONS = ['All', 'ferry_commission', 'rental_commission', 'lodging_commission', 'parking_fee', 'ad_impression', 'other'];

export default function RevenueDashboard() {
  const [sourceFilter, setSourceFilter] = useState('All');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['revenueEntries'],
    queryFn: () => base44.entities.RevenueEntry.list('-created_date', 500),
  });

  const filtered = useMemo(() =>
    sourceFilter === 'All' ? entries : entries.filter(e => e.source === sourceFilter),
    [entries, sourceFilter]
  );

  const totalRevenue = useMemo(() => entries.reduce((s, e) => s + (e.amount || 0), 0), [entries]);

  const thisMonth = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return entries
      .filter(e => e.created_date && isWithinInterval(parseISO(e.created_date), { start, end }))
      .reduce((s, e) => s + (e.amount || 0), 0);
  }, [entries]);

  const lastMonth = useMemo(() => {
    const prev = subMonths(new Date(), 1);
    const start = startOfMonth(prev);
    const end = endOfMonth(prev);
    return entries
      .filter(e => e.created_date && isWithinInterval(parseISO(e.created_date), { start, end }))
      .reduce((s, e) => s + (e.amount || 0), 0);
  }, [entries]);

  const mom = lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : null;

  // Last 6 months stacked bar data
  const barData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const monthEntries = entries.filter(e =>
        e.created_date && isWithinInterval(parseISO(e.created_date), { start, end })
      );
      const row = { month: format(d, 'MMM') };
      Object.keys(SOURCE_COLORS).forEach(src => {
        row[src] = monthEntries.filter(e => e.source === src).reduce((s, e) => s + (e.amount || 0), 0);
      });
      return row;
    });
  }, [entries]);

  // MoM trend line
  const trendData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const total = entries
        .filter(e => e.created_date && isWithinInterval(parseISO(e.created_date), { start, end }))
        .reduce((s, e) => s + (e.amount || 0), 0);
      return { month: format(d, 'MMM'), revenue: parseFloat(total.toFixed(2)) };
    });
  }, [entries]);

  const uniqueSources = [...new Set(entries.map(e => e.source))];

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="px-4 pt-5 pb-6 space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon="💰" color="bg-accent/10 text-accent" />
        <StatCard label="This Month" value={`$${thisMonth.toFixed(2)}`} sub={mom ? `${mom > 0 ? '+' : ''}${mom}% vs last month` : undefined} icon="📅" color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Transactions" value={entries.length} sub={`${filtered.length} shown`} icon="🧾" color="bg-purple-50 text-purple-600" />
        <StatCard label="Revenue Sources" value={uniqueSources.length} sub="Active streams" icon="📊" color="bg-amber-50 text-amber-600" />
      </div>

      {/* Stacked bar */}
      <div className="bg-card border rounded-xl p-4">
        <p className="text-sm font-bold mb-3">Revenue by Source (6 months)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
            {Object.entries(SOURCE_COLORS).map(([src, color]) => (
              <Bar key={src} dataKey={src} name={SOURCE_LABELS[src]} stackId="a" fill={color} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend line */}
      <div className="bg-card border rounded-xl p-4">
        <p className="text-sm font-bold mb-3">Month-over-Month Trend</p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={trendData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
            <Line type="monotone" dataKey="revenue" stroke="#2E86C1" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Filter + Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <p className="text-sm font-bold">Transactions</p>
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="text-xs border rounded-lg px-2 py-1.5 bg-background text-foreground"
          >
            {FILTER_OPTIONS.map(o => (
              <option key={o} value={o}>{o === 'All' ? 'All Sources' : SOURCE_LABELS[o] || o}</option>
            ))}
          </select>
        </div>
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">No transactions found</p>
        ) : (
          <div className="divide-y max-h-64 overflow-y-auto">
            {filtered.slice(0, 50).map(e => (
              <div key={e.id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <p className="text-xs font-semibold capitalize">{SOURCE_LABELS[e.source] || e.source}</p>
                  <p className="text-[10px] text-muted-foreground">{e.description || e.reference_type || '—'}</p>
                  <p className="text-[10px] text-muted-foreground">{e.created_date ? format(parseISO(e.created_date), 'MMM d, yyyy') : '—'}</p>
                </div>
                <span className="text-sm font-bold text-emerald-600">+${(e.amount || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}