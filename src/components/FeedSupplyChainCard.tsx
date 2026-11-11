import React, { useState, useMemo } from 'react';
import { farmStore } from '../services/farmStore';
import { FeedInventoryItem } from '../types';
import { 
  Package, ShoppingCart, AlertCircle, CheckCircle2, 
  Send, Phone, MessageSquare, Copy, Check, Clock, 
  Truck, ArrowUpRight, DollarSign, Building2, RefreshCw, 
  Sparkles, Layers
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  dealerType: string;
  phone: string;
  address: string;
  suppliedFeeds: string[];
}

export const FeedSupplyChainCard: React.FC = () => {
  const [feedInventory, setFeedInventory] = useState<FeedInventoryItem[]>(farmStore.getFeedInventory());
  const [reorderDays, setReorderDays] = useState<number>(15);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('sup-1');
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);
  const [activeOrderTab, setActiveOrderTab] = useState<'alerts' | 'suppliers' | 'orders'>('alerts');

  // Suppliers directory
  const suppliers: Supplier[] = [
    {
      id: 'sup-1',
      name: 'মেসার্স সততা ফিড অ্যান্ড এগ্রো মিলস',
      dealerType: 'সিপি ও নারিশ ফিড প্রধান পরিবেশক',
      phone: '০১৭৫০০০০১১১',
      address: 'মাইজভাণ্ডার রোড, ফটিকছড়ি, চট্টগ্রাম',
      suppliedFeeds: ['দানাদার ডেইরি স্পেশাল ফিড', 'সোনালী স্টার্টার ফিড', 'ভাসমান ফিশ ফিড (২৮% প্রোটিন)']
    },
    {
      id: 'sup-2',
      name: 'গ্রীন ভ্যালি লাইভস্টক নিউট্রিশন',
      dealerType: 'সাইলেজ ও প্রিমিয়াম সবুজ ঘাস সরবরাহকারী',
      phone: '০১৮১২৩৩৪৪৫৫',
      address: 'সাভার ডেইরি ফার্ম জোন, ঢাকা',
      suppliedFeeds: ['ভুট্টা সাইলেজ (প্যাক)', 'শুকনো খড় (বেল)', 'ডিহাইড্রেশন আলফালফা']
    },
    {
      id: 'sup-3',
      name: 'বিসমিল্লাহ এগ্রো সাপ্লাইয়ার্স',
      dealerType: 'ভুসি, খৈল ও মিনারেল মিক্স পাইকারি ডিলার',
      phone: '০১৯১১২২৩৩৪৪',
      address: 'খাতুনগঞ্জ পাইকারি বাজার, চট্টগ্রাম',
      suppliedFeeds: ['গমের ভুসি (গম ভুসি)', 'সরিষার খৈল', 'খাদ্য লবণ ও ডিসিপি']
    }
  ];

  // Mock initial purchase orders
  const [purchaseOrders, setPurchaseOrders] = useState([
    {
      id: 'PO-2026-081',
      date: '২০২৬-১১-০৭',
      supplierName: 'মেসার্স সততা ফিড অ্যান্ড এগ্রো মিলস',
      items: 'দানাদার ডেইরি স্পেশাল (১০ বস্তা)',
      amountTaka: 24500,
      status: 'গুদামে রিসিভ হয়েছে (Received)',
      statusColor: 'emerald'
    },
    {
      id: 'PO-2026-088',
      date: '২০২৬-১১-০৯',
      supplierName: 'গ্রীন ভ্যালি লাইভস্টক নিউট্রিশন',
      items: 'ভুট্টা সাইলেজ (২০ বেল)',
      amountTaka: 18000,
      status: 'ট্রানজিটে আছে (In Transit)',
      statusColor: 'amber'
    }
  ]);

  // Find critical items
  const lowStockItems = useMemo(() => {
    return feedInventory.filter(item => item.currentStockKg <= (item.reorderThresholdKg || 100));
  }, [feedInventory]);

  // Selected supplier
  const activeSupplier = useMemo(() => {
    return suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];
  }, [selectedSupplierId]);

  // Auto-generate calculated replenishment order
  const calculatedRequirements = useMemo(() => {
    return feedInventory.map(item => {
      // Estimated daily consumption based on active stock
      const estimatedDailyKg = item.dailyUsageKg || (item.currentStockKg > 0 ? Math.max(8, Math.round(item.currentStockKg / 12)) : 15);
      const neededTotalKg = estimatedDailyKg * reorderDays;
      const deficitKg = Math.max(0, neededTotalKg - item.currentStockKg);
      const kgPerBag = item.conversionRatePerBag || 50;
      const bagsToOrder = Math.ceil(deficitKg / kgPerBag);
      const estimatedCost = bagsToOrder * (item.unitPricePerBag || (item.unitPricePerKg * kgPerBag) || 2400);

      return {
        ...item,
        estimatedDailyKg,
        neededTotalKg,
        deficitKg,
        bagsToOrder,
        estimatedCost,
        isUrgent: item.currentStockKg <= (item.reorderThresholdKg || 100)
      };
    });
  }, [feedInventory, reorderDays]);

  // Draft purchase order message in Bengali
  const draftMessage = useMemo(() => {
    const urgentItems = calculatedRequirements.filter(r => r.bagsToOrder > 0);
    const itemListText = urgentItems.length > 0 
      ? urgentItems.map((it, idx) => `${idx + 1}. ${it.feedName}: ${it.bagsToOrder} বস্তা (মোট ${it.bagsToOrder * 50} কেজি)`).join('\n')
      : '১. দানাদার ডেইরি স্পেশাল ফিড: ১০ বস্তা\n২. গমের ভুসি: ৫ বস্তা';

    return `আসসালামু আলাইকুম।\n${activeSupplier.name} মহোদয়,\n\n"আর এস খামার" (RS Khamar)-এর জন্য আগামী ${reorderDays} দিনের পশুখাদ্য সরবরাহের জরুরি চাহিদা তালিকা নিচে দেওয়া হলো:\n\n${itemListText}\n\nদয়া করে দ্রুততম সময়ে ডেলিভারি দেওয়ার ব্যবস্থা করবেন। বিল ক্যাশ/অনলাইন ট্রানজেকশনে পরিশোধ করা হবে।\n\nপ্রেরক:\nম্যানেজার, আর এস খামার\nমোবাইল: ০১৭০০-০০০০০০`;
  }, [activeSupplier, calculatedRequirements, reorderDays]);

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftMessage);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 3000);
  };

  const handleCreateOrderFromDraft = () => {
    const urgentItems = calculatedRequirements.filter(r => r.bagsToOrder > 0);
    const itemsSummary = urgentItems.length > 0 
      ? urgentItems.map(it => `${it.feedName} (${it.bagsToOrder} বস্তা)`).join(', ')
      : 'পশুখাদ্য ব্যাচ অর্ডার';
    const totalCost = urgentItems.reduce((acc, curr) => acc + curr.estimatedCost, 0) || 15000;

    const newPO = {
      id: `PO-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      date: new Date().toISOString().split('T')[0],
      supplierName: activeSupplier.name,
      items: itemsSummary,
      amountTaka: totalCost,
      status: 'অর্ডার পাঠানো হয়েছে (Ordered)',
      statusColor: 'blue'
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    setActiveOrderTab('orders');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              স্মার্ট সাপ্লাই চেইন ও অটো-রিঅর্ডার
            </span>
            <span className="text-xs font-bold text-slate-500">খাদ্য নিরাপত্তা ও ডিলার ম্যানেজমেন্ট</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>খাদ্য মজুদ ও স্বয়ংক্রিয় ফরমায়েশ ট্র্যাকার (Feed Supply Chain)</span>
          </h3>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveOrderTab('alerts')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeOrderTab === 'alerts' 
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-black shadow-sm' 
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>মজুদ ঘাটতি ({lowStockItems.length})</span>
          </button>
          <button
            onClick={() => setActiveOrderTab('suppliers')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeOrderTab === 'suppliers' 
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-black shadow-sm' 
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>সাপ্লায়ার ডিরেক্টরি</span>
          </button>
          <button
            onClick={() => setActiveOrderTab('orders')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeOrderTab === 'orders' 
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-black shadow-sm' 
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-teal-600" />
            <span>অর্ডার ট্র্যাকিং ({purchaseOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Alerts & Auto-Reorder Calculator */}
      {activeOrderTab === 'alerts' && (
        <div className="space-y-6">
          {/* Days Horizon Controller */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="text-xs font-black text-emerald-950 dark:text-emerald-200">
                  স্বয়ংক্রিয় চাহিদাপত্র পূর্বাভাস (Auto Reorder Horizon)
                </h4>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
                  খামারে থাকা সকল প্রাণীর দৈনিক খাদ্যগ্রহণ হারে আগামী কত দিনের মজুত নিশ্চিত করতে চান?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {[7, 15, 30, 45].map((days) => (
                <button
                  key={days}
                  onClick={() => setReorderDays(days)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    reorderDays === days
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {days} দিন
                </button>
              ))}
            </div>
          </div>

          {/* Low Stock Reorder Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">খাদ্যের নাম</th>
                  <th className="p-3.5">বর্তমান মজুদ</th>
                  <th className="p-3.5">দৈনিক খরচ</th>
                  <th className="p-3.5">{reorderDays} দিনে প্রয়োজন</th>
                  <th className="p-3.5">অর্ডার প্রস্তাব (বস্তা)</th>
                  <th className="p-3.5">আনুমানিক খরচ</th>
                  <th className="p-3.5 text-center">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {calculatedRequirements.map((item) => (
                  <tr key={item.id} className={item.isUrgent ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''}>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 dark:text-white block">{item.feedName}</span>
                      <span className="text-[10px] text-slate-400">প্রতি বস্তা: {item.conversionRatePerBag || 50} কেজি</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold">
                      <span className={item.isUrgent ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                        {item.currentStockKg} কেজি
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                      ~{item.estimatedDailyKg} কেজি/দিন
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {item.neededTotalKg} কেজি
                    </td>
                    <td className="p-3.5">
                      {item.bagsToOrder > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono font-black">
                          {item.bagsToOrder} বস্তা
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold">পর্যাপ্ত মজুদ ✓</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-white">
                      ৳ {item.estimatedCost.toLocaleString('bn-BD')}
                    </td>
                    <td className="p-3.5 text-center">
                      {item.isUrgent ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                          রি-অর্ডার করুন ⚠️
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          নিরাপদ
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Draft & Supplier Requisition Generator */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  ডিলারের জন্য ১-ক্লিক বাংলা ফরমায়েশ ড্রাফট (SMS / WhatsApp)
                </h4>
              </div>

              {/* Select Supplier */}
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
                ))}
              </select>
            </div>

            {/* Draft Text Preview Box */}
            <div className="relative">
              <pre className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed whitespace-pre-wrap select-all">
                {draftMessage}
              </pre>

              <button
                onClick={handleCopyDraft}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {copiedDraft ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>মেসেজ কপি করুন</span>
                  </>
                )}
              </button>
            </div>

            {/* Dispatch Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500">
                ডিলার ফোন: <span className="font-bold text-slate-800 dark:text-slate-200">{activeSupplier.phone}</span> ({activeSupplier.dealerType})
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/88${activeSupplier.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(draftMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp-এ পাঠান</span>
                </a>

                <button
                  onClick={handleCreateOrderFromDraft}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>অর্ডার তালিকাভুক্ত করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Supplier Directory */}
      {activeOrderTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {suppliers.map(s => (
            <div key={s.id} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                  অনুমোদিত ডিলার
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">{s.name}</h4>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{s.dealerType}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{s.address}</p>

                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">সরবরাহকৃত খাদ্য তালিকা:</span>
                  <div className="flex flex-wrap gap-1">
                    {s.suppliedFeeds.map((feed, idx) => (
                      <span key={idx} className="text-[10px] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        {feed}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <a
                  href={`tel:${s.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{s.phone}</span>
                </a>

                <button
                  onClick={() => {
                    setSelectedSupplierId(s.id);
                    setActiveOrderTab('alerts');
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>অর্ডার ড্রাফট</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Order History & Status */}
      {activeOrderTab === 'orders' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">অর্ডার ট্র্যাকিং নং</th>
                  <th className="p-3.5">তারিখ</th>
                  <th className="p-3.5">সরবরাহকারী</th>
                  <th className="p-3.5">আইটেম বিবরণ</th>
                  <th className="p-3.5">মোট মূল্য</th>
                  <th className="p-3.5">বর্তমান স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {purchaseOrders.map((po) => (
                  <tr key={po.id}>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {po.id}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">
                      {po.date}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {po.supplierName}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {po.items}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      ৳ {po.amountTaka.toLocaleString('bn-BD')}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                        po.statusColor === 'emerald'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : po.statusColor === 'amber'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                      }`}>
                        {po.statusColor === 'emerald' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {po.statusColor === 'amber' && <Truck className="w-3 h-3 text-amber-600" />}
                        {po.statusColor === 'blue' && <Clock className="w-3 h-3 text-blue-600" />}
                        <span>{po.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
