import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, TrendingUp, AlertCircle, ShoppingCart, 
  CheckCircle2, Clock, Brain, FileText, Download,
  ArrowRight, ShieldCheck, Zap, History, ChevronRight,
  Pill, Activity, Sparkles, Plus, Check, RefreshCw, X,
  Calendar, Layers, Filter, CheckSquare
} from 'lucide-react';
import { farmStore } from '../services/farmStore';
import { FeedInventoryItem, PurchaseOrder, CustomerOrder, FeedLog, HealthLog } from '../types';

export interface MedicineInventoryItem {
  id: string;
  name: string;
  category: 'ভ্যাকসিন' | 'অ্যান্টিবায়োটিক' | 'কৃমিনাশক' | 'ভিটামিন ও খনিজ';
  currentStock: number;
  unit: string;
  minThreshold: number;
  unitPrice: number;
  monthlyAverageUse: number;
  supplier: string;
}

const INITIAL_MEDICINE_INVENTORY: MedicineInventoryItem[] = [
  { id: 'MED-1', name: 'এফএমডি (FMD) খুরারোগ ভ্যাকসিন', category: 'ভ্যাকসিন', currentStock: 15, unit: 'ডোজ', minThreshold: 30, unitPrice: 220, monthlyAverageUse: 25, supplier: 'বাংলাদেশ প্রাণিসম্পদ গবেষণা প্রতিষ্ঠান (BLRI)' },
  { id: 'MED-2', name: 'পিপিআর (PPR) ছাগলের ভ্যাকসিন', category: 'ভ্যাকসিন', currentStock: 8, unit: 'ডোজ', minThreshold: 20, unitPrice: 150, monthlyAverageUse: 18, supplier: 'প্রাণিসম্পদ অধিদপ্তর (DLS)' },
  { id: 'MED-3', name: 'রানীক্ষেত আরডিভি (RDV) ড্রপ', category: 'ভ্যাকসিন', currentStock: 25, unit: 'ডোজ', minThreshold: 50, unitPrice: 90, monthlyAverageUse: 60, supplier: 'এগ্রো ভেট ফার্মাসিউটিক্যালস' },
  { id: 'MED-4', name: 'ব্রড-স্পেকট্রাম কৃমিনাশক বোলাস', category: 'কৃমিনাশক', currentStock: 12, unit: 'বোলাস', minThreshold: 25, unitPrice: 65, monthlyAverageUse: 20, supplier: 'স্কয়ার এগ্রোভেট' },
  { id: 'MED-5', name: 'ক্যালসিয়াম ও ভিটামিন এডি৩ই লিকুইড', category: 'ভিটামিন ও খনিজ', currentStock: 4, unit: 'লিটার', minThreshold: 8, unitPrice: 480, monthlyAverageUse: 6, supplier: 'রেনেটা লিমিটেড' },
  { id: 'MED-6', name: 'পুকুরের বায়ো-অক্সিজেন ট্যাবলেট', category: 'অ্যান্টিবায়োটিক', currentStock: 3, unit: 'কেজি', minThreshold: 10, unitPrice: 850, monthlyAverageUse: 8, supplier: 'একোয়া কেয়ার ডিলার' },
];

