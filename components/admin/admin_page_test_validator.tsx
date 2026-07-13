import React, { useEffect, useState, useMemo } from 'react';
import { Shield, FileJson, Clock, CheckCircle2, AlertTriangle, XCircle, RefreshCw, BookOpen, Send, Trash2, Terminal, Settings, Layers, Info, Database } from 'lucide-react';
import { useAdminLicensesLogs } from './admin_hook_licenses_logs';
import { useAdminSimulator } from './admin_hook_sim';
import { AdminCompValidatorLogBoard } from './admin_comp_validator_logboard';
import { AdminValidatorControl } from './admin_comp_validator_control';
import { adminFetch, JAVA_CODE_SNIPPET } from './admin_utils_api';
import standardProducts from './standard_products.json';
import * as XLSX from 'xlsx';

interface AdminPageTestValidatorProps {
  mode?: 'COFFEE' | 'KIOSK';
}

export const AdminPageTestValidator: React.FC<AdminPageTestValidatorProps> = ({ mode }) => {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [isFetchingLicenses, setIsFetchingLicenses] = useState(false);
  const [dbSize, setDbSize] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Toss Kiosk Validator States
  const [activeTab, setActiveTab] = useState<'COFFEE' | 'KIOSK'>(mode || 'COFFEE');

  // Sync mode if changed dynamically
  useEffect(() => {
    if (mode) {
      setActiveTab(mode);
    }
  }, [mode]);

  const [kioskUrl, setKioskUrl] = useState(() => localStorage.getItem('haste_kiosk_test_url_v6') || 'https://local.cafehaste.com:8080/api/order');
  const [kioskToken, setKioskToken] = useState(() => localStorage.getItem('haste_kiosk_test_token') || 'HASTE_SECRET_LIVE_9363');
  const [kioskLogs, setKioskLogs] = useState<any[]>([]);
  const [isSendingKiosk, setIsSendingKiosk] = useState(false);

  // Upgrade Kiosk States from standalone app
  const [products, setProducts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('haste_kiosk_products');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return standardProducts;
  });
  
  const [mappingSource, setMappingSource] = useState<'default' | 'excel' | 'sheets'>(() => {
    return (localStorage.getItem('haste_kiosk_products_source') as any) || 'default';
  });

  const [selectedCup, setSelectedCup] = useState<string>('G');
  const [bean1, setBean1] = useState<string>('S');
  const [bean2, setBean2] = useState<string>('D');
  const [simProductV4Code, setSimProductV4Code] = useState('MS000126');
  const [simQuantity, setSimQuantity] = useState(1);
  const [simCart, setSimCart] = useState<any[]>([]);

  const [optionMappings, setOptionMappings] = useState<any[]>([]);
  const [isFetchingOptions, setIsFetchingOptions] = useState(false);
  const [isSavingOptions, setIsSavingOptions] = useState(false);
  const [optionSearchQuery, setOptionSearchQuery] = useState('');

  const fetchOptionMappings = async () => {
    try {
      setIsFetchingOptions(true);
      const res = await fetch('/api/menu-items/option-mappings');
      const data = await res.json();
      if (data.success && Array.isArray(data.mappings)) {
        setOptionMappings(data.mappings);
      }
    } catch (e) {
      console.error('Failed to fetch option mappings:', e);
    } finally {
      setIsFetchingOptions(false);
    }
  };

  const saveOptionMappings = async () => {
    try {
      setIsSavingOptions(true);
      const res = await fetch('/api/menu-items/sync-option-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionMappings })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('옵션 매핑 저장 완료!', 'success');
      } else {
        throw new Error(data.message || '저장 실패');
      }
    } catch (err: any) {
      showToast(`저장 실패: ${err.message}`, 'error');
    } finally {
      setIsSavingOptions(false);
    }
  };
  
  const [googleSheetUrl, setGoogleSheetUrl] = useState(() => {
    return localStorage.getItem('haste_kiosk_sheet_url') || '';
  });
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetSyncError, setSheetSyncError] = useState<string | null>(null);
  const [sheetSyncSuccess, setSheetSyncSuccess] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      const code = p.v4Code || '';
      if (code.length === 0) return false;
      
      const cupChar = code[0].toUpperCase();
      
      if (p.sizeGroup === '미니벤티' || p.sizeGroup === '그란데' || p.sizeGroup === '벤티') {
        if (selectedCup !== cupChar) return false;
        
        if (code.length >= 2) {
          const beanChar = code[1].toUpperCase();
          if (['S', 'P', 'D'].includes(beanChar)) {
            const matchesBean1 = bean1 === beanChar;
            const matchesBean2 = bean2 !== 'NONE' && bean2 === beanChar;
            return matchesBean1 || matchesBean2;
          }
        }
        return true;
      }
      
      return selectedCup === 'DESSERT' || p.sizeGroup === '디저트 및 상품';
    });
  }, [products, selectedCup, bean1, bean2]);

  React.useEffect(() => {
    if (filteredProducts.length > 0) {
      const exists = filteredProducts.some(p => p.v4Code === simProductV4Code);
      if (!exists) {
        setSimProductV4Code(filteredProducts[0].v4Code);
      }
    } else {
      setSimProductV4Code('');
    }
  }, [filteredProducts, simProductV4Code]);

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

  // Auto-clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const saveKioskSettings = () => {
    localStorage.setItem('haste_kiosk_test_url_v6', kioskUrl);
    localStorage.setItem('haste_kiosk_test_token', kioskToken);
    showToast('설정이 브라우저에 저장되었습니다.', 'success');
  };

  const handleAddToCart = () => {
    const prod = products.find(p => p.v4Code === simProductV4Code);
    if (!prod) return;
    
    setSimCart(prev => {
      const idx = prev.findIndex(item => item.product.v4Code === simProductV4Code);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + simQuantity };
        return next;
      }
      return [...prev, { id: Math.random().toString(36).substring(2, 9), product: prod, quantity: simQuantity }];
    });
    
    showToast(`${prod.name} 상품이 장바구니에 추가되었습니다.`, 'success');
  };

  const handleRemoveFromCart = (id: string) => {
    setSimCart(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setSimCart([]);
  };

  const handleResetToDefaultProducts = () => {
    setProducts(standardProducts);
    setMappingSource('default');
    localStorage.removeItem('haste_kiosk_products');
    localStorage.removeItem('haste_kiosk_products_source');
    setSelectedCup('G'); setBean1('S'); setBean2('D');
    setSimProductV4Code('MS000126');
    setSimCart([]);
    showToast('기본 매핑 정보로 초기화되었습니다.', 'success');
  };

  const extractSpreadsheetId = (input: string) => {
    const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : input.trim();
  };

  const parseGvizResponse = (text: string, sheetName: string) => {
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) {
      throw new Error('올바르지 않은 구글 시트 응답 형식입니다.');
    }
    const jsonStr = text.substring(startIdx, endIdx + 1);
    const data = JSON.parse(jsonStr);
    
    if (data.status === 'error') {
      throw new Error(data.errors?.[0]?.detailed_message || '구글 시트 로드 중 오류가 발생했습니다.');
    }

    const table = data.table;
    if (!table || !table.cols || !table.rows) {
      throw new Error('시트 테이블 데이터를 분석할 수 없습니다.');
    }

    const cols = table.cols;
    const rows = table.rows;

    const findColIndex = (keywords: string[], defaultIdx: number) => {
      const idx = cols.findIndex((col: any) => {
        const label = (col.label || '').toLowerCase().trim();
        return keywords.some(kw => label.includes(kw.toLowerCase()));
      });
      return idx !== -1 ? idx : defaultIdx;
    };

    const categoryIdx = findColIndex(['대분류'], 0);
    const v4CodeIdx = findColIndex(['최종', '연동', '표준'], 1);
    const oldCodeIdx = findColIndex(['상품코드', '원래'], 2);
    const nameIdx = findColIndex(['상품명', '이름'], 3);
    const priceIdx = findColIndex(['판매가', '가격'], 4);

    const parsedProducts: any[] = [];

    rows.forEach((row: any) => {
      const cells = row.c || [];
      
      const getVal = (idx: number) => {
        if (idx >= cells.length || !cells[idx]) return null;
        return cells[idx].v;
      };

      const categoryRaw = getVal(categoryIdx);
      const v4CodeRaw = getVal(v4CodeIdx);
      const oldCodeRaw = getVal(oldCodeIdx);
      const nameRaw = getVal(nameIdx);
      const priceRaw = getVal(priceIdx);

      const category = categoryRaw ? String(categoryRaw).trim() : '기타';
      const v4Code = v4CodeRaw ? String(v4CodeRaw).trim() : '';
      const oldCode = oldCodeRaw ? String(oldCodeRaw).trim() : '';
      const name = nameRaw ? String(nameRaw).trim() : '';
      const price = typeof priceRaw === 'number' ? priceRaw : parseInt(String(priceRaw || '3000')) || 3000;

      if (v4Code && oldCode && v4Code !== '최종 연동코드' && oldCode !== '상품코드') {
        parsedProducts.push({
          sizeGroup: sheetName,
          category,
          v4Code,
          oldCode,
          name,
          price
        });
      }
    });

    return parsedProducts;
  };

  const handleGoogleSheetSync = async () => {
    const inputUrl = googleSheetUrl.trim();
    if (!inputUrl) {
      showToast('구글 시트 주소 또는 ID를 입력해 주세요.', 'error');
      setSheetSyncError('구글 시트 주소 또는 ID를 입력해 주세요.');
      setSheetSyncSuccess(null);
      return;
    }

    const sheetId = extractSpreadsheetId(inputUrl);
    addKioskLog('info', `[구글 시트 연동] 동기화 시작... (Spreadsheet ID: ${sheetId})`);
    setIsSyncingSheet(true);
    setSheetSyncError(null);
    setSheetSyncSuccess(null);

    const sheetNames = ['미니벤티', '그란데', '벤티', '디저트 및 상품'];
    const allExtractedProducts: any[] = [];

    try {
      const promises = sheetNames.map(async (sheetName) => {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`시트 '${sheetName}'를 가져올 수 없습니다. (HTTP ${res.status})`);
        }
        const text = await res.text();
        return { sheetName, text };
      });

      const results = await Promise.all(promises);

      results.forEach(({ sheetName, text }) => {
        const parsed = parseGvizResponse(text, sheetName);
        allExtractedProducts.push(...parsed);
      });

      if (allExtractedProducts.length === 0) {
        throw new Error('분석된 상품 매핑 정보가 0개입니다. 시트 내용을 확인하세요.');
      }

      setProducts(allExtractedProducts);
      setMappingSource('sheets');
      localStorage.setItem('haste_kiosk_products', JSON.stringify(allExtractedProducts));
      localStorage.setItem('haste_kiosk_products_source', 'sheets');
      localStorage.setItem('haste_kiosk_sheet_url', inputUrl);
      
      setSelectedCup(allExtractedProducts[0].v4Code[0] === 'M' ? 'M' : allExtractedProducts[0].v4Code[0] === 'V' ? 'V' : 'G');
      setSimProductV4Code(allExtractedProducts[0].v4Code);
      setSimCart([]);

      addKioskLog('success', `[구글 시트 연동] 총 ${allExtractedProducts.length}개의 상품 매핑 정보를 시트로부터 성공적으로 실시간 연동했습니다.`);
      showToast('구글 시트 동기화 성공!', 'success');
      setSheetSyncSuccess(`성공: 총 ${allExtractedProducts.length}개 상품 동기화 완료`);
    } catch (err: any) {
      let detailMsg = err.message || '알 수 없는 오류가 발생했습니다.';
      if (detailMsg.includes('Failed to fetch') || detailMsg.includes('fetch')) {
        detailMsg = `네트워크 오류 또는 권한 없음 (HTTP 401 Unauthorized 등). 구글 시트 우측 상단 [공유] -> 일반 액세스가 "링크가 있는 모든 사용자 - 뷰어"로 설정되어 있는지 확인해 주세요.`;
      } else if (detailMsg.includes('401') || detailMsg.includes('Unauthorized')) {
        detailMsg = `HTTP 401 Unauthorized: 구글 시트 접근 권한이 없습니다. 구글 시트 우측 상단 [공유] -> 일반 액세스를 "링크가 있는 모든 사용자 - 뷰어"로 설정해 주세요.`;
      } else if (detailMsg.includes('404') || detailMsg.includes('Not Found')) {
        detailMsg = `HTTP 404 Not Found: 구글 시트 ID 또는 URL이 올바르지 않거나 시트를 찾을 수 없습니다.`;
      }
      
      addKioskLog('error', `[구글 시트 연동] 동기화 실패: ${err.message}`);
      addKioskLog('info', '※ 조치사항: 구글 시트 우측 상단 [공유] -> 일반 액세스를 [링크가 있는 모든 사용자 - 뷰어]로 설정해 주세요.');
      showToast('구글 시트 연동 실패', 'error');
      setSheetSyncError(detailMsg);
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const handleSendKioskTest = async () => {
    if (simCart.length === 0) {
      showToast('장바구니가 비어 있습니다. 상품을 추가한 후 시도해 주세요.', 'error');
      return;
    }

    if (!kioskUrl.trim()) {
      showToast('수신 주소를 입력해 주세요.', 'error');
      return;
    }
    setIsSendingKiosk(true);

    addKioskLog('info', `[시뮬레이터] 가상 결제 완료 승인 감지. 전송 패킷 변환 시작...`);

    // 1. 디저트, 베이커리 등 비음료 제외 키워드 필터링
    const excludeKeywords = ['디저트', '베이커리', '푸드', '사이드', 'MD', '쿠키', '케이크', '빵', '음식', 'food', 'dessert', 'bakery', 'side', 'goods'];
    const filteredItems = simCart.filter(item => {
      const category = (item.product.category || '').toLowerCase();
      const isExcluded = excludeKeywords.some(keyword => category.includes(keyword.toLowerCase()));
      if (isExcluded) {
        addKioskLog('info', `[필터링 작동] 비음료 카테고리 품목 제외: ${item.product.name} (카테고리: ${item.product.category})`);
      }
      return !isExcluded;
    });

    if (filteredItems.length === 0) {
      addKioskLog('warning', `[시뮬레이터] 장바구니 품목 중 전송 대상 음료가 없어 로컬 서버로 데이터를 전송하지 않습니다. (디저트류 필터링 완료)`);
      showToast('디저트류 전송 필터링이 완료되었습니다.', 'success');
      setIsSendingKiosk(false);
      return;
    }

    // 2. 최종 전송할 items 매핑 (productNo, name, quantity)
    const finalItems = filteredItems.map(item => ({
      productNo: item.product.v4Code,
      name: item.product.name,
      quantity: item.quantity
    }));

    const mockOrderId = 'TOSS-ORD-' + Math.floor(100000 + Math.random() * 900005);

    const payload = {
      orderId: mockOrderId,
      token: kioskToken,
      items: finalItems
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-Haste-API-Key': kioskToken,
      'X-Haste-Timestamp': Date.now().toString(),
      'bypass-tunnel-reminder': 'true'
    };

    addKioskLog('info', `전송 패킷 조립 완료. (디저트 필터링 처리됨)`, JSON.stringify(payload, null, 2));
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
    } catch (err: any) {
      const isHttps = kioskUrl.toLowerCase().startsWith('https');
      const remedy = isHttps 
        ? "\n\n※ 로컬 HTTPS 자가서명 인증서 문제인 경우, 브라우저로 목적지 주소(" + kioskUrl + ")에 직접 한번 접속하셔서 '보안 경고 페이지 -> 무시하고 진행(안전하지 않음으로 이동)'을 수동으로 한번 눌러주셔야 브라우저 보안 정책상 통신이 허용됩니다."
        : "\n\n※ 일반 HTTP 연결 실패입니다. 로컬 수신 프로그램(mock_receiver.py 등)이 실행 중인지 확인하거나 PC의 네트워크 IP 주소/포트 번호를 재확인하세요.";
      
      addKioskLog('error', "로컬 전송 실패: " + err.message, "에러 세부 사항: " + err.message + remedy);
      showToast('전송 에러가 발생했습니다. 터미널 로그를 확인해 주세요.', 'error');
    } finally {
      setIsSendingKiosk(false);
    }
  };
  
  const getKstTodayStr = () => {
    const d = new Date();
    const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split('T')[0];
  };
  const [selectedDate, setSelectedDate] = useState(getKstTodayStr());

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const productionEndpointUrl = 'https://cafehaste.com/api/v1/store/verify';


  // Toast mockup handler
  const showToast = (msg: string, type?: 'success' | 'error') => {
    console.log(`[Toast] ${type || 'success'}: ${msg}`);
  };

  const fetchDbSize = async () => {
    const res = await adminFetch('/api/db-info');
    if (res.success && res.data) {
      setDbSize(res.data.sizeMb);
    }
  };

  const logs = useAdminLicensesLogs(showToast, false, fetchDbSize);
  const sim = useAdminSimulator(logs.testStoreId, licenses, logs.fetchApiLogs);

  const fetchLicenses = async () => {
    setIsFetchingLicenses(true);
    const res = await adminFetch('/api/licenses');
    if (res.success && res.data) {
      setLicenses(res.data.licenses || []);
    }
    setIsFetchingLicenses(false);
  };

  useEffect(() => {
    fetchLicenses();
    fetchDbSize();
    fetchOptionMappings();
    // Auto-refresh logs every 7 seconds for live demo feel
    const interval = setInterval(() => {
      logs.fetchApiLogs();
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Left logs filter (actual DB test logs)
  const leftLogs = useMemo(() => {
    const combined = [
      ...sim.simulatedLogs,
      ...logs.apiLogs
    ];
    const filtered = combined.filter(log => {
      const storeId = (log.storeId || '').trim().toUpperCase();
      return storeId !== '' && log.isVirtual !== true && storeId.startsWith('STORE') && !storeId.startsWith('STOREX');
    });

    // 중복 제거: 로컬 임시 로그(lineIndex 없음) 중 이미 서버 로그(apiLogs)에 유사한 시간대(10초 이내)의 동일 매장 로그가 존재하면 로컬 로그 제외
    return filtered.filter(log => {
      if (!log.lineIndex) {
        const hasDuplicateInServer = logs.apiLogs.some(srvLog => {
          if (srvLog.storeId !== log.storeId) return false;
          const timeDiff = Math.abs(new Date(srvLog.timestamp).getTime() - new Date(log.timestamp).getTime());
          return timeDiff < 10000; // 10초 이내 동일 매장 요청은 동일 사건으로 간주
        });
        if (hasDuplicateInServer) return false;
      }
      return true;
    });
  }, [sim.simulatedLogs, logs.apiLogs]);



  // Filter and compute status for test accounts store123456 ~ store123460
  const testAccounts = useMemo(() => {
    const targets = ['store123456', 'store123457', 'store123458', 'store123459', 'store123460'];
    return targets.map(storeId => {
      const found = licenses.find(l => (l.storeId || '').toLowerCase() === storeId.toLowerCase());
      
      let storeName = '미지정 매장';
      let storeGrade = 'PREMIUM';
      let statusLabel = '미등록';
      let statusColor = 'text-stone-400 bg-stone-100 border-stone-200';
      let expireDate = '-';

      if (found) {
        storeName = found.storeName;
        storeGrade = found.storeGrade || 'PREMIUM';
        expireDate = found.licenseEndDate || '-';
        
        const isNotExpired = expireDate !== '-' ? (new Date(`${expireDate}T23:59:59`).getTime() >= Date.now()) : false;
        
        if (Number(found.isApproved) === 1 && isNotExpired) {
          statusLabel = '인증 완료';
          statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        } else if (Number(found.isApproved) === 1 && !isNotExpired) {
          statusLabel = '기간 만료';
          statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
        } else if (Number(found.isApproved) === 0) {
          statusLabel = '가동 정지중';
          statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
        } else if (Number(found.isApproved) === 2) {
          statusLabel = '인증 대기';
          statusColor = 'text-blue-700 bg-blue-50 border-blue-200';
        }
      } else {
        // Fallback mockup values if DB fetch fails or has not loaded yet
        if (storeId === 'store123456') { storeName = '테스트강남본점'; statusLabel = '인증 완료'; statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200'; expireDate = '2026-12-31'; }
        else if (storeId === 'store123457') { storeName = '테스트역삼지점'; storeGrade = 'STANDARD'; statusLabel = '인증 완료'; statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200'; expireDate = '2026-08-15'; }
        else if (storeId === 'store123458') { storeName = '테스트홍대입구역점'; statusLabel = '기간 만료'; statusColor = 'text-amber-700 bg-amber-50 border-amber-200'; expireDate = '2026-05-01'; }
        else if (storeId === 'store123459') { storeName = '테스트부산서면점'; statusLabel = '가동 정지중'; statusColor = 'text-rose-700 bg-rose-50 border-rose-200'; expireDate = '2027-03-01'; }
        else if (storeId === 'store123460') { storeName = '테스트신규가맹점'; statusLabel = '인증 대기'; statusColor = 'text-blue-700 bg-blue-50 border-blue-200'; expireDate = '2027-06-01'; }
      }

      return {
        storeId,
        storeName,
        storeGrade,
        statusLabel,
        statusColor,
        expireDate
      };
    });
  }, [licenses]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 font-sans text-stone-800">
      
      {/* 타이틀 및 안내글 */}
      {mode !== 'KIOSK' && (
        <div className="mb-6 text-left">
          <h2 className="haste-page-title text-2xl font-serif text-stone-900 mb-2">
            {mode === 'COFFEE'
              ? '커피머신 연동 검증 시뮬레이터 (v1.2.0)'
              : '실시간 검증 시뮬레이터 및 API 개발 관제소 (테스트용)'}
          </h2>
          <p className="haste-body-text-1 text-sm text-stone-600 font-light leading-relaxed">
            {mode === 'COFFEE'
              ? '커피머신 로컬 서버 패킷 매핑 상태를 개발자용 로그보드를 통해 즉각 확인할 수 있습니다.'
              : '외주 프로그램 연동 및 커피머신 로컬 서버 패킷 매핑 상태를 개발자용 로그보드와 연동 규격서를 통해 즉각 확인할 수 있습니다.'}
          </p>
        </div>
      )}

      {/* 탭 버튼 컨트롤바 */}
      {!mode && (
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
            커피머신 연동 검증 (기존) (v1.2.0)
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
            토스 키오스크 연동 검증 (v2.4.0)
          </button>
        </div>
      )}

      {activeTab === 'COFFEE' ? (
        /* 기존 커피머신 연동 검증 레이아웃 */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 좌측: 실시간 멤버십 검증기 모니터링 로그보드 */}
        <div className="lg:col-span-7 space-y-6">
          <div className="text-left font-bold text-sm text-[#C5A059] flex items-center gap-1.5 mb-1">
            <Clock size={16} />
            <span>실시간 검증 전산 모니터링 로그보드</span>
          </div>
          <AdminCompValidatorLogBoard
            displayLogs={leftLogs}
            isCurrentlyLoading={logs.isLoadingLogs}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            handleFlushLogs={async () => {}}
            flushStatus={null}
            isSavingLogs={false}
            hasFlushed={false}
            onRefresh={logs.fetchApiLogs}
            handleClearLogs={() => {
              sim.handleClearSimulation();
              logs.handleClearLogs();
            }}
            handleClearDbLogs={() => {
              sim.handleClearSimulation();
              logs.handleClearDbLogs();
            }}
            licenses={licenses}
          />
        </div>

        {/* 우측: 실시간 연동 모니터 제어기, 테스트 계정 상태 및 API 가이드북 */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* API 실시간 연동 모니터 조작기 */}
          <div className="w-full">
            <AdminValidatorControl
              testStoreId={logs.testStoreId}
              setTestStoreId={logs.setTestStoreId}
              testApiKey={logs.testApiKey}
              setTestApiKey={logs.setTestApiKey}
              handleTestVerify={logs.handleTestVerify}
              isTesting={logs.isTesting}
              isLoadingLogs={logs.isLoadingLogs}
              dbSize={dbSize}
              logAnalysis={logs.logAnalysis}
              setIsKioskPopupOpen={() => {}}
              handleClearLogs={() => {
                sim.handleClearSimulation();
                logs.handleClearLogs();
              }}
              handleClearSimulation={sim.handleClearSimulation}
              isSimulating={sim.isSimulating}
              simSpeed={sim.simSpeed}
              setSimSpeed={sim.setSimSpeed}
              simProgress={sim.simProgress}
              runDbSimulation={sim.runDbSimulation}
              fetchApiLogs={logs.fetchApiLogs}
              fetchLicenses={fetchLicenses}
              testResult={logs.testResult}
            />
          </div>

          {/* 테스트 계정 인증상태 테이블 */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm text-left">
            <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-[#C5A059]" />
              <span>테스트용 계정 (store123456 ~ store123460) 실시간 인증상태</span>
            </h4>
            <div className="border border-stone-200 rounded-xl overflow-hidden text-[11px] bg-white">
              <table className="w-full text-left text-stone-600 bg-white leading-normal">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-extrabold text-[9px] tracking-wider uppercase">
                    <th className="p-2.5 pl-3">계정코드</th>
                    <th className="p-2.5">매장명</th>
                    <th className="p-2.5">상태</th>
                    <th className="p-2.5 pr-3">만료일</th>
                  </tr>
                </thead>
                <tbody>
                  {testAccounts.map((acc, index) => (
                    <tr key={index} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                      <td className="p-2.5 pl-3 font-mono font-bold text-stone-900">{acc.storeId}</td>
                      <td className="p-2.5 font-medium text-stone-700">
                        {acc.storeName} <span className="text-[9px] text-stone-400">({acc.storeGrade})</span>
                      </td>
                      <td className="p-2.5">
                        <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-bold ${acc.statusColor}`}>
                          {acc.statusLabel}
                        </span>
                      </td>
                      <td className="p-2.5 pr-3 font-mono text-stone-500">{acc.expireDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* API 관제소 처리 가이드북 */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm text-left space-y-3">
            <h4 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-1.5 border-b border-stone-100 pb-2.5">
              <BookOpen size={16} className="text-[#C5A059]" />
              <span>API 관제소 처리 가이드북</span>
            </h4>
            <div className="text-xs text-stone-600 space-y-3 leading-relaxed">
              <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl space-y-1.5">
                <span className="text-[10px] text-[#C5A059] font-extrabold uppercase tracking-wider block">■ 1. 중복 패킷 및 리플레이 방어 (DUP Guard)</span>
                <p className="text-[11px] text-stone-700 font-medium">
                  동일한 매장 고유번호로 10초 이내에 중복 접수되는 API 호출은 리플레이 어택 방어 시스템에 의해 중복 패킷(<code className="bg-white px-1.5 py-0.5 rounded font-mono text-[10px] text-blue-600 border border-stone-200">DUP</code>)으로 자동 필터링됩니다. 자바 클라이언트 연동 개발 시 단발성 호출 규격을 사수하십시오.
                </p>
              </div>
              <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl space-y-1.5">
                <span className="text-[10px] text-[#C5A059] font-extrabold uppercase tracking-wider block">■ 2. 커피머신 로컬 구동 유예제 (Grace Period)</span>
                <p className="text-[11px] text-stone-700 font-medium">
                  인터넷 장애나 만료 당일 정산 지연으로 매장 영업이 급작스럽게 마비되는 것을 막기 위해 만료 후 최대 7일간 임시 오프라인 구동을 보장하는 <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[10px] text-rose-600 border border-stone-200">allowOfflineGrace: true</code> 유예 토큰을 반환합니다. <br/>
                  <span className="text-[9.5px] text-stone-500 font-normal block mt-1">※ 목적: 미납 매장에 대한 헤이스트의 실시간 차단 제어권을 확보하고, 클라이언트 PC 시간 조작을 통한 유예 타이머 우회 행위를 원천 방지하기 위해 암호화된 토큰을 교차 대조합니다.</span>
                </p>
              </div>
              <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl space-y-1.5">
                <span className="text-[10px] text-[#C5A059] font-extrabold uppercase tracking-wider block">■ 3. 커넥션 병목 및 인메모리 벌크 동기화</span>
                <p className="text-[11px] text-stone-700 font-medium">
                  서버 부하 분산 및 DB 커넥션 병목 극복을 위해, 실시간 호출 로그는 5분간 램 버퍼에 수집된 후 DB로 벌크 이관되며, 자정(00:00 KST)에 자동으로 디스크 파일 백업 후 DB 데이터는 최적화 소거됩니다.
                </p>
              </div>
              <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl space-y-1.5">
                <span className="text-[10px] text-[#C5A059] font-extrabold uppercase tracking-wider block">■ 4. API 관제소 판정 기준 및 동작 분기 (Status Mapping)</span>
                <div className="text-[11px] text-stone-700 font-medium space-y-1 text-left">
                  <p>• <strong className="text-emerald-600">정상 PASS</strong>: 유효한 약정 내의 정상 가동 매장으로, 로컬 동기화 기능이 승인 완료됩니다.</p>
                  <p>• <strong className="text-amber-600">주의 WARN</strong>: 가맹 승인 심사 대기(Pending) 상태이거나 라이선스 기간 만료 후 7일 비상 구동 유예가 보장되는 과도기 상태입니다.</p>
                  <p>• <strong className="text-rose-600">위험 FAIL</strong>: 보안 시크릿 키 불일치(INVALID_KEY), 유예 기간 소진, 혹은 다중 IP 동시 접속 등의 위협 감지로 강제 락다운(Lock) 차단된 상태입니다.</p>
                  <p>• <strong className="text-blue-600">중복 DUP</strong>: 10초 이내에 동일 매장에서 전송된 비정상 반복 패킷으로, 시스템 과부하 차단을 위해 무효 필터링된 건입니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* API 연동 가이드북 내용 */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm text-left space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2.5">
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <FileJson size={16} className="text-[#C5A059]" />
                <span>자바로컬서버연동 API 규격서 (v1.2.0)</span>
              </h4>
              <div className="flex gap-1.5 items-center flex-wrap">
                <a
                  href="/Local_Program_API_Specs_v1.2.0.md"
                  download="Local_Program_API_Specs_v1.2.0.md"
                  className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 px-2 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen size={11} />
                  <span>연동 가이드 (.md)</span>
                </a>
              </div>
            </div>

            {/* 개요 */}
            <div className="text-xs text-stone-600 space-y-2 leading-relaxed">
              <p className="font-bold text-stone-800">
                👉 매장 커피머신 로컬 프로그램과 헤이스트 백엔드 서버 간의 API 검증 연동 규약입니다.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-stone-550">
                <li>보안 위조 방지를 위해 마스터 시크릿 키 헤더 주입이 필수적입니다.</li>
                <li>오프라인 유예(Grace Period) 설정을 확인하여 무중단 서비스를 제공해 주십시오.</li>
              </ul>
            </div>

            {/* 엔드포인트 */}
            <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl space-y-2">
              <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">1. API 엔드포인트</span>
              <div className="text-[11px] font-mono text-stone-700 bg-white p-2 rounded border border-stone-150 break-all">
                <span className="text-emerald-600 font-extrabold mr-1.5">POST</span>
                {productionEndpointUrl}
              </div>
            </div>

            {/* 요청 헤더 */}
            <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl space-y-2">
              <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">2. Request 헤더 규격</span>
              <div className="space-y-1.5 text-xs">
                <div className="bg-white p-2 rounded border border-stone-150 font-mono">
                  <div className="flex justify-between font-bold text-stone-850">
                    <span>X-Haste-API-Key</span>
                    <span className="text-rose-600 text-[10px]">필수</span>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1 select-all break-all flex items-center justify-between">
                    <span>값: <code className="bg-rose-50 text-rose-600 px-1 py-0.5 rounded font-bold">HASTE_SECRET_LIVE_9363</code></span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('HASTE_SECRET_LIVE_9363', 'master-key-header')}
                      className="text-[9px] text-[#C5A059] hover:text-[#b08e4d] font-bold cursor-pointer transition-colors"
                    >
                      {copiedText === 'master-key-header' ? '✓ 복사완료' : '복사'}
                    </button>
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-stone-150 font-mono">
                  <div className="flex justify-between font-bold text-stone-850">
                    <span>X-Haste-Timestamp</span>
                    <span className="text-rose-600 text-[10px]">필수</span>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1">
                    값: System.currentTimeMillis() (유닉스 타임스탬프 밀리초)
                  </div>
                </div>
              </div>
            </div>

            {/* 요청 Body */}
            <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl space-y-2">
              <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">3. Request Body (JSON)</span>
              <pre className="bg-stone-950 text-stone-300 p-2.5 rounded-lg text-[10px] font-mono whitespace-pre overflow-x-auto select-all">
{`{
  "storeId": "store123456"
}`}
              </pre>
            </div>

            {/* 응답 예시 (성공/실패) */}
            <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl space-y-2.5">
              <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">4. 응답 예시 (JSON)</span>
              
              <div className="space-y-1">
                <span className="text-[10px] text-emerald-700 font-bold block">■ [정상 인증 합격] isApproved: true</span>
                <pre className="bg-white border border-stone-200 text-stone-700 p-2 rounded-lg text-[9.5px] font-mono leading-tight whitespace-pre overflow-x-auto select-all">
{`{
  "isApproved": true,
  "storeGrade": "PREMIUM",
  "storeName": "강남본점",
  "expireDate": "2026-12-31",
  "offlineLicenseToken": "Haste_SecureToken_..."
}`}
                </pre>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-amber-700 font-bold block">■ [기간 만료 유예] reason: EXPIRED</span>
                <pre className="bg-white border border-stone-200 text-stone-700 p-2 rounded-lg text-[9.5px] font-mono leading-tight whitespace-pre overflow-x-auto select-all">
{`{
  "isApproved": false,
  "reason": "EXPIRED",
  "allowOfflineGrace": true,
  "offlineLicenseToken": "Haste_Expired_GraceToken_Sample_9363"
}`}
                </pre>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-rose-750 font-bold block">■ [가동 정지 / 인증대기] isApproved: false</span>
                <pre className="bg-white border border-stone-200 text-stone-700 p-2 rounded-lg text-[9.5px] font-mono leading-tight whitespace-pre overflow-x-auto select-all">
{`{
  "isApproved": false,
  "reason": "SUSPENDED", // 또는 "PENDING_APPROVAL"
  "allowOfflineGrace": false,
  "offlineLicenseToken": null
}`}
                </pre>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-rose-750 font-bold block">■ [보안키 불일치] reason: INVALID_KEY</span>
                <pre className="bg-white border border-stone-200 text-stone-700 p-2 rounded-lg text-[9.5px] font-mono leading-tight whitespace-pre overflow-x-auto select-all">
{`{
  "isApproved": false,
  "reason": "INVALID_KEY",
  "allowOfflineGrace": false,
  "offlineLicenseToken": null
}`}
                </pre>
              </div>
            </div>

            {/* 자바 연동 예제 */}
            <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl space-y-2.5">
              <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">5. Java 연동 클래스 예시 (Client Code Snippet)</span>
              <div className="relative font-mono">
                <pre className="bg-stone-950 text-stone-300 p-2.5 rounded-lg text-[9.5px] overflow-auto max-h-48 select-all whitespace-pre leading-normal tab-size-4">
                  {JAVA_CODE_SNIPPET}
                </pre>
                <button 
                  type="button"
                  onClick={() => copyToClipboard(JAVA_CODE_SNIPPET, 'java-test-page')}
                  className="absolute top-2 right-2 bg-stone-900 hover:bg-stone-850 text-stone-300 p-1 px-2 rounded border border-stone-750 text-[9px] active:scale-95 transition-all cursor-pointer font-sans"
                >
                  {copiedText === 'java-test-page' ? '✓ 복사됨' : '복사'}
                </button>
              </div>
            </div>

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
                        <pre className="bg-stone-950 border border-stone-900 p-3 rounded-xl text-sky-400 text-[10px] select-all overflow-x-auto leading-normal whitespace-pre-wrap break-all">
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
            
            {/* 로컬 연동 설정 정보 카드 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-stone-100 pb-2.5">
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Settings size={16} className="text-[#C5A059]" />
                  <span>로컬 연동 설정 정보</span>
                </h4>
                {/* Dynamic badge for mapping source */}
                {mappingSource === 'excel' && (
                  <span className="bg-indigo-50 border border-indigo-200 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold">
                    커스텀 엑셀
                  </span>
                )}
                {mappingSource === 'sheets' && (
                  <span className="bg-blue-50 border border-blue-200 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">
                    구글 시트
                  </span>
                )}
                {mappingSource === 'default' && (
                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold">
                    빌트인 매핑
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                {/* Connection Config */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">로컬 수신 주소 (URL)</label>
                    <input
                      type="text"
                      value={kioskUrl}
                      readOnly
                      placeholder="https://local.cafehaste.com:8080/api/order"
                      className="w-full text-xs font-mono font-semibold px-3 py-2 border border-stone-250 rounded-xl bg-stone-100/70 text-stone-500 focus:outline-none select-all cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">인증 토큰 (X-Haste-API-Key)</label>
                    <input
                      type="text"
                      value={kioskToken}
                      readOnly
                      placeholder="인증 토큰값 입력"
                      className="w-full text-xs font-mono font-semibold px-3 py-2 border border-stone-250 rounded-xl bg-stone-100/70 text-stone-500 focus:outline-none select-all cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Google Sheets Sync Card */}
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">구글 시트 연동 주소 (Spreadsheet URL)</label>
                    {mappingSource !== 'default' && (
                      <button
                        type="button"
                        className="text-[10px] text-rose-600 hover:text-rose-700 font-bold transition-all cursor-pointer"
                        onClick={handleResetToDefaultProducts}
                      >
                        기본값 초기화
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={googleSheetUrl}
                      onChange={(e) => setGoogleSheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/... 주소 입력"
                      className="flex-1 text-xs font-mono font-semibold px-3 py-2 border border-stone-300 rounded-xl bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleGoogleSheetSync}
                      disabled={isSyncingSheet}
                      className="bg-[#C5A059] hover:bg-[#b08e4d] disabled:bg-stone-300 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 disabled:scale-100"
                    >
                      <RefreshCw size={11} className={isSyncingSheet ? "animate-spin" : ""} />
                      {isSyncingSheet ? '동기화 중' : '동기화'}
                    </button>
                  </div>

                  {sheetSyncError && (
                    <div className="text-[11px] text-rose-650 bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-left leading-normal font-medium">
                      {sheetSyncError}
                    </div>
                  )}
                  {sheetSyncSuccess && (
                    <div className="text-[11px] text-emerald-650 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-left leading-normal font-bold">
                      {sheetSyncSuccess}
                    </div>
                  )}
                </div>

                {/* 표준 옵션 매핑 관리 카드 */}
                <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-2.5">
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <Layers size={16} className="text-[#C5A059]" />
                      <span>표준 옵션 레시피 매핑 관리 (DB)</span>
                    </h4>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={fetchOptionMappings}
                        disabled={isFetchingOptions}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold rounded-lg border border-stone-300 transition-all cursor-pointer"
                      >
                        {isFetchingOptions ? '로딩 중...' : '불러오기'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOptionMappings(prev => [
                            { baseName: '신규 상품', optionName: '기본 (HOT)', recipeCode: 'GS000000', actualName: '신규 음료', category: '에스프레소' },
                            ...prev
                          ]);
                        }}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold rounded-lg border border-stone-300 transition-all cursor-pointer"
                      >
                        행 추가
                      </button>
                      <button
                        type="button"
                        onClick={saveOptionMappings}
                        disabled={isSavingOptions}
                        className="px-2.5 py-1 bg-[#C5A059] hover:bg-[#b08e4d] text-white text-[10px] font-extrabold rounded-lg transition-all cursor-pointer shadow-xs"
                      >
                        {isSavingOptions ? '저장 중...' : 'DB에 저장'}
                      </button>
                    </div>
                  </div>

                  {/* Search filter for mapping rows */}
                  <input
                    type="text"
                    placeholder="매핑 규칙 필터링 (메뉴명, 옵션명, 레시피 코드...)"
                    value={optionSearchQuery}
                    onChange={(e) => setOptionSearchQuery(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 border border-stone-250 rounded-xl bg-white text-stone-900 focus:outline-[#C5A059]"
                  />

                  <div className="border border-stone-200 rounded-xl overflow-hidden text-[10px] bg-white max-h-72 overflow-y-auto">
                    <table className="w-full text-left text-stone-600 bg-white leading-normal">
                      <thead className="sticky top-0 bg-stone-50 z-10">
                        <tr className="border-b border-stone-200 text-stone-500 font-extrabold text-[9px] tracking-wider uppercase">
                          <th className="p-2 pl-3">대표 상품 (Kiosk)</th>
                          <th className="p-2">선택 옵션 (Option)</th>
                          <th className="p-2">레시피 코드</th>
                          <th className="p-2">제조 음료명 (DB)</th>
                          <th className="p-2 pr-3 text-center">동작</th>
                        </tr>
                      </thead>
                      <tbody>
                        {optionMappings
                          .filter(m => {
                            if (!optionSearchQuery) return true;
                            const q = optionSearchQuery.toLowerCase();
                            return (
                              (m.baseName || '').toLowerCase().includes(q) ||
                              (m.optionName || '').toLowerCase().includes(q) ||
                              (m.recipeCode || '').toLowerCase().includes(q) ||
                              (m.actualName || '').toLowerCase().includes(q)
                            );
                          })
                          .map((m, idx) => (
                            <tr key={idx} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                              <td className="p-1.5 pl-3">
                                <input
                                  type="text"
                                  value={m.baseName || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setOptionMappings(prev => prev.map((item, i) => i === idx ? { ...item, baseName: val } : item));
                                  }}
                                  className="w-full bg-transparent border-b border-transparent focus:border-[#C5A059] px-1 py-0.5 focus:outline-none font-bold text-stone-900"
                                />
                              </td>
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={m.optionName || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setOptionMappings(prev => prev.map((item, i) => i === idx ? { ...item, optionName: val } : item));
                                  }}
                                  className="w-full bg-transparent border-b border-transparent focus:border-[#C5A059] px-1 py-0.5 focus:outline-none"
                                />
                              </td>
                              <td className="p-1.5 font-mono">
                                <input
                                  type="text"
                                  value={m.recipeCode || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setOptionMappings(prev => prev.map((item, i) => i === idx ? { ...item, recipeCode: val } : item));
                                  }}
                                  className="w-full bg-transparent border-b border-transparent focus:border-[#C5A059] px-1 py-0.5 focus:outline-none font-bold text-blue-700"
                                />
                              </td>
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={m.actualName || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setOptionMappings(prev => prev.map((item, i) => i === idx ? { ...item, actualName: val } : item));
                                  }}
                                  className="w-full bg-transparent border-b border-transparent focus:border-[#C5A059] px-1 py-0.5 focus:outline-none text-stone-800"
                                />
                              </td>
                              <td className="p-1.5 pr-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOptionMappings(prev => prev.filter((_, i) => i !== idx));
                                  }}
                                  className="text-[9px] text-rose-600 hover:text-rose-700 font-bold transition-all cursor-pointer"
                                >
                                  삭제
                                </button>
                              </td>
                            </tr>
                          ))}
                        {optionMappings.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-stone-400 bg-stone-50/50">
                              옵션 매핑 데이터가 없습니다. 불러오기 버튼을 클릭해 주세요.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

{/* Warning Helper Box */}
                <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-2xl flex gap-2 items-start text-xs text-stone-600 leading-normal text-left">
                  <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-blue-955 block mb-0.5">⚠️ 브라우저 보안 경고 해결 방법 (로컬 HTTPS 연동 테스트 시)</strong>
                    연동 전송 에러가 날 경우, 브라우저 새 탭에서 본인의 수신 주소(<a href={kioskUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 font-bold">{kioskUrl}</a>)에 직접 접속하여 <strong>'안전하지 않음으로 이동'</strong>을 허용해주셔야 브라우저 로컬 통신이 활성화됩니다.
                  </div>
                </div>
              </div>
            </div>

            {/* 토스 키오스크 모의 결제기 (주문 정보) 카드 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-stone-100 pb-2.5">
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Layers size={16} className="text-[#C5A059]" />
                  <span>토스 키오스크 모의 결제기 (주문 정보)</span>
                </h4>
              </div>
              
              <div className="space-y-4">
                {/* 컵 및 원두 선택 (물리 설정 제약) */}
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-left">
                  {/* 컵 분류 */}
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">1. 컵 사이즈 선택</label>
                    <select
                      value={selectedCup}
                      onChange={(e) => setSelectedCup(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none cursor-pointer transition-all focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                    >
                      <option value="G">그란데 (G)</option>
                      <option value="M">미니벤티 (M)</option>
                      <option value="V">벤티 (V)</option>
                      <option value="DESSERT">디저트/상품</option>
                    </select>
                  </div>

                  {/* 사용 원두 1 */}
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">2. 사용 원두 1</label>
                    <select
                      value={bean1}
                      onChange={(e) => setBean1(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none cursor-pointer transition-all focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                    >
                      <option value="S">일반 원두 (S)</option>
                      <option value="P">프리미엄 (P)</option>
                      <option value="D">디카페인 (D)</option>
                    </select>
                  </div>

                  {/* 사용 원두 2 */}
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">3. 사용 원두 2 (선택)</label>
                    <select
                      value={bean2}
                      onChange={(e) => setBean2(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none cursor-pointer transition-all focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                    >
                      <option value="NONE">사용 안 함 (없음)</option>
                      <option value="S">일반 원두 (S)</option>
                      <option value="P">프리미엄 (P)</option>
                      <option value="D">디카페인 (D)</option>
                    </select>
                  </div>
                </div>

{/* 상품 선택 및 수량 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-left">
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">음료/상품 선택</label>
                    <select
                      className="w-full text-sm border border-stone-200 rounded-xl p-2.5 bg-stone-50 focus:outline-none cursor-pointer font-bold text-stone-850"
                      value={simProductV4Code}
                      onChange={(e) => setSimProductV4Code(e.target.value)}
                    >
                      {filteredProducts.length === 0 ? (
                        <option value="">조건에 맞는 상품이 없습니다</option>
                      ) : (
                        filteredProducts.map(prod => (
                          <option key={prod.v4Code} value={prod.v4Code}>
                            {prod.name} ({prod.price.toLocaleString()}원)
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">수량</label>
                    <div className="flex gap-1.5">
                      <select
                        className="flex-1 text-sm border border-stone-200 rounded-xl p-2.5 bg-stone-50 focus:outline-none cursor-pointer"
                        value={simQuantity}
                        onChange={(e) => setSimQuantity(parseInt(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 10].map(n => (
                          <option key={n} value={n}>{n}개</option>
                        ))}
                      </select>
                      
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={filteredProducts.length === 0}
                        className="bg-[#C5A059] hover:bg-[#b08e4d] disabled:bg-stone-200 text-white font-bold text-xs px-3.5 rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        담기
                      </button>
                    </div>
                  </div>
                </div>

                {/* Code Info Display */}
                {(() => {
                  const selectedProd = products.find(p => p.v4Code === simProductV4Code) || products[0];
                  if (!selectedProd) return null;
                  return (
                    <div className="bg-amber-50/30 border border-amber-200/50 p-3.5 rounded-2xl text-xs text-stone-700 space-y-1.5 text-left">
                      <div className="font-bold text-[#C5A059] flex items-center gap-1">📋 선택 상품 코드 정보</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
                        <div><span className="text-stone-400">구 상품코드:</span> <strong className="text-stone-900">{selectedProd.oldCode}</strong></div>
                        <div><span className="text-stone-400">신 표준코드:</span> <strong className="text-amber-600">{selectedProd.v4Code}</strong></div>
                        <div className="col-span-2"><span className="text-stone-400">상품명:</span> <span className="text-stone-850">{selectedProd.name}</span></div>
                      </div>
                    </div>
                  );
                })()}

{/* Cart Display */}
                <div className="border border-stone-200 rounded-2xl overflow-hidden text-sm text-left">
                  <div className="flex justify-between items-center px-4.5 py-2.5 bg-stone-50 border-b border-stone-200 font-bold text-stone-850">
                    <span>🛒 모의 장바구니 ({simCart.length}개 품목)</span>
                    {simCart.length > 0 && (
                      <button type="button" onClick={handleClearCart} className="text-rose-500 hover:text-rose-600 text-xs font-bold cursor-pointer">비우기</button>
                    )}
                  </div>
                  <div className="max-h-40 overflow-y-auto bg-stone-50/30 divide-y divide-stone-100">
                    {simCart.length === 0 ? (
                      <div className="p-6 text-center text-stone-400 text-xs font-light">
                        추가된 상품이 없습니다. 위 목록에서 음료나 디저트를 장바구니에 담아 주세요.
                      </div>
                    ) : (
                      simCart.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-2.5 text-xs">
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex gap-1.5 items-center">
                              <span className="bg-stone-200 text-stone-600 text-[10px] px-1 rounded font-extrabold">{item.product.sizeGroup}</span>
                              <span className="font-bold text-stone-900 truncate block">{item.product.name}</span>
                            </div>
                            <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                              코드: <span className="text-amber-600 font-bold">{item.product.v4Code}</span> (구: {item.product.oldCode})
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-850">{item.quantity}개</span>
                            <span className="w-14 text-right font-semibold text-stone-700">{(item.product.price * item.quantity).toLocaleString()}원</span>
                            <button type="button" onClick={() => handleRemoveFromCart(item.id)} className="text-stone-300 hover:text-rose-500 font-bold text-sm cursor-pointer px-1">✕</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Simulation Trigger Row */}
                <div className="flex justify-between items-center pt-1 border-t border-stone-100">
                  <div className="flex flex-col text-left">
                    <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">총 시뮬레이션 금액</span>
                    <span className="text-lg font-extrabold text-[#C5A059] font-mono">
                      {simCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toLocaleString()} 원
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleSendKioskTest}
                    disabled={isSendingKiosk}
                    className="bg-[#C5A059] hover:bg-[#b08e4d] disabled:bg-stone-300 text-white text-sm font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Send size={12} />
                    {isSendingKiosk ? '전송 중...' : '모의 결제 승인 패킷 전송 (POST)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Simple API Docs */}
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-stone-100 pb-2.5 flex-wrap gap-2">
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <FileJson size={16} className="text-[#C5A059]" />
                  <span>토스 키오스크 로컬 연동 API 규격서 (v2.4.0)</span>
                </h4>
                <div className="flex gap-1.5 items-center flex-wrap">
                  <a
                    href="/Toss_Kiosk_Integration_Guide_v2.4.0.md"
                    download="Toss_Kiosk_Integration_Guide_v2.4.0.md"
                    className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 px-2 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen size={11} />
                    <span>연동 가이드 (.md)</span>
                  </a>
                  <a
                    href="/Recipe_Converter_Spec_v4.md"
                    download="Recipe_Converter_Spec_v4.md"
                    className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 px-2 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Layers size={11} />
                    <span>레시피 변환규격 (.md)</span>
                  </a>
                  <span className="text-[10px] text-stone-300">|</span>
                  <a
                    href="/cert.pem"
                    download="cert.pem"
                    className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 px-2 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="로컬 HTTPS 인증서 (cert.pem)"
                  >
                    <Shield size={11} />
                    <span>cert.pem</span>
                  </a>
                  <a
                    href="/key.pem"
                    download="key.pem"
                    className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 px-2 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="로컬 HTTPS 개인키 (key.pem)"
                  >
                    <Shield size={11} />
                    <span>key.pem</span>
                  </a>
                  <a
                    href="/cert.pfx"
                    download="cert.pfx"
                    className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 px-2 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Spring Boot 용 SSL 키스토어 (비밀번호: HASTE_CERT_PASSWORD)"
                  >
                    <Shield size={11} />
                    <span>cert.pfx</span>
                  </a>
                </div>
              </div>
              
              <div className="text-xs text-stone-600 space-y-3 leading-relaxed">
                {/* 상품코드 기준정보 */}
                <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl space-y-1.5">
                  <span className="text-[10px] text-[#C5A059] font-extrabold uppercase tracking-wider block">★ v4.1.0 표준 상품 코드 규격 (8자리 고정 길이)</span>
                  <div className="bg-white p-2.5 rounded-lg border border-stone-150 space-y-2 text-[11px] text-stone-750">
                    <div>
                      <strong className="text-stone-900 block mb-0.5">☕ 음료 품목 코드 구조</strong>
                      <code className="bg-stone-100 text-amber-600 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">{"[Size (1자)] + [Base (1자)] + [Category (1자)] + [Recipe ID (5자)]"}</code>
                      <ul className="list-disc pl-4 mt-1 text-[10px] text-stone-500 space-y-0.5">
                        <li><strong>Size (1번째)</strong>: M (미니벤티 _MV), G (그란데 _G), V (벤티 _V)</li>
                        <li><strong>Base (2번째)</strong>: S (원두커피), P (프리미엄), D (디카페인), M (논커피 우유), T (티음료), A (에이드)</li>
                        <li><strong>Category (3번째)</strong>: 0 (매장용), 7 (배달용)</li>
                        <li><strong>Recipe ID (4~8번째)</strong>: 기존 POS 상품코드의 마지막 5자리 일련번호</li>
                      </ul>
                    </div>
                    <div className="border-t border-stone-100 pt-1.5">
                      <strong className="text-stone-900 block mb-0.5">🍰 디저트 및 일반 상품</strong>
                      <code className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">{"X + [기존 POS 번호 뒤쪽 7자리]"}</code>
                      <span className="text-[10px] text-stone-500 block mt-0.5">예: E9000004 (마카롱) ➔ X9000004</span>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl space-y-1.5">
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">1. 필수 HTTP 헤더</span>
                  <div className="bg-white p-2.5 rounded-lg border border-stone-150 font-mono text-[9.5px] space-y-1">
                    <div><strong>X-Haste-API-Key</strong>: <code>{kioskToken || 'HASTE_SECRET_LIVE_9363'}</code></div>
                    <div><strong>X-Haste-Timestamp</strong>: System.currentTimeMillis()</div>
                  </div>
                </div>
                
                <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl space-y-1.5">
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">2. Request Body (JSON)</span>
                  <pre className="bg-stone-950 text-stone-300 p-2.5 rounded-lg text-[9.5px] font-mono leading-tight whitespace-pre overflow-x-auto select-all">
{`{
  "orderId": "TOSS-ORD-123456",
  "token": "${kioskToken || 'HASTE_SECRET_LIVE_9363'}",
  "items": [
    {
      "productNo": "MS000126",
      "name": "HOT_아메리카노_MV",
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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-stone-900 border border-emerald-500/30 px-5 py-3 rounded-2xl flex items-center gap-2 text-white shadow-2xl z-50 animate-bounce">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
