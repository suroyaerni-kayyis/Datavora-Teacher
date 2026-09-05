/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ClassDataProvider, useClassData } from './context/ClassDataContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ActiveTab, Student } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { ToastContainer } from './components/ToastContainer';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmDialog } from './components/ConfirmDialog';

// Views
import { DashboardView } from './components/views/DashboardView';
import { SiswaView } from './components/views/SiswaView';
import { AbsensiView } from './components/views/AbsensiView';
import { NilaiView } from './components/views/NilaiView';
import { JadwalView } from './components/views/JadwalView';
import { AdministrasiView } from './components/views/AdministrasiView';
import { CatatanView } from './components/views/CatatanView';
import { LaporanView } from './components/views/LaporanView';

// Global Form Modals
import { StudentFormModal } from './components/views/StudentFormModal';
import { StudentDetailModal } from './components/views/StudentDetailModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Global modal triggers from Quick Actions
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

  const { deleteStudent, clearAllData } = useClassData();
  const { themeConfig, actualTheme } = useTheme();

  const appBg = actualTheme === 'dark' ? themeConfig.appBgDark : themeConfig.appBgLight;
  const contentBg = actualTheme === 'dark' ? themeConfig.contentBgDark : themeConfig.contentBgLight;

  return (
    <div className={`flex h-screen ${appBg} text-slate-800 dark:text-slate-100 font-sans antialiased overflow-hidden transition-colors duration-200`}>
      {/* Toast notifications */}
      <ToastContainer />

      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAddStudent={() => setIsAddStudentOpen(true)}
        />

        {/* Scrollable View Container */}
        <main className={`flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 ${contentBg} transition-colors duration-200`}>
          <div className="max-w-7xl mx-auto space-y-4">
            {activeTab === 'dashboard' && (
              <DashboardView
                setActiveTab={setActiveTab}
                onOpenAddStudent={() => setIsAddStudentOpen(true)}
                onOpenAddGrade={() => setActiveTab('nilai')}
                onOpenAddNote={() => {
                  setActiveTab('catatan');
                  setIsAddNoteOpen(true);
                }}
                onSelectStudent={(student) => setSelectedStudentForDetail(student)}
              />
            )}

            {activeTab === 'siswa' && (
              <SiswaView
                onOpenAddStudent={() => setIsAddStudentOpen(true)}
                selectedStudentForDetail={selectedStudentForDetail}
                onClearSelectedStudent={() => setSelectedStudentForDetail(null)}
              />
            )}

            {activeTab === 'absensi' && <AbsensiView />}

            {activeTab === 'nilai' && <NilaiView />}

            {activeTab === 'jadwal' && <JadwalView />}

            {activeTab === 'administrasi' && <AdministrasiView />}

            {activeTab === 'catatan' && (
              <CatatanView
                isAddNoteOpen={isAddNoteOpen}
                setIsAddNoteOpen={setIsAddNoteOpen}
                onSelectStudent={(student) => setSelectedStudentForDetail(student)}
              />
            )}

            {activeTab === 'laporan' && <LaporanView />}
          </div>
        </main>

        {/* Mobile Thumb-friendly Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* Global Settings & Data Management Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenConfirmReset={() => setIsConfirmResetOpen(true)}
      />

      {/* Global Add Student Modal */}
      <StudentFormModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
      />

      {/* Global Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudentForDetail}
        isOpen={Boolean(selectedStudentForDetail)}
        onClose={() => setSelectedStudentForDetail(null)}
        onEdit={() => {
          // If editing from global detail, switch to Siswa tab
          setActiveTab('siswa');
        }}
        onDelete={(student) => {
          deleteStudent(student.id);
          setSelectedStudentForDetail(null);
        }}
      />

      {/* Global Confirm Reset All Data Alert Dialog */}
      <ConfirmDialog
        isOpen={isConfirmResetOpen}
        onClose={() => setIsConfirmResetOpen(false)}
        onConfirm={() => {
          clearAllData();
          setIsConfirmResetOpen(false);
        }}
        title="Kosongkan Seluruh Data Kelas"
        itemName="Semua Siswa, Nilai, Absensi, Jadwal, Kas & Catatan"
        message="Apakah Anda benar-benar yakin ingin mengosongkan seluruh data aplikasi DATAVORA? Seluruh data siswa, rekap nilai, presensi, jadwal, transaksi kas, dan catatan khusus akan dihapus secara permanen."
        confirmText="Kosongkan Semua Data"
        cancelText="Batal"
        isDangerous
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ClassDataProvider>
          <AppContent />
        </ClassDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
