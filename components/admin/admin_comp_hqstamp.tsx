import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Upload, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminHqStampTabProps {
  showTemporaryToast: (msg: string) => void;
  showTemporaryError: (msg: string) => void;
}

export const AdminHqStampTab: React.FC<AdminHqStampTabProps> = ({
  showTemporaryToast,
  showTemporaryError
}) => {
  const [stampUrl, setStampUrl] = useState<string>('/uploads/haste_hq_stamp.png');
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  const [uploading, setUploading] = useState<boolean>(false);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // [한글 주석] 컴포넌트 마운트 시 캐시 방지를 위해 현재 시간 타임스탬프를 주입합니다.
  useEffect(() => {
    setTimestamp(Date.now());
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showTemporaryError('이미지 파일만 선택할 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // 서명 및 직인용이므로 최대 해상도 400px 크기로 충분합니다.
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setPreviewBase64(event.target?.result as string);
          return;
        }

        // 투명 배경 유지를 위해 흰색을 채우지 않고 그립니다.
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // 투명도를 유지하기 위해 png 포맷으로 변환합니다.
        const pngBase64 = canvas.toDataURL('image/png');
        setPreviewBase64(pngBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewBase64) {
      showTemporaryError('업로드할 직인/서명 이미지를 선택해 주세요.');
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/hq/upload-stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data: previewBase64 })
      });

      const data = await res.json();
      if (data.success) {
        showTemporaryToast('헤이스트 직인/서명이 정상적으로 저장 및 동기화되었습니다.');
        setStampUrl(data.url);
        setTimestamp(Date.now());
        setPreviewBase64(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        showTemporaryError(data.message || '직인 업로드에 실패했습니다.');
      }
    } catch (err: any) {
      showTemporaryError('서버와의 연동 과정에서 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm font-sans max-w-3xl mx-auto">
      {/* 7대 표준 스타일 규격: 카테고리 / 칩 라벨 */}
      <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-3">
        HEADQUARTER DIGITAL SIGNATURE & STAMP
      </span>

      {/* 7대 표준 스타일 규격: 섹션 / 카드 타이틀 */}
      <h2 className="font-sans font-bold text-stone-900 text-xl md:text-2xl mb-4">
        헤이스트 직인 및 약정서 도장 설정
      </h2>

      {/* 7대 표준 스타일 규격: 본문 텍스트 */}
      <p className="text-stone-650 font-sans font-light text-sm md:text-base leading-relaxed mb-8">
        매장 점주 가입 과정에서 제공되는 전자 약정서에 표시될 헤이스트("갑")의 디지털 도장 또는 서명 이미지를 관리합니다. 
        배경이 투명한 PNG 이미지 파일 사용을 권장하며, 업로드 시 시스템 규격에 맞춰 최적화된 해상도로 자동 변환 및 클라우드 버킷에 동기화됩니다.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Current Active Stamp */}
        <div className="border border-stone-200 rounded-2xl p-5 flex flex-col items-center bg-[#FAF9F6]">
          <span className="text-xs font-bold text-stone-500 mb-3 uppercase tracking-wider">
            현재 등록된 헤이스트 직인
          </span>
          <div className="w-48 h-48 border border-dashed border-stone-300 rounded-xl flex items-center justify-center bg-white p-4 relative overflow-hidden">
            <img 
              src={`${stampUrl}?t=${timestamp}`} 
              alt="헤이스트 직인" 
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                // 대체 이미지
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200';
              }}
            />
          </div>
          <span className="inline-flex items-center gap-1.5 mt-3 text-xs text-stone-600 bg-stone-200/60 px-3 py-1 rounded-full font-sans font-medium">
            <CheckCircle size={12} className="text-emerald-600" />
            실시간 서비스 반영 중
          </span>
        </div>

        {/* Change Stamp / Upload Preview */}
        <div className="border border-stone-200 rounded-2xl p-5 flex flex-col items-center justify-between">
          <span className="text-xs font-bold text-stone-500 mb-3 uppercase tracking-wider">
            신규 파일 업로드 및 미리보기
          </span>
          <div className="w-48 h-48 border border-dashed border-stone-300 rounded-xl flex items-center justify-center bg-stone-50 p-4 relative overflow-hidden">
            {previewBase64 ? (
              <img 
                src={previewBase64} 
                alt="새 직인 미리보기" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center text-stone-400 text-center">
                <ImageIcon size={32} className="mb-2 stroke-1" />
                <span className="text-xs font-light">선택된 파일 없음</span>
              </div>
            )}
          </div>
          
          <div className="w-full mt-4 flex flex-col gap-2">
            <input 
              type="file" 
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[#FAF9F6] hover:bg-[#F2F0E8] text-stone-700 font-medium py-2 px-4 rounded-xl border border-stone-300 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload size={14} />
              파일 선택 (PNG 권장)
            </button>
          </div>
        </div>
      </div>

      {/* Error or Warning alert context */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
        <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed font-light">
          <span className="font-bold block mb-1">💡 중요 참고 사항</span>
          본 직인 이미지는 '스마트 솔루션 이용 및 상표 표시에 관한 약정서' 체결 시 "갑"의 서명란에 실시간으로 합성 및 인코딩되어 적용됩니다.
          업로드 후 기존 서명 완료된 약정서 문서에는 소급 적용되지 않으며, 새로 체결되는 계약부터 즉시 적용됩니다.
        </div>
      </div>

      {/* Upload confirmation buttons */}
      <div className="flex justify-end gap-3 border-t border-stone-100 pt-6">
        {previewBase64 && (
          <button
            onClick={() => {
              setPreviewBase64(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="bg-[#FAF9F6] hover:bg-[#F2F0E8] text-stone-700 font-medium py-3 px-6 rounded-2xl border border-stone-300 transition-all text-xs md:text-sm cursor-pointer"
          >
            선택 취소
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={uploading || !previewBase64}
          className="bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold py-3.5 px-6 rounded-2xl border border-stone-800 transition-all text-xs md:text-sm cursor-pointer disabled:opacity-40"
        >
          {uploading ? '클라우드 동기화 중...' : '헤이스트 직인 변경 적용'}
        </button>
      </div>
    </div>
  );
};
