import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div
      id="global-toast-notification"
      className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#141414]/95 backdrop-blur-md border border-[#D4AF37]/50 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.2)] text-xs text-white animate-in slide-in-from-top-4 duration-300"
    >
      {toastMessage.type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      ) : toastMessage.type === 'error' ? (
        <AlertCircle className="w-4 h-4 text-red-400" />
      ) : (
        <Info className="w-4 h-4 text-[#D4AF37]" />
      )}
      
      <span className="font-medium">{toastMessage.text}</span>
    </div>
  );
};
