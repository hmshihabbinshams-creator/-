import React, { useState, useEffect } from 'react';
import { NavTab } from './types';
import { farmStore } from './services/farmStore';
import { authService, AdminUser } from './services/authService';
import { Sidebar } from './components/Sidebar';
import { PublicHome } from './components/PublicHome';
import { PublicStore } from './components/PublicStore';
import { AdminPanel, AdminTab } from './components/AdminPanel';
import { EasyEntryModal } from './components/EasyEntryModal';
import { UsernameLoginModal } from './components/UsernameLoginModal';
import { ArrowLeft, Zap, Bell, Search, Mic, Lock, User, LogOut, ShieldCheck } from 'lucide-react';
import { AlertCenterPopover } from './components/AlertCenterPopover';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { VoiceWaveVisualizer } from './components/VoiceWaveVisualizer';
import { GeminiChatbot } from './components/GeminiChatbot';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('main_dashboard');
  const [history, setHistory] = useState<NavTab[]>(['home']);
  const [profile, setProfile] = useState(farmStore.getInstitutionProfile());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Auth states
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => authService.getCurrentUser());
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [isEasyEntryOpen, setIsEasyEntryOpen] = useState(false);
  const [easyEntryCategory, setEasyEntryCategory] = useState<'milk' | 'eggs' | 'feed' | 'add_animal' | 'health' | 'cash' | 'fish'>('milk');
  
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('rs_theme');
    return stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('rs_theme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  const openEasyEntry = (cat?: 'milk' | 'eggs' | 'feed' | 'add_animal' | 'health' | 'cash' | 'fish') => {
    if (cat) setEasyEntryCategory(cat);
    setIsEasyEntryOpen(true);
  };

  useEffect(() => {
    const update = () => {
      setProfile(farmStore.getInstitutionProfile());
    };
    update();
    const unsubStore = farmStore.subscribe(update);
    const unsubAuthService = authService.subscribe(() => setAdminUser(authService.getCurrentUser()));
    const unsubFirebaseAuth = onAuthStateChanged(auth, u => setFirebaseUser(u));

    return () => {
      unsubStore();
      unsubAuthService();
      unsubFirebaseAuth();
    };
  }, []);

  const isAuthenticated = !!adminUser || !!firebaseUser;

  const handleTabChange = (tab: NavTab) => {
    if (tab === 'admin' && !isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    if (tab !== currentTab) {
      setHistory(prev => [...prev, tab]);
      setCurrentTab(tab);
      setIsSidebarOpen(false);
    }
  };

  const handleGoBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previousTab = newHistory[newHistory.length - 1] || 'home';
      setHistory(newHistory);
      setCurrentTab(previousTab);
    } else {
      setCurrentTab('home');
    }
  };

  const handleLogout = () => {
    authService.logout();
    if (firebaseUser) signOut(auth);
    setCurrentTab('home');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
        
        {/* Mobile Sidebar Overlay (Admin Panel Only) */}
        {currentTab === 'admin' && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation (Admin Panel Only) */}
        {currentTab === 'admin' && (
          <div className={`fixed lg:sticky top-0 left-0 z-[70] h-screen transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <Sidebar 
              currentTab={currentTab} 
              onTabChange={handleTabChange}
              adminTab={adminTab}
              onAdminTabChange={(tab) => {
                setAdminTab(tab);
                setIsSidebarOpen(false);
              }}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          
          {/* Content Header (Context-Aware: Public vs Admin) */}
          <header className="h-16 shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 z-30 transition-all">
            
            {/* Left: Branding */}
            <div className="flex items-center gap-3">
               {currentTab === 'admin' && (
                 <button 
                   onClick={() => setIsSidebarOpen(true)}
                   className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer lg:hidden"
                 >
                    <Zap className="w-5 h-5 text-emerald-600" />
                 </button>
               )}

               <div className="flex items-center gap-2">
                  {currentTab === 'admin' ? (
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-emerald-600">
                      <span className="text-sm">🌾</span>
                      <span>খামার ম্যানেজমেন্ট প্যানেল</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🌾</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{profile.name}</span>
                    </div>
                  )}
               </div>
            </div>

            {/* Center: Public Navigation Tabs (Only in Public View) */}
            {currentTab !== 'admin' && (
              <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
                <button
                  onClick={() => setCurrentTab('home')}
                  className={`transition-all cursor-pointer ${
                    currentTab === 'home'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  হোম
                </button>
                <button
                  onClick={() => setCurrentTab('store')}
                  className={`transition-all cursor-pointer ${
                    currentTab === 'store'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  পণ্য শপ
                </button>
              </nav>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
               {currentTab === 'admin' ? (
                 <>
                   {isListening && <VoiceWaveVisualizer />}
                   <AlertCenterPopover onTabChange={handleTabChange} onSelectAdminTab={setAdminTab} />
                   <button
                      onClick={() => setIsVoiceAssistantOpen(true)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      <Mic className="w-4 h-4 text-emerald-600" />
                    </button>
                   <button
                     onClick={() => openEasyEntry()}
                     className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                   >
                     <Zap className="w-3.5 h-3.5 fill-current" />
                     <span>দ্রুত ইনপুট</span>
                   </button>
                 </>
               ) : (
                 <div className="flex items-center gap-2">
                   {isAuthenticated ? (
                     <>
                       <button
                         onClick={() => setCurrentTab('admin')}
                         className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold transition-all cursor-pointer border border-emerald-600/20"
                       >
                         <ShieldCheck className="w-3.5 h-3.5" />
                         <span>ম্যানেজমেন্ট</span>
                       </button>
                       <button
                         onClick={handleLogout}
                         className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                         title="লগ আউট"
                       >
                         <LogOut className="w-3.5 h-3.5" />
                       </button>
                     </>
                   ) : (
                     <button
                       onClick={() => setIsLoginModalOpen(true)}
                       className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-[10px] font-black transition-all shadow-md cursor-pointer border border-slate-700"
                     >
                       <Lock className="w-3 h-3 text-emerald-400" />
                       <span>অ্যাডমিন লগইন</span>
                     </button>
                   )}
                 </div>
               )}
            </div>
          </header>

          {/* View Container */}
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="animate-in fade-in duration-500">
              {currentTab === 'home' && <PublicHome onTabChange={handleTabChange} />}
              {currentTab === 'store' && <PublicStore onBack={handleGoBack} />}
              {currentTab === 'admin' && (
                isAuthenticated ? (
                  <AdminPanel 
                    onBack={handleGoBack} 
                    onOpenEasyEntry={openEasyEntry} 
                    initialTab={adminTab}
                    onTabChange={setAdminTab}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                  />
                ) : (
                  <div className="p-8 max-w-lg mx-auto my-16 text-center space-y-4 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-3xl mx-auto">
                      🔒
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">অ্যাডমিন প্যানেল সংরক্ষিত</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      অ্যাডমিন প্যানেলে শুধুমাত্র নিবন্ধিত ইউজারনেম ও পাসওয়ার্ড দিয়ে প্রবেশ করা যাবে।
                    </p>
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all cursor-pointer"
                    >
                      ইউজারনেম দিয়ে লগইন করুন
                    </button>
                  </div>
                )
              )}
            </div>
          </main>
        </div>

        {/* Username Login Modal */}
        <UsernameLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={() => {
            setCurrentTab('admin');
          }}
        />

        {/* Voice Assistant Modal */}
        <VoiceAssistantModal
          isOpen={isVoiceAssistantOpen}
          onClose={() => setIsVoiceAssistantOpen(false)}
          onTabChange={handleTabChange}
          onOpenEasyEntry={openEasyEntry}
          onSelectAdminTab={setAdminTab}
          onListeningChange={setIsListening}
        />

        {/* Easy Entry Modal */}
        <EasyEntryModal
          isOpen={isEasyEntryOpen}
          onClose={() => setIsEasyEntryOpen(false)}
          defaultCategory={easyEntryCategory}
        />

        {/* Gemini AI Floating Chatbot (Admin Panel Only) */}
        {currentTab === 'admin' && <GeminiChatbot />}
      </div>
    </div>
  );
}

export default App;
