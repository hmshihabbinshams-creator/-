import React, { useState, useEffect, useMemo } from 'react';
import { farmStore } from '../services/farmStore';
import { LivestockItem } from '../types';

interface PublicStoreProps {
  onBack?: () => void;
}

export const PublicStore: React.FC<PublicStoreProps> = ({ onBack }) => {
  const [forSaleItems, setForSaleItems] = useState<LivestockItem[]>([]);

  useEffect(() => {
    const update = () => {
      setForSaleItems(farmStore.getForSaleLivestock());
    };
    update();
    const unsubscribe = farmStore.subscribe(update);
    return () => unsubscribe();
  }, []);

  const sortedItems = useMemo(() => {
    return [...forSaleItems].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }, [forSaleItems]);

  const getWhatsAppUrl = (item: LivestockItem) => {
    const profile = farmStore.getInstitutionProfile();
    const firstPhone = profile.phone ? profile.phone.split(/[,/]/)[0] : '01712-345678';
    let cleanDigits = firstPhone.replace(/[^0-9]/g, '');
    if (cleanDigits.startsWith('01')) {
      cleanDigits = '88' + cleanDigits;
    } else if (!cleanDigits.startsWith('88') && cleanDigits.length === 10) {
      cleanDigits = '880' + cleanDigits;
    }
    const message = `আসসালামু আলাইকুম, আমি আপনাদের খামারের "${item.name}" (আইডি: ${item.id}) সম্পর্কে জানতে ও অর্ডার করতে আগ্রহী।`;
    return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">আমাদের প্রাকৃতিক খাবার পণ্যসমূহ</h2>

      {/* Items Grid */}
      {sortedItems.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <p className="text-slate-500">বর্তমানে বিক্রির জন্য কোনো প্রাণী নেই।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedItems.map(item => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4"
            >
              <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-5xl">
                {item.photoPlaceholder ? <img src={item.photoPlaceholder} className="w-full h-full object-cover rounded-2xl" /> : <span>{item.type.includes('মাছ') ? '🐟' : '🐄'}</span>}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black">{item.name}</h3>
                <p className="text-xs text-emerald-600 font-bold">{item.sellingPrice?.toLocaleString('bn-BD')} ৳</p>
              </div>
              <a
                href={getWhatsAppUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-[#25D366] text-white font-black text-xs text-center hover:bg-[#128C7E] transition-all"
              >
                অর্ডার করতে মেসেজ দিন
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

