import React, { useState } from 'react';
import { 
  BellRing, CheckCircle2, ShoppingBag, Send, 
  Sparkles, Mail, Phone, ShieldCheck, HeartPulse
} from 'lucide-react';

interface AlertProduct {
  id: string;
  name: string;
  category: string;
  price: string;
  stockStatus: 'স্টক সীমিত' | 'আউট অফ স্টক' | 'আসন্ন প্রিমিয়াম ব্যাচ';
  badgeColor: string;
}

const ALERT_PRODUCTS: AlertProduct[] = [
  {
    id: 'prod-1',
    name: 'খাঁটি সাহীওয়াল ডেইরি কাঁচা দুধ (১ লিটার প্যাক)',
    category: 'ডেইরি ও দুধ',
    price: '৳ ১২০/লিটার',
    stockStatus: 'স্টক সীমিত',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  },
  {
    id: 'prod-2',
    name: 'দেশি ফ্রি-রেঞ্জ অর্গানিক হাঁসের ডিম (১ ডজন)',
    category: 'অর্গানিক ডিম',
    price: '৳ ২৪০/ডজন',
    stockStatus: 'আউট অফ স্টক',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
  },
  {
    id: 'prod-3',
    name: 'গাভীর খাঁটি দানাদার ঘি (৫০০ গ্রাম জার)',
    category: 'ঘি ও ননী',
    price: '৳ ৯৫০/জার',
    stockStatus: 'আউট অফ স্টক',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
  },
  {
    id: 'prod-4',
    name: 'ব্ল্যাক বেঙ্গল খাঁটি খাসির প্রিমিয়াম মিট প্যাক (১ কেজি)',
    category: 'মাংস',
    price: '৳ ১১৫০/কেজি',
    stockStatus: 'আসন্ন প্রিমিয়াম ব্যাচ',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
  }
];

export const ProductStockAlertWidget: React.FC = () => {
  const [selectedProductId, setSelectedProductId] = useState<string>(ALERT_PRODUCTS[0].id);
  const [subscriberName, setSubscriberName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [notifyMethod, setNotifyMethod] = useState<'sms' | 'email' | 'whatsapp'>('sms');
  const [subscribedMessage, setSubscribedMessage] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberName.trim() || !contactInfo.trim()) return;

    const prod = ALERT_PRODUCTS.find(p => p.id === selectedProductId) || ALERT_PRODUCTS[0];

    // Persist in local storage
    try {
      const existing = JSON.parse(localStorage.getItem('rs_farm_product_alerts') || '[]');
      existing.push({
        id: `alert-${Date.now()}`,
        productName: prod.name,
        name: subscriberName,
        contact: contactInfo,
        method: notifyMethod,
        date: new Date().toISOString()
      });
      localStorage.setItem('rs_farm_product_alerts', JSON.stringify(existing));
    } catch (e) {
      console.error(e);
    }

    setSubscribedMessage(`✓ ধন্যবাদ ${subscriberName}! '${prod.name}' স্টকে আসামাত্রই আপনার ${notifyMethod.toUpperCase()} এ নোটিফিকেশন পাঠানো হবে।`);
    setSubscriberName('');
    setContactInfo('');
    setTimeout(() => setSubscribedMessage(null), 6000);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white rounded-[2.5rem] p-6 sm:p-10 border border-emerald-800/80 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 font-extrabold text-[11px] border border-emerald-800 flex items-center gap-1.5 w-max">
            <BellRing className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            <span>প্রোডাক্ট এভেলেবিলিটি স্টক অ্যালার্ট</span>
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
            পছন্দের খামারের পণ্য স্টকে আসার তাৎক্ষণিক নোটিফিকেশন সাবস্ক্রাইব করুন
          </h3>
          <p className="text-xs text-slate-300 font-medium mt-1">
            অর্গানিক ডিম, খাঁটি দুধ ও ঘি স্টক শেষ হয়ে গেলে আবার স্টকে আসার সাথে সাথেই আপনার ফোনে ফ্রি SMS/মেসেজ যাবে।
          </p>
        </div>
      </div>

      {subscribedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-600/90 text-white font-extrabold text-xs shadow-lg animate-in fade-in duration-300 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span>{subscribedMessage}</span>
        </div>
      )}

      {/* Grid: Product Select Cards & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Product Choice Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <span className="text-xs font-bold text-slate-400 block">১. যে পণ্যটির নোটিফিকেশন পেতে চান সেটি নির্বাচন করুন:</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALERT_PRODUCTS.map(p => {
              const isSelected = p.id === selectedProductId;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg'
                      : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400">{p.category}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${p.badgeColor}`}>
                      {p.stockStatus}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-white leading-tight">
                    {p.name}
                  </h4>

                  <p className="text-[11px] font-mono font-bold text-slate-300">
                    মূল্য: {p.price}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Subscriber Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-800/80 p-6 rounded-3xl border border-slate-700 space-y-4">
          <span className="text-xs font-black text-white block">২. আপনার নাম ও যোগাযোগমাধ্যম লিখুন:</span>

          <form onSubmit={handleSubscribe} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">আপনার নাম:</label>
              <input
                type="text"
                required
                placeholder="যেমন: মোঃ তামিম ইকবাল"
                value={subscriberName}
                onChange={(e) => setSubscriberName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">মোবাইল নম্বর বা ইমেইল ঠিকানা:</label>
              <input
                type="text"
                required
                placeholder="যেমন: ০১৭০০-০০০০০০ বা email@domain.com"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">নোটিফিকেশন গ্রহণের মাধ্যম:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sms', label: 'SMS মেসেজ' },
                  { id: 'whatsapp', label: 'WhatsApp' },
                  { id: 'email', label: 'ইমেইল' }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setNotifyMethod(m.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      notifyMethod === m.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Send className="w-4 h-4" />
              <span>ফ্রি স্টক অ্যালার্ট সাবস্ক্রাইব করুন</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
