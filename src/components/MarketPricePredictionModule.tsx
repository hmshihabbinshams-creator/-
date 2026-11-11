import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid, Area, ComposedChart, ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Sparkles, 
  AlertCircle, CheckCircle2, Clock, HelpCircle, ArrowUpRight, 
  ArrowDownRight, Scale, Award, ShoppingBag, Lightbulb
} from 'lucide-react';

type CommodityKey = 'cattle' | 'goat' | 'milk' | 'eggs' | 'fish';

interface PriceDataPoint {
  period: string;
  historicalPrice?: number;
  predictedPrice?: number;
  costThreshold: number;
  isForecast: boolean;
  eventNote?: string;
}

export const MarketPricePredictionModule: React.FC = () => {
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityKey>('cattle');
  const [forecastHorizon, setForecastHorizon] = useState<number>(3); // 3 or 6 months

  // Multi-commodity historical trend + predictive forecasting datasets
  const commodityDatasets: Record<CommodityKey, {
    title: string;
    unit: string;
    currentMarketPrice: number;
    breakEvenCost: number;
    peakPriceExpected: number;
    bestTimeToSell: string;
    recommendation: 'sell_now' | 'hold' | 'do_not_sell';
    recommendationLabel: string;
    expectedGainPercent: number;
    seasonalNote: string;
    timelineData: PriceDataPoint[];
  }> = {
    cattle: {
      title: 'সাহীওয়াল ও উন্নত জাতের গরু/বলদ',
      unit: '৳/পশু',
      currentMarketPrice: 145000,
      breakEvenCost: 110000,
      peakPriceExpected: 178000,
      bestTimeToSell: 'আগামী ঈদুল আযহার ৮-১০ দিন পূর্বে',
      recommendation: 'hold',
      recommendationLabel: 'আরও ৪-৬ সপ্তাহ লালন-পালন করুন (Hold - দ্রুত ঊর্ধ্বমুখী)',
      expectedGainPercent: 22.7,
      seasonalNote: 'কোরবানি মৌসুম সন্নিকটে আসায় বাজারে বড় ও মাঝারি সাইজের সুস্থ বলদের চাহিদা প্রতি সপ্তাহে ৫-৮% হারে বাড়ছে।',
      timelineData: [
        { period: 'জুন (বিগত)', historicalPrice: 125000, costThreshold: 98000, isForecast: false },
        { period: 'জুলাই', historicalPrice: 130000, costThreshold: 100000, isForecast: false },
        { period: 'আগস্ট', historicalPrice: 132000, costThreshold: 102000, isForecast: false },
        { period: 'সেপ্টেম্বর', historicalPrice: 138000, costThreshold: 105000, isForecast: false },
        { period: 'অক্টোবর', historicalPrice: 140000, costThreshold: 108000, isForecast: false },
        { period: 'নভেম্বর (বর্তমান)', historicalPrice: 145000, predictedPrice: 145000, costThreshold: 110000, isForecast: false },
        { period: 'ডিসেম্বর (প্রাক.)', predictedPrice: 154000, costThreshold: 113000, isForecast: true, eventNote: 'শীতের পিক চাহিদা' },
        { period: 'জানুয়ারি (পূর্বাভাস)', predictedPrice: 165000, costThreshold: 116000, isForecast: true, eventNote: 'কোরবানি সংগ্রহ শুরু' },
        { period: 'ফেব্রুয়ারি (পিক সময়)', predictedPrice: 178000, costThreshold: 119000, isForecast: true, eventNote: '🌟 বিক্রয়ের সেরা সময়' },
      ]
    },
    goat: {
      title: 'যমুনাপারি ও ব্ল্যাক বেঙ্গল খাসি',
      unit: '৳/পশু',
      currentMarketPrice: 28000,
      breakEvenCost: 20000,
      peakPriceExpected: 34500,
      bestTimeToSell: 'শীতের উৎসব ও কোরবানির মৌসুমে',
      recommendation: 'hold',
      recommendationLabel: 'ধরে রাখুন (Hold - দর ঊর্ধ্বমুখী)',
      expectedGainPercent: 23.2,
      seasonalNote: 'দেশি উন্নত খাসির স্থানীয় ও ঢাকা-চট্টগ্রামের পাইকারি হাটে সরবরাহ কম থাকায় আগামী মাসগুলোতে দর উল্লেখযোগ্য বৃদ্ধি পাবে।',
      timelineData: [
        { period: 'জুন (বিগত)', historicalPrice: 22000, costThreshold: 17500, isForecast: false },
        { period: 'জুলাই', historicalPrice: 23500, costThreshold: 18000, isForecast: false },
        { period: 'আগস্ট', historicalPrice: 24000, costThreshold: 18500, isForecast: false },
        { period: 'সেপ্টেম্বর', historicalPrice: 25500, costThreshold: 19000, isForecast: false },
        { period: 'অক্টোবর', historicalPrice: 26800, costThreshold: 19500, isForecast: false },
        { period: 'নভেম্বর (বর্তমান)', historicalPrice: 28000, predictedPrice: 28000, costThreshold: 20000, isForecast: false },
        { period: 'ডিসেম্বর (প্রাক.)', predictedPrice: 30000, costThreshold: 20500, isForecast: true, eventNote: 'শীতকালীন বিবাহ উৎসব' },
        { period: 'জানুয়ারি (পূর্বাভাস)', predictedPrice: 32500, costThreshold: 21000, isForecast: true },
        { period: 'ফেব্রুয়ারি (পিক সময়)', predictedPrice: 34500, costThreshold: 21500, isForecast: true, eventNote: '🌟 বিক্রয়ের সেরা পিক দর' },
      ]
    },
    milk: {
      title: 'খাঁটি ডেইরি দুধ (Pure Cow Milk)',
      unit: '৳/লিটার',
      currentMarketPrice: 85,
      breakEvenCost: 62,
      peakPriceExpected: 92,
      bestTimeToSell: 'এখনই নিয়মিত ডেলিভারি চুক্তিতে বিক্রয় করুন',
      recommendation: 'sell_now',
      recommendationLabel: 'এখনই বিক্রয় করুন (Strong Sell - উচ্চ মুনাফা)',
      expectedGainPercent: 8.2,
      seasonalNote: 'শীতকালে মিষ্টি তৈরি ও পরিবারিক ভোগের কারণে ডেইরি দুধের চাহিদা স্থিতিশীল ও ভালো দামে চলমান।',
      timelineData: [
        { period: 'জুন (বিগত)', historicalPrice: 75, costThreshold: 58, isForecast: false },
        { period: 'জুলাই', historicalPrice: 76, costThreshold: 59, isForecast: false },
        { period: 'আগস্ট', historicalPrice: 78, costThreshold: 60, isForecast: false },
        { period: 'সেপ্টেম্বর', historicalPrice: 80, costThreshold: 60, isForecast: false },
        { period: 'অক্টোবর', historicalPrice: 82, costThreshold: 61, isForecast: false },
        { period: 'নভেম্বর (বর্তমান)', historicalPrice: 85, predictedPrice: 85, costThreshold: 62, isForecast: false },
        { period: 'ডিসেম্বর (প্রাক.)', predictedPrice: 88, costThreshold: 63, isForecast: true, eventNote: 'শীতকালীন পিঠা উৎসব' },
        { period: 'জানুয়ারি (পূর্বাভাস)', predictedPrice: 90, costThreshold: 64, isForecast: true },
        { period: 'ফেব্রুয়ারি (পিক সময়)', predictedPrice: 92, costThreshold: 65, isForecast: true, eventNote: '🌟 পিক দর' },
      ]
    },
    eggs: {
      title: 'অর্গানিক সোনালী ও দেশি হাঁসের ডিম',
      unit: '৳/ডজন',
      currentMarketPrice: 170,
      breakEvenCost: 125,
      peakPriceExpected: 185,
      bestTimeToSell: 'চলতি মাস থেকে আগামী ২ মাস নিয়মিত বিক্রয়',
      recommendation: 'sell_now',
      recommendationLabel: 'এখনই বিক্রয় অব্যাহত রাখুন (Active Sell)',
      expectedGainPercent: 8.8,
      seasonalNote: 'শীতের শুরুতে ডিমের বাজারদর সর্বোচ্চ থাকে; মজুদ না রেখে তাজা অবস্থায় বিক্রয় করাই সর্বোত্তম সিদ্ধান্ত।',
      timelineData: [
        { period: 'জুন (বিগত)', historicalPrice: 140, costThreshold: 115, isForecast: false },
        { period: 'জুলাই', historicalPrice: 145, costThreshold: 118, isForecast: false },
        { period: 'আগস্ট', historicalPrice: 150, costThreshold: 120, isForecast: false },
        { period: 'সেপ্টেম্বর', historicalPrice: 158, costThreshold: 122, isForecast: false },
        { period: 'অক্টোবর', historicalPrice: 165, costThreshold: 124, isForecast: false },
        { period: 'নভেম্বর (বর্তমান)', historicalPrice: 170, predictedPrice: 170, costThreshold: 125, isForecast: false },
        { period: 'ডিসেম্বর (প্রাক.)', predictedPrice: 178, costThreshold: 127, isForecast: true, eventNote: 'শীতের চাহিদা' },
        { period: 'জানুয়ারি (পূর্বাভাস)', predictedPrice: 185, costThreshold: 128, isForecast: true, eventNote: '🌟 পিক রেট' },
        { period: 'ফেব্রুয়ারি (হালকা হ্রাস)', predictedPrice: 175, costThreshold: 126, isForecast: true },
      ]
    },
    fish: {
      title: 'মিশ্র কার্প ও বড় তেলাপিয়া মাছ',
      unit: '৳/কেজি',
      currentMarketPrice: 240,
      breakEvenCost: 170,
      peakPriceExpected: 285,
      bestTimeToSell: 'পুকুর সেচ দিয়ে জানুয়ারি মাসে মাছ উত্তোলন',
      recommendation: 'hold',
      recommendationLabel: 'আরও ৩০-৪০ দিন ওজন বাড়ান (Hold)',
      expectedGainPercent: 18.75,
      seasonalNote: 'শীতের শুরুতে বাজারে ছোট মাছ বেশি থাকায় বড় কার্পের দাম ডিসেম্বরের শেষে ২০-২৫% বৃদ্ধি পায়।',
      timelineData: [
        { period: 'জুন (বিগত)', historicalPrice: 200, costThreshold: 155, isForecast: false },
        { period: 'জুলাই', historicalPrice: 210, costThreshold: 160, isForecast: false },
        { period: 'আগস্ট', historicalPrice: 215, costThreshold: 162, isForecast: false },
        { period: 'সেপ্টেম্বর', historicalPrice: 225, costThreshold: 165, isForecast: false },
        { period: 'অক্টোবর', historicalPrice: 230, costThreshold: 168, isForecast: false },
        { period: 'নভেম্বর (বর্তমান)', historicalPrice: 240, predictedPrice: 240, costThreshold: 170, isForecast: false },
        { period: 'ডিসেম্বর (প্রাক.)', predictedPrice: 260, costThreshold: 174, isForecast: true, eventNote: 'বড় মাছের ঘাটতি' },
        { period: 'জানুয়ারি (পূর্বাভাস)', predictedPrice: 285, costThreshold: 178, isForecast: true, eventNote: '🌟 পুকুর সেচ ও বিক্রয়' },
        { period: 'ফেব্রুয়ারি (পিক সময়)', predictedPrice: 275, costThreshold: 176, isForecast: true },
      ]
    }
  };

  const currentDataset = commodityDatasets[selectedCommodity];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              হিস্টোরিক্যাল ডাটা ট্রেন্ড ও বাজারমূল্য প্রেডিকশন
            </span>
            <span className="text-xs font-bold text-slate-500">ম্যানেজারের বিক্রয় সিদ্ধান্ত অ্যালগরিদম</span>
          </div>

          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>বাজারদর পূর্বাভাস ও বিক্রয়ের সেরা সময় নির্ধারণী টুল</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            বিগত ঐতিহাসিক মূল্যের সাথে মৌসুমি চাহিদা ও উৎপাদন খরচের ডেটাসেট বিশ্লেষণ করে সম্ভাব্য ভবিষ্যৎ বাজারদর পূর্বাভাস।
          </p>
        </div>

        {/* Commodity Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          {[
            { id: 'cattle', label: '🐄 গরু/বলদ' },
            { id: 'goat', label: '🐐 খাসি/ছাগল' },
            { id: 'milk', label: '🥛 খাঁটি দুধ' },
            { id: 'eggs', label: '🥚 দেশি ডিম' },
            { id: 'fish', label: '🐟 মৎস্য লট' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCommodity(cat.id as CommodityKey)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedCommodity === cat.id
                  ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Decision Engine Summary Banner */}
      <div className={`p-6 rounded-3xl border-2 space-y-4 ${
        currentDataset.recommendation === 'sell_now'
          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400'
          : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-md ${
              currentDataset.recommendation === 'sell_now'
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-amber-500 text-white shadow-amber-500/30'
            }`}>
              {currentDataset.recommendation === 'sell_now' ? '💰' : '⏳'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                  currentDataset.recommendation === 'sell_now'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}>
                  ম্যানেজারের সিদ্ধান্ত সিগন্যাল
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {currentDataset.title}
                </span>
              </div>

              <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                {currentDataset.recommendationLabel}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                {currentDataset.seasonalNote}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between shrink-0 gap-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase">প্রত্যাশিত অতিরিক্ত মুনাফা</span>
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              +{currentDataset.expectedGainPercent}% লাভ
            </span>
            <span className="text-[11px] text-slate-500 font-bold">
              সেরা সময়: {currentDataset.bestTimeToSell}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            বর্তমান পাইকারি বাজারদর
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
            ৳ {currentDataset.currentMarketPrice.toLocaleString('bn-BD')}{' '}
            <span className="text-xs font-bold font-sans text-slate-400">{currentDataset.unit}</span>
          </p>
          <span className="text-[11px] text-slate-500">চলতি মাসের হালনাগাদ দর</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
            পূর্বাভাসিত পিক বাজারমূল্য
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 dark:text-emerald-300 tabular-nums">
            ৳ {currentDataset.peakPriceExpected.toLocaleString('bn-BD')}{' '}
            <span className="text-xs font-bold font-sans text-emerald-600">{currentDataset.unit}</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-bold">
            আসন্ন উৎসবের প্রত্যাশিত সর্বোচ্চ দর
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            খামারের উৎপাদন ও ব্রেক-ইভেন খরচ
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-slate-700 dark:text-slate-300 tabular-nums">
            ৳ {currentDataset.breakEvenCost.toLocaleString('bn-BD')}{' '}
            <span className="text-xs font-bold font-sans text-slate-400">{currentDataset.unit}</span>
          </p>
          <span className="text-[11px] text-rose-500 font-bold">এই দরের নিচে বিক্রয় লোকসান হবে</span>
        </div>
      </div>

      {/* Main Trend Line Chart (Historical vs Forecasted Price Trend) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>ঐতিহাসিক বাজারদর ও ভবিষ্যৎ পূর্বাভাস ট্রেন্ড-লাইন চার্ট ({currentDataset.title})</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              নীল লাইনটি বিগত ৬ মাসের আসল বাজারদর এবং সবুজ ড্যাশড লাইনটি আগামী মাসগুলোর পূর্বাভাসিত মূল্য নির্দেশ করে।
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-sky-500 inline-block rounded-full" />
              <span className="text-slate-700 dark:text-slate-300">ঐতিহাসিক দর</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-emerald-500 inline-block rounded-full border-t border-dashed border-emerald-500" />
              <span className="text-emerald-600 font-bold">পূর্বাভাস ট্রেন্ড</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-rose-400 inline-block rounded-full" />
              <span className="text-rose-500 font-bold">উৎপাদন খরচ সীমা</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentDataset.timelineData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
              <XAxis dataKey="period" stroke="#64748b" fontSize={11} fontWeight="bold" />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                fontWeight="bold" 
                unit=" ৳"
                tickFormatter={(val) => val >= 1000 ? `${val / 1000}k` : `${val}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '1rem', 
                  color: '#fff', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  padding: '12px'
                }}
                formatter={(val: any, name: any) => {
                  if (!val) return ['-', name];
                  return [`৳ ${val.toLocaleString('bn-BD')}`, name];
                }}
                labelFormatter={(label, payload) => {
                  const pt = payload && payload[0] ? payload[0].payload : null;
                  if (pt && pt.eventNote) {
                    return `${label} • [${pt.eventNote}]`;
                  }
                  return label;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
              
              {/* Reference Threshold: Break-Even Cost */}
              <Line 
                type="monotone" 
                dataKey="costThreshold" 
                name="উৎপাদন খরচ সীমা (Break-Even)" 
                stroke="#f43f5e" 
                strokeWidth={2} 
                strokeDasharray="4 4"
                dot={false}
              />

              {/* Historical Actual Price Line */}
              <Line 
                type="monotone" 
                dataKey="historicalPrice" 
                name="ঐতিহাসিক বাজারমূল্য (Historical)" 
                stroke="#0284c7" 
                strokeWidth={3} 
                dot={{ r: 5, fill: '#0284c7', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 7 }}
              />

              {/* Forecasted Predicted Price Line */}
              <Line 
                type="monotone" 
                dataKey="predictedPrice" 
                name="ভবিষ্যৎ বাজারদর পূর্বাভাস (Forecast)" 
                stroke="#10b981" 
                strokeWidth={4} 
                strokeDasharray="6 6"
                dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actionable Strategy Advice for the Farm Manager */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h4 className="font-black text-sm text-slate-900 dark:text-white">
            ম্যানেজারের জন্য বাজারজাতকরণ ও বিক্রয় কৌশলগত নির্দেশিকা
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>পিক সিজনের ২ সপ্তাহ আগে বুকিং:</span>
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              সরাসরি হাটে নেওয়ার বদলে ডিজিটাল প্ল্যাটফর্ম ও প্রি-অর্ডারে ১০-১৫% বায়না নিয়ে রাখলে মধ্যস্বত্বভোগী ছাড়া সর্বোচ্চ লাভ পাওয়া যায়।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-teal-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ওজন বৃদ্ধির সাথে খাদ্য ব্যয়ের সমন্বয়:</span>
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              পশু বিক্রয়ের শেষ ৩০ দিনে সাশ্রয়ী সাইলেজ ও হাই-এনার্জি ফিড দিলে প্রতি সপ্তাহে ৩-৪ কেজি ওজন বৃদ্ধি ঘটে, যা পিক মূল্যে অতিরিক্ত লাভ এনে দেয়।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>দর পতনের ঝুঁকি এড়ানো:</span>
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              একসাথে সব পশু হাটে না তুলে কিস্তিতে বিক্রি করুন। এতে বাজারের অপ্রত্যাশিত দর পতন থেকে খামার সুরক্ষিত থাকে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
