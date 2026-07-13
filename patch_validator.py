import re

filepath = "components/admin/admin_page_test_validator.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace imports
old_import = "import { Shield, FileJson, Clock, CheckCircle2, AlertTriangle, XCircle, RefreshCw, BookOpen } from 'lucide-react';"
new_import = "import { Shield, FileJson, Clock, CheckCircle2, AlertTriangle, XCircle, RefreshCw, BookOpen, Send, Trash2, Terminal, Settings, Layers, Info } from 'lucide-react';"

if old_import in content:
    content = content.replace(old_import, new_import)
    print("1. Imports updated.")
else:
    print("1. Warning: Import string not found.")

# 2. Replace copiedText state declaration to insert Kiosk states
old_state = "  const [copiedText, setCopiedText] = useState<string | null>(null);"
new_state = """  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Toss Kiosk Validator States
  const [activeTab, setActiveTab] = useState<'COFFEE' | 'KIOSK'>('COFFEE');
  const [kioskUrl, setKioskUrl] = useState(() => localStorage.getItem('haste_kiosk_test_url') || 'https://local.cafehaste.com:8080/api/order');
  const [kioskToken, setKioskToken] = useState(() => localStorage.getItem('haste_kiosk_test_token') || 'HASTE_SECRET_LIVE_9363');
  const [kioskProduct, setKioskProduct] = useState('E0000126');
  const [kioskQty, setKioskQty] = useState(1);
  const [kioskIncludeDessert, setKioskIncludeDessert] = useState(true);
  const [kioskLogs, setKioskLogs] = useState<any[]>([]);
  const [isSendingKiosk, setIsSendingKiosk] = useState(false);

  const KIOSK_SAMPLE_BEVERAGES = [
    { code: 'E0000126', title: 'HOT 아메리카노 벤티' },
    { code: 'E0000138', title: 'ICE 아메리카노 벤티' },
    { code: 'E0000167', title: 'HOT 녹차라떼 벤티' },
    { code: 'E0000166', title: 'HOT 초코라떼 벤티' },
    { code: 'E0000157', title: 'HOT 헤이즐넛라떼 벤티' },
    { code: 'E0000156', title: 'HOT 바닐라라떼 벤티' },
    { code: 'E0000155', title: 'HOT 카라멜마끼아또 벤티' },
    { code: 'E0000163', title: 'ICE 카라멜마끼아또 벤티' },
    { code: 'E0000154', title: 'HOT 카페모카 벤티' },
    { code: 'E0000150', title: 'HOT 카페라떼 벤티' },
  ];

  const saveKioskSettings = () => {
    localStorage.setItem('haste_kiosk_test_url', kioskUrl);
    localStorage.setItem('haste_kiosk_test_token', kioskToken);
    showToast('설정이 브라우저에 저장되었습니다.', 'success');
  };

  const handleSendKioskTest = async () => {
    if (!kioskUrl.trim()) {
      showToast('수신 주소를 입력해 주세요.', 'error');
      return;
    }
    setIsSendingKiosk(true);

    const addKioskLog = (type: 'info' | 'success' | 'warning' | 'error', message: string, payload?: string) => {
      const time = new Date().toLocaleTimeString('ko-KR', { hour12: false });
      setKioskLogs(prev => [...prev, {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: time,
        type,
        message,
        payload
      }].slice(-100));
    };

    addKioskLog('info', `가상 토스 결제 완료 승인 감지. 전송 패킷 변환 시작...`);

    const selectedBev = KIOSK_SAMPLE_BEVERAGES.find(b => b.code === kioskProduct) || KIOSK_SAMPLE_BEVERAGES[0];
    const rawItems = [
      {
        productNo: selectedBev.code,
        title: selectedBev.title,
        quantity: kioskQty,
        category: '커피/음료'
      }
    ];

    if (kioskIncludeDessert) {
      addKioskLog('warning', `[시뮬레이터] 디저트 제품 동시 결제 포함됨: 뉴욕 치즈 케이크 (1개)`);
      rawItems.push({
        productNo: 'E9999999',
        title: '뉴욕 치즈 케이크',
        quantity: 1,
        category: '디저트'
      });
    }

    const excludeKeywords = ['디저트', '베이커리', '푸드', '사이드', 'MD', '쿠키', '케이크', '빵', '음식', 'food', 'dessert', 'bakery', 'side', 'goods'];
    const filteredItems = rawItems.filter(item => {
      const isExcluded = excludeKeywords.some(keyword => item.category.toLowerCase().includes(keyword.toLowerCase()));
      if (isExcluded) {
        addKioskLog('info', `[필터링 작동] 비음료 카테고리 품목 제외: ${item.title} (카테고리: ${item.category})`);
      }
      return !isExcluded;
    }).map(item => ({
      productNo: item.productNo,
      title: item.title,
      quantity: item.quantity
    }));

    const mockOrderId = 'TOSS-ORD-' + Math.floor(100000 + Math.random() * 900005);
    const payload = {
      orderId: mockOrderId,
      token: kioskToken,
      items: filteredItems
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-Haste-API-Key': kioskToken,
      'X-Haste-Timestamp': Date.now().toString(),
      'bypass-tunnel-reminder': 'true'
    };

    addKioskLog('info', `전송 패킷 조립 완료.`, JSON.stringify(payload, null, 2));
    addKioskLog('info', `HTTP POST 요청 전송 시도 -> ${kioskUrl}`);

    try {
      const response = await fetch(kioskUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      let parsedResponse = responseText;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (e) {}

      if (response.ok) {
        addKioskLog('success', `로컬 수신 서버 전송 성공! (HTTP 상태 코드: ${response.status})`, JSON.stringify({
          status: response.status,
          response: parsedResponse
        }, null, 2));
        showToast('모의 결제 패킷이 정상 전송되었습니다.', 'success');
      } else {
        addKioskLog('error', `로컬 수신 서버 에러 반환 (HTTP 상태 코드: ${response.status})`, JSON.stringify({
          status: response.status,
          response: parsedResponse
        }, null, 2));
        showToast("로컬 서버 에러 반환: " + response.status, 'error');
      }
    } catch (err) {
      addKioskLog('error', "로컬 전송 실패: " + err.message, "에러 세부 사항: " + err.message + "\\n\\n※ 로컬 HTTPS 자가서명 인증서 문제인 경우, 브라우저로 목적지 주소(" + kioskUrl + ")에 직접 한번 접속하셔서 '보안 경고 페이지 -> 무시하고 진행(안전하지 않음으로 이동)'을 수동으로 한번 눌러주셔야 브라우저 보안 정책상 통신이 허용됩니다.");
      showToast('전송 에러가 발생했습니다. 터미널 로그를 확인해 주세요.', 'error');
    } finally {
      setIsSendingKiosk(false);
    }
  };"""

