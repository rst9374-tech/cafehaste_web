import React, { useRef, useState, useEffect } from 'react';
import { Shield, Check, X, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AGREEMENT_TITLE, AGREEMENT_SUBTITLE, AGREEMENT_LINES } from './haste_agreement_data';

interface HasteAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeCode: string;
  storeName: string;
  ownerName: string;
  phone: string;
  address: string;
  businessNumber: string;
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
  businessNumber,
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
  const [agreementTitle, setAgreementTitle] = useState(AGREEMENT_TITLE);
  const [agreementSubtitle, setAgreementSubtitle] = useState(AGREEMENT_SUBTITLE);
  const [agreementLines, setAgreementLines] = useState<string[]>(AGREEMENT_LINES);

  // States for editable User ("을") info
  const [storeNameInput, setStoreNameInput] = useState('');
  const [businessNumberInput, setBusinessNumberInput] = useState('');
  const [ownerNameInput, setOwnerNameInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // State for Provider ("갑") info
  const [providerInfo, setProviderInfo] = useState({
    name: '주식회사 헤이스트 랩스',
    bizNo: '(발급 후 기재)',
    ceo: '김성규',
    address: '(법인 등기부상 본점 주소)',
    phone: '1644-8999'
  });

  // Sync props to inputs when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setStoreNameInput(storeName || '');
      setBusinessNumberInput(businessNumber || '');
      setOwnerNameInput(ownerName || '');
      setAddressInput(address || '');
      setPhoneInput(phone || '');
    }
  }, [isOpen, storeName, businessNumber, ownerName, address, phone]);

  // Fetch agreement config on mount/open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/public/agreement')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.lines && data.lines.length > 0) {
            setAgreementTitle(data.title);
            setAgreementSubtitle(data.subtitle);
            setAgreementLines(data.lines);
            if (data.provider) {
              setProviderInfo({
                name: data.provider.name || '주식회사 헤이스트 에이아이',
                bizNo: data.provider.bizNo || '(발급 후 기재)',
                ceo: data.provider.ceo || '김성규',
                address: data.provider.address || '(법인 등기부상 본점 주소)',
                phone: data.provider.phone || '1644-8999'
              });
            }
          }
        })
        .catch((err) => console.error('Failed to load agreement from API:', err));
    }
  }, [isOpen]);

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

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < 15) {
      setHasScrolledToBottom(true);
    }
  };

  const getCanvasContext = (idx: number) => {
    const canvas = idx === 1 ? canvasRef1.current : idx === 2 ? canvasRef2.current : canvasRef3.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent, idx: number) => {
    e.preventDefault();
    const canvas = idx === 1 ? canvasRef1.current : idx === 2 ? canvasRef2.current : canvasRef3.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setActiveCanvasIdx(idx);

    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || activeCanvasIdx === null) return;
    e.preventDefault();
    const canvas = activeCanvasIdx === 1 ? canvasRef1.current : activeCanvasIdx === 2 ? canvasRef2.current : canvasRef3.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();

    if (activeCanvasIdx === 1) setHasSig1(true);
    if (activeCanvasIdx === 2) setHasSig2(true);
    if (activeCanvasIdx === 3) setHasSig3(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setActiveCanvasIdx(null);
  };

  const clearAllSignatures = () => {
    [1, 2, 3].forEach((idx) => {
      const ctx = getCanvasContext(idx);
      if (ctx) {
        ctx.clearRect(0, 0, 120, 120);
      }
    });
    setHasSig1(false);
    setHasSig2(false);
    setHasSig3(false);
  };

  const handleComplete = async () => {
    if (!isAgreed) return;
    if (!hasSig1 || !hasSig2 || !hasSig3) {
      alert('을(이용자) 서명 세 칸(성, 이, 름)을 모두 기재해 주세요.');
      return;
    }
    if (!storeNameInput.trim() || !ownerNameInput.trim() || !addressInput.trim() || !businessNumberInput.trim()) {
      alert('이용자(을)의 상호, 사업자등록번호, 대표자 성명, 주소 정보는 필수입니다.');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create a temporary large canvas to draw everything first
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 800;
      tempCanvas.height = 2500; // Safe extra large height
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) throw new Error('Canvas context failure');

      // Draw background
      tempCtx.fillStyle = '#FFFFFF';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Header title
      tempCtx.fillStyle = '#1C1917';
      tempCtx.font = 'bold 22px sans-serif';
      tempCtx.textAlign = 'center';
      tempCtx.fillText(agreementTitle, tempCanvas.width / 2, 80);

      // Subtitle
      tempCtx.fillStyle = '#78716C';
      tempCtx.font = '12px sans-serif';
      tempCtx.fillText(agreementSubtitle, tempCanvas.width / 2, 115);

      // Horizontal line
      tempCtx.strokeStyle = '#E7E5E4';
      tempCtx.lineWidth = 1.5;
      tempCtx.beginPath();
      tempCtx.moveTo(40, 135);
      tempCtx.lineTo(tempCanvas.width - 40, 135);
      tempCtx.stroke();

      // Agreement content
      tempCtx.fillStyle = '#44403C';
      tempCtx.textAlign = 'left';
      
      let startY = 165;
      const lineHeight = 20;

      for (const line of agreementLines) {
        if (line.trim().startsWith('제') && line.includes('조')) {
          tempCtx.font = 'bold 12px sans-serif';
          tempCtx.fillStyle = '#1C1917';
        } else {
          tempCtx.font = '11px sans-serif';
          tempCtx.fillStyle = '#44403C';
        }

        // Auto word-wrap to prevent text cutting off on canvas
        const maxWidth = tempCanvas.width - 120;
        const words = line.split('');
        let currentLineText = '';

        for (let n = 0; n < words.length; n++) {
          const testLine = currentLineText + words[n];
          const metrics = tempCtx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            tempCtx.fillText(currentLineText, 60, startY);
            currentLineText = words[n];
            startY += lineHeight;
          } else {
            currentLineText = testLine;
          }
        }
        tempCtx.fillText(currentLineText, 60, startY);
        startY += lineHeight + 4;
      }

      // Date of Agreement (Current Date)
      const now = new Date();
      const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
      
      tempCtx.font = 'bold 14px sans-serif';
      tempCtx.fillStyle = '#1C1917';
      tempCtx.textAlign = 'center';
      tempCtx.fillText(dateStr, tempCanvas.width / 2, startY + 40);

      startY += 100;
      tempCtx.textAlign = 'left';
      tempCtx.font = 'bold 12.5px sans-serif';
      
      tempCtx.fillText('[ "갑" (공급자) ]', 60, startY);
      tempCtx.font = '12px sans-serif';
      tempCtx.fillStyle = '#44403C';
      tempCtx.fillText(`상  호 : ${providerInfo.name}`, 60, startY + 25);
      tempCtx.fillText(`사업자등록번호 : ${providerInfo.bizNo}`, 60, startY + 45);
      tempCtx.fillText(`대  표 : ${providerInfo.ceo}`, 60, startY + 65);
      tempCtx.fillText(`주  소 : ${providerInfo.address}`, 60, startY + 85);
      tempCtx.fillText(`연락처 : ${providerInfo.phone}`, 60, startY + 105);

      tempCtx.font = 'bold 12.5px sans-serif';
      tempCtx.fillStyle = '#1C1917';
      tempCtx.fillText('[ "을" (이용자) ]', tempCanvas.width / 2 + 20, startY);
      tempCtx.font = '12px sans-serif';
      tempCtx.fillStyle = '#44403C';
      tempCtx.fillText(`상  호 : ${storeNameInput}`, tempCanvas.width / 2 + 20, startY + 25);
      tempCtx.fillText(`사업자등록번호 : ${businessNumberInput}`, tempCanvas.width / 2 + 20, startY + 45);
      tempCtx.fillText(`대  표 : ${ownerNameInput}`, tempCanvas.width / 2 + 20, startY + 65);
      tempCtx.fillText(`주  소 : ${addressInput}`, tempCanvas.width / 2 + 20, startY + 85);
      tempCtx.fillText(`연락처 : ${phoneInput}`, tempCanvas.width / 2 + 20, startY + 105);

      const hqStamp = new Image();
      hqStamp.crossOrigin = 'anonymous';
      hqStamp.src = `/uploads/membership/haste_hq_stamp.png?t=${stampTimestamp}`;
      await new Promise((resolve) => {
        hqStamp.onload = () => {
          tempCtx.drawImage(hqStamp, 160, startY + 48, 99, 99);
          resolve(null);
        };
        hqStamp.onerror = () => {
          tempCtx.strokeStyle = '#B91C1C';
          tempCtx.lineWidth = 2.5;
          tempCtx.strokeRect(165, startY + 55, 60, 60);
          tempCtx.fillStyle = '#B91C1C';
          tempCtx.font = 'bold 9px sans-serif';
          tempCtx.fillText('(인)', 190, startY + 90);
          resolve(null);
        };
      });

      const canvas1 = canvasRef1.current;
      const canvas2 = canvasRef2.current;
      const canvas3 = canvasRef3.current;
      if (canvas1) {
        tempCtx.drawImage(canvas1, tempCanvas.width / 2 + 95, startY + 51, 72, 72);
      }
      if (canvas2) {
        tempCtx.drawImage(canvas2, tempCanvas.width / 2 + 175, startY + 51, 72, 72);
      }
      if (canvas3) {
        tempCtx.drawImage(canvas3, tempCanvas.width / 2 + 255, startY + 51, 72, 72);
      }

      // Calculate exact dynamic height
      const totalDrawnHeight = startY + 160;

      // 2. Create final cropped canvas and copy contents
      const docCanvas = document.createElement('canvas');
      docCanvas.width = 800;
      docCanvas.height = totalDrawnHeight;
      const ctx = docCanvas.getContext('2d');
      if (!ctx) throw new Error('Doc context failure');

      ctx.drawImage(tempCanvas, 0, 0);

      // Draw border on cropped canvas
      ctx.strokeStyle = '#D6D3D1';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, docCanvas.width - 40, docCanvas.height - 40);

      const mergedDataUrl = docCanvas.toDataURL('image/png');

      // Convert PNG Canvas to PDF with custom dynamic height to prevent signature cutoff
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (docCanvas.height * imgWidth) / docCanvas.width;
      const pdf = new jsPDF('p', 'mm', [imgWidth, imgHeight]);
      pdf.addImage(mergedDataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], `agreement_${storeCode || 'default'}.pdf`, { type: 'application/pdf' });

      onAgreementComplete(pdfFile, mergedDataUrl);
    } catch (err) {
      console.error(err);
      alert('약정서 서명 이미지 인코딩 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans select-none">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-150 flex justify-between items-center bg-stone-50 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="text-[#C5A059]" size={20} />
            <span className="font-bold text-stone-900 text-sm md:text-base">
              {agreementTitle}
            </span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 hover:bg-stone-200 rounded-full transition-all text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="p-6 overflow-y-auto flex-1 text-left text-xs leading-relaxed text-stone-650 bg-white"
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-center font-bold text-stone-900 text-base md:text-lg mb-2">
              {agreementTitle}
            </h3>
            <p className="text-center text-[10px] text-stone-400 mb-6">
              {agreementSubtitle}
            </p>

            {agreementLines.map((line, idx) => {
              if (line.trim().startsWith('제') && line.includes('조')) {
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

        {/* User Info inputs & Signature */}
        <div className="p-5 flex flex-col gap-4 bg-stone-50 border-t border-stone-150 shrink-0">
          
          {/* 이용자(을) 인적사항 입력란 */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block text-left">
              ✍️ 이용자 (을) 인적사항 확인 및 입력 (약정서 기재용)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9.5px] font-bold text-stone-600">가맹점 상호명 (점포명)</label>
                <input 
                  type="text"
                  value={storeNameInput}
                  onChange={(e) => setStoreNameInput(e.target.value)}
                  placeholder="예: 헤이스트 김포운양역점"
                  className="text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />
              </div>
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9.5px] font-bold text-stone-600">점주 사업자등록번호</label>
                <input 
                  type="text"
                  value={businessNumberInput}
                  onChange={(e) => setBusinessNumberInput(e.target.value)}
                  placeholder="사업자등록번호 10자리 숫자"
                  className="text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />
              </div>
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9.5px] font-bold text-stone-600">대표자 성명</label>
                <input 
                  type="text"
                  value={ownerNameInput}
                  onChange={(e) => setOwnerNameInput(e.target.value)}
                  placeholder="대표자 실명"
                  className="text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />
              </div>
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9.5px] font-bold text-stone-600">점주 연락처</label>
                <input 
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="예: 010-1234-5678"
                  className="text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />
              </div>
              <div className="flex flex-col gap-1 text-left sm:col-span-2">
                <label className="text-[9.5px] font-bold text-stone-600">점포 주소 (소재지)</label>
                <input 
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder="도로명 주소 등 상세 주소"
                  className="text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>
          </div>

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
              className={`text-[11.5px] font-bold select-none cursor-pointer text-left ${hasScrolledToBottom ? 'text-stone-800' : 'text-stone-400'}`}
            >
              상기 스마트 솔루션 이용 및 상표 표시에 관한 약정서의 모든 조항을 완전히 인지하고 서명(도장 날인)에 동의합니다.
            </label>
          </div>

          <div className={`grid grid-cols-2 gap-4 border border-stone-200 bg-white p-3.5 rounded-2xl transition-all ${isAgreed && hasScrolledToBottom ? 'opacity-100' : 'opacity-40 pointer-events-none blur-2xs'}`}>
            <div className="border border-stone-100 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 relative overflow-hidden bg-stone-50/50">
              <span className="text-[9.5px] font-bold text-stone-500 uppercase tracking-widest block">공급자 [갑] 날인</span>
              <img src={`/uploads/membership/haste_hq_stamp.png?t=${stampTimestamp}`} alt="Haste HQ Stamp" className="w-[85px] h-[85px] object-contain z-10" />
              <span className="text-[10px] font-bold text-[#C5A059]">(인) {providerInfo.ceo}</span>
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
              disabled={isProcessing || !isAgreed || !hasSig1 || !hasSig2 || !hasSig3}
              onClick={handleComplete}
              className="flex-1 py-3 bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold rounded-xl text-xs transition-all active:scale-98 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              {isProcessing ? '서명 인코딩 및 체결 중...' : '서명 완료 및 약정서 체결'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
