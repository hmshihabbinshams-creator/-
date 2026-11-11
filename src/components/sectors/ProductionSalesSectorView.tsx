import React, { useState } from 'react';
import { farmStore } from '../../services/farmStore';
import { CustomerOrder } from '../../types';
import { 
  TrendingUp, ShoppingCart, CheckCircle2, Clock, 
  Trash2, Phone, MapPin, User, FileText, Sparkles, Share2 
} from 'lucide-react';
import { ProductionMetricsDashboard } from '../ProductionMetricsDashboard';

export const ProductionSalesSectorView: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>(() => farmStore.getOrders());
  const [activeTab, setActiveTab] = useState<'trends' | 'orders'>('trends');
  const [orderFilter, setOrderFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Delivered'>('All');

  React.useEffect(() => {
    return farmStore.subscribe(() => {
      setOrders(farmStore.getOrders());
    });
  }, []);

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const confirmedOrders = orders.filter(o => o.status === 'Confirmed').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const totalSalesRevenue = orders
    .filter(o => o.status === 'Delivered' || o.status === 'Confirmed')
    .reduce((acc, o) => acc + (o.agreedPrice || 0), 0);

  const handleOrderAction = (orderId: string, newStatus: 'Confirmed' | 'Delivered' | 'Cancelled') => {
    farmStore.updateOrderStatus(orderId, newStatus);
    setOrders(farmStore.getOrders());
  };

  const filteredOrders = orders.filter(o => orderFilter === 'All' || o.status === orderFilter);

  const handleSyncToWhatsApp = () => {
    const forSaleItems = farmStore.getForSaleLivestock();
    if (forSaleItems.length === 0) {
      alert('বর্তমানে পাবলিক শপে বিক্রির জন্য কোনো পণ্য নেই।');
      return;
    }

    let message = `আসসালামু আলাইকুম, *${farmStore.getInstitutionProfile().name}*-এর বর্তমান বিক্রয়যোগ্য পণ্যের তালিকা:\n\n`;
    
    forSaleItems.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (${item.type})\n`;
      message += `   জাত: ${item.breed}\n`;
      message += `   মূল্য: ${item.sellingPrice.toLocaleString('bn-BD')} ৳\n\n`;
    });

    message += `অর্ডার করতে আমাদের সাথে যোগাযোগ করুন। ধন্যবাদ!`;

    // Create a temporary textarea to copy text
    const el = document.createElement('textarea');
    el.value = message;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    // Open WhatsApp with the message
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. উৎপাদন ও বিক্রয় খাতের ডেডিকেটেড ড্যাশবোর্ড (Dashboard at Top) */}
      <div className="bg-gradient-to-br from-teal-900 via-emerald-950 to-slate-900 rounded-[2.5rem] text-white p-6 sm:p-8 border border-teal-700/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-3xl shadow-inner">
                📊
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">খাতভিত্তিক ড্যাশবোর্ড</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">উৎপাদন ও কাস্টমার সেলস খাত</h2>
                <p className="text-xs text-slate-300 mt-0.5">৩০ দিনের দুধ ও ডিম ফলন অ্যানালিটিক্স এবং কাস্টমার অর্ডার প্রসেসিং</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold">
                লাইভ ট্র্যাকিং সক্রিয়
              </span>
            </div>
          </div>

          {/* 4 Core Production & Sales Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-teal-300 uppercase tracking-widest">৩০ দিনে দুধ সংগ্রহ</p>
              <p className="text-3xl font-black font-mono text-white">৩,৯১২ <span className="text-xs font-normal">L</span></p>
              <p className="text-[10px] text-slate-400 font-medium">দৈনিক গড়: ১৩০.৪ লিটার</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">৩০ দিনে মোট ডিম</p>
              <p className="text-3xl font-black font-mono text-amber-300">২৫,৭৪০ <span className="text-xs font-normal">টি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">দৈনিক গড়: ৮৫৮ টি ডিম</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">পেন্ডিং কাস্টমার অর্ডার</p>
              <p className="text-3xl font-black font-mono text-blue-300">{pendingOrders} <span className="text-xs font-normal">টি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">কনফার্মেশন ও প্রসেসিং অপেক্ষমাণ</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">বুকিং ও সেলস রাজস্ব</p>
              <p className="text-3xl font-black font-mono text-emerald-300">{(totalSalesRevenue / 1000).toFixed(0)} <span className="text-xs font-normal">হাজার ৳</span></p>
              <p className="text-[10px] text-slate-400 font-medium">{deliveredOrders} টি ডেলিভারি সম্পন্ন</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. উৎপাদন চার্ট ও কাস্টমার অর্ডারসমূহ (Below Dashboard) */}
      <div className="space-y-6">
        
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'trends'
                ? 'bg-teal-700 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>৩০ দিনের উৎপাদন গ্রাফ ও মেট্রিক্স</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-teal-700 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>কাস্টমার অর্ডার ও বুকিং তালিকা ({orders.length})</span>
          </button>
        </div>

        {activeTab === 'trends' && <ProductionMetricsDashboard />}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {['All', 'Pending', 'Confirmed', 'Delivered'].map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                      orderFilter === status
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {status === 'All' ? 'সব অর্ডার' : status === 'Pending' ? 'পেন্ডিং' : status === 'Confirmed' ? 'কনফার্মড' : 'ডেলিভার্ড'}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSyncToWhatsApp}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-xs shadow-lg transition-all cursor-pointer transform active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp-এ শেয়ার করুন (Sync)</span>
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="p-4">অর্ডার আইডি ও তারিখ</th>
                      <th className="p-4">গ্রাহকের নাম ও মোবাইল</th>
                      <th className="p-4">পশুর বিবরণ</th>
                      <th className="p-4 text-right">মূল্য (৳)</th>
                      <th className="p-4 text-center">স্ট্যাটাস</th>
                      <th className="p-4 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                          কোনো অর্ডার পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-mono">
                            <span className="font-bold text-slate-900 dark:text-white">#{order.id.slice(0, 8)}</span>
                            <span className="block text-[10px] text-slate-400">{order.date}</span>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-900 dark:text-white">{order.customerName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{order.customerPhone}</p>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">{order.animalName}</span>
                            <span className="block text-[10px] text-slate-400">{order.animalType}</span>
                          </td>
                          <td className="p-4 text-right font-mono font-black text-slate-900 dark:text-white">
                            {order.agreedPrice.toLocaleString('bn-BD')} ৳
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                              order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {order.status === 'Delivered' ? 'ডেলিভারি সম্পন্ন' : order.status === 'Confirmed' ? 'কনফার্মড' : 'পেন্ডিং'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {order.status === 'Pending' && (
                                <button
                                  onClick={() => handleOrderAction(order.id, 'Confirmed')}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] cursor-pointer"
                                >
                                  কনফার্ম
                                </button>
                              )}
                              {order.status !== 'Delivered' && (
                                <button
                                  onClick={() => handleOrderAction(order.id, 'Delivered')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                                >
                                  ডেলিভারি
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
