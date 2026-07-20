import React from 'react';
import { HelpCircle } from 'lucide-react';

interface AlertModalProps {
  alertModal: {
    isOpen: boolean;
    title: string;
    message: string;
  } | null;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ alertModal, onClose }) => {
  if (!alertModal || !alertModal.isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-stone-955/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#0c0a09]/95 border border-stone-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 rounded-full shrink-0">
            <HelpCircle size={18} className="text-emerald-500" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-stone-200 font-extrabold text-[13px] tracking-tight">{alertModal.title}</h3>
            <p className="text-stone-400 text-xs leading-relaxed whitespace-pre-line font-light font-sans">{alertModal.message}</p>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-950 border border-stone-900 hover:bg-stone-900 text-stone-300 hover:text-stone-100 rounded-xl font-black text-xs transition-colors cursor-pointer shadow-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

interface CertLightboxProps {
  selectedCertUrl: string | null;
  onClose: () => void;
}

export const CertLightbox: React.FC<CertLightboxProps> = ({ selectedCertUrl, onClose }) => {
  if (!selectedCertUrl) return null;
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-stone-955/85 backdrop-blur-xs">
      <div 
        onClick={onClose}
        className="fixed inset-0 cursor-pointer"
      />
      <div className="relative bg-[#0c0a09]/95 rounded-3xl border border-stone-900 shadow-2xl max-w-xl w-full p-5 z-50 overflow-hidden flex flex-col items-center animate-fade-in">
        <div className="flex justify-between items-center w-full mb-3 pb-2 border-b border-stone-900">
          <h3 className="font-serif font-bold text-sm text-stone-200 flex items-center gap-1.5 font-sans">
            <span>📄 등록증 첨부서류 확인</span>
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-100 transition-colors text-base font-bold"
          >
            ✕
          </button>
        </div>
        
        <div className="w-full bg-stone-950 border border-stone-900 rounded-2xl flex items-center justify-center p-3 min-h-[250px] max-h-[55vh] overflow-auto">
          {selectedCertUrl.toLowerCase().endsWith('.pdf') ? (
            <iframe 
              src={selectedCertUrl} 
              className="w-full h-[400px] border-none rounded-xl"
              title="PDF Viewer" 
            />
          ) : (
            <img 
              src={selectedCertUrl} 
              alt="등록증" 
              className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-sm"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/600x400?text=%EC%9D%B4%EB%AF%B8%EC%A7%80+%EB%B6%88%EB%9F%AC%EC%98%A4%EA%B8%B0+%EC%8B%A4%ED%8C%A8';
              }}
              referrerPolicy="no-referrer"
            />
          )}
        </div>
        
        <div className="flex gap-2 mt-4 w-full justify-end">
          <a 
            href={selectedCertUrl} 
            download
            className="px-4 py-2 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/25 rounded-xl text-xs font-bold hover:bg-[#C5A059]/20 transition-colors font-sans"
          >
            PC에 다운로드
          </a>
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-950 border border-stone-900 text-stone-300 hover:bg-stone-900 hover:text-stone-100 rounded-xl text-xs font-bold transition-colors cursor-pointer font-sans"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
