import React from 'react';
import { X, Layers, Network, Key, FileJson, Laptop, Code } from 'lucide-react';

interface KioskGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KioskGuideModal: React.FC<KioskGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans overflow-y-auto select-none">
      <div className="bg-white border border-stone-200 w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col my-6 max-h-[95vh] animate-fadeIn">
        
        {/* Header */}
        <div className="bg-[#FAF9F6] border-b border-stone-150 py-4.5 px-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-stone-900">
            <Layers className="text-[#C5A059]" size={22} />
            <h3 className="font-bold text-base tracking-tight font-serif">토스플레이스 키오스크 연동 규격서 (v2.3.0)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-750 transition-all rounded-lg cursor-pointer"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-xs md:text-sm text-stone-650 max-h-[600px] text-left">
          
          <div className="text-center pb-2 border-b border-stone-100">
            <span className="text-xs font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-1">TOSS KIOSK INTEGRATION SPEC</span>
            <h4 className="text-stone-900 font-bold text-lg font-serif">토스플레이스 키오스크 연동 규격서</h4>
            <p className="text-stone-400 text-xs mt-1 leading-relaxed">매장용 로컬 프로그램과 토스 키오스크 간의 실시간 결제 완료 정보 연동을 위한 규약입니다.</p>
          </div>

          <div className="flex flex-col gap-6 font-sans text-stone-700">
            
            {/* 1. Overview */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5"><Network size={14} className="text-[#C5A059]" /> 1. 개요 및 연동 원칙</h5>
              <ul className="list-disc list-inside space-y-1.5 text-stone-600 pl-1 leading-relaxed">
                <li><strong>실시간 주문 연동</strong>: 고객이 토스 키오스크에서 결제를 완료하면, 로컬 프로그램의 API 엔드포인트로 결제 정보를 즉시 전송합니다.</li>
                <li><strong>HTTPS 보안 우회 (DNS 매핑)</strong>: 토스 단말기 보안 규약에 맞추기 위해 공인 도메인 <code className="bg-stone-50 px-1 py-0.5 rounded font-mono text-xs text-[#C5A059] font-bold">local.cafehaste.com</code>을 로컬 루프백 IP(<code className="bg-stone-50 px-1 py-0.5 rounded font-mono text-xs">127.0.0.1</code>)로 DNS 매핑하여 사용합니다.</li>
                <li>※ 주소 통신을 위해 헤이스트에서 발급하는 SSL 인증서 파일(<code className="bg-stone-50 px-1 py-0.5 rounded font-mono text-xs">cert.pem</code>, <code className="bg-stone-50 px-1 py-0.5 rounded font-mono text-xs">key.pem</code>)을 로컬 서버에 등록해야 합니다.</li>
              </ul>
            </div>

            {/* 2. Security Headers */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5"><Key size={14} className="text-[#C5A059]" /> 2. Request 보안 인증 헤더</h5>
              <div className="space-y-2">
                <div className="bg-stone-50 p-2.5 border border-stone-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-stone-900 font-bold">X-Haste-API-Key</span>
                    <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-bold">필수</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    발급 마스터 시크릿 키 : <code className="font-mono text-rose-600 bg-white px-1.5 py-0.5 rounded border border-stone-200 text-xs font-bold">HASTE_SECRET_LIVE_9363</code>
                  </p>
                </div>
                <div className="bg-stone-50 p-2.5 border border-stone-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-stone-900 font-bold">X-Haste-Timestamp</span>
                    <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-bold">필수</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    송신 시점의 유닉스 타임스탬프 (밀리초). 서버 수신 시간과 ±5분 차이 발생 시 차단(401 Unauthorized)해야 합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. JSON Payload */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5"><FileJson size={14} className="text-[#C5A059]" /> 3. 데이터 규격 (JSON Payload)</h5>
              <p className="text-stone-550 mb-2 text-xs leading-relaxed">
                v2.3.0 에서는 주문 전송 페이로드가 극도로 간소화되어, 결제 금액/승인 키 등은 배제하고 필수 주문 목록만 전송합니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px] leading-normal">
                <div>
                  <span className="text-stone-400 block mb-1 font-sans text-xs">Request Body</span>
                  <pre className="bg-stone-950 text-stone-300 p-3 rounded-xl overflow-x-auto select-all whitespace-pre leading-normal">
{`{
  "orderId": "TOSS-ORD-202606240001",
  "token": "HASTE_SECRET_LIVE_9363",
  "items": [
    {
      "productNo": "GS000101",
      "name": "HOT_아메리카노_G",
      "quantity": 1
    }
  ]
}`}
                  </pre>
                </div>
                <div>
                  <span className="text-stone-400 block mb-1 font-sans text-xs">Response Body (200 OK)</span>
                  <pre className="bg-stone-950 text-stone-300 p-3 rounded-xl overflow-x-auto select-all whitespace-pre leading-normal">
{`{
  "success": true,
  "message": "Order processed successfully"
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* 4. Product Code */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5"><Laptop size={14} className="text-[#C5A059]" /> 4. 표준 상품 코드 규격 (v4.1.0)</h5>
              <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl text-stone-600 space-y-2 leading-relaxed">
                <p>무인 커피머신 연동의 고유성 확보를 위해 **8자리 고정 길이** 표준 코드로 치환 전송됩니다.</p>
                <ul className="list-disc pl-4 text-xs space-y-1">
                  <li><strong>음료 품목 (Beverages)</strong> : <code className="bg-white px-1.5 py-0.5 rounded font-mono border text-stone-850">[Size(1자)] + [Base(1자)] + [Category(1자)] + [RecipeID(5자)]</code> (예: <code className="font-mono text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded font-bold">GS000101</code>)</li>
                  <li><strong>디저트 및 상품 품목</strong> : <code className="bg-white px-1.5 py-0.5 rounded font-mono border text-stone-850">X + [기존POS번호 뒤쪽 7자리]</code> (예: <code className="font-mono text-stone-700 bg-white px-1 py-0.2 rounded border">X9000004</code>)</li>
                </ul>
              </div>
            </div>

            {/* 5. Code Example */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5"><Code size={14} className="text-[#C5A059]" /> 5. 로컬 수신 서버 Express(Node.js) 구현 예시</h5>
              <div className="relative">
                <pre className="bg-stone-950 text-stone-300 p-3 rounded-xl text-[10.5px] font-mono overflow-auto max-h-56 select-all whitespace-pre leading-normal tab-size-4">
{`const https = require('https');
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/order', (req, res) => {
  const apiKey = req.headers['x-haste-api-key'];
  if (apiKey !== 'HASTE_SECRET_LIVE_9363') {
    return res.status(401).json({ success: false, message: 'Invalid API Key' });
  }
  console.log("주문 정보 수신:", req.body);
  res.json({ success: true, message: 'Order processed' });
});

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(8080, () => {
  console.log('HTTPS Server running on port 8080');
});`}
                </pre>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-150 p-4 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold rounded-xl text-sm transition-all active:scale-97 cursor-pointer"
          >
            규격서 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
