import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Upload, Image as ImageIcon, AlertCircle, CheckCircle, FileText, Save, RefreshCw, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

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

  // Agreement form states
  const [activeTab, setActiveTab] = useState<'stamp' | 'agreement'>('stamp');
  const [agreementTitle, setAgreementTitle] = useState('');
  const [agreementSubtitle, setAgreementSubtitle] = useState('');
  const [agreementContent, setAgreementContent] = useState('');
  const [isLoadingAgreement, setIsLoadingAgreement] = useState(false);
  const [isSavingAgreement, setIsSavingAgreement] = useState(false);

  // Provider (갑) info states
  const [providerName, setProviderName] = useState('');
  const [providerBizNo, setProviderBizNo] = useState('');
  const [providerCeo, setProviderCeo] = useState('');
  const [providerAddress, setProviderAddress] = useState('');
  const [providerPhone, setProviderPhone] = useState('');

  // [한글 주석] 컴포넌트 마운트 시 캐시 방지를 위해 현재 시간 타임스탬프를 주입합니다.
  useEffect(() => {
    setTimestamp(Date.now());
    fetchAgreement();
  }, []);

  const fetchAgreement = async () => {
    setIsLoadingAgreement(true);
    try {
      const res = await fetch('/api/public/agreement');
      const data = await res.json();
      if (data.success) {
        setAgreementTitle(data.title);
        setAgreementSubtitle(data.subtitle);
        setAgreementContent(data.lines.join('\n'));
        if (data.provider) {
          setProviderName(data.provider.name || '');
          setProviderBizNo(data.provider.bizNo || '');
          setProviderCeo(data.provider.ceo || '');
          setProviderAddress(data.provider.address || '');
          setProviderPhone(data.provider.phone || '');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAgreement(false);
    }
  };

  const handleSaveAgreement = async () => {
    if (!agreementTitle.trim() || !agreementContent.trim()) {
      showTemporaryError('약정서 제목과 조항 내용은 필수입니다.');
      return;
    }

    setIsSavingAgreement(true);
    try {
      const lines = agreementContent.split('\n');
      const res = await fetch('/api/hq/agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: agreementTitle,
          subtitle: agreementSubtitle,
          lines,
          provider: {
            name: providerName,
            bizNo: providerBizNo,
            ceo: providerCeo,
            address: providerAddress,
            phone: providerPhone
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        showTemporaryToast('약정서 템플릿이 정상적으로 저장되었습니다.');
      } else {
        showTemporaryError(data.message || '약정서 저장에 실패했습니다.');
      }
    } catch (err) {
      showTemporaryError('서버 오류로 인해 약정서 설정에 실패했습니다.');
    } finally {
      setIsSavingAgreement(false);
    }
  };

  const handleDownloadTestPdf = async () => {
    try {
      // 1. Create a large temporary canvas to draw everything first
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 800;
      tempCanvas.height = 2500; // Safe large height
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // Draw background
      tempCtx.fillStyle = '#FFFFFF';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Header title
      tempCtx.fillStyle = '#1C1917';
      tempCtx.font = 'bold 22px sans-serif';
      tempCtx.textAlign = 'center';
      tempCtx.fillText(agreementTitle || '이용 약정서', tempCanvas.width / 2, 80);

      // Subtitle
      tempCtx.fillStyle = '#78716C';
      tempCtx.font = '12px sans-serif';
      tempCtx.fillText(agreementSubtitle || '※ 본 계약은 전자서명법에 따른 전자문서로 체결될 수 있습니다.', tempCanvas.width / 2, 115);

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
      const lines = agreementContent.split('\n');

      for (const line of lines) {
        if (line.trim().startsWith('제') && line.includes('조')) {
          tempCtx.font = 'bold 12px sans-serif';
          tempCtx.fillStyle = '#1C1917';
        } else {
          tempCtx.font = '11px sans-serif';
          tempCtx.fillStyle = '#44403C';
        }

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

      // Date of Agreement
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
      tempCtx.fillText(`상  호 : ${providerName || '주식회사 헤이스트 에이아이'}`, 60, startY + 25);
      tempCtx.fillText(`사업자등록번호 : ${providerBizNo || '(발급 후 기재)'}`, 60, startY + 45);
      tempCtx.fillText(`대  표 : ${providerCeo || '김성규'} (인/서명)`, 60, startY + 65);
      tempCtx.fillText(`주  소 : ${providerAddress || '(법인 등기부상 본점 주소)'}`, 60, startY + 85);
      tempCtx.fillText(`연락처 : ${providerPhone || '1644-8999'}`, 60, startY + 105);

      tempCtx.font = 'bold 12.5px sans-serif';
      tempCtx.fillStyle = '#1C1917';
      tempCtx.fillText('[ "을" (이용자) ]', tempCanvas.width / 2 + 20, startY);
      tempCtx.font = '12px sans-serif';
      tempCtx.fillStyle = '#44403C';
      tempCtx.fillText(`상  호 : (가입 점포명)`, tempCanvas.width / 2 + 20, startY + 25);
      tempCtx.fillText(`사업자등록번호 : (점주의 사업자번호 필수 기재)`, tempCanvas.width / 2 + 20, startY + 45);
      tempCtx.fillText(`대  표 : (점주 성명) (인/서명)`, tempCanvas.width / 2 + 20, startY + 65);
      tempCtx.fillText(`주  소 : (점포 주소)`, tempCanvas.width / 2 + 20, startY + 85);
      tempCtx.fillText(`연락처 : (연락처)`, tempCanvas.width / 2 + 20, startY + 105);

      // Load stamp image on temp canvas
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `${stampUrl}?t=${timestamp}`;
      await new Promise((resolve) => {
        img.onload = () => {
          tempCtx.drawImage(img, 160, startY + 48, 99, 99);
          resolve(null);
        };
        img.onerror = () => {
          tempCtx.strokeStyle = '#B91C1C';
          tempCtx.lineWidth = 2.5;
          tempCtx.strokeRect(165, startY + 55, 60, 60);
          tempCtx.fillStyle = '#B91C1C';
          tempCtx.font = 'bold 9px sans-serif';
          tempCtx.fillText('(인)', 190, startY + 90);
          resolve(null);
        };
      });

      // Add a mock signature on the user side for previewing
      tempCtx.strokeStyle = '#2563EB';
      tempCtx.lineWidth = 2.5;
      tempCtx.beginPath();
      tempCtx.moveTo(tempCanvas.width / 2 + 100, startY + 70);
      tempCtx.lineTo(tempCanvas.width / 2 + 140, startY + 60);
      tempCtx.lineTo(tempCanvas.width / 2 + 160, startY + 85);
      tempCtx.stroke();

      // Calculate dynamic height
      const totalDrawnHeight = startY + 160;

      // 2. Create the final cropped canvas
      const docCanvas = document.createElement('canvas');
      docCanvas.width = 800;
      docCanvas.height = totalDrawnHeight;
      const docCtx = docCanvas.getContext('2d');
      if (!docCtx) return;

      docCtx.drawImage(tempCanvas, 0, 0);

      // Draw border on final cropped canvas
      docCtx.strokeStyle = '#D6D3D1';
      docCtx.lineWidth = 4;
      docCtx.strokeRect(20, 20, docCanvas.width - 40, docCanvas.height - 40);

      const mergedDataUrl = docCanvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (docCanvas.height * imgWidth) / docCanvas.width;
      const pdf = new jsPDF('p', 'mm', [imgWidth, imgHeight]);
      pdf.addImage(mergedDataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('test_agreement_preview.pdf');
      showTemporaryToast('테스트 약정서 PDF가 다운로드되었습니다.');
    } catch (err) {
      console.error(err);
      showTemporaryError('PDF 생성 중 오류가 발생했습니다.');
    }
  };

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

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

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
    <div className="bg-stone-950 border border-stone-900 rounded-3xl p-6 sm:p-8 shadow-sm font-sans max-w-3xl mx-auto">
      {/* 7대 표준 스타일 규격: 카테고리 / 칩 라벨 */}
      <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-3">
        HEADQUARTER DIGITAL SIGNATURE & TEMPLATE
      </span>

      {/* 7대 표준 스타일 규격: 섹션 / 카드 타이틀 */}
      <h2 className="font-sans font-normal leading-tight text-stone-100 tracking-tight text-xl md:text-2xl mb-4">
        헤이스트 본사 서명/직인 및 약정서 설정
      </h2>

      {/* Tab selectors */}
      <div className="flex gap-2 mb-6 border-b border-stone-900 pb-px">
        <button
          onClick={() => setActiveTab('stamp')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${ activeTab === 'stamp' ? 'border-[#C5A059] text-[#C5A059]' : 'border-transparent text-stone-500 hover:text-stone-300' }`}
        >
          <ShieldCheck size={14} />
          서명 및 직인 이미지
        </button>
        <button
          onClick={() => setActiveTab('agreement')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${ activeTab === 'agreement' ? 'border-[#C5A059] text-[#C5A059]' : 'border-transparent text-stone-500 hover:text-stone-300' }`}
        >
          <FileText size={14} />
          이용 약정서 양식 설정
        </button>
      </div>

      {activeTab === 'stamp' ? (
        <>
          <p className="text-stone-400 font-sans font-light text-sm leading-relaxed mb-8">
            매장 점주 가입 과정에서 제공되는 전자 약정서에 표시될 헤이스트("갑")의 디지털 도장 또는 서명 이미지를 관리합니다. 
            배경이 투명한 PNG 이미지 파일 사용을 권장하며, 업로드 시 시스템 규격에 맞춰 최적화된 해상도로 자동 변환 및 클라우드 버킷에 동기화됩니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Current Active Stamp */}
            <div className="border border-stone-900 rounded-2xl p-5 flex flex-col items-center bg-stone-900/20">
              <span className="text-xs font-bold text-stone-400 mb-3 uppercase tracking-wider">
                현재 등록된 헤이스트 직인
              </span>
              <div className="w-48 h-48 border border-dashed border-stone-900 rounded-xl flex items-center justify-center bg-stone-950 p-4 relative overflow-hidden">
                <img 
                  src={`${stampUrl}?t=${timestamp}`} 
                  alt="헤이스트 직인" 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200';
                  }}
                />
              </div>
              <span className="inline-flex items-center gap-1.5 mt-3 text-xs text-stone-450 bg-stone-900/40 px-3 py-1 rounded-full font-sans font-medium">
                <CheckCircle size={12} className="text-emerald-500" />
                실시간 서비스 반영 중
              </span>
            </div>

            {/* Change Stamp / Upload Preview */}
            <div className="border border-stone-900 rounded-2xl p-5 flex flex-col items-center justify-between bg-stone-900/10">
              <span className="text-xs font-bold text-stone-400 mb-3 uppercase tracking-wider">
                신규 파일 업로드 및 미리보기
              </span>
              <div className="w-48 h-48 border border-dashed border-stone-900 rounded-xl flex items-center justify-center bg-stone-950 p-4 relative overflow-hidden">
                {previewBase64 ? (
                  <img 
                    src={previewBase64} 
                    alt="새 직인 미리보기" 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center text-stone-600 text-center">
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
                  className="w-full bg-stone-900 hover:bg-stone-850 text-stone-350 font-medium py-2 px-4 rounded-xl border border-stone-900 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Upload size={14} />
                  파일 선택 (PNG 권장)
                </button>
              </div>
            </div>
          </div>

          {/* Error or Warning alert context */}
          <div className="bg-amber-950/15 border border-amber-900/30 rounded-2xl p-4 flex items-start gap-3 mb-6">
            <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-500 leading-relaxed font-light">
              <span className="font-bold block mb-1">💡 중요 참고 사항</span>
              본 직인 이미지는 '스마트 솔루션 이용 및 상표 표시에 관한 약정서' 체결 시 "갑"의 서명란에 실시간으로 합성 및 인코딩되어 적용됩니다.
              업로드 후 기존 서명 완료된 약정서 문서에는 소급 적용되지 않으며, 새로 체결되는 계약부터 즉시 적용됩니다.
            </div>
          </div>

          {/* Upload confirmation buttons */}
          <div className="flex justify-end gap-3 border-t border-stone-900 pt-6">
            {previewBase64 && (
              <button
                onClick={() => {
                  setPreviewBase64(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="bg-stone-900 hover:bg-stone-850 text-stone-350 font-medium py-3 px-6 rounded-2xl border border-stone-900 transition-all text-xs md:text-sm cursor-pointer active:scale-95"
              >
                선택 취소
              </button>
            )}
            <button
              onClick={handleUpload}
              disabled={uploading || !previewBase64}
              className="bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold py-3.5 px-6 rounded-2xl border border-stone-900 transition-all text-xs md:text-sm cursor-pointer disabled:opacity-40 active:scale-95"
            >
              {uploading ? '클라우드 동기화 중...' : '헤이스트 직인 변경 적용'}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-stone-400 font-sans font-light text-sm leading-relaxed mb-8">
            점주 회원 가입 및 라이선스 가동 시 사용되는 공식 약정서의 본문 조항과 공급자 정보를 편집합니다. 
            입력된 내용은 신규 점주 가입 과정에서 실시간으로 로드되며 서명 날인 완료된 PDF 생성에 즉각 반영됩니다.
          </p>

          {isLoadingAgreement ? (
            <div className="flex flex-col items-center justify-center py-12 text-stone-500">
              <RefreshCw size={24} className="animate-spin mb-2 text-stone-650" />
              <span className="text-xs font-bold">약정서 데이터를 불러오는 중...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-5 mb-8">
              {/* Agreement Title */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-stone-400">약정서 공식 제목</label>
                <input 
                  type="text"
                  value={agreementTitle}
                  onChange={(e) => setAgreementTitle(e.target.value)}
                  placeholder="예: 스마트 솔루션 이용 및 상표 표시에 관한 약정서"
                  className="w-full text-xs font-semibold px-4 py-3 border border-stone-900 rounded-xl bg-stone-950 text-stone-100 focus:outline-none focus:border-[#C5A059]/40 focus:ring-1 focus:ring-[#C5A059]/40 shadow-sm"
                />
              </div>

              {/* Agreement Subtitle */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-stone-400">약정서 부제목 / 안내문구</label>
                <input 
                  type="text"
                  value={agreementSubtitle}
                  onChange={(e) => setAgreementSubtitle(e.target.value)}
                  placeholder="예: ※ 본 계약은 전자서명법에 따른 전자문서로 체결될 수 있습니다."
                  className="w-full text-xs font-semibold px-4 py-3 border border-stone-900 rounded-xl bg-stone-950 text-stone-100 focus:outline-none focus:border-[#C5A059]/40 focus:ring-1 focus:ring-[#C5A059]/40 shadow-sm"
                />
              </div>

              {/* Provider (갑) Info Section */}
              <div className="border border-stone-900 rounded-2xl p-5 bg-stone-900/20 flex flex-col gap-4">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block text-left">
                  🏢 공급자 (갑) 정보 설정
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold text-stone-500">법인 상호명</label>
                    <input 
                      type="text"
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                      placeholder="예: 주식회사 헤이스트 랩스"
                      className="w-full text-xs font-semibold px-3 py-2.5 border border-stone-900 rounded-xl bg-stone-950 text-stone-100 focus:outline-none focus:border-[#C5A059]/40 focus:ring-1 focus:ring-[#C5A059]/40 shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold text-stone-500">법인 사업자등록번호</label>
                    <input 
                      type="text"
                      value={providerBizNo}
                      onChange={(e) => setProviderBizNo(e.target.value)}
                      placeholder="예: (발급 후 기재)"
                      className="w-full text-xs font-semibold px-3 py-2.5 border border-stone-900 rounded-xl bg-stone-950 text-stone-100 focus:outline-none focus:border-[#C5A059]/40 focus:ring-1 focus:ring-[#C5A059]/40 shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold text-stone-500">대표자 성명</label>
                    <input 
                      type="text"
                      value={providerCeo}
                      onChange={(e) => setProviderCeo(e.target.value)}
                      placeholder="예: 김성규"
                      className="w-full text-xs font-semibold px-3 py-2.5 border border-stone-900 rounded-xl bg-stone-950 text-stone-100 focus:outline-none focus:border-[#C5A059]/40 focus:ring-1 focus:ring-[#C5A059]/40 shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold text-stone-500">본점 소재지 주소</label>
                    <input 
                      type="text"
                      value={providerAddress}
                      onChange={(e) => setProviderAddress(e.target.value)}
                      placeholder="예: (법인 등기부상 본점 주소)"
                      className="w-full text-xs font-semibold px-3 py-2.5 border border-stone-900 rounded-xl bg-stone-950 text-stone-100 focus:outline-none focus:border-[#C5A059]/40 focus:ring-1 focus:ring-[#C5A059]/40 shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                    <label className="text-[10px] font-bold text-stone-500">본사 대표 연락처</label>
                    <input 
                      type="text"
                      value={providerPhone}
                      onChange={(e) => setProviderPhone(e.target.value)}
                      placeholder="예: 1644-8999"
                      className="w-full text-xs font-semibold px-3 py-2.5 border border-stone-900 rounded-xl bg-stone-950 text-stone-100 focus:outline-none focus:border-[#C5A059]/40 focus:ring-1 focus:ring-[#C5A059]/40 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Agreement Content Textarea */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-stone-400 flex justify-between">
                  <span>조항 내용 (줄바꿈 단위로 1개 라인으로 취급됩니다)</span>
                  <span className="text-[10px] text-stone-500 font-normal">라인 단위로 작성 시 '제 X 조 (제목)' 형태로 시작하면 강조처리됩니다.</span>
                </label>
                <textarea
                  value={agreementContent}
                  onChange={(e) => setAgreementContent(e.target.value)}
                  rows={14}
                  placeholder="각 조항 조문을 입력해 주세요. (제 1 조 목적... 형태)"
                  className="w-full text-xs font-medium font-sans leading-relaxed p-4 border border-stone-900 rounded-xl bg-stone-950 text-stone-100 focus:outline-none focus:border-[#C5A059]/40 focus:ring-1 focus:ring-[#C5A059]/40 shadow-sm animate-none"
                />
              </div>
            </div>
          )}

          {/* Info banner */}
          <div className="bg-amber-950/15 border border-amber-900/30 rounded-2xl p-4 flex items-start gap-3 mb-6">
            <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-500 leading-relaxed font-light text-left">
              <span className="font-bold block mb-1">💡 중요 권고사항</span>
              약정서 조문을 너무 길게 변경할 경우, PDF/이미지 합성 문서의 하단 여백을 초과할 수 있습니다. 
              조문 변경 후 실서버에서 가입 테스트를 진행해 보시는 것을 권장합니다.
            </div>
          </div>

          {/* 서명란 미리보기 영역 */}
          <div className="border border-stone-900 rounded-2xl p-5 bg-stone-900/20 flex flex-col gap-4 mb-6">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block text-left">
              ✍️ 약정서 하단 서명란 실시간 렌더링 예시
            </span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-950 p-6 rounded-xl border border-stone-900 relative">
              {/* 갑 영역 */}
              <div className="flex flex-col gap-1 text-left relative min-h-[140px]">
                <span className="font-bold text-xs text-[#C5A059] mb-1">[ "갑" (공급자) ]</span>
                <span className="text-[11px] text-stone-400">상  호 : {providerName || '(상호 없음)'}</span>
                <span className="text-[11px] text-stone-400">사업자등록번호 : {providerBizNo || '(사업자번호 없음)'}</span>
                <span className="text-[11px] text-stone-400">대  표 : {providerCeo || '(대표명 없음)'} (인/서명)</span>
                <span className="text-[11px] text-stone-400">주  소 : {providerAddress || '(주소 없음)'}</span>
                <span className="text-[11px] text-stone-400">연락처 : {providerPhone || '(연락처 없음)'}</span>
                
                {/* 헤이스트 직인 오버레이 */}
                <div className="absolute right-4 bottom-2 w-20 h-20 border border-stone-900 rounded-full flex items-center justify-center bg-stone-900/40">
                  <img 
                    src={`${stampUrl}?t=${timestamp}`} 
                    alt="직인 미리보기" 
                    className="w-16 h-16 object-contain text-stone-600"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100';
                    }}
                  />
                </div>
              </div>

              {/* 을 영역 */}
              <div className="flex flex-col gap-1 text-left relative min-h-[140px] border-t md:border-t-0 md:border-l border-stone-900 pt-4 md:pt-0 md:pl-6">
                <span className="font-bold text-xs text-[#C5A059] mb-1">[ "을" (이용자) ]</span>
                <span className="text-[11px] text-stone-400">상  호 : (가입 점포명)</span>
                <span className="text-[11px] text-stone-400">사업자등록번호 : (점주의 사업자번호 필수 기재)</span>
                <span className="text-[11px] text-stone-400">대  표 : (점주 성명) (인/서명)</span>
                <span className="text-[11px] text-stone-400">주  소 : (점포 주소)</span>
                <span className="text-[11px] text-stone-400">연락처 : (연락처)</span>
                
                {/* 점주 서명 예시 */}
                <div className="absolute right-4 bottom-2 flex gap-1.5 items-center">
                  <div className="w-10 h-10 border border-dashed border-stone-900 rounded-md flex items-center justify-center text-[10px] text-stone-600 bg-stone-900/20">
                    서명1
                  </div>
                  <div className="w-10 h-10 border border-dashed border-stone-900 rounded-md flex items-center justify-center text-[10px] text-stone-600 bg-stone-900/20">
                    서명2
                  </div>
                  <div className="w-10 h-10 border border-dashed border-stone-900 rounded-md flex items-center justify-center text-[10px] text-stone-600 bg-stone-900/20">
                    서명3
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-stone-500 text-left">
              ※ 위 예시는 점주 회원가입 시 최종 서명 및 약정 완료 단계에서 생성되는 PDF 문서의 최하단 서명 날인 블록 구성입니다. 본사에 등록된 직인(도장) 이미지가 자동으로 합성됩니다.
            </p>
          </div>

          {/* Save button */}
          <div className="flex justify-end gap-3 border-t border-stone-900 pt-6">
            <button
              onClick={fetchAgreement}
              disabled={isLoadingAgreement || isSavingAgreement}
              className="bg-stone-900 hover:bg-stone-850 text-stone-350 font-medium py-3.5 px-6 rounded-2xl border border-stone-900 transition-all text-xs md:text-sm cursor-pointer disabled:opacity-40 active:scale-95"
            >
              새로고침
            </button>
            <button
              onClick={handleDownloadTestPdf}
              disabled={isLoadingAgreement || isSavingAgreement || !agreementTitle.trim()}
              className="bg-amber-950/20 hover:bg-amber-900/30 text-amber-500 font-bold py-3.5 px-6 rounded-2xl border border-amber-900/30 transition-all text-xs md:text-sm cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <FileDown size={14} />
              테스트 PDF 다운로드
            </button>
            <button
              onClick={handleSaveAgreement}
              disabled={isLoadingAgreement || isSavingAgreement || !agreementTitle.trim()}
              className="bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold py-3.5 px-6 rounded-2xl border border-stone-900 transition-all text-xs md:text-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-40 active:scale-95"
            >
              <Save size={14} />
              {isSavingAgreement ? '약정서 내용 저장 중...' : '약정서 내용 변경 적용'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