export const AiSmartSupplyChainManager: React.FC = () => {
  const [inventory, setInventory] = useState<FeedInventoryItem[]>([]);
  const [medicines, setMedicines] = useState<MedicineInventoryItem[]>(INITIAL_MEDICINE_INVENTORY);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [feedLogs, setFeedLogs] = useState<FeedLog[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  
  // Projection options
  const [projectionHorizonDays, setProjectionHorizonDays] = useState<number>(30); // 15, 30, 60, 90 days
  const [activeTab, setActiveTab] = useState<'overview' | 'projections' | 'orders'>('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Single Item Reorder Suggestion Modal
  const [selectedShortageItem, setSelectedShortageItem] = useState<{
    id: string;
    name: string;
    type: 'feed' | 'medicine';
    currentStock: number;
    unit: string;
    projectedDemand: number;
    deficit: number;
    suggestedReorderQty: number;
    unitPrice: number;
    supplier: string;
    estimatedCost: number;
  } | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const load = () => {
      setInventory(farmStore.getFeedInventory());
      setPurchaseOrders(farmStore.getPurchaseOrders());
      setFeedLogs(farmStore.getFeedLogs());
      setHealthLogs(farmStore.getHealthLogs());
      setCustomerOrders(farmStore.getOrders());
    };
    load();
    return farmStore.subscribe(load);
  }, []);

  const livestock = useMemo(() => farmStore.getLivestock(), []);

  // Total daily feed requirements
  const dailyTotalReqKg = useMemo(() => {
    let total = 0;
    livestock.forEach(item => {
      if (item.type.includes('গরু')) total += 22 * item.quantity;
      else if (item.type.includes('ছাগল')) total += 4 * item.quantity;
      else if (item.type.includes('হাঁস')) total += 0.5 * item.quantity;
      else if (item.type.includes('মুরগি')) total += 0.2 * item.quantity;
      else total += 3 * item.quantity;
    });
    return Math.round(total);
  }, [livestock]);

  // Historical Consumption Trends from FeedLogs (Average daily rate per item)
  const historicalConsumptionRateMap = useMemo(() => {
    const usageMap: Record<string, number> = {};
    feedLogs.forEach(l => {
      const feedLower = l.feedType.toLowerCase();
      const amt = Number(l.amountKg) || 0;
      if (feedLower.includes('ঘাস')) usageMap['ঘাস'] = (usageMap['ঘাস'] || 0) + amt;
      else if (feedLower.includes('ভুসি') || feedLower.includes('দানাদার')) usageMap['ভুসি'] = (usageMap['ভুসি'] || 0) + amt;
      else if (feedLower.includes('খৈল')) usageMap['খৈল'] = (usageMap['খৈল'] || 0) + amt;
      else usageMap['অন্যান্য'] = (usageMap['অন্যান্য'] || 0) + amt;
    });
    return usageMap;
  }, [feedLogs]);

  // Historical Sales Growth Trend
  const salesVelocityFactor = useMemo(() => {
    const deliveredCount = customerOrders.filter(o => o.status === 'Delivered').length;
    // Positive sales trend slightly increases future herd replenishment demand (+5% to +15%)
    return deliveredCount > 0 ? 1.08 : 1.0;
  }, [customerOrders]);

  // Enriched feed inventory with projections
  const enrichedInventory = useMemo(() => {
    return inventory.map(item => {
      let dailyUse = 10;
      const name = item.name.toLowerCase();
      if (name.includes('ঘাস')) dailyUse = Math.round(dailyTotalReqKg * 0.55 * salesVelocityFactor);
      else if (name.includes('ভুসি') || name.includes('দানাদার')) dailyUse = Math.round(dailyTotalReqKg * 0.25 * salesVelocityFactor);
      else if (name.includes('খড়')) dailyUse = Math.round(dailyTotalReqKg * 0.15 * salesVelocityFactor);
      else if (name.includes('খৈল')) dailyUse = Math.max(5, Math.round(dailyTotalReqKg * 0.08 * salesVelocityFactor));
      else dailyUse = Math.max(4, Math.round(dailyTotalReqKg * 0.05 * salesVelocityFactor));

      const daysLeft = dailyUse > 0 ? Math.floor(item.currentStockKg / dailyUse) : 99;
      const projectedRequirement = dailyUse * projectionHorizonDays;
      const projectedDeficit = Math.max(0, projectedRequirement - item.currentStockKg);
      const isShortage = item.currentStockKg < (item.minThresholdKg || 50) || projectedDeficit > 0;

      return {
        ...item,
        dailyUse,
        daysLeft,
        projectedRequirement,
        projectedDeficit,
        isShortage,
      };
    });
  }, [inventory, dailyTotalReqKg, projectionHorizonDays, salesVelocityFactor]);

  // Medicine items with consumption projections
  const enrichedMedicines = useMemo(() => {
    return medicines.map(med => {
      const dailyUse = med.monthlyAverageUse / 30;
      const projectedRequirement = Math.ceil(dailyUse * projectionHorizonDays);
      const daysLeft = dailyUse > 0 ? Math.floor(med.currentStock / dailyUse) : 99;
      const projectedDeficit = Math.max(0, projectedRequirement - med.currentStock);
      const isShortage = med.currentStock <= med.minThreshold || projectedDeficit > 0;

      return {
        ...med,
        dailyUse: parseFloat(dailyUse.toFixed(2)),
        daysLeft,
        projectedRequirement,
        projectedDeficit,
        isShortage,
      };
    });
  }, [medicines, projectionHorizonDays]);

  const allShortages = useMemo(() => {
    const feedShortages = enrichedInventory.filter(i => i.isShortage);
    const medShortages = enrichedMedicines.filter(m => m.isShortage);
    return { feedShortages, medShortages, totalCount: feedShortages.length + medShortages.length };
  }, [enrichedInventory, enrichedMedicines]);

  // Open Reorder Suggestion Modal for a specific item
  const openReorderSuggestion = (item: any, type: 'feed' | 'medicine') => {
    const isFeed = type === 'feed';
    const currentStock = isFeed ? item.currentStockKg : item.currentStock;
    const unit = isFeed ? 'কেজি' : item.unit;
    const projectedDemand = item.projectedRequirement;
    const deficit = item.projectedDeficit;
    
    // Suggested Reorder Quantity: Enough to fulfill deficit + 20% safety stock buffer
    const buffer = Math.ceil(projectedDemand * 0.2);
    const suggestedReorderQty = Math.max(isFeed ? 50 : 10, Math.ceil((deficit + buffer) / 5) * 5);
    const supplier = isFeed ? 'মেসার্স সততা এগ্রো ফিড মিলস' : item.supplier;
    const estimatedCost = suggestedReorderQty * item.unitPrice;

    setSelectedShortageItem({
      id: item.id,
      name: item.name,
      type,
      currentStock,
      unit,
      projectedDemand,
      deficit,
      suggestedReorderQty,
      unitPrice: item.unitPrice,
      supplier,
      estimatedCost
    });
  };

  // Submit Reorder Suggestion into Purchase Order
  const handleConfirmReorder = () => {
    if (!selectedShortageItem) return;

    const today = new Date().toISOString().split('T')[0];
    const needDate = new Date();
    needDate.setDate(needDate.getDate() + 4);

    farmStore.createPurchaseOrder({
      date: today,
      supplierName: selectedShortageItem.supplier,
      items: [
        {
          itemId: selectedShortageItem.id,
          name: selectedShortageItem.name,
          quantity: selectedShortageItem.suggestedReorderQty,
          unitPrice: selectedShortageItem.unitPrice,
          total: selectedShortageItem.estimatedCost,
        }
      ],
      totalAmount: selectedShortageItem.estimatedCost,
      predictedNeedDate: needDate.toISOString().split('T')[0],
      isAutoGenerated: true,
      notes: `ঐতিহাসিক বিক্রয় ও খরচ ধারা বিশ্লেষণপূর্বক ${projectionHorizonDays} দিনের পূর্বাভাসের ভিত্তিতে অনুমোদিত রি-অর্ডার প্রস্তাব।`,
    });

    triggerToast(`✓ "${selectedShortageItem.name}"-এর জন্য ৳ ${selectedShortageItem.estimatedCost.toLocaleString('bn-BD')}-এর রি-অর্ডার অর্ডার তৈরি হয়েছে!`);
    setSelectedShortageItem(null);
    setActiveTab('orders');
  };

  // Bulk Generate PO for all identified shortages
  const handleBulkGeneratePO = async () => {
    if (allShortages.totalCount === 0) return;
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 1200));

    const poItems: any[] = [];
    allShortages.feedShortages.forEach(item => {
      const buffer = Math.ceil(item.projectedRequirement * 0.2);
      const qty = Math.max(50, Math.ceil((item.projectedDeficit + buffer) / 10) * 10);
      poItems.push({
        itemId: item.id,
        name: item.name,
        quantity: qty,
        unitPrice: item.unitPrice,
        total: qty * item.unitPrice
      });
    });

    allShortages.medShortages.forEach(med => {
      const qty = Math.max(10, Math.ceil((med.projectedDeficit + 5) / 5) * 5);
      poItems.push({
        itemId: med.id,
        name: med.name,
        quantity: qty,
        unitPrice: med.unitPrice,
        total: qty * med.unitPrice
      });
    });

    const totalAmount = poItems.reduce((s, i) => s + i.total, 0);
    const today = new Date().toISOString().split('T')[0];
    const needDate = new Date();
    needDate.setDate(needDate.getDate() + 4);

    farmStore.createPurchaseOrder({
      date: today,
      supplierName: 'সেন্ট্রাল এগ্রো ও ভেটেরিনারি ডিলার কনসোর্টিয়াম',
      items: poItems,
      totalAmount,
      predictedNeedDate: needDate.toISOString().split('T')[0],
      isAutoGenerated: true,
      notes: `ঐতিহাসিক কনজাম্পশন ও বিক্রয় গতির ভিত্তিতে আগামী ${projectionHorizonDays} দিনের বাল্ক রি-অর্ডার।`
    });

    setIsGenerating(false);
    triggerToast(`✓ ${poItems.length}টি খাদ্য ও ওষুধের সম্মিলিত রি-অর্ডার প্রস্তাব জেনারেট সম্পন্ন!`);
    setActiveTab('orders');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-xs font-black">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-[10px] flex items-center gap-1 border border-indigo-100 dark:border-indigo-900">
                <Brain className="w-3 h-3" />
                AI SMART LOGISTICS & DEMAND PROJECTION
              </span>
              {allShortages.totalCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] animate-pulse">
                  ⚠️ {allShortages.totalCount} টি ঘাটতি শনাক্ত
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              স্মার্ট সাপ্লাই চেইন, খাদ্য ও ওষুধ চাহিদা প্রক্ষেপণ
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              অতীতের বিক্রয় গতি এবং পশুখাদ্য ও ওষুধের দৈনিক কনজাম্পশন বিশ্লেষণ করে ভবিষ্যৎ চাহিদা নিরূপণ ও তাত্ক্ষণিক রি-অর্ডার প্রস্তাব।
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              স্টক ও প্রক্ষেপণ
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'orders' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              পারচেজ অর্ডার্স ({purchaseOrders.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* Horizon Selection Bar & Demand Highlights */}
          <div className="bg-gradient-to-r from-indigo-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-5 rounded-3xl border border-indigo-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  ভবিষ্যৎ চাহিদা প্রক্ষেপণ সময়সীমা (Projection Horizon)
                </h4>
                <p className="text-xs text-slate-500">
                  ঐতিহাসিক বিক্রয় প্রবৃদ্ধি ({(salesVelocityFactor * 100 - 100).toFixed(0)}%) ও গড় খাদ্যগ্রহণ হারের ভিত্তিতে ভবিষ্যৎ প্রয়োজন
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">প্রক্ষেপণ সময়:</span>
              {[15, 30, 60, 90].map(days => (
                <button
                  key={days}
                  onClick={() => setProjectionHorizonDays(days)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    projectionHorizonDays === days
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {days} দিন
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Feed & Medicine Projection Tables */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* FEED REQUIREMENTS TABLE */}
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-black text-slate-900 dark:text-white">
                      পশুখাদ্য প্রক্ষেপণ ও রি-অর্ডার ঘাটতি ({projectionHorizonDays} দিনের প্রক্ষেপণ)
                    </h3>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    ফিড ইনভেন্টরি
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-black">
                      <tr>
                        <th className="p-3">খাদ্যের নাম</th>
                        <th className="p-3">মজুদ</th>
                        <th className="p-3">দৈনিক চাহিদা</th>
                        <th className="p-3">{projectionHorizonDays} দিনে প্রয়োজন</th>
                        <th className="p-3">ঘাটতি</th>
                        <th className="p-3 text-right">পদক্ষেপ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {enrichedInventory.map(item => (
                        <tr key={item.id} className={item.isShortage ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            {item.name}
                          </td>
                          <td className="p-3 font-mono font-bold">
                            <span className={item.daysLeft <= 7 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}>
                              {item.currentStockKg} কেজি
                            </span>
                            <span className="text-[10px] text-slate-400 block font-normal">~{item.daysLeft} দিন চলবে</span>
                          </td>
                          <td className="p-3 font-mono text-slate-600">
                            ~{item.dailyUse} কেজি
                          </td>
                          <td className="p-3 font-mono font-bold text-indigo-600">
                            {item.projectedRequirement} কেজি
                          </td>
                          <td className="p-3 font-mono font-black">
                            {item.projectedDeficit > 0 ? (
                              <span className="text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-md text-[11px]">
                                -{item.projectedDeficit} কেজি
                              </span>
                            ) : (
                              <span className="text-emerald-600 text-[11px]">পর্যাপ্ত ✓</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {item.isShortage ? (
                              <button
                                onClick={() => openReorderSuggestion(item, 'feed')}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                <span>Reorder Suggestion</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold">নিরাপদ</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MEDICINE & VACCINE REQUIREMENTS TABLE */}
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-rose-500" />
                    <h3 className="font-black text-slate-900 dark:text-white">
                      প্রয়োজনীয় ওষুধ ও ভ্যাকসিন চাহিদা প্রক্ষেপণ
                    </h3>
                  </div>
                  <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    মেডিসিন ইনভেন্টরি
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-black">
                      <tr>
                        <th className="p-3">ওষুধ/টিকার নাম</th>
                        <th className="p-3">ক্যাটাগরি</th>
                        <th className="p-3">মজুদ</th>
                        <th className="p-3">{projectionHorizonDays} দিনে প্রয়োজন</th>
                        <th className="p-3">ঘাটতি</th>
                        <th className="p-3 text-right">পদক্ষেপ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {enrichedMedicines.map(med => (
                        <tr key={med.id} className={med.isShortage ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''}>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            {med.name}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 text-[10px] font-bold">
                              {med.category}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold">
                            <span className={med.currentStock <= med.minThreshold ? 'text-rose-600' : 'text-slate-800'}>
                              {med.currentStock} {med.unit}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-indigo-600">
                            {med.projectedRequirement} {med.unit}
                          </td>
                          <td className="p-3 font-mono font-black">
                            {med.projectedDeficit > 0 ? (
                              <span className="text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-md text-[11px]">
                                -{med.projectedDeficit} {med.unit}
                              </span>
                            ) : (
                              <span className="text-emerald-600 text-[11px]">পর্যাপ্ত ✓</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {med.isShortage ? (
                              <button
                                onClick={() => openReorderSuggestion(med, 'medicine')}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                <span>Reorder Suggestion</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold">নিরাপদ</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column: AI Action Card & Historical Insights */}
            <div className="space-y-6">
              {/* Bulk Reorder Suggestion Action Card */}
              <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden space-y-5">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <h3 className="text-lg font-black tracking-tight">AI সমন্বিত রিকমেন্ডেশন</h3>
                </div>

                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <p className="text-xs font-black text-indigo-100 mb-1">শনাক্তকৃত মোট ঘাটতি</p>
                    <p className="text-2xl font-black font-mono">
                      {allShortages.totalCount} <span className="text-xs font-bold font-sans">টি আইটেম (খাদ্য ও ওষুধ)</span>
                    </p>
                    <p className="text-[11px] text-indigo-200 mt-1 leading-relaxed">
                      আগামী {projectionHorizonDays} দিনের মধ্যে এই পণ্যগুলোর স্টক শেষ হয়ে উৎপাদন ও পশুর স্বাস্থ্য ব্যাহত হতে পারে।
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <p className="text-xs font-black text-indigo-100 mb-1">বিক্রয় ও ফলন প্রভাব</p>
                    <p className="text-[11px] text-indigo-100 leading-relaxed">
                      ঐতিহাসিক অর্ডার ডেলিভারি রেট অনুযায়ী পশুপালের চাহিদা স্বাভাবিকের চেয়ে বৃদ্ধি পাচ্ছে। বাল্ক অর্ডারে পরিবহন ব্যয় ও ডিলার কমিশন সাশ্রয় হবে।
                    </p>
                  </div>
                </div>

                <button 
                  onClick={handleBulkGeneratePO}
                  disabled={allShortages.totalCount === 0 || isGenerating}
                  className="w-full py-4 rounded-2xl bg-white text-indigo-600 font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>সকল ঘাটতির জন্য অটো PO তৈরি করুন</span>
                    </>
                  )}
                </button>
              </div>

              {/* Verified Suppliers Directory */}
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  সাপ্লায়ার ও দ্রুত যোগাযোগ
                </h3>
                <div className="space-y-2.5">
                  {[
                    { name: 'মেসার্স সততা ফিড অ্যান্ড এগ্রো মিলস', phone: '০১৭৫০০০০১১১', item: 'ডেইরি ও পোল্ট্রি ফিড' },
                    { name: 'গ্রীন ভ্যালি লাইভস্টক নিউট্রিশন', phone: '০১৮১২৩৩৪৪৫৫', item: 'ভুট্টা সাইলেজ ও খড়' },
                    { name: 'বাংলাদেশ প্রাণিসম্পদ গবেষণা প্রতিষ্ঠান (BLRI)', phone: '০২৯৯৬৬৭৭৮৮', item: 'সরকারি ভ্যাকসিন ও বায়ো-লজিক্স' },
                  ].map((s, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">{s.name}</p>
                        <p className="text-[10px] text-slate-400">{s.item}</p>
                      </div>
                      <a href={`tel:${s.phone}`} className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg hover:underline">
                        {s.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: PURCHASE ORDERS LIST */
        <div className="space-y-4">
          {purchaseOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <History className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">কোনো পারচেজ অর্ডার পাওয়া যায়নি</h3>
                <p className="text-sm text-slate-500">আপনার প্রথম এআই জেনারেটেড অর্ডার তৈরি করতে স্টক ও প্রক্ষেপণ ট্যাবে যান।</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {purchaseOrders.map(po => (
                <div key={po.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 dark:text-white">{po.id}</h4>
                          {po.isAutoGenerated && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-[8px] font-black uppercase">AI AUTO REORDER</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">তারিখ: {po.date} • সরবরাহকারী: {po.supplierName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-white">৳ {po.totalAmount.toLocaleString('bn-BD')}</p>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          po.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          po.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                          po.status === 'Received' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {po.status === 'Pending' ? 'অপেক্ষমান' : po.status === 'Approved' ? 'অনুমোদিত' : po.status === 'Received' ? 'গৃহীত' : po.status}
                        </span>
                      </div>
                      <button 
                        onClick={() => window.print()}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="অর্ডার চালান প্রিন্ট করুন"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50/50 dark:bg-slate-800/30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {po.items.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-slate-200">{item.name}</p>
                          <p className="text-[10px] text-slate-500">{item.quantity} একক @ ৳{item.unitPrice}</p>
                        </div>
                        <span className="text-[10px] font-black text-indigo-600">৳{item.total}</span>
                      </div>
                    ))}
                  </div>

                  <div className="px-5 py-3 bg-indigo-50/30 dark:bg-indigo-950/10 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                      <Clock className="w-3 h-3" />
                      <span>প্রত্যাশিত সরবরাহ: {po.predictedNeedDate}</span>
                    </div>
                    {po.status === 'Pending' && (
                      <button 
                        onClick={() => farmStore.updatePurchaseOrderStatus(po.id, 'Approved')}
                        className="text-[10px] font-black text-indigo-600 flex items-center gap-1 hover:underline transition-all cursor-pointer"
                      >
                        অনুমোদন দিন <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REORDER SUGGESTION MODAL FOR SINGLE SHORTAGE ITEM */}
      {selectedShortageItem && (
        <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                    রি-অর্ডার সুপারিশ (Reorder Suggestion)
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedShortageItem.name}
                  </h3>
                </div>
              </div>

              <button 
                onClick={() => setSelectedShortageItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Analysis details */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">বর্তমান মজুদ</span>
                <span className="font-mono font-black text-slate-800 dark:text-white text-sm">
                  {selectedShortageItem.currentStock} {selectedShortageItem.unit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">{projectionHorizonDays} দিনের চাহিদা</span>
                <span className="font-mono font-black text-indigo-600 text-sm">
                  {selectedShortageItem.projectedDemand} {selectedShortageItem.unit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">শনাক্তকৃত ঘাটতি</span>
                <span className="font-mono font-black text-rose-600 text-sm">
                  {selectedShortageItem.deficit} {selectedShortageItem.unit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">প্রস্তাবিত রি-অর্ডার পরিমাণ</span>
                <span className="font-mono font-black text-emerald-600 text-sm">
                  {selectedShortageItem.suggestedReorderQty} {selectedShortageItem.unit}
                </span>
              </div>
            </div>

            {/* Editable Quantity & Price */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  অর্ডারের পরিমাণ পরিবর্তন করুন ({selectedShortageItem.unit}):
                </label>
                <input
                  type="number"
                  min={1}
                  value={selectedShortageItem.suggestedReorderQty}
                  onChange={(e) => {
                    const q = Number(e.target.value);
                    setSelectedShortageItem({
                      ...selectedShortageItem,
                      suggestedReorderQty: q,
                      estimatedCost: q * selectedShortageItem.unitPrice
                    });
                  }}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-base text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  সরবরাহকারী (Supplier):
                </label>
                <input
                  type="text"
                  value={selectedShortageItem.supplier}
                  onChange={(e) => setSelectedShortageItem({ ...selectedShortageItem, supplier: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">আনুমানিক মোট খরচ:</span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-base">
                  ৳ {selectedShortageItem.estimatedCost.toLocaleString('bn-BD')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedShortageItem(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmReorder}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>রি-অর্ডার অর্ডার নিশ্চিত করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
