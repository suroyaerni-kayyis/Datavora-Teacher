import React, { useState, useRef } from 'react';
import { useClassData } from '../../context/ClassDataContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  FileText, 
  Printer, 
  Download, 
  FileDown,
  Loader2,
  Check,
  CalendarCheck2, 
  GraduationCap, 
  WalletCards, 
  Users,
  Eye,
  CheckCircle2,
  School
} from 'lucide-react';
import { standardSubjects } from '../../data/mockData';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

type ReportType = 'absensi' | 'nilai' | 'kas' | 'biodata';

export const LaporanView: React.FC = () => {
  const { 
    classInfo, 
    students, 
    attendance, 
    grades, 
    cashTransactions, 
    cashBalance,
    feePayments 
  } = useClassData();
  const { themeConfig } = useTheme();

  const [activeReport, setActiveReport] = useState<ReportType>('absensi');
  const [selectedSubject, setSelectedSubject] = useState<string>('Matematika');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Trigger browser print dialog (configured with @page size: A4 portrait; margin: 20mm;)
  const handlePrint = () => {
    window.print();
  };

  // Download directly as PDF file with A4 size & exactly 2 cm margins
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);
    setDownloadSuccess(false);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Crisp high-DPI rendering
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('printable-report-card');
          if (clonedElement) {
            // A4 printable width ratio (without outer padding, since PDF margin handles 20mm)
            clonedElement.style.width = '850px';
            clonedElement.style.maxWidth = '850px';
            clonedElement.style.padding = '0px';
            clonedElement.style.boxShadow = 'none';
            clonedElement.style.border = 'none';
            clonedElement.style.borderRadius = '0px';
            const overflowContainers = clonedElement.querySelectorAll('.overflow-x-auto');
            overflowContainers.forEach((el) => {
              (el as HTMLElement).style.overflow = 'visible';
            });
          }
        },
      });

      // A4 Standard Dimensions in mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm
      
      // Margin keliling persis 2 cm = 20 mm
      const marginMm = 20; 
      const contentWidthMm = pdfWidth - (marginMm * 2); // 170 mm
      const contentHeightMm = pdfHeight - (marginMm * 2); // 257 mm

      const pxPerMm = canvas.width / contentWidthMm;
      const pageHeightPx = Math.floor(contentHeightMm * pxPerMm);

      const totalCanvasHeight = canvas.height;
      let currentSrcY = 0;
      let pageIndex = 0;

      while (currentSrcY < totalCanvasHeight) {
        if (pageIndex > 0) {
          pdf.addPage('a4', 'portrait');
        }

        const sliceHeightPx = Math.min(pageHeightPx, totalCanvasHeight - currentSrcY);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeightPx;

        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(
            canvas,
            0, currentSrcY, canvas.width, sliceHeightPx,
            0, 0, canvas.width, sliceHeightPx
          );

          const pageImgData = sliceCanvas.toDataURL('image/png');
          const sliceHeightMm = sliceHeightPx / pxPerMm;

          pdf.addImage(
            pageImgData,
            'PNG',
            marginMm,
            marginMm,
            contentWidthMm,
            sliceHeightMm,
            undefined,
            'FAST'
          );
        }

        currentSrcY += sliceHeightPx;
        pageIndex++;
      }

      let reportTitle = 'Laporan';
      if (activeReport === 'absensi') reportTitle = 'Laporan_Presensi';
      else if (activeReport === 'nilai') reportTitle = `Laporan_Nilai_${selectedSubject}`;
      else if (activeReport === 'kas') reportTitle = 'Laporan_Kas';
      else if (activeReport === 'biodata') reportTitle = 'Laporan_Biodata';

      const fileName = `DATAVORA_${reportTitle}_${classInfo.className.replace(/\s+/g, '_')}_A4_Margin2cm_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Gagal membuat file PDF:', err);
      // Fallback to browser print dialog
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Export functions
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = '';

    if (activeReport === 'absensi') {
      filename = `Laporan_Absensi_${classInfo.className}_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['No', 'Nama Siswa', 'NIS', 'Hadir', 'Sakit', 'Izin', 'Alfa', 'Persentase'];
      rows = students.map((std, idx) => {
        const stdAtt = attendance.filter(a => a.studentId === std.id);
        const h = stdAtt.filter(a => a.status === 'Hadir').length;
        const s = stdAtt.filter(a => a.status === 'Sakit').length;
        const i = stdAtt.filter(a => a.status === 'Izin').length;
        const a = stdAtt.filter(a => a.status === 'Alfa').length;
        const rate = stdAtt.length > 0 ? Math.round((h / stdAtt.length) * 100) : 100;
        return [idx + 1, `"${std.name}"`, `"${std.nis}"`, h, s, i, a, `${rate}%`];
      });
    } else if (activeReport === 'nilai') {
      filename = `Laporan_Nilai_${selectedSubject}_${classInfo.className}.csv`;
      headers = ['No', 'Nama Siswa', 'NIS', 'Tugas', 'Kuis', 'Ulangan Harian', 'PTS', 'PAS', 'Rata-rata', 'Predikat'];
      rows = students.map((std, idx) => {
        const stdGrades = grades.filter(g => g.studentId === std.id && g.subject === selectedSubject);
        const t = stdGrades.find(g => g.assessmentType === 'Tugas')?.score ?? '-';
        const k = stdGrades.find(g => g.assessmentType === 'Kuis')?.score ?? '-';
        const uh = stdGrades.find(g => g.assessmentType === 'Ulangan Harian')?.score ?? '-';
        const pts = stdGrades.find(g => g.assessmentType === 'PTS')?.score ?? '-';
        const pas = stdGrades.find(g => g.assessmentType === 'PAS')?.score ?? '-';
        const avg = stdGrades.length > 0 ? Math.round(stdGrades.reduce((sum, g) => sum + g.score, 0) / stdGrades.length) : '-';
        return [idx + 1, `"${std.name}"`, `"${std.nis}"`, t, k, uh, pts, pas, avg, (avg as number) >= 75 ? 'Tuntas' : 'Remidi'];
      });
    } else if (activeReport === 'kas') {
      filename = `Laporan_Kas_Keuangan_${classInfo.className}.csv`;
      headers = ['No', 'Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Nominal (Rp)'];
      rows = cashTransactions.map((tx, idx) => [
        idx + 1,
        tx.date,
        tx.type,
        `"${tx.category}"`,
        `"${tx.description}"`,
        tx.amount,
      ]);
    } else {
      filename = `Laporan_Biodata_Siswa_${classInfo.className}.csv`;
      headers = ['No', 'Nama Lengkap', 'NIS', 'NISN', 'JK', 'Nama Ayah', 'Nama Ibu', 'No Kontak', 'Alamat'];
      rows = students.map((s, idx) => [
        idx + 1,
        `"${s.name}"`,
        `"${s.nis}"`,
        `"${s.nisn || ''}"`,
        s.gender,
        `"${s.parentName || ''}"`,
        `"${s.parentMotherName || ''}"`,
        `"${s.parentPhone || ''}"`,
        `"${(s.address || '').replace(/"/g, '""')}"`,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3.5 pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Pusat Laporan & Rekap</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cetak format resmi atau export data ke format spreadsheet Excel/CSV
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors active:scale-97 min-h-[36px]"
            title="Export data ke berkas CSV (Excel)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors active:scale-97 min-h-[36px]"
            title="Cetak format kertas A4 dengan margin 2 cm keliling"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span>Cetak (A4 • 2 cm)</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg ${themeConfig.accentBtnClass} text-white text-xs font-semibold shadow-xs transition-colors active:scale-97 min-h-[36px] disabled:opacity-75 cursor-pointer`}
            title="Unduh berkas PDF standar A4 dengan margin 2 cm keliling"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyiapkan PDF...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>PDF Terunduh!</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-white" />
                <span>Download PDF (A4 • 2 cm)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 no-print">
        <button
          onClick={() => setActiveReport('absensi')}
          className={`p-2.5 rounded-xl border text-left transition-all min-h-[40px] ${
            activeReport === 'absensi'
              ? `${themeConfig.accentBgClass} border-current/30 ${themeConfig.accentTextClass} shadow-xs font-semibold`
              : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <CalendarCheck2 className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Laporan Absensi</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Rekapitulasi presensi semester</p>
        </button>

        <button
          onClick={() => setActiveReport('nilai')}
          className={`p-2.5 rounded-xl border text-left transition-all min-h-[40px] ${
            activeReport === 'nilai'
              ? `${themeConfig.accentBgClass} border-current/30 ${themeConfig.accentTextClass} shadow-xs font-semibold`
              : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Laporan Nilai</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Leger nilai mata pelajaran</p>
        </button>

        <button
          onClick={() => setActiveReport('kas')}
          className={`p-2.5 rounded-xl border text-left transition-all min-h-[40px] ${
            activeReport === 'kas'
              ? `${themeConfig.accentBgClass} border-current/30 ${themeConfig.accentTextClass} shadow-xs font-semibold`
              : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <WalletCards className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Laporan Kas Kelas</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Transparansi buku kas & iuran</p>
        </button>

        <button
          onClick={() => setActiveReport('biodata')}
          className={`p-2.5 rounded-xl border text-left transition-all min-h-[40px] ${
            activeReport === 'biodata'
              ? `${themeConfig.accentBgClass} border-current/30 ${themeConfig.accentTextClass} shadow-xs font-semibold`
              : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Biodata Siswa</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Daftar buku induk kelas</p>
        </button>
      </div>

      {/* Filter for Nilai report */}
      {activeReport === 'nilai' && (
        <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700 shadow-xs flex items-center gap-2.5 no-print">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Pilih Mata Pelajaran:</span>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-[34px]"
          >
            {standardSubjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Information Header: A4 Standard & Margin 2 cm */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400 no-print pt-1">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          Pratinjau Lembar Dokumen
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Standar: <strong className="font-semibold text-slate-900 dark:text-white">A4 (210 × 297 mm)</strong> • Margin: <strong className="font-semibold text-slate-900 dark:text-white">2 cm Keliling</strong>
        </span>
      </div>

      {/* Printable Report Document Card (KOP Resmi & Tanda Tangan) */}
      <div 
        ref={reportRef} 
        id="printable-report-card" 
        className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0"
      >
        
        {/* KOP LAPORAN RESMI SEKOLAH */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
          <div className="w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center shrink-0">
            {classInfo.schoolLogo ? (
              <img 
                src={classInfo.schoolLogo} 
                alt="Logo Sekolah" 
                className="w-14 sm:w-16 h-14 sm:h-16 object-contain" 
              />
            ) : (
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#D9468F] print:border-slate-800">
                <School className="w-6 sm:w-7 h-6 sm:h-7" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center px-2 sm:px-4">
            <h1 className="text-sm sm:text-lg font-bold uppercase tracking-wider text-slate-900 leading-snug">
              {classInfo.schoolName}
            </h1>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 uppercase tracking-wide">
              ADMINISTRASI WALI KELAS — RUANG {classInfo.className.toUpperCase()}
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Tahun Ajaran {classInfo.academicYear} • Semester {classInfo.semester}
            </p>
          </div>
          {/* Symmetrical placeholder for balance */}
          <div className="w-14 sm:w-16 h-14 sm:h-16 shrink-0 hidden sm:block" aria-hidden="true" />
        </div>

        {/* Report Title Sub-header */}
        <div className="text-center mb-4">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-900 underline underline-offset-4">
            {activeReport === 'absensi' && 'LAPORAN REKAPITULASI PRESENSI SISWA'}
            {activeReport === 'nilai' && `LAPORAN REKAPITULASI NILAI ${selectedSubject.toUpperCase()}`}
            {activeReport === 'kas' && 'LAPORAN BUKU KAS DAN KEUANGAN KELAS'}
            {activeReport === 'biodata' && 'BUKU INDUK BIODATA PESERTA DIDIK'}
          </h3>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Report Content Table */}
        <div className="overflow-x-auto">
          {activeReport === 'absensi' && (
            <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                  <th className="border border-slate-300 py-1.5 px-2 text-center w-8">No</th>
                  <th className="border border-slate-300 py-1.5 px-2.5">Nama Siswa</th>
                  <th className="border border-slate-300 py-1.5 px-2.5 text-center">NIS</th>
                  <th className="border border-slate-300 py-1.5 px-1.5 text-center">H</th>
                  <th className="border border-slate-300 py-1.5 px-1.5 text-center">S</th>
                  <th className="border border-slate-300 py-1.5 px-1.5 text-center">I</th>
                  <th className="border border-slate-300 py-1.5 px-1.5 text-center">A</th>
                  <th className="border border-slate-300 py-1.5 px-2.5 text-center">% Hadir</th>
                </tr>
              </thead>
              <tbody>
                {students.map((std, idx) => {
                  const stdAtt = attendance.filter(a => a.studentId === std.id);
                  const h = stdAtt.filter(a => a.status === 'Hadir').length;
                  const s = stdAtt.filter(a => a.status === 'Sakit').length;
                  const i = stdAtt.filter(a => a.status === 'Izin').length;
                  const a = stdAtt.filter(a => a.status === 'Alfa').length;
                  const rate = stdAtt.length > 0 ? Math.round((h / stdAtt.length) * 100) : 100;

                  return (
                    <tr key={std.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 py-1 px-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 py-1 px-2.5 font-medium">{std.name}</td>
                      <td className="border border-slate-300 py-1 px-2.5 text-center font-mono">{std.nis}</td>
                      <td className="border border-slate-300 py-1 px-1.5 text-center font-semibold text-emerald-700">{h}</td>
                      <td className="border border-slate-300 py-1 px-1.5 text-center text-amber-700">{s}</td>
                      <td className="border border-slate-300 py-1 px-1.5 text-center text-sky-700">{i}</td>
                      <td className="border border-slate-300 py-1 px-1.5 text-center text-rose-700">{a}</td>
                      <td className="border border-slate-300 py-1 px-2.5 text-center font-bold">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeReport === 'nilai' && (
            <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                  <th className="border border-slate-300 py-1.5 px-2 text-center w-8">No</th>
                  <th className="border border-slate-300 py-1.5 px-2.5">Nama Siswa</th>
                  <th className="border border-slate-300 py-1.5 px-1.5 text-center">Tugas</th>
                  <th className="border border-slate-300 py-1.5 px-1.5 text-center">Kuis</th>
                  <th className="border border-slate-300 py-1.5 px-1.5 text-center">UH</th>
                  <th className="border border-slate-300 py-1.5 px-1.5 text-center">PTS</th>
                  <th className="border border-slate-300 py-1.5 px-1.5 text-center">PAS</th>
                  <th className="border border-slate-300 py-1.5 px-1.5 text-center">Rata-rata</th>
                  <th className="border border-slate-300 py-1.5 px-2 text-center">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {students.map((std, idx) => {
                  const stdGrades = grades.filter(g => g.studentId === std.id && g.subject === selectedSubject);
                  const t = stdGrades.find(g => g.assessmentType === 'Tugas')?.score ?? '-';
                  const k = stdGrades.find(g => g.assessmentType === 'Kuis')?.score ?? '-';
                  const uh = stdGrades.find(g => g.assessmentType === 'Ulangan Harian')?.score ?? '-';
                  const pts = stdGrades.find(g => g.assessmentType === 'PTS')?.score ?? '-';
                  const pas = stdGrades.find(g => g.assessmentType === 'PAS')?.score ?? '-';
                  const avg = stdGrades.length > 0 ? Math.round(stdGrades.reduce((sum, g) => sum + g.score, 0) / stdGrades.length) : null;

                  return (
                    <tr key={std.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 py-1 px-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 py-1 px-2.5 font-medium">{std.name}</td>
                      <td className="border border-slate-300 py-1 px-1.5 text-center">{t}</td>
                      <td className="border border-slate-300 py-1 px-1.5 text-center">{k}</td>
                      <td className="border border-slate-300 py-1 px-1.5 text-center">{uh}</td>
                      <td className="border border-slate-300 py-1 px-1.5 text-center">{pts}</td>
                      <td className="border border-slate-300 py-1 px-1.5 text-center">{pas}</td>
                      <td className="border border-slate-300 py-1 px-1.5 text-center font-bold text-[#D9468F]">
                        {avg ?? '-'}
                      </td>
                      <td className="border border-slate-300 py-1 px-2 text-center font-medium">
                        {avg === null ? '-' : avg >= 75 ? 'Tuntas' : 'Remidial'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeReport === 'kas' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Total Pemasukan:</span>
                  <span className="font-bold text-emerald-700">Rp {cashBalance.totalIncome.toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Total Pengeluaran:</span>
                  <span className="font-bold text-rose-700">Rp {cashBalance.totalExpense.toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Saldo Kas Saat Ini:</span>
                  <span className="font-bold text-[#D9468F]">Rp {cashBalance.balance.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                    <th className="border border-slate-300 py-1.5 px-2 text-center w-8">No</th>
                    <th className="border border-slate-300 py-1.5 px-2.5">Tanggal</th>
                    <th className="border border-slate-300 py-1.5 px-2.5">Kategori</th>
                    <th className="border border-slate-300 py-1.5 px-2.5">Uraian / Keterangan</th>
                    <th className="border border-slate-300 py-1.5 px-2.5 text-right">Pemasukan</th>
                    <th className="border border-slate-300 py-1.5 px-2.5 text-right">Pengeluaran</th>
                  </tr>
                </thead>
                <tbody>
                  {cashTransactions.map((tx, idx) => (
                    <tr key={tx.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 py-1 px-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 py-1 px-2.5">{tx.date}</td>
                      <td className="border border-slate-300 py-1 px-2.5">{tx.category}</td>
                      <td className="border border-slate-300 py-1 px-2.5 font-medium">{tx.description}</td>
                      <td className="border border-slate-300 py-1 px-2.5 text-right font-semibold text-emerald-700">
                        {tx.type === 'Pemasukan' ? `Rp ${tx.amount.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="border border-slate-300 py-1 px-2.5 text-right font-semibold text-rose-700">
                        {tx.type === 'Pengeluaran' ? `Rp ${tx.amount.toLocaleString('id-ID')}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReport === 'biodata' && (
            <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                  <th className="border border-slate-300 py-1.5 px-2 text-center w-8">No</th>
                  <th className="border border-slate-300 py-1.5 px-2.5">Nama Lengkap</th>
                  <th className="border border-slate-300 py-1.5 px-2 text-center">NIS</th>
                  <th className="border border-slate-300 py-1.5 px-2 text-center">JK</th>
                  <th className="border border-slate-300 py-1.5 px-2.5">Nama Orang Tua</th>
                  <th className="border border-slate-300 py-1.5 px-2.5">Kontak Orang Tua</th>
                  <th className="border border-slate-300 py-1.5 px-2.5">Alamat</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={s.id} className="border-b border-slate-200">
                    <td className="border border-slate-300 py-1 px-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 py-1 px-2.5 font-medium">{s.name}</td>
                    <td className="border border-slate-300 py-1 px-2 text-center font-mono">{s.nis}</td>
                    <td className="border border-slate-300 py-1 px-2 text-center">{s.gender}</td>
                    <td className="border border-slate-300 py-1 px-2.5">{s.parentName || '-'}</td>
                    <td className="border border-slate-300 py-1 px-2.5">{s.parentPhone || s.phone || '-'}</td>
                    <td className="border border-slate-300 py-1 px-2.5 truncate max-w-xs">{s.address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Tanda Tangan Formal (Signatures) */}
        <div className="mt-8 pt-4 flex justify-between items-start text-[11px] text-slate-800">
          <div className="text-center w-52">
            <p>Mengetahui,</p>
            <p className="font-semibold">Kepala Sekolah</p>
            <div className="h-12" />
            <p className="font-bold underline">{classInfo.headmasterName || 'Dr. Bambang Sutrisno, M.Pd.'}</p>
            <p className="text-[10px] text-slate-500">
              {classInfo.headmasterNip ? `NIP. ${classInfo.headmasterNip}` : 'NIP. -'}
            </p>
          </div>

          <div className="text-center w-52">
            <p>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-semibold">Guru Wali Kelas {classInfo.className}</p>
            <div className="h-12" />
            <p className="font-bold underline">{classInfo.homeroomTeacher}</p>
            <p className="text-[10px] text-slate-500">
              {classInfo.homeroomTeacherNip ? `NIP. ${classInfo.homeroomTeacherNip}` : 'NIP. -'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