if old_state in content:
    content = content.replace(old_state, new_state)
    print("2. State variables and functions injected.")
else:
    print("2. Warning: Target state declaration not found.")

# 3. Replace the beginning of return statement to add tab controller
old_return_start = """  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 font-sans text-stone-800">
      
      {/* 타이틀 및 안내글 */}
      <div className="mb-6 text-left">
        <h2 className="haste-page-title text-2xl font-serif text-stone-900 mb-2">
          실시간 검증 시뮬레이터 및 API 개발 관제소 (테스트용)
        </h2>
        <p className="haste-body-text-1 text-sm text-stone-600 font-light leading-relaxed">
          외주 프로그램 연동 및 커피머신 로컬 서버 패킷 매핑 상태를 개발자용 로그보드와 연동 규격서를 통해 즉각 확인할 수 있습니다.
        </p>
      </div>

      {/* 2열 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">"""

new_return_start = """  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 font-sans text-stone-800">
      
      {/* 타이틀 및 안내글 */}
      <div className="mb-6 text-left">
        <h2 className="haste-page-title text-2xl font-serif text-stone-900 mb-2">
          실시간 검증 시뮬레이터 및 API 개발 관제소 (테스트용)
        </h2>
        <p className="haste-body-text-1 text-sm text-stone-600 font-light leading-relaxed">
          외주 프로그램 연동 및 커피머신 로컬 서버 패킷 매핑 상태를 개발자용 로그보드와 연동 규격서를 통해 즉각 확인할 수 있습니다.
        </p>
      </div>

      {/* 탭 버튼 컨트롤바 */}
      <div className="flex border-b border-stone-200 mb-6 gap-2 text-left">
        <button
          type="button"
          onClick={() => setActiveTab('COFFEE')}
          className={`px-5 py-3 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'COFFEE'
              ? 'border-[#C5A059] text-[#C5A059]'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <Clock size={14} />
          커피머신 연동 검증 (기존)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('KIOSK')}
          className={`px-5 py-3 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'KIOSK'
              ? 'border-[#C5A059] text-[#C5A059]'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <Layers size={14} />
          토스 키오스크 연동 검증 (v2.1.0)
        </button>
      </div>

      {activeTab === 'COFFEE' ? (
        /* 기존 커피머신 연동 검증 레이아웃 */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">"""

