import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { Student, Gender, StudentStatus } from '../../types';
import { useClassData } from '../../context/ClassDataContext';
import { Check, User, Phone, MapPin, Users2, HeartPulse } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
}) => {
  const { addStudent, updateStudent, classInfo } = useClassData();

  const [formData, setFormData] = useState<Omit<Student, 'id' | 'createdAt'>>({
    name: '',
    nis: '',
    nisn: '',
    gender: 'L',
    className: classInfo.className,
    status: 'Aktif',
    birthPlace: '',
    birthDate: '',
    address: '',
    phone: '',
    parentName: '',
    parentMotherName: '',
    parentPhone: '',
    parentJob: '',
    bloodType: 'Belum Cek',
    healthNotes: '',
    specialNotes: '',
  });

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        name: studentToEdit.name || '',
        nis: studentToEdit.nis || '',
        nisn: studentToEdit.nisn || '',
        gender: studentToEdit.gender || 'L',
        className: studentToEdit.className || classInfo.className,
        status: studentToEdit.status || 'Aktif',
        birthPlace: studentToEdit.birthPlace || '',
        birthDate: studentToEdit.birthDate || '',
        address: studentToEdit.address || '',
        phone: studentToEdit.phone || '',
        parentName: studentToEdit.parentName || '',
        parentMotherName: studentToEdit.parentMotherName || '',
        parentPhone: studentToEdit.parentPhone || '',
        parentJob: studentToEdit.parentJob || '',
        bloodType: studentToEdit.bloodType || 'Belum Cek',
        healthNotes: studentToEdit.healthNotes || '',
        specialNotes: studentToEdit.specialNotes || '',
      });
    } else {
      setFormData({
        name: '',
        nis: '',
        nisn: '',
        gender: 'L',
        className: classInfo.className,
        status: 'Aktif',
        birthPlace: '',
        birthDate: '',
        address: '',
        phone: '',
        parentName: '',
        parentMotherName: '',
        parentPhone: '',
        parentJob: '',
        bloodType: 'Belum Cek',
        healthNotes: '',
        specialNotes: '',
      });
    }
  }, [studentToEdit, isOpen, classInfo.className]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nis.trim()) return;

    if (studentToEdit) {
      updateStudent(studentToEdit.id, formData);
    } else {
      addStudent(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
      subtitle={studentToEdit ? `Memperbarui biodata ${studentToEdit.name}` : `Menambahkan siswa ke ${classInfo.className}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Identitas Pokok */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-[#D9468F]" />
            Identitas Pokok
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nama Lengkap Siswa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F]"
                placeholder="mis. Muhammad Raihan Fadillah"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                NIS (Nomor Induk Siswa) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nis}
                onChange={e => setFormData({ ...formData, nis: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F]"
                placeholder="mis. 23240815"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                NISN (10 Digit Nasional)
              </label>
              <input
                type="text"
                value={formData.nisn}
                onChange={e => setFormData({ ...formData, nisn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F]"
                placeholder="mis. 0098456789"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Status Siswa
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white"
              >
                <option value="Aktif">Aktif</option>
                <option value="Mutasi">Mutasi</option>
                <option value="Lulus">Lulus</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={formData.birthPlace}
                onChange={e => setFormData({ ...formData, birthPlace: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F]"
                placeholder="mis. Jakarta"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Alamat Tempat Tinggal
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F]"
                placeholder="Jl. Nama Jalan No. XX, Kelurahan, Kecamatan"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                No. HP / WhatsApp Siswa
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F]"
                placeholder="mis. 0812-3456-7890"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Data Orang Tua */}
        <div className="pt-3 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users2 className="w-3.5 h-3.5 text-[#D9468F]" />
            Data Orang Tua / Wali
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nama Ayah
              </label>
              <input
                type="text"
                value={formData.parentName}
                onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F]"
                placeholder="Nama ayah kandung / wali"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nama Ibu
              </label>
              <input
                type="text"
                value={formData.parentMotherName}
                onChange={e => setFormData({ ...formData, parentMotherName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F]"
                placeholder="Nama ibu kandung"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                No. HP / WA Orang Tua
              </label>
              <input
                type="text"
                value={formData.parentPhone}
                onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F]"
                placeholder="mis. 0813-9876-5432"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Pekerjaan Orang Tua
              </label>
              <input
                type="text"
                value={formData.parentJob}
                onChange={e => setFormData({ ...formData, parentJob: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F]"
                placeholder="mis. Karyawan Swasta / PNS / Wiraswasta"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Tambahan & Kesehatan */}
        <div className="pt-3 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <HeartPulse className="w-3.5 h-3.5 text-[#D9468F]" />
            Catatan Kesehatan & Tambahan
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Golongan Darah
              </label>
              <select
                value={formData.bloodType}
                onChange={e => setFormData({ ...formData, bloodType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white"
              >
                <option value="Belum Cek">Belum Cek</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Catatan Khusus / Peran Kelas
              </label>
              <input
                type="text"
                value={formData.specialNotes}
                onChange={e => setFormData({ ...formData, specialNotes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F]"
                placeholder="mis. Ketua Kelas / Anggota OSIS"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Informasi Alergi / Riwayat Kesehatan
              </label>
              <input
                type="text"
                value={formData.healthNotes}
                onChange={e => setFormData({ ...formData, healthNotes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9468F]"
                placeholder="mis. Alergi udang / Asma ringan"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors min-h-[44px]"
          >
            Batal
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#D9468F] hover:bg-[#C2357A] transition-colors active:scale-97 min-h-[44px]"
          >
            <Check className="w-4 h-4" />
            <span>{studentToEdit ? 'Simpan Perubahan' : 'Tambahkan Siswa'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
