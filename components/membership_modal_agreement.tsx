import React, { useRef, useState, useEffect } from 'react';
import { Shield, Check, X, RefreshCw, Download } from 'lucide-react';
import { AGREEMENT_TITLE, AGREEMENT_SUBTITLE, AGREEMENT_LINES } from './haste_agreement_data';

interface HasteAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeCode: string;
  storeName: string;
  ownerName: string;
  phone: string;
  address: string;
  onAgreementComplete: (agreementFile: File, dataUrl: string) => void;
}

export const HasteAgreementModal: React.FC<HasteAgreementModalProps> = ({
  isOpen,
  onClose,
  storeCode,
  storeName,
  ownerName,
  phone,
  address,
  onAgreementComplete
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasRef3 = useRef<HTMLCanvasElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeCanvasIdx, setActiveCanvasIdx] = useState<number | null>(null);
  const [hasSig1, setHasSig1] = useState(false);
  const [hasSig2, setHasSig2] = useState(false);
  const [hasSig3, setHasSig3] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stampTimestamp, setStampTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      setIsAgreed(false);
      setHasSig1(false);
      setHasSig2(false);
      setHasSig3(false);
      setIsProcessing(false);
      setStampTimestamp(Date.now());
      setTimeout(() => {
        clearAllSignatures();
      }, 150);
    }
  }, [isOpen, ownerName]);

  if (!isOpen) return null;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const getGuideChar = (idx: number) => {
    const name = ownerName || '홍길동';
    if (name.length >= 3) {
      return name.charAt(idx - 1) || '';
    } else if (name.length === 2) {
      if (idx === 1) return name.charAt(0);
      if (idx === 2) return name.charAt(1);
      return '인';
    } else {
      if (idx === 1) return name.charAt(0) || '홍';
      if (idx === 2) return '길';
      return '동';
    }
  };

  const drawGuideText = (canvas: HTMLCanvasElement, char: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = 'rgba(156, 163, 175, 0.28)';
    ctx.font = 'bold 68px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, canvas.width / 2, canvas.height / 2 + 2);
  };

  const clearSignature = (idx: number) => {
    const canvas = idx === 1 ? canvasRef1.current : idx === 2 ? canvasRef2.current : canvasRef3.current;
    if (!canvas) return;
    drawGuideText(canvas, getGuideChar(idx));
    if (idx === 1) setHasSig1(false);
    else if (idx === 2) setHasSig2(false);
    else if (idx === 3) setHasSig3(false);
  };

  const clearAllSignatures = () => {
    clearSignature(1);
    clearSignature(2);
    clearSignature(3);
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent, idx: number) => {
    if (!hasScrolledToBottom || !isAgreed) return;
    const canvas = idx === 1 ? canvasRef1.current : idx === 2 ? canvasRef2.current : canvasRef3.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setActiveCanvasIdx(idx);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || activeCanvasIdx === null) return;
    const canvas = activeCanvasIdx === 1 ? canvasRef1.current : activeCanvasIdx === 2 ? canvasRef2.current : canvasRef3.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      if (e.cancelable) e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    if (activeCanvasIdx === 1) setHasSig1(true);
    else if (activeCanvasIdx === 2) setHasSig2(true);
    else if (activeCanvasIdx === 3) setHasSig3(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setActiveCanvasIdx(null);
  };

  const handleCompleteAgreement = async () => {
    if (!hasScrolledToBottom || !isAgreed || !(hasSig1 && hasSig2 && hasSig3)) return;
    setIsProcessing(true);

    try {
      const docCanvas = document.createElement('canvas');
      docCanvas.width = 800;
      docCanvas.height = 1450;
      const ctx = docCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      ctx.fillStyle = '#FAF9F6';
      ctx.fillRect(0, 0, docCanvas.width, docCanvas.height);

      ctx.strokeStyle = '#C5A059';
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, docCanvas.width - 40, docCanvas.height - 40);
      ctx.strokeStyle = '#1C1917';
      ctx.lineWidth = 1;
      ctx.strokeRect(26, 26, docCanvas.width - 52, docCanvas.height - 52);

      ctx.fillStyle = '#1C1917';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(AGREEMENT_TITLE, docCanvas.width / 2, 80);

      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#78716C';
      ctx.fillText(AGREEMENT_SUBTITLE, docCanvas.width / 2, 110);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#292524';
      
      let startY = 150;
      ctx.font = '12px sans-serif';
      AGREEMENT_LINES.forEach((line) => {
        if (line.startsWith('제 ')) {
          ctx.font = 'bold 13px sans-serif';
          ctx.fillStyle = '#1C1917';
        } else {
          ctx.font = '12px sans-serif';
          ctx.fillStyle = '#44403C';
        }
        ctx.fillText(line, 60, startY);
        startY += 20;
      });

      const now = new Date();
      const dateStr = `${now.getFullYear()}년 ${String(now.getMonth() + 1).padStart(2, '0')}월 ${String(now.getDate()).padStart(2, '0')}일`;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#1C1917';
      ctx.textAlign = 'center';
      ctx.fillText(dateStr, docCanvas.width / 2, startY + 40);

      startY += 100;
      ctx.textAlign = 'left';
      ctx.font = 'bold 12.5px sans-serif';
      
      ctx.fillText('[ "갑" (공급자) ]', 60, startY);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#44403C';
      ctx.fillText('상  호 : 헤이스트', 60, startY + 25);
      ctx.fillText('대  표 : 김 성 규', 60, startY + 45);
      ctx.fillText('주  소 : 경기도 김포시 김포한강11로', 60, startY + 65);
      ctx.fillText('연락처 : 1644-8999', 60, startY + 85);

      ctx.font = 'bold 12.5px sans-serif';
      ctx.fillStyle = '#1C1917';
      ctx.fillText('[ "을" (이용자) ]', docCanvas.width / 2 + 20, startY);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#44403C';
      ctx.fillText(`상  호 : ${storeName}`, docCanvas.width / 2 + 20, startY + 25);
      ctx.fillText(`대  표 : ${ownerName}`, docCanvas.width / 2 + 20, startY + 45);
      ctx.fillText(`주  소 : ${address}`, docCanvas.width / 2 + 20, startY + 65);
      ctx.fillText(`연락처 : ${phone}`, docCanvas.width / 2 + 20, startY + 85);

      const hqStamp = new Image();
      hqStamp.crossOrigin = 'anonymous';
      hqStamp.src = `/uploads/haste_hq_stamp.png?t=${stampTimestamp}`;
      await new Promise((resolve) => {
        hqStamp.onload = () => {
          ctx.drawImage(hqStamp, 160, startY + 8, 99, 99);
          resolve(null);
        };
        hqStamp.onerror = () => {
          ctx.strokeStyle = '#B91C1C';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(165, startY + 25, 60, 60);
          ctx.fillStyle = '#B91C1C';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('(인)', 190, startY + 60);
          resolve(null);
        };
      });

      const canvas1 = canvasRef1.current;
      const canvas2 = canvasRef2.current;
      const canvas3 = canvasRef3.current;
      if (canvas1) {
        ctx.drawImage(canvas1, docCanvas.width / 2 + 95, startY + 11, 72, 72);
      }
      if (canvas2) {
        ctx.drawImage(canvas2, docCanvas.width / 2 + 175, startY + 11, 72, 72);
      }
      if (canvas3) {
        ctx.drawImage(canvas3, docCanvas.width / 2 + 255, startY + 11, 72, 72);
      }

      const mergedDataUrl = docCanvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = mergedDataUrl;
      downloadLink.download = `membership_agreement_${storeCode}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      const response = await fetch(mergedDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `membership_agreement_${storeCode}_${Date.now()}.png`, { type: 'image/png' });

      onAgreementComplete(file, mergedDataUrl);
    } catch (err: any) {
      alert('약정서 캔버스 이미지 생성 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col my-8 max-h-[98vh]">
        
        <div className="bg-[#15141D] border-b border-stone-800 py-3 sm:py-4.5 px-4 sm:px-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
              <Shield className="text-[#C5A059]" size={14} />
            </div>
            <div>
              <span className="haste-category-label-en mb-0.5">HASTE AGREEMENT</span>
              <h3 className="haste-section-title-3 !text-white leading-tight">헤이스트 스마트 솔루션 이용 약정서 체결</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors cursor-pointer"><X size={18} /></button>
        </div>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 text-[11px] leading-relaxed text-stone-650 flex flex-col gap-4 border-b border-stone-100 max-h-[460px]"
        >
          <div className="text-center font-bold text-stone-900 text-sm mb-3">{AGREEMENT_TITLE}</div>
          <p className="italic text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-100">{AGREEMENT_SUBTITLE}</p>

          <div className="space-y-4">
            {AGREEMENT_LINES.map((line, idx) => {
              if (line.trim() === '') return <div key={idx} className="h-2" />;
              if (line.startsWith('제 ')) {
                return (
                  <strong key={idx} className="text-stone-850 font-bold block mt-3">
                    {line}
                  </strong>
                );
              }
              return <p key={idx}>{line}</p>;
            })}
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4 bg-stone-50 border-t border-stone-150 shrink-0">
          {!hasScrolledToBottom && (
            <div className="text-center text-rose-500 font-bold text-[10.5px] bg-rose-50 border border-rose-100 py-2 rounded-xl animate-pulse">
              ⚠️ 약정서 내용을 끝까지 스크롤하여 모두 읽어주신 후 동의 체크가 가능합니다.
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <input 
              type="checkbox"
              id="haste-agree-chk"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              disabled={!hasScrolledToBottom}
              className="w-4 h-4 text-[#C5A059] border-stone-300 rounded-sm focus:ring-[#C5A059] disabled:opacity-40 cursor-pointer"
            />
            <label 
              htmlFor="haste-agree-chk" 
              className={`text-[11.5px] font-bold select-none cursor-pointer ${hasScrolledToBottom ? 'text-stone-800' : 'text-stone-400'}`}
            >
              상기 스마트 솔루션 이용 및 상표 표시에 관한 약정서의 모든 조항을 완전히 인지하고 서명(도장 날인)에 동의합니다.
            </label>
          </div>

          <div className={`grid grid-cols-2 gap-4 border border-stone-200 bg-white p-3.5 rounded-2xl transition-all ${isAgreed && hasScrolledToBottom ? 'opacity-100' : 'opacity-40 pointer-events-none blur-2xs'}`}>
            <div className="border border-stone-100 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 relative overflow-hidden bg-stone-50/50">
              <span className="text-[9.5px] font-bold text-stone-500 uppercase tracking-widest block">공급자 [갑] 날인</span>
              <img src={`/uploads/haste_hq_stamp.png?t=${stampTimestamp}`} alt="Haste HQ Stamp" className="w-[85px] h-[85px] object-contain z-10" />
              <span className="text-[10px] font-bold text-[#C5A059]">(인) 헤이스트 김성규</span>
            </div>

            <div className="border border-stone-200 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 bg-white relative">
              <div className="w-full flex justify-between items-center px-1">
                <span className="text-[9.5px] font-bold text-stone-700 tracking-wider">이용자 [을] 서명 (점주 성함 정자로 써주세요)</span>
                {(hasSig1 || hasSig2 || hasSig3) && (
                  <button 
                    type="button" 
                    onClick={clearAllSignatures}
                    className="p-1 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 transition-all"
                    title="전체 지우기"
                  >
                    <RefreshCw size={11} />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((idx) => {
                  const canvasRef = idx === 1 ? canvasRef1 : idx === 2 ? canvasRef2 : canvasRef3;
                  const label = idx === 1 ? '성' : '이름';
                  return (
                    <div key={idx} className="relative flex flex-col items-center gap-1">
                      <canvas
                        ref={canvasRef}
                        width={120}
                        height={120}
                        onMouseDown={(e) => startDrawing(e, idx)}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={(e) => startDrawing(e, idx)}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-[81px] h-[81px] border border-dashed border-stone-300 bg-stone-50/20 rounded-lg cursor-crosshair touch-none"
                      />
                      <span className="text-[8px] text-stone-400 font-mono">{label}</span>
                    </div>
                  );
                })}
              </div>
              <span className="text-[8px] font-bold text-stone-550">(각 틀에 마우스/터치 드로잉)</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-all active:scale-98 cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              disabled={isProcessing || !hasScrolledToBottom || !isAgreed || !(hasSig1 && hasSig2 && hasSig3)}
              onClick={handleCompleteAgreement}
              className="flex-1 py-3 bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-black rounded-xl text-xs transition-all active:scale-98 cursor-pointer disabled:opacity-45 disabled:pointer-events-none flex items-center justify-center gap-1.5"
            >
              {isProcessing ? (
                <>
                  <span className="w-3 h-3 rounded-full border border-stone-400 border-t-transparent animate-spin" />
                  <span>약정서 합성 및 소장용 인코딩 중...</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>서명 날인 완료 및 약정서 즉시 소장</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