# Normalise spaces to ensure correct matching
content = content.replace(old_return_start.strip(), new_return_start.strip())
print("3. Return start updated.")

# 4. Replace the end of return statement to close activeTab check and add Kiosk view
old_return_end = """            </div>
          </div>

        </div>

      </div>

    </div>
  );
};"""

new_return_end = """            </div>
          </div>

        </div>

      </div>
      ) : (
        /* 신규 토스 키오스크 연동 검증 레이아웃 */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          
          {/* 좌측 열: 실시간 Kiosk 전송 터미널 로그 */}
          <div className="lg:col-span-7 space-y-6">
            <div className="font-bold text-sm text-[#C5A059] flex items-center gap-1.5 mb-1">
              <Terminal size={16} />
              <span>실시간 Kiosk 연동 터미널 로그</span>
            </div>
            
            <div className="bg-[#090d16] border border-stone-800 rounded-3xl overflow-hidden shadow-lg flex flex-col font-mono text-[11px] text-[#e2e8f0]">
              <div className="bg-stone-900/60 border-b border-stone-800 px-4 py-3 flex justify-between items-center">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">KIOSK LOG CONSOLE</span>
                <button
                  type="button"
                  onClick={() => setKioskLogs([])}
                  className="text-[10px] text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1 font-sans"
                >
                  <Trash2 size={11} />
                  로그 초기화
                </button>
              </div>
              
              <div className="p-5 space-y-4 min-h-[480px] max-h-[650px] overflow-y-auto">
                {kioskLogs.length === 0 ? (
                  <div className="text-center text-stone-600 py-32 font-sans text-xs font-light">
                    로그 데이터가 없습니다. 우측 결제 송신 버튼을 눌러 모의 결제를 진행해 보세요.
                  </div>
                ) : (
                  kioskLogs.map((log) => (
                    <div key={log.id} className="space-y-1 border-b border-stone-900 pb-3 last:border-0 last:pb-0">
                      <div className="flex gap-2 text-[10px] text-stone-500">
                        <span>[{log.timestamp}]</span>
                        <span className={`font-bold uppercase ${
                          log.type === 'success' ? 'text-emerald-500' :
                          log.type === 'warning' ? 'text-amber-400' :
                          log.type === 'error' ? 'text-rose-500' : 'text-sky-400'
                        }`}>
                          {log.type}
                        </span>
                      </div>
                      <div className="text-stone-300 font-sans text-[11.5px] leading-relaxed">{log.message}</div>
                      {log.payload && (
                        <pre className="bg-stone-950 border border-stone-900 p-3 rounded-xl text-sky-400 text-[10px] select-all overflow-x-auto leading-normal whitespace-pre">
                          {log.payload}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 우측 열: 시뮬레이터 컨트롤 & 간편 명세서 */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Kiosk Simulator Control */}
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-1.5 border-b border-stone-100 pb-2.5">
                <Settings size={16} className="text-[#C5A059]" />
                <span>토스 키오스크 모의 결제기</span>
              </h4>
              
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">로컬 API 수신 주소 (HTTPS URL)</label>
                  <input
                    type="text"
                    value={kioskUrl}
                    onChange={(e) => setKioskUrl(e.target.value)}
                    placeholder="https://local.cafehaste.com:8080/api/order"
                    className="w-full text-xs font-mono border border-stone-200 rounded-xl p-2.5 bg-stone-50 focus:outline-none focus:border-[#C5A059] transition-all"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">연동 보안 토큰 (X-Haste-API-Key)</label>
                  <input
                    type="text"
                    value={kioskToken}
                    onChange={(e) => setKioskToken(e.target.value)}
                    placeholder="인증 토큰값 입력"
                    className="w-full text-xs font-mono border border-stone-200 rounded-xl p-2.5 bg-stone-50 focus:outline-none focus:border-[#C5A059] transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">음료 상품 선택</label>
                    <select
                      value={kioskProduct}
                      onChange={(e) => setKioskProduct(e.target.value)}
                      className="w-full text-xs border border-stone-200 rounded-xl p-2.5 bg-stone-50 focus:outline-none cursor-pointer"
                    >
                      {KIOSK_SAMPLE_BEVERAGES.map((bev) => (
                        <option key={bev.code} value={bev.code}>
                          {bev.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">주문 수량</label>
                    <input
                      type="number"
                      value={kioskQty}
                      onChange={(e) => setKioskQty(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="w-full text-xs border border-stone-200 rounded-xl p-2.5 bg-stone-50 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="includeDessertWeb"
                    checked={kioskIncludeDessert}
                    onChange={(e) => setKioskIncludeDessert(e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-[#C5A059]"
                  />
                  <label htmlFor="includeDessertWeb" className="text-xs font-bold text-stone-700 cursor-pointer select-none">
                    <strong>[디저트 필터링 검증]</strong> 뉴욕 치즈 케이크 1개 동시 주문
                  </label>
                </div>
                
                <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-2xl flex gap-2 items-start text-[10.5px] text-stone-600 leading-relaxed">
                  <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-blue-900 block mb-0.5">⚠️ 브라우저 보안 경고 해결 방법 (최초 1회 필수)</strong>
                    로컬 자가 서명 SSL 인증서 테스트 중 전송 에러가 날 경우, 브라우저 새 탭에서 본인의 목적지 주소(<a href={kioskUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 font-bold">{kioskUrl}</a>)를 직접 접속하여 <strong>'보안 경고 페이지 ➔ 고급 ➔ 안전하지 않음으로 이동'</strong>을 수동으로 허용해주셔야 브라우저에서 로컬 통신이 허용됩니다.
                  </div>
                </div>
                
                <div className="flex gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={saveKioskSettings}
                    className="border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                  >
                    설정 저장
                  </button>
                  <button
                    type="button"
                    onClick={handleSendKioskTest}
                    disabled={isSendingKiosk}
                    className="flex-1 bg-[#C5A059] hover:bg-[#b08e4d] disabled:bg-stone-300 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Send size={12} />
                    {isSendingKiosk ? '전송 중...' : '모의 결제 승인 패킷 전송 (POST)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Simple API Docs */}
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-1.5 border-b border-stone-100 pb-2.5">
                <FileJson size={16} className="text-[#C5A059]" />
                <span>토스 키오스크 로컬 연동 API 규격서 (v2.1.0)</span>
              </h4>
              
              <div className="text-xs text-stone-600 space-y-3 leading-relaxed">
                <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl space-y-1.5">
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">1. 필수 HTTP 헤더</span>
                  <div className="bg-white p-2.5 rounded-lg border border-stone-150 font-mono text-[9.5px] space-y-1">
                    <div><strong>X-Haste-API-Key</strong>: <code>HASTE_SECRET_LIVE_9363</code></div>
                    <div><strong>X-Haste-Timestamp</strong>: System.currentTimeMillis()</div>
                  </div>
                </div>
                
                <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl space-y-1.5">
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">2. Request Body (JSON)</span>
                  <pre className="bg-stone-950 text-stone-300 p-2.5 rounded-lg text-[9.5px] font-mono leading-tight whitespace-pre overflow-x-auto select-all">
{`{
  "orderId": "TOSS-ORD-123456",
  "token": "HASTE_SECRET_LIVE_9363",
  "items": [
    {
      "productNo": "E0000126",
      "title": "HOT 아메리카노 벤티",
      "quantity": 1
    }
  ]
}`}
                  </pre>
                </div>
                
                <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl space-y-1.5">
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">3. Response Body (JSON)</span>
                  <pre className="bg-white border border-stone-200 text-stone-700 p-2.5 rounded-lg text-[9.5px] font-mono leading-tight whitespace-pre overflow-x-auto">
{`{
  "success": true
}`}
                  </pre>
                </div>
              </div>
            </div>
            
          </div>
          
        </div>
      )}
    </div>
  );
};"""

content = content.replace(old_return_end.strip(), new_return_end.strip())
print("4. Return end updated.")

# Save modifications
with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Patch successfully applied!")
