import React from 'react';
import { LivestockDashboard } from './LivestockDashboard';

export const AdminDashboard: React.FC<{
  onOpenEasyEntry?: (category?: any) => void;
}> = ({ onOpenEasyEntry }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-slate-900 mb-6">অ্যাডমিন ড্যাশবোর্ড</h1>
      <LivestockDashboard onOpenEasyEntry={onOpenEasyEntry} />
    </div>
  );
};
