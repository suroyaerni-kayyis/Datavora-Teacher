import React, { useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  isDangerous = true,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button on open so pressing Enter won't accidentally trigger dangerous confirm
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center p-1">
        {/* Warning Icon Badge */}
        <div 
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-xs ${
            isDangerous 
              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 ring-4 ring-rose-50 dark:ring-rose-950/30' 
              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 ring-4 ring-amber-50 dark:ring-amber-950/30'
          }`}
        >
          {isDangerous ? (
            <Trash2 className="w-6 h-6 animate-pulse" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>

        {/* Item highlighted box if provided */}
        {itemName && (
          <div className="w-full px-3 py-2 mb-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
            {itemName}
          </div>
        )}

        {/* Description / Message */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
          {message}
        </p>

        {isDangerous && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 mb-5 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 text-[11px] font-medium text-rose-700 dark:text-rose-300">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Tindakan ini permanen dan tidak dapat dibatalkan.</span>
          </div>
        )}

        {/* Actions Button Group */}
        <div className="flex items-center justify-end gap-2.5 w-full pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors active:scale-97 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all active:scale-97 min-h-[40px] shadow-xs flex items-center justify-center gap-1.5 focus:outline-none ${
              isDangerous 
                ? 'bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500 shadow-rose-600/20' 
                : 'bg-[#D9468F] hover:bg-[#C2357A] focus:ring-2 focus:ring-[#D9468F] shadow-rose-500/20'
            }`}
          >
            {isDangerous && <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
