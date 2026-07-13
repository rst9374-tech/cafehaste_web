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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-stone-200 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-full shrink-0">
            <HelpCircle size={18} className="text-emerald-500" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-stone-900 font-extrabold text-[13px] tracking-tight">{alertModal.title}</h3>
            <p className="text-stone-650 text-xs leading-relaxed whitespace-pre-line font-light font-sans">{alertModal.message}</p>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl font-black text-xs transition-colors cursor-pointer shadow-sm"
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
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-stone-955/80 backdrop-blur-sm">
      <div 
        onClick={onClose}
        className="fixed inset-0 cursor-pointer"
      />
      <div className="relative bg-white rounded-3xl border border-stone-300 shadow-2xl max-w-xl w-full p-5 z-50 overflow-hidden flex flex-col items-center animate-fade-in">
        <div className="flex justify-between items-center w-full mb-3 pb-2 border-b border-stone-200">
          <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-1.5 font-sans">
            <span>📄 등록증 첨부서류 확인</span>
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-900 transition-colors text-base font-bold"
          >
            ✕
          </button>
        </div>
        
        <div className="w-full bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-center p-3 min-h-[250px] max-h-[55vh] overflow-auto">
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
            className="px-4 py-2 bg-[#FAF4EB]/90 text-[#422B1E] border border-stone-300 rounded-xl text-xs font-bold hover:bg-[#FAF4EB] transition-colors font-sans"
          >
            PC에 다운로드
          </a>
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-850 transition-colors cursor-pointer font-sans"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
