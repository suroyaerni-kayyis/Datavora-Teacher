import React, { useState } from 'react';
import { useClassData } from '../context/ClassDataContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  CalendarCheck2, 
  UserPlus, 
  GraduationCap, 
  BookOpen, 
  Settings, 
  Sparkles,
  ChevronDown,
  Clock,
  Database,
  RefreshCw,
  LogIn,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddStudent: () => void;
  onOpenAddGrade: () => void;
  onOpenAddNote: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddStudent,
  onOpenAddGrade,
  onOpenAddNote,
  onOpenSettings,
}) => {
  const { classInfo, totalStudents, dbStatus, dbMode, lastSyncTime, syncNow } = useClassData();
  const { user, signInWithGoogle, signOut, loading: authLoading } = useAuth();
  const { themeConfig, actualTheme } = useTheme();
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncNow();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const headerBg = actualTheme === 'dark' ? themeConfig.headerBgDark : themeConfig.headerBgLight;
  const headerBorder = actualTheme === 'dark' ? themeConfig.headerBorderDark : themeConfig.headerBorderLight;

  // Format today's date in Indonesian
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className={`sticky top-0 z-30 ${headerBg} border-b ${headerBorder} px-3 sm:px-4 lg:px-6 py-2 transition-colors duration-200 no-print`}>
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        
        {/* Left: Brand / Active View Title */}
        <div className="flex items-center gap-2.5">
          <div className="md:hidden flex items-center gap-2">
            {classInfo.schoolLogo ? (
              <img 
                src={classInfo.schoolLogo} 
                alt="Logo Sekolah" 
                className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 shrink-0" 
              />
            ) : (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0"
                style={{ backgroundColor: themeConfig.primaryColor }}
              >
                W+
              </div>
            )}
            <div className="min-w-0">
              <span className="font-extrabold text-xs tracking-tight text-slate-900 dark:text-slate-100 truncate block">
                {classInfo.schoolName || 'DATAVORA'}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none truncate">
                {classInfo.className}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold ${themeConfig.accentBgClass} ${themeConfig.accentTextClass} border border-current/20`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {classInfo.className}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{classInfo.academicYear} ({classInfo.semester})</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">{totalStudents} Siswa Terdaftar</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Date pill (desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{todayFormatted}</span>
          </div>

          {/* Quick Action dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${themeConfig.accentBtnClass} shadow-xs hover:shadow transition-all active:scale-97 min-h-[38px]`}
              aria-expanded={showQuickMenu}
              aria-label="Menu Aksi Cepat"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aksi Cepat</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showQuickMenu ? 'rotate-180' : ''}`} />
            </button>

            {showQuickMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowQuickMenu(false)} 
                />
                <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Pintasan Cepat
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      setActiveTab('absensi');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#D9468F] transition-colors"
                  >
                    <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>+ Isi Absensi</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenAddStudent();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#D9468F] transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-sky-500" />
                    <span>+ Tambah Siswa</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenAddGrade();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#D9468F] transition-colors"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                    <span>+ Input Nilai</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenAddNote();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#D9468F] transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    <span>+ Catatan Siswa</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Database Sync Status Badge */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              title={`Database Backend: ${dbMode} (${dbStatus === 'connected' ? 'Terhubung' : dbStatus === 'syncing' ? 'Menyinkronkan...' : 'Offline / Cache'}). Klik untuk sinkronisasi.`}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border text-xs font-medium transition-all active:scale-97 min-h-[36px] ${
                dbStatus === 'connected'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : dbStatus === 'syncing' || isSyncing
                  ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
              }`}
            >
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline text-[11px] font-semibold">
                {dbStatus === 'connected' ? 'Supabase' : dbStatus === 'syncing' || isSyncing ? 'Sinkron...' : 'Offline'}
              </span>
              <RefreshCw className={`w-3 h-3 ${isSyncing || dbStatus === 'syncing' ? 'animate-spin text-sky-500' : 'text-emerald-500'}`} />
            </button>
          </div>

          {/* User Auth Profile / Login */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[36px]"
                  title={user.user_metadata?.full_name || user.email || 'Akun Guru'}
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.full_name || 'Avatar'}
                      className="w-6 h-6 rounded-full object-cover border border-slate-300 dark:border-slate-600"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#D9468F] text-white text-[10px] font-bold flex items-center justify-center">
                      {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[90px] truncate">
                    {(user.user_metadata?.full_name || user.email)?.split(' ')[0] || 'Guru'}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {user.user_metadata?.full_name || 'Pengguna'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={async () => {
                          setShowUserMenu(false);
                          await signOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar (Sign Out)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenSettings()}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[36px]"
                title="Konfigurasi Supabase & Akun"
              >
                <Database className="w-3.5 h-3.5 text-[#D9468F]" />
                <span>Supabase</span>
              </button>
            )}
          </div>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors active:scale-97 min-h-[38px]"
            title="Pengaturan Kelas"
            aria-label="Pengaturan Kelas"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
