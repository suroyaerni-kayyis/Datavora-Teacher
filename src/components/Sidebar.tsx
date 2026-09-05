import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck2, 
  GraduationCap, 
  CalendarRange, 
  WalletCards, 
  BookOpen, 
  FileText, 
  Settings,
  School
} from 'lucide-react';
import { ActiveTab, SidebarColorTheme } from '../types';
import { useClassData } from '../context/ClassDataContext';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
}

const sidebarThemeStyles: Record<SidebarColorTheme, {
  asideBg: string;
  borderColor: string;
  headerBorder: string;
  brandText: string;
  subText: string;
  cardBg: string;
  cardBorder: string;
  cardSchoolText: string;
  cardClassText: string;
  cardDetailText: string;
  sectionLabel: string;
  activeBtn: string;
  inactiveBtn: string;
  inactiveIcon: string;
  footerBorder: string;
  footerBtn: string;
}> = {
  plum: {
    asideBg: 'bg-gradient-to-b from-[#241738] via-[#1B1229] to-[#120B1D] text-slate-100',
    borderColor: 'border-purple-950/80',
    headerBorder: 'border-white/10',
    brandText: 'text-white',
    subText: 'text-purple-300/70',
    cardBg: 'bg-white/10 backdrop-blur-sm',
    cardBorder: 'border-white/15',
    cardSchoolText: 'text-rose-300',
    cardClassText: 'text-white',
    cardDetailText: 'text-purple-200/80',
    sectionLabel: 'text-purple-300/60',
    activeBtn: 'bg-[#D9468F] text-white shadow-md shadow-rose-950/50 font-semibold',
    inactiveBtn: 'text-purple-100/85 hover:text-white hover:bg-white/10',
    inactiveIcon: 'text-purple-300/70',
    footerBorder: 'border-white/10',
    footerBtn: 'text-purple-200/85 hover:text-white hover:bg-white/10',
  },
  maroon: {
    asideBg: 'bg-gradient-to-b from-[#4A0E2E] via-[#35081F] to-[#1F0413] text-rose-100',
    borderColor: 'border-rose-950/80',
    headerBorder: 'border-white/10',
    brandText: 'text-white',
    subText: 'text-rose-300/70',
    cardBg: 'bg-white/10 backdrop-blur-sm',
    cardBorder: 'border-white/15',
    cardSchoolText: 'text-rose-200',
    cardClassText: 'text-white',
    cardDetailText: 'text-rose-200/80',
    sectionLabel: 'text-rose-300/60',
    activeBtn: 'bg-[#D9468F] text-white shadow-md shadow-rose-950/50 font-semibold',
    inactiveBtn: 'text-rose-100/85 hover:text-white hover:bg-white/10',
    inactiveIcon: 'text-rose-300/70',
    footerBorder: 'border-white/10',
    footerBtn: 'text-rose-200/85 hover:text-white hover:bg-white/10',
  },
  navy: {
    asideBg: 'bg-gradient-to-b from-[#0F172A] via-[#162033] to-[#0A101D] text-slate-100',
    borderColor: 'border-slate-800',
    headerBorder: 'border-white/10',
    brandText: 'text-white',
    subText: 'text-slate-400',
    cardBg: 'bg-white/10 backdrop-blur-sm',
    cardBorder: 'border-white/15',
    cardSchoolText: 'text-sky-300',
    cardClassText: 'text-white',
    cardDetailText: 'text-slate-300/80',
    sectionLabel: 'text-slate-400',
    activeBtn: 'bg-[#D9468F] text-white shadow-md shadow-slate-950/50 font-semibold',
    inactiveBtn: 'text-slate-200/85 hover:text-white hover:bg-white/10',
    inactiveIcon: 'text-slate-400',
    footerBorder: 'border-white/10',
    footerBtn: 'text-slate-300 hover:text-white hover:bg-white/10',
  },
  emerald: {
    asideBg: 'bg-gradient-to-b from-[#064E3B] via-[#043E30] to-[#02261E] text-emerald-100',
    borderColor: 'border-emerald-950/80',
    headerBorder: 'border-white/10',
    brandText: 'text-white',
    subText: 'text-emerald-300/70',
    cardBg: 'bg-white/10 backdrop-blur-sm',
    cardBorder: 'border-white/15',
    cardSchoolText: 'text-emerald-200',
    cardClassText: 'text-white',
    cardDetailText: 'text-emerald-200/80',
    sectionLabel: 'text-emerald-300/60',
    activeBtn: 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 font-semibold',
    inactiveBtn: 'text-emerald-100/85 hover:text-white hover:bg-white/10',
    inactiveIcon: 'text-emerald-300/70',
    footerBorder: 'border-white/10',
    footerBtn: 'text-emerald-200/85 hover:text-white hover:bg-white/10',
  },
  rose: {
    asideBg: 'bg-gradient-to-b from-[#FFF0F6] via-[#FDF2F8] to-[#FCE7F3] text-slate-800',
    borderColor: 'border-rose-200/90',
    headerBorder: 'border-rose-200/80',
    brandText: 'text-slate-900',
    subText: 'text-rose-800/70',
    cardBg: 'bg-white/80 backdrop-blur-sm',
    cardBorder: 'border-rose-200/80',
    cardSchoolText: 'text-[#9D174D]',
    cardClassText: 'text-slate-900',
    cardDetailText: 'text-slate-600',
    sectionLabel: 'text-rose-700/80',
    activeBtn: 'bg-[#D9468F] text-white shadow-md shadow-rose-300/40 font-semibold',
    inactiveBtn: 'text-slate-700 hover:text-slate-900 hover:bg-rose-100/80',
    inactiveIcon: 'text-rose-500/80',
    footerBorder: 'border-rose-200/80',
    footerBtn: 'text-slate-700 hover:text-slate-900 hover:bg-rose-100/80',
  },
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
}) => {
  const { classInfo, totalStudents } = useClassData();
  const { sidebarTheme } = useTheme();

  const themeStyle = sidebarThemeStyles[sidebarTheme] || sidebarThemeStyles.plum;

  const mainNavItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'siswa', label: 'Siswa', icon: Users },
    { id: 'absensi', label: 'Absensi', icon: CalendarCheck2 },
    { id: 'nilai', label: 'Nilai', icon: GraduationCap },
    { id: 'jadwal', label: 'Jadwal & Piket', icon: CalendarRange },
    { id: 'administrasi', label: 'Administrasi', icon: WalletCards },
  ];

  const secondaryNavItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'catatan', label: 'Catatan Siswa', icon: BookOpen },
    { id: 'laporan', label: 'Laporan & Rekap', icon: FileText },
  ];

  return (
    <aside className={`hidden md:flex flex-col w-56 lg:w-60 ${themeStyle.asideBg} border-r ${themeStyle.borderColor} h-screen sticky top-0 shrink-0 select-none no-print transition-colors duration-200 shadow-md`}>
      {/* Brand Header */}
      <div className={`p-3.5 px-4 border-b ${themeStyle.headerBorder} flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D9468F] to-[#BE185D] flex items-center justify-center text-white font-bold text-base shadow-sm shadow-rose-500/30">
            W+
          </div>
          <div>
            <h1 className={`font-extrabold text-sm tracking-tight ${themeStyle.brandText} leading-none`}>
              DATAVORA
            </h1>
            <p className={`text-[10px] ${themeStyle.subText} font-medium mt-0.5`}>Sistem Administrasi Guru</p>
          </div>
        </div>
      </div>

      {/* Class Profile Card snippet */}
      <div className={`mx-3 mt-3 p-2.5 ${themeStyle.cardBg} border ${themeStyle.cardBorder} rounded-xl shadow-xs`}>
        <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${themeStyle.cardSchoolText}`}>
          {classInfo.schoolLogo ? (
            <img 
              src={classInfo.schoolLogo} 
              alt="Logo" 
              className="w-4 h-4 object-contain rounded-xs shrink-0" 
            />
          ) : (
            <School className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="truncate">{classInfo.schoolName}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className={`text-xs font-bold ${themeStyle.cardClassText}`}>{classInfo.className}</span>
          <span className={`text-[10px] font-medium ${themeStyle.cardDetailText}`}>{totalStudents} Siswa</span>
        </div>
        <p className={`text-[10px] ${themeStyle.cardDetailText} truncate mt-0.5`}>
          {classInfo.homeroomTeacher}
        </p>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        <div>
          <div className={`px-2 mb-1.5 text-[10px] font-semibold ${themeStyle.sectionLabel} uppercase tracking-wider`}>
            Menu Utama
          </div>
          <nav className="space-y-0.5">
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left active:scale-98 min-h-[38px] ${
                    isActive
                      ? themeStyle.activeBtn
                      : themeStyle.inactiveBtn
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : themeStyle.inactiveIcon}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <div className={`px-2 mb-1.5 text-[10px] font-semibold ${themeStyle.sectionLabel} uppercase tracking-wider`}>
            Fitur Pendukung
          </div>
          <nav className="space-y-0.5">
            {secondaryNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left active:scale-98 min-h-[38px] ${
                    isActive
                      ? themeStyle.activeBtn
                      : themeStyle.inactiveBtn
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : themeStyle.inactiveIcon}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Settings link */}
      <div className={`p-2.5 border-t ${themeStyle.footerBorder}`}>
        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${themeStyle.footerBtn} transition-colors text-left min-h-[38px]`}
        >
          <Settings className={`w-4 h-4 ${themeStyle.inactiveIcon} shrink-0`} />
          <span>Pengaturan Kelas</span>
        </button>
      </div>
    </aside>
  );
};
