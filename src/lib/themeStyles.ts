import { SidebarColorTheme, AppColorTheme } from '../types';

export interface ColorThemeDefinition {
  id: AppColorTheme;
  name: string;
  desc: string;
  dotColor: string;
  previewGradient: string;
  // App Canvas Background
  appBgLight: string;
  appBgDark: string;
  // Main scrollable area background
  contentBgLight: string;
  contentBgDark: string;
  // Header styles
  headerBgLight: string;
  headerBgDark: string;
  headerBorderLight: string;
  headerBorderDark: string;
  // Bottom navigation styles
  bottomNavBgLight: string;
  bottomNavBgDark: string;
  bottomNavBorderLight: string;
  bottomNavBorderDark: string;
  bottomNavDrawerBgLight: string;
  bottomNavDrawerBgDark: string;
  // Dashboard Banner gradient
  bannerGradient: string;
  bannerSubtext: string;
  bannerPillBg: string;
  bannerButtonText: string;
  // Primary Accent color
  primaryColor: string;
  accentBtnClass: string;
  accentTextClass: string;
  accentBgClass: string;
  // Sidebar styling
  sidebar: {
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
  };
}

export const colorThemes: Record<AppColorTheme, ColorThemeDefinition> = {
  plum: {
    id: 'plum',
    name: 'Midnight Plum',
    desc: 'Ungu Elegan & Aksen Rose',
    dotColor: '#D9468F',
    previewGradient: 'from-[#25173B] to-[#120B1D]',
    // App Canvas Background
    appBgLight: 'bg-[#FAF6FD]',
    appBgDark: 'bg-[#0E0917]',
    // Main scrollable area background
    contentBgLight: 'bg-gradient-to-b from-[#FAF6FD] via-[#F6F0FC] to-[#F1E8F8]',
    contentBgDark: 'bg-gradient-to-b from-[#110A1D] via-[#0D0716] to-[#08040E]',
    // Header styles
    headerBgLight: 'bg-white/90 backdrop-blur-md',
    headerBgDark: 'bg-[#180F26]/90 backdrop-blur-md',
    headerBorderLight: 'border-purple-100/80',
    headerBorderDark: 'border-purple-950/70',
    // Bottom nav
    bottomNavBgLight: 'bg-white/95 backdrop-blur-md',
    bottomNavBgDark: 'bg-[#180F26]/95 backdrop-blur-md',
    bottomNavBorderLight: 'border-purple-100/90',
    bottomNavBorderDark: 'border-purple-950/80',
    bottomNavDrawerBgLight: 'bg-white',
    bottomNavDrawerBgDark: 'bg-[#1B112B]',
    // Banner
    bannerGradient: 'bg-gradient-to-r from-[#9333EA] via-[#BE185D] to-[#D9468F]',
    bannerSubtext: 'text-purple-100',
    bannerPillBg: 'bg-white/20',
    bannerButtonText: 'text-[#831843]',
    // Accent
    primaryColor: '#D9468F',
    accentBtnClass: 'bg-[#D9468F] hover:bg-[#BE185D] text-white',
    accentTextClass: 'text-[#D9468F] dark:text-rose-400',
    accentBgClass: 'bg-rose-50 dark:bg-rose-950/40',
    // Sidebar
    sidebar: {
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
  },
  maroon: {
    id: 'maroon',
    name: 'Rose Maroon',
    desc: 'Merah Marun Mewah',
    dotColor: '#BE185D',
    previewGradient: 'from-[#4A0E2E] to-[#1F0413]',
    // App Canvas Background
    appBgLight: 'bg-[#FCF5F7]',
    appBgDark: 'bg-[#14060E]',
    // Main scrollable area background
    contentBgLight: 'bg-gradient-to-b from-[#FCF5F7] via-[#FAF0F4] to-[#F5E6EC]',
    contentBgDark: 'bg-gradient-to-b from-[#180812] via-[#13050E] to-[#0A0207]',
    // Header styles
    headerBgLight: 'bg-white/90 backdrop-blur-md',
    headerBgDark: 'bg-[#230C1A]/90 backdrop-blur-md',
    headerBorderLight: 'border-rose-100/80',
    headerBorderDark: 'border-rose-950/70',
    // Bottom nav
    bottomNavBgLight: 'bg-white/95 backdrop-blur-md',
    bottomNavBgDark: 'bg-[#230C1A]/95 backdrop-blur-md',
    bottomNavBorderLight: 'border-rose-100/90',
    bottomNavBorderDark: 'border-rose-950/80',
    bottomNavDrawerBgLight: 'bg-white',
    bottomNavDrawerBgDark: 'bg-[#280E1E]',
    // Banner
    bannerGradient: 'bg-gradient-to-r from-[#9F1239] via-[#BE185D] to-[#E11D48]',
    bannerSubtext: 'text-rose-100',
    bannerPillBg: 'bg-white/20',
    bannerButtonText: 'text-[#881337]',
    // Accent
    primaryColor: '#BE185D',
    accentBtnClass: 'bg-[#BE185D] hover:bg-[#9D174D] text-white',
    accentTextClass: 'text-[#BE185D] dark:text-rose-400',
    accentBgClass: 'bg-rose-50 dark:bg-rose-950/40',
    // Sidebar
    sidebar: {
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
      activeBtn: 'bg-[#BE185D] text-white shadow-md shadow-rose-950/50 font-semibold',
      inactiveBtn: 'text-rose-100/85 hover:text-white hover:bg-white/10',
      inactiveIcon: 'text-rose-300/70',
      footerBorder: 'border-white/10',
      footerBtn: 'text-rose-200/85 hover:text-white hover:bg-white/10',
    },
  },
  navy: {
    id: 'navy',
    name: 'Royal Navy',
    desc: 'Biru Tua Klasik',
    dotColor: '#0284C7',
    previewGradient: 'from-[#0F172A] to-[#0A101D]',
    // App Canvas Background
    appBgLight: 'bg-[#F4F7FB]',
    appBgDark: 'bg-[#090F1C]',
    // Main scrollable area background
    contentBgLight: 'bg-gradient-to-b from-[#F4F7FB] via-[#EEF3FA] to-[#E5EDF7]',
    contentBgDark: 'bg-gradient-to-b from-[#0D1527] via-[#090E1B] to-[#050810]',
    // Header styles
    headerBgLight: 'bg-white/90 backdrop-blur-md',
    headerBgDark: 'bg-[#111A2E]/90 backdrop-blur-md',
    headerBorderLight: 'border-slate-200/80',
    headerBorderDark: 'border-slate-800/80',
    // Bottom nav
    bottomNavBgLight: 'bg-white/95 backdrop-blur-md',
    bottomNavBgDark: 'bg-[#111A2E]/95 backdrop-blur-md',
    bottomNavBorderLight: 'border-slate-200/90',
    bottomNavBorderDark: 'border-slate-800/80',
    bottomNavDrawerBgLight: 'bg-white',
    bottomNavDrawerBgDark: 'bg-[#141F36]',
    // Banner
    bannerGradient: 'bg-gradient-to-r from-[#1E3A8A] via-[#0369A1] to-[#0284C7]',
    bannerSubtext: 'text-sky-100',
    bannerPillBg: 'bg-white/20',
    bannerButtonText: 'text-[#0C4A6E]',
    // Accent
    primaryColor: '#0284C7',
    accentBtnClass: 'bg-[#0284C7] hover:bg-[#0369A1] text-white',
    accentTextClass: 'text-[#0284C7] dark:text-sky-400',
    accentBgClass: 'bg-sky-50 dark:bg-sky-950/40',
    // Sidebar
    sidebar: {
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
      activeBtn: 'bg-[#0284C7] text-white shadow-md shadow-slate-950/50 font-semibold',
      inactiveBtn: 'text-slate-200/85 hover:text-white hover:bg-white/10',
      inactiveIcon: 'text-slate-400',
      footerBorder: 'border-white/10',
      footerBtn: 'text-slate-300 hover:text-white hover:bg-white/10',
    },
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Forest',
    desc: 'Hijau Zamrud Segar',
    dotColor: '#059669',
    previewGradient: 'from-[#064E3B] to-[#02261E]',
    // App Canvas Background
    appBgLight: 'bg-[#F3F8F5]',
    appBgDark: 'bg-[#03140F]',
    // Main scrollable area background
    contentBgLight: 'bg-gradient-to-b from-[#F3F8F5] via-[#EDF5F0] to-[#E3EFE8]',
    contentBgDark: 'bg-gradient-to-b from-[#061F17] via-[#031510] to-[#010C09]',
    // Header styles
    headerBgLight: 'bg-white/90 backdrop-blur-md',
    headerBgDark: 'bg-[#06261E]/90 backdrop-blur-md',
    headerBorderLight: 'border-emerald-100/80',
    headerBorderDark: 'border-emerald-950/70',
    // Bottom nav
    bottomNavBgLight: 'bg-white/95 backdrop-blur-md',
    bottomNavBgDark: 'bg-[#06261E]/95 backdrop-blur-md',
    bottomNavBorderLight: 'border-emerald-100/90',
    bottomNavBorderDark: 'border-emerald-950/80',
    bottomNavDrawerBgLight: 'bg-white',
    bottomNavDrawerBgDark: 'bg-[#082E24]',
    // Banner
    bannerGradient: 'bg-gradient-to-r from-[#064E3B] via-[#047857] to-[#059669]',
    bannerSubtext: 'text-emerald-100',
    bannerPillBg: 'bg-white/20',
    bannerButtonText: 'text-[#064E3B]',
    // Accent
    primaryColor: '#059669',
    accentBtnClass: 'bg-[#059669] hover:bg-[#047857] text-white',
    accentTextClass: 'text-[#059669] dark:text-emerald-400',
    accentBgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    // Sidebar
    sidebar: {
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
  },
  rose: {
    id: 'rose',
    name: 'Soft Rose',
    desc: 'Merah Muda Anggun',
    dotColor: '#FB7185',
    previewGradient: 'from-[#FFF0F6] to-[#FCE7F3]',
    // App Canvas Background
    appBgLight: 'bg-[#FFF5F8]',
    appBgDark: 'bg-[#140610]',
    // Main scrollable area background
    contentBgLight: 'bg-gradient-to-b from-[#FFF5F8] via-[#FDF0F5] to-[#F8E2EB]',
    contentBgDark: 'bg-gradient-to-b from-[#1B0A16] via-[#140610] to-[#0D030A]',
    // Header styles
    headerBgLight: 'bg-white/90 backdrop-blur-md',
    headerBgDark: 'bg-[#230C1C]/90 backdrop-blur-md',
    headerBorderLight: 'border-rose-200/70',
    headerBorderDark: 'border-rose-950/70',
    // Bottom nav
    bottomNavBgLight: 'bg-white/95 backdrop-blur-md',
    bottomNavBgDark: 'bg-[#230C1C]/95 backdrop-blur-md',
    bottomNavBorderLight: 'border-rose-200/80',
    bottomNavBorderDark: 'border-rose-950/80',
    bottomNavDrawerBgLight: 'bg-white',
    bottomNavDrawerBgDark: 'bg-[#2A0E22]',
    // Banner
    bannerGradient: 'bg-gradient-to-r from-[#9D174D] via-[#BE185D] to-[#F43F5E]',
    bannerSubtext: 'text-rose-100',
    bannerPillBg: 'bg-white/20',
    bannerButtonText: 'text-[#881337]',
    // Accent
    primaryColor: '#F43F5E',
    accentBtnClass: 'bg-[#E11D48] hover:bg-[#BE123C] text-white',
    accentTextClass: 'text-[#E11D48] dark:text-rose-400',
    accentBgClass: 'bg-rose-50 dark:bg-rose-950/40',
    // Sidebar
    sidebar: {
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
  },
};
