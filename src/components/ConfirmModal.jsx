import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDestructive = false, autoClose = true }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                        <AlertTriangle className={clsx("w-5 h-5", isDestructive ? "text-red-500" : "text-amber-500")} />
                        {title}
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-slate-300">
                    {message}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            if (autoClose) onClose();
                        }}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-white font-bold transition-colors shadow-lg",
                            isDestructive
                                ? "bg-red-600 hover:bg-red-500 shadow-red-900/20"
                                : "bg-amber-600 hover:bg-amber-500 shadow-amber-900/20"
                        )}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
