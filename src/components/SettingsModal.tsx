import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { useClassData } from '../context/ClassDataContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Check, 
  School, 
  User, 
  Calendar,
  Sun, 
  Moon, 
  Laptop, 
  Palette,
  Image as ImageIcon,
  UploadCloud,
  X,
  Award,
  Sparkles,
  Database,
  Server,
  RefreshCw,
  CheckCircle2,
  LogIn,
  LogOut,
  ShieldCheck,
  Zap,
  Copy,
  ExternalLink,
  Code
} from 'lucide-react';
import { ThemeMode, SidebarColorTheme } from '../types';
import { DEFAULT_SCHOOL_LOGO } from '../data/mockData';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  testSupabaseConnection, 
  SUPABASE_SQL_SCHEMA 
} from '../lib/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConfirmReset: () => void;
}

const sidebarColorOptions: {
  id: SidebarColorTheme;
  label: string;
  desc: string;
  bgGradient: string;
  dotColor: string;
}[] = [
  {
    id: 'plum',
    label: 'Midnight Plum',
    desc: 'Ungu Elegan (Bawaan)',
    bgGradient: 'from-[#25173B] to-[#120B1D]',
    dotColor: '#D9468F',
  },
  {
    id: 'maroon',
    label: 'Rose Maroon',
    desc: 'Merah Marun',
    bgGradient: 'from-[#4A0E2E] to-[#1F0413]',
    dotColor: '#BE185D',
  },
  {
    id: 'navy',
    label: 'Royal Navy',
    desc: 'Biru Tua Klasik',
    bgGradient: 'from-[#0F172A] to-[#0A101D]',
    dotColor: '#38BDF8',
  },
  {
    id: 'emerald',
    label: 'Emerald Forest',
    desc: 'Hijau Zamrud',
    bgGradient: 'from-[#064E3B] to-[#02261E]',
    dotColor: '#10B981',
  },
  {
    id: 'rose',
    label: 'Soft Rose',
    desc: 'Merah Muda Terang',
    bgGradient: 'from-[#FFF0F6] to-[#FCE7F3]',
    dotColor: '#FB7185',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenConfirmReset,
}) => {
  const { 
    classInfo, 
    updateClassInfo, 
    loadDemoData, 
    exportBackupJSON, 
    importBackupJSON,
    showToast,
    dbStatus,
    dbMode,
    lastSyncTime,
    syncNow
  } = useClassData();

  const { user, signInWithGoogle, signOut } = useAuth();
  const { theme, actualTheme, setTheme, sidebarTheme, setSidebarTheme } = useTheme();

  const [formData, setFormData] = useState(classInfo);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Supabase Configuration State
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseCredentials().url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => getSupabaseCredentials().anonKey);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Sync state whenever modal opens or classInfo updates
  useEffect(() => {
    if (isOpen) {
      setFormData(classInfo);
      const creds = getSupabaseCredentials();
      setSupabaseUrl(creds.url);
      setSupabaseAnonKey(creds.anonKey);
      setSupabaseTestStatus(null);
    }
  }, [isOpen, classInfo]);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateClassInfo(formData);
    onClose();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file logo maksimal 2MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setFormData(prev => ({ ...prev, schoolLogo: base64 }));
        showToast('Logo sekolah berhasil dipilih. Jangan lupa klik "Simpan Pengaturan".', 'info');
      }
    };
    reader.readAsDataURL(file);
    // Reset value so user can re-upload same filename if needed
    e.target.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importBackupJSON(content);
        if (ok) onClose();
      }
    };
    reader.readAsText(file);
  };

  const themeOptions: { mode: ThemeMode; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { mode: 'light', label: 'Terang', description: 'Mode cerah', icon: Sun },
    { mode: 'dark', label: 'Gelap', description: 'Mode gelap', icon: Moon },
    { mode: 'system', label: 'Sistem', description: 'Otomatis', icon: Laptop },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Sekolah, Laporan PDF & Tampilan"
      subtitle="Atur identitas sekolah, logo, kepala sekolah untuk PDF, warna sidebar, dan pencadangan"
      maxWidth="xl"
    >
      <div className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">
        
        {/* FORM PENGATURAN IDENTITAS SEKOLAH & KELAS */}
        <form onSubmit={handleSaveInfo} className="space-y-4">
          
          {/* SECTION 1: Identitas & Logo Sekolah untuk PDF */}
          <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-bold text-xs">
              <School className="w-4 h-4 text-[#D9468F]" />
              <span>Identitas Sekolah & Logo KOP Laporan (PDF)</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">
                Nama Sekolah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
                placeholder="mis. SMP Negeri 1 Nusantara"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                Nama sekolah dicetak paling atas pada KOP resmi dokumen laporan dan PDF.
              </p>
            </div>

            {/* Logo Uploader */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                Logo Sekolah untuk KOP Dokumen PDF
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-2.5 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                {/* Logo Preview */}
                <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                  {formData.schoolLogo ? (
                    <img 
                      src={formData.schoolLogo} 
                      alt="Preview Logo" 
                      className="w-full h-full object-contain p-1" 
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white bg-[#D9468F] hover:bg-[#BE185D] transition-colors min-h-[30px]"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Unggah Logo (PNG/JPG)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, schoolLogo: DEFAULT_SCHOOL_LOGO }));
                        showToast('Logo standar sekolah dipilih', 'info');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors min-h-[30px]"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Gunakan Logo Standar</span>
                    </button>

                    {formData.schoolLogo && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, schoolLogo: '' }));
                          showToast('Logo sekolah dihapus', 'info');
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors min-h-[30px]"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                    Format disarankan PNG/JPG transparan atau SVG. Logo akan otomatis dicetak di pojok kiri atas KOP dokumen PDF.
                  </p>
                </div>
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Kepala Sekolah untuk Tanda Tangan PDF */}
          <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-bold text-xs">
              <Award className="w-4 h-4 text-[#D9468F]" />
              <span>Pengesahan Dokumen PDF (Kepala Sekolah)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">
                  Nama Lengkap & Gelar Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={formData.headmasterName || ''}
                  onChange={(e) => setFormData({ ...formData, headmasterName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
                  placeholder="mis. Dr. Bambang Sutrisno, M.Pd."
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={formData.headmasterNip || ''}
                  onChange={(e) => setFormData({ ...formData, headmasterNip: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
                  placeholder="mis. 19680312 199403 1 005"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Dicetak pada kolom tanda tangan "Mengetahui, Kepala Sekolah" di lembar rekapitulasi PDF.
            </p>
          </div>

          {/* SECTION 3: Identitas Kelas & Wali Kelas */}
          <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-bold text-xs">
              <User className="w-4 h-4 text-[#D9468F]" />
              <span>Identitas Kelas & Guru Wali Kelas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">
                  Nama Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
                  placeholder="mis. Kelas 8-B"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">
                  Tahun Ajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
                  placeholder="mis. 2025/2026"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">
                  Semester
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value as 'Ganjil' | 'Genap' })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white dark:bg-slate-800 min-h-[36px]"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">
                  Nama Lengkap & Gelar Wali Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.homeroomTeacher}
                  onChange={(e) => setFormData({ ...formData, homeroomTeacher: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
                  placeholder="mis. Dra. Hj. Nurul Hidayah, M.Pd."
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">
                  NIP Wali Kelas
                </label>
                <input
                  type="text"
                  value={formData.homeroomTeacherNip || ''}
                  onChange={(e) => setFormData({ ...formData, homeroomTeacherNip: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
                  placeholder="mis. 19780412 200501 2 003"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#D9468F] hover:bg-[#C2357A] transition-colors active:scale-97 min-h-[38px] shadow-sm shadow-rose-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Profil & Pengaturan PDF</span>
            </button>
          </div>
        </form>

        {/* SECTION 4: Kustomisasi Latar Aplikasi & Tema Tampilan */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          
          {/* Warna Latar Aplikasi & Sidebar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-bold text-xs">
                <Palette className="w-3.5 h-3.5 text-[#D9468F]" />
                <span>Tema Warna & Latar Aplikasi</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Pilih tema warna latar, sidebar & aksen visual
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {sidebarColorOptions.map((item) => {
                const isSelected = sidebarTheme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSidebarTheme(item.id);
                      showToast(`Tema warna aplikasi diubah ke ${item.label}`, 'info');
                    }}
                    className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-[#D9468F] ring-2 ring-[#D9468F]/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    } bg-white dark:bg-slate-800`}
                  >
                    {/* Color Swatch Preview */}
                    <div 
                      className={`w-full h-8 rounded-lg bg-gradient-to-br ${item.bgGradient} mb-1.5 flex items-center justify-center shadow-inner`}
                    >
                      <div 
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs" 
                        style={{ backgroundColor: item.dotColor }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate w-full">
                      {item.label}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate w-full">
                      {item.desc}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-[#D9468F] text-white rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Tampilan (Light / Dark / System) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Mode Tampilan Aplikasi
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {theme === 'system'
                  ? `Mengikuti Sistem (${actualTheme === 'dark' ? 'Gelap' : 'Terang'})`
                  : theme === 'dark'
                  ? 'Mode Gelap Aktif'
                  : 'Mode Terang Aktif'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.mode;
                return (
                  <button
                    key={opt.mode}
                    type="button"
                    id={`theme-btn-${opt.mode}`}
                    onClick={() => {
                      setTheme(opt.mode);
                      showToast(`Tema diubah ke mode ${opt.label.toLowerCase()}`, 'info');
                    }}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-2 rounded-xl border text-xs font-semibold transition-all min-h-[44px] ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-[#D9468F] text-[#D9468F] shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#D9468F]' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span className="text-xs">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#D9468F] hidden sm:block shrink-0 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION: Integrasi Database Supabase */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#D9468F]" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Database Supabase (PostgreSQL)</h4>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              dbStatus === 'connected' 
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : dbStatus === 'syncing' || isManualSyncing
                ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
              {dbStatus === 'connected' ? 'Supabase Terhubung' : dbStatus === 'syncing' || isManualSyncing ? 'Sinkronisasi...' : 'Mode Cache Lokal'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            {/* Supabase connection info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-medium">Database Platform</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Supabase (PostgreSQL 15)
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-medium">Tabel Terhubung</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  10 Tabel Relasional Aktif
                </span>
              </div>
            </div>

            {/* Custom Supabase Credentials Form */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-[#D9468F]" />
                  Kredensial Project Supabase Anda
                </span>
                <button
                  type="button"
                  onClick={() => setShowSqlSchema(!showSqlSchema)}
                  className="text-[11px] font-semibold text-[#D9468F] hover:underline flex items-center gap-1"
                >
                  <Code className="w-3 h-3" />
                  <span>{showSqlSchema ? 'Tutup SQL' : 'Lihat Skema SQL'}</span>
                </button>
              </div>

              {showSqlSchema && (
                <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Skema SQL Supabase (10 Tabel)</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                        setCopiedSql(true);
                        showToast('Skema SQL Supabase disalin ke clipboard!', 'success');
                        setTimeout(() => setCopiedSql(false), 2000);
                      }}
                      className="px-2 py-1 bg-[#D9468F] text-white rounded text-[10px] font-sans font-bold flex items-center gap-1 hover:bg-[#c2367c]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                    </button>
                  </div>
                  <pre className="max-h-36 overflow-y-auto text-[10px] text-emerald-400 leading-relaxed">
                    {SUPABASE_SQL_SCHEMA.slice(0, 480)}...
                  </pre>
                </div>
              )}

              <div className="space-y-1.5">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">SUPABASE URL</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-[#D9468F]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">SUPABASE ANON PUBLIC KEY</label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-[#D9468F]"
                  />
                </div>
              </div>

              {supabaseTestStatus && (
                <div className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
                  supabaseTestStatus.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}>
                  {supabaseTestStatus.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" /> : <X className="w-3.5 h-3.5 shrink-0 text-rose-500" />}
                  <span>{supabaseTestStatus.message}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    saveSupabaseCredentials(supabaseUrl, supabaseAnonKey);
                    showToast('Kredensial Supabase berhasil disimpan!', 'success');
                  }}
                  className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors active:scale-97 min-h-[34px]"
                >
                  Simpan Kredensial
                </button>

                <button
                  type="button"
                  disabled={isTestingSupabase}
                  onClick={async () => {
                    setIsTestingSupabase(true);
                    const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
                    setSupabaseTestStatus(res);
                    setIsTestingSupabase(false);
                  }}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors active:scale-97 min-h-[34px] flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                  <span>{isTestingSupabase ? 'Menguji...' : 'Uji Koneksi'}</span>
                </button>
              </div>
            </div>

            {/* Sync now trigger button */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-700">
              <button
                type="button"
                disabled={isManualSyncing}
                onClick={async () => {
                  setIsManualSyncing(true);
                  await syncNow();
                  setTimeout(() => {
                    setIsManualSyncing(false);
                    showToast('Sinkronisasi data dengan database backend Supabase berhasil!', 'success');
                  }, 600);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#D9468F] text-white hover:bg-[#c2367c] transition-all active:scale-97 shadow-xs min-h-[38px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin' : ''}`} />
                <span>{isManualSyncing ? 'Menyinkronkan...' : 'Sinkronkan Data ke Supabase Sekarang'}</span>
              </button>

              {/* Supabase Auth quick button */}
              {user ? (
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                    Akun: <strong className="text-slate-800 dark:text-white">{user.user_metadata?.full_name || user.email}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="text-rose-500 hover:text-rose-700 font-semibold text-[11px] underline"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors min-h-[38px]"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#D9468F]" />
                  <span>Login Supabase Auth</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 5: Manajemen Data & Cadangan */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Pencadangan & Pemulihan Data</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Seluruh data disimpan aman di browser lokal Anda. Anda dapat mengunduh salinan cadangan JSON kapan saja atau memuatnya kembali.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={exportBackupJSON}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-97 min-h-[36px]"
            >
              <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Unduh Backup JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-97 min-h-[36px]"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Pulihkan dari File JSON</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                loadDemoData();
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-97 min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#D9468F]" />
              <span>Muat Data Contoh (Demo)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenConfirmReset();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors active:scale-97 min-h-[36px]"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Kosongkan Semua Data</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
