import React, { useState, useMemo } from 'react';
import { useClassData } from '../../context/ClassDataContext';
import { CashTransaction, PaymentItem, CashTransactionType, PaymentStatus } from '../../types';
import { 
  WalletCards, 
  ArrowDownRight, 
  ArrowUpRight, 
  Plus, 
  Search, 
  Download, 
  CheckCircle2, 
  Trash2, 
  Check, 
  Coins,
  BadgeAlert
} from 'lucide-react';
import { Modal } from '../Modal';
import { ConfirmDialog } from '../ConfirmDialog';

export const AdministrasiView: React.FC = () => {
  const { 
    cashTransactions, 
    payments, 
    students, 
    cashBalance, 
    addCashTransaction, 
    deleteCashTransaction, 
    updatePaymentStatus,
    classInfo 
  } = useClassData();

  const [activeSubTab, setActiveSubTab] = useState<'kas' | 'iuran'>('kas');

  // Kas state
  const [filterType, setFilterType] = useState<'Semua' | CashTransactionType>('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  // Deletion state
  const [deletingTx, setDeletingTx] = useState<CashTransaction | null>(null);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashForm, setCashForm] = useState<{
    type: CashTransactionType;
    category: string;
    description: string;
    amount: string;
    date: string;
  }>({
    type: 'Pemasukan',
    category: 'Iuran Kas',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Iuran state
  const [iuranFilter, setIuranFilter] = useState<'Semua' | 'Sudah Bayar' | 'Belum Bayar'>('Semua');
  const [iuranSearch, setIuranSearch] = useState('');

  // Filtered cash transactions
  const filteredTransactions = useMemo(() => {
    return cashTransactions.filter(t => {
      const matchType = filterType === 'Semua' || t.type === filterType;
      const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [cashTransactions, filterType, searchTerm]);

  // Handle Cash submit
  const handleSaveCash = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(cashForm.amount.replace(/\D/g, ''), 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    addCashTransaction({
      type: cashForm.type,
      category: cashForm.category,
      description: cashForm.description.trim() || `${cashForm.type} kas kelas`,
      amount: parsedAmount,
      date: cashForm.date,
    });

    setIsCashModalOpen(false);
  };

  // Export Kas to CSV
  const handleExportKasCSV = () => {
    if (cashTransactions.length === 0) return;
    const headers = ['No', 'Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Nominal (Rp)'];
    const rows = filteredTransactions.map((t, idx) => [
      idx + 1,
      t.date,
      t.type,
      `"${t.category || ''}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Buku_Kas_${classInfo.className.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fee / Iuran student matrix
  const studentFeeList = useMemo(() => {
    return students
      .filter(s => s.name.toLowerCase().includes(iuranSearch.toLowerCase()) || s.nis.includes(iuranSearch))
      .map(std => {
        const payment = payments.find(p => p.studentId === std.id);
        const isPaid = payment?.status === 'Sudah Bayar';
        return {
          student: std,
          payment: payment || null,
          isPaid,
          paidDate: payment?.date,
        };
      })
      .filter(item => {
        if (iuranFilter === 'Sudah Bayar') return item.isPaid;
        if (iuranFilter === 'Belum Bayar') return !item.isPaid;
        return true;
      });
  }, [students, payments, iuranSearch, iuranFilter]);

  const paidCount = payments.filter(p => p.status === 'Sudah Bayar').length;
  const unpaidCount = Math.max(0, students.length - paidCount);

  const handleTogglePayment = (studentId: string, currentStatus: boolean, paymentId?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (paymentId) {
      updatePaymentStatus(paymentId, currentStatus ? 'Belum Bayar' : 'Sudah Bayar', currentStatus ? undefined : todayStr);
    }
  };

  return (
    <div className="space-y-3.5 pb-10">
      {/* Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Administrasi & Keuangan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola buku kas kelas, iuran kas siswa, dan transparansi laporan keuangan
          </p>
        </div>

        <div className="flex items-center p-0.5 bg-slate-200/70 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('kas')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all min-h-[34px] ${
              activeSubTab === 'kas'
                ? 'bg-white text-[#D9468F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <WalletCards className="w-3.5 h-3.5" />
            <span>Buku Kas</span>
          </button>
          <button
            onClick={() => setActiveSubTab('iuran')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all min-h-[34px] ${
              activeSubTab === 'iuran'
                ? 'bg-white text-[#D9468F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Iuran Siswa</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'kas' ? (
        /* Sub-tab 1: Buku Kas Kelas */
        <div className="space-y-3">
          {/* Summary Financial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Total Pemasukan</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg sm:text-xl font-bold text-emerald-600 mt-1">
                +Rp {cashBalance.totalIncome.toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Uang kas & donasi masuk</p>
            </div>

            <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Total Pengeluaran</span>
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg sm:text-xl font-bold text-rose-600 mt-1">
                -Rp {cashBalance.totalExpense.toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Pembelian alat & kegiatan</p>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-pink-50/60 p-3 sm:p-3.5 rounded-xl border border-rose-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#D9468F]">Saldo Akhir Bersih</span>
                <div className="w-7 h-7 rounded-lg bg-[#D9468F] text-white flex items-center justify-center">
                  <WalletCards className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                Rp {cashBalance.balance.toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] text-rose-700/80 mt-0.5">Dana siap digunakan</p>
            </div>
          </div>

          {/* Action and Filter Bar */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari transaksi / keterangan..."
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] w-full sm:w-60 min-h-[36px]"
              />

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as 'Semua' | CashTransactionType)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
              >
                <option value="Semua">Semua Jenis</option>
                <option value="Pemasukan">Pemasukan (+)</option>
                <option value="Pengeluaran">Pengeluaran (-)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <button
                onClick={handleExportKasCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors active:scale-97 min-h-[36px]"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                onClick={() => {
                  setCashForm({
                    type: 'Pemasukan',
                    category: 'Iuran Kas',
                    description: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                  });
                  setIsCashModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D9468F] hover:bg-[#C2357A] text-white text-xs font-semibold shadow-xs transition-colors active:scale-97 min-h-[36px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Catat Transaksi</span>
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
            {filteredTransactions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Belum ada transaksi kas yang dicatat.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-2 px-3 w-10 text-center">No</th>
                      <th className="py-2 px-3">Tanggal</th>
                      <th className="py-2 px-3">Kategori</th>
                      <th className="py-2 px-3">Keterangan</th>
                      <th className="py-2 px-3 text-center">Jenis</th>
                      <th className="py-2 px-3 text-right">Nominal</th>
                      <th className="py-2 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredTransactions.map((tx, idx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-2 px-3 text-slate-600 font-medium whitespace-nowrap">{tx.date}</td>
                        <td className="py-2 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {tx.category || 'Kas'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-800 font-medium">{tx.description}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            tx.type === 'Pemasukan' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {tx.type === 'Pemasukan' ? <ArrowDownRight className="w-2.5 h-2.5" /> : <ArrowUpRight className="w-2.5 h-2.5" />}
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold">
                          <span className={tx.type === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'}>
                            {tx.type === 'Pemasukan' ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => setDeletingTx(tx)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Sub-tab 2: Iuran Siswa */
        <div className="space-y-3">
          {/* Iuran Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500">Iuran Terkumpul</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  Rp {(paidCount * 10000).toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-slate-400">Tarif Rp 10.000 / anak</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#D9468F]/10 text-[#D9468F] flex items-center justify-center font-bold">
                <Coins className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500">Siswa Lunas</span>
                <div className="text-lg font-bold text-emerald-600 mt-0.5">{paidCount} Siswa</div>
                <span className="text-[10px] text-slate-400">{students.length > 0 ? Math.round((paidCount / students.length) * 100) : 0}% terlunasi</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500">Belum Membayar</span>
                <div className="text-lg font-bold text-rose-600 mt-0.5">{unpaidCount} Siswa</div>
                <span className="text-[10px] text-slate-400">Perlu pengingat kelas</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <BadgeAlert className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <input
              type="text"
              value={iuranSearch}
              onChange={e => setIuranSearch(e.target.value)}
              placeholder="Cari nama atau NIS siswa..."
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] w-full sm:w-64 min-h-[36px]"
            />

            <div className="flex items-center gap-1 w-full sm:w-auto">
              {(['Semua', 'Sudah Bayar', 'Belum Bayar'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setIuranFilter(tab)}
                  className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors min-h-[32px] ${
                    iuranFilter === tab
                      ? 'bg-[#D9468F] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Student Iuran List */}
          <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs divide-y divide-slate-100">
            {studentFeeList.map((item, idx) => (
              <div 
                key={item.student.id} 
                className="p-2.5 sm:p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-medium text-slate-400 w-4 text-center shrink-0">{idx + 1}</span>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {item.student.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-slate-900 truncate">
                      {item.student.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      NIS: {item.student.nis} {item.paidDate ? `• Dibayar: ${item.paidDate}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                    item.isPaid 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                    {item.isPaid ? 'Lunas' : 'Belum Bayar'}
                  </span>

                  {item.payment && (
                    <button
                      onClick={() => handleTogglePayment(item.student.id, item.isPaid, item.payment?.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all active:scale-97 min-h-[32px] ${
                        item.isPaid 
                          ? 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>{item.isPaid ? 'Batal' : 'Tandai Lunas'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        title="Catat Transaksi Kas"
        subtitle="Pemasukan atau pengeluaran operasional kas kelas"
        maxWidth="md"
      >
        <form onSubmit={handleSaveCash} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Transaksi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCashForm({ ...cashForm, type: 'Pemasukan' })}
                className={`py-1.5 rounded-lg text-xs font-bold border transition-colors min-h-[36px] ${
                  cashForm.type === 'Pemasukan'
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Pemasukan (+)
              </button>
              <button
                type="button"
                onClick={() => setCashForm({ ...cashForm, type: 'Pengeluaran' })}
                className={`py-1.5 rounded-lg text-xs font-bold border transition-colors min-h-[36px] ${
                  cashForm.type === 'Pengeluaran'
                    ? 'bg-rose-500 border-rose-500 text-white shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Pengeluaran (-)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Kategori</label>
            <select
              value={cashForm.category}
              onChange={e => setCashForm({ ...cashForm, category: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
            >
              <option value="Iuran Kas">Iuran Kas Siswa</option>
              <option value="Kebersihan">Alat Kebersihan & Piket</option>
              <option value="Fotokopi & ATK">Fotokopi & ATK Kelas</option>
              <option value="Kegiatan Kelas">Kegiatan / Lomba Kelas</option>
              <option value="Kesehatan / P3K">Obat / P3K</option>
              <option value="Sosial & Jenguk">Sosial / Jenguk Teman Sakit</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nominal (Rp) <span className="text-rose-500">*</span></label>
            <input
              type="number"
              required
              min={1000}
              step={500}
              placeholder="mis. 50000"
              value={cashForm.amount}
              onChange={e => setCashForm({ ...cashForm, amount: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Keterangan Transaksi</label>
            <input
              type="text"
              placeholder="mis. Beli sapu lantai & penghapus whiteboard"
              value={cashForm.description}
              onChange={e => setCashForm({ ...cashForm, description: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal</label>
            <input
              type="date"
              value={cashForm.date}
              onChange={e => setCashForm({ ...cashForm, date: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
            />
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCashModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 min-h-[36px]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#D9468F] hover:bg-[#C2357A] text-white text-xs font-semibold transition-colors min-h-[36px]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Cash Transaction Confirmation Alert Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingTx)}
        onClose={() => setDeletingTx(null)}
        onConfirm={() => {
          if (deletingTx) {
            deleteCashTransaction(deletingTx.id);
            setDeletingTx(null);
          }
        }}
        title="Hapus Transaksi Kas"
        itemName={deletingTx ? `${deletingTx.description} • Rp ${deletingTx.amount.toLocaleString('id-ID')} (${deletingTx.type})` : undefined}
        message={`Apakah Anda yakin ingin menghapus data transaksi "${deletingTx?.description}" sebesar Rp ${deletingTx?.amount.toLocaleString('id-ID')}? Saldo kas kelas akan diperbarui secara otomatis.`}
        confirmText="Hapus Transaksi"
        isDangerous
      />
    </div>
  );
};
