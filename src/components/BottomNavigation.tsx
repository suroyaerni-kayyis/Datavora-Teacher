import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck2, 
  GraduationCap, 
  CalendarRange, 
  MoreHorizontal,
  WalletCards,
  BookOpen,
  FileText,
  Settings,
  X
} from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
}) => {
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const { themeConfig, actualTheme } = useTheme();

  const navBg = actualTheme === 'dark' ? themeConfig.bottomNavBgDark : themeConfig.bottomNavBgLight;
  const navBorder = actualTheme === 'dark' ? themeConfig.bottomNavBorderDark : themeConfig.bottomNavBorderLight;
  const drawerBg = actualTheme === 'dark' ? themeConfig.bottomNavDrawerBgDark : themeConfig.bottomNavDrawerBgLight;

  const primaryTabs = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'siswa' as ActiveTab, label: 'Siswa', icon: Users },
    { id: 'absensi' as ActiveTab, label: 'Absensi', icon: CalendarCheck2 },
    { id: 'nilai' as ActiveTab, label: 'Nilai', icon: GraduationCap },
    { id: 'jadwal' as ActiveTab, label: 'Jadwal', icon: CalendarRange },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setShowMoreDrawer(false);
  };

  const isMoreActive = activeTab === 'administrasi' || activeTab === 'catatan' || activeTab === 'laporan';

  return (
    <>
      {/* Drawer for More menus */}
      {showMoreDrawer && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-150"
          onClick={() => setShowMoreDrawer(false)}
        >
          <div 
            className={`${drawerBg} rounded-t-2xl p-3.5 border-t ${navBorder} shadow-xl animate-in slide-in-from-bottom-5 duration-200`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Menu Lainnya</span>
              <button 
                onClick={() => setShowMoreDrawer(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSelectTab('administrasi')}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all active:scale-97 min-h-[42px] ${
                  activeTab === 'administrasi'
                    ? `${themeConfig.accentBgClass} border-current/30 ${themeConfig.accentTextClass} font-semibold`
                    : 'bg-slate-50/70 dark:bg-slate-800/70 border-slate-200/70 dark:border-slate-700/70 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${activeTab === 'administrasi' ? 'bg-current/15' : 'bg-rose-100 dark:bg-rose-950/60 text-[#D9468F]'} flex items-center justify-center shrink-0`}>
                  <WalletCards className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Administrasi</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">Kas & Iuran</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectTab('catatan')}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all active:scale-97 min-h-[42px] ${
                  activeTab === 'catatan'
                    ? `${themeConfig.accentBgClass} border-current/30 ${themeConfig.accentTextClass} font-semibold`
                    : 'bg-slate-50/70 dark:bg-slate-800/70 border-slate-200/70 dark:border-slate-700/70 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${activeTab === 'catatan' ? 'bg-current/15' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'} flex items-center justify-center shrink-0`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Catatan Siswa</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">Perkembangan</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectTab('laporan')}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all active:scale-97 min-h-[42px] ${
                  activeTab === 'laporan'
                    ? `${themeConfig.accentBgClass} border-current/30 ${themeConfig.accentTextClass} font-semibold`
                    : 'bg-slate-50/70 dark:bg-slate-800/70 border-slate-200/70 dark:border-slate-700/70 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${activeTab === 'laporan' ? 'bg-current/15' : 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'} flex items-center justify-center shrink-0`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Laporan & Rekap</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">PDF & Excel</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowMoreDrawer(false);
                  onOpenSettings();
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-left transition-all active:scale-97 min-h-[42px]"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Pengaturan</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">Profil & Tema</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Bar */}
      <nav 
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 ${navBg} border-t ${navBorder} px-1.5 py-0.5 flex items-center justify-around no-print transition-colors duration-200`}
        aria-label="Navigasi Bawah"
      >
        {primaryTabs.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] min-w-[40px] rounded-lg transition-all active:scale-95 ${
                isActive ? themeConfig.accentTextClass : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${isActive ? `${themeConfig.accentBgClass} ${themeConfig.accentTextClass}` : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-medium leading-none mt-0.5 ${isActive ? `font-bold ${themeConfig.accentTextClass}` : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setShowMoreDrawer(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] min-w-[40px] rounded-lg transition-all active:scale-95 ${
            isMoreActive ? themeConfig.accentTextClass : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${isMoreActive ? `${themeConfig.accentBgClass} ${themeConfig.accentTextClass}` : ''}`}>
            <MoreHorizontal className="w-4 h-4" />
          </div>
          <span className={`text-[10px] font-medium leading-none mt-0.5 ${isMoreActive ? `font-bold ${themeConfig.accentTextClass}` : ''}`}>
            Lainnya
          </span>
        </button>
      </nav>
    </>
  );
};
