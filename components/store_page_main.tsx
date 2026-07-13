import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';
import { HasteSymbol } from './home_comp_logo';
import { StoreBranch, getAddressForStore, hashStringToCoords } from './store_types';
import { StoreCompMap } from './store_comp_map';

export const HasteStore: React.FC<{ 
  onQuickOrder?: (branchName: string) => void;
  isMobile?: boolean;
  useMobileCompact?: boolean;
}> = ({ onQuickOrder, isMobile = false, useMobileCompact = false }) => {
  const isComp = isMobile || useMobileCompact;
  const [branches, setBranches] = useState<StoreBranch[]>(() => {
    try {
      const cached = localStorage.getItem('haste_cached_approved_branches');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('[HasteStore] Failed to load cached approved branches:', e);
    }
    return [];
  });
  const [selectedBranch, setSelectedBranch] = useState<StoreBranch | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load and merge members to branches dynamically
  useEffect(() => {
    const fetchAndMerge = async () => {
      const savedLocal = localStorage.getItem('haste_membership_db');
      let localMembers: any[] = [];
      if (savedLocal) {
        try {
          localMembers = JSON.parse(savedLocal);
        } catch (e) {
          console.error('[HasteStore] Failed to parse local members:', e);
        }
      }

      let licenses: any[] = [];
      let cloudMembers: any[] = [];

      try {
        const [licenseData, memberData] = await Promise.all([
          fetch('/api/licenses')
            .then(async res => {
              if (!res.ok) return { success: false, licenses: [] };
              const t = await res.text();
              return t ? JSON.parse(t) : { success: false, licenses: [] };
            })
            .catch(err => {
              console.log('[HasteStore] Failed to load licenses in parallel:', err);
              return { success: false, licenses: [] };
            }),
          fetch('/api/registered-members')
            .then(async res => {
              if (!res.ok) return [];
              const t = await res.text();
              return t ? JSON.parse(t) : [];
            })
            .catch(err => {
              console.log('[HasteStore] Failed to load registered members in parallel:', err);
              return [];
            })
        ]);

        if (licenseData && licenseData.success && Array.isArray(licenseData.licenses)) {
          licenses = licenseData.licenses;
        }
        if (Array.isArray(memberData)) {
          cloudMembers = memberData;
        } else if (memberData && Array.isArray(memberData.members)) {
          cloudMembers = memberData.members;
        }
      } catch (err) {
        console.log('[HasteStore] Error in parallel load sequence:', err);
      }

      const mergedList: any[] = [];
      const seenNames = new Set<string>();

      const processMemberItem = (m: any) => {
        if (!m || !m.storeName) return;
        const nameKey = m.storeName.trim();
        if (m.id === 'HST-M101' || m.id === 'HST-M102' || m.id === 'HST-M103' || m.id === 'HST-M104') {
          return;
        }
        const storeCodeClean = (m.storeCode || m.store_code || '').trim();
        if (storeCodeClean.startsWith('storex') || nameKey.includes('테스트')) {
          return;
        }
        if (!seenNames.has(nameKey)) {
          seenNames.add(nameKey);
          mergedList.push(m);
        }
      };

      cloudMembers.forEach(processMemberItem);
      localMembers.forEach(processMemberItem);

      const todayStr = new Date().toISOString().split('T')[0];

      const approvedStoreIds = new Set(
        licenses
          .filter((l: any) => {
            const isApproved = l.isApproved === 1;
            const endDate = l.licenseEndDate || l.license_end_date || '';
            const isNotExpired = !endDate || endDate >= todayStr;
            return isApproved && isNotExpired;
          })
          .map((l: any) => l.storeId ? String(l.storeId).trim() : '')
      );

      const approvedStoreNames = new Set(
        licenses
          .filter((l: any) => {
            const isApproved = l.isApproved === 1;
            const endDate = l.licenseEndDate || l.license_end_date || '';
            const isNotExpired = !endDate || endDate >= todayStr;
            return isApproved && isNotExpired;
          })
          .map((l: any) => l.storeName ? String(l.storeName).trim() : '')
      );

      const licensedMembers = mergedList.filter(m => {
        if (m.registrationStatus === 'SUSPENDED') return false;

        const storeCodeClean = m.storeCode ? String(m.storeCode).trim() : '';
        const storeNameClean = m.storeName ? String(m.storeName).replace(/^(헤이스트|HASTE)\s*/gi, '').trim() : '';

        const storeCodeMatch = storeCodeClean && approvedStoreIds.has(storeCodeClean);
        const storeNameMatch = approvedStoreNames.has(storeNameClean) || approvedStoreNames.has(m.storeName.trim());

        return storeCodeMatch || storeNameMatch;
      });

      const mappedBranches: StoreBranch[] = licensedMembers.map((m, idx) => {
        let cleanName = m.storeName.trim();
        cleanName = cleanName.replace(/^(헤이스트|HASTE)\s*/gi, '').trim();
        const name = `HASTE ${cleanName}`;
        const address = m.address || getAddressForStore(name);
        
        let coords = { x: 50, y: 50 };
        if (name.includes('성수')) coords = { x: 62, y: 44 };
        else if (name.includes('한남')) coords = { x: 52, y: 53 };
        else if (name.includes('마포') || name.includes('공덕')) coords = { x: 34, y: 38 };
        else if (name.includes('마곡')) coords = { x: 18, y: 26 };
        else if (name.includes('강남')) coords = { x: 48, y: 65 };
        else if (name.includes('홍대')) coords = { x: 25, y: 34 };
        else if (name.includes('광안리')) coords = { x: 84, y: 78 };
        else {
          coords = hashStringToCoords(name);
        }

        let mappedId = m.id || `M-${idx}`;
        if (name.includes('성수')) mappedId = 'SEONGSU';
        else if (name.includes('한남')) mappedId = 'HANNAM';
        else if (name.includes('마포') || name.includes('공덕')) mappedId = 'MAPO';
        else if (name.includes('마곡')) mappedId = 'MAGOK';
        else if (name.includes('강남')) mappedId = 'GANGNAM';
        else if (name.includes('홍대')) mappedId = 'HONGDAE';
        else if (name.includes('광안리')) mappedId = 'GWANGALLI';

        return {
          id: mappedId,
          name,
          address,
          tel: m.phone || '02-1234-5678',
          hours: '매일 24시간',
          mapX: coords.x,
          mapY: coords.y,
          amenities: ['WIFI'],
          description: `${name} - 편리하고 안락한 서비스 부스터 등록 매장.`,
          approvalStatus: '승인',
          storeType: m.storeType || '일반',
          storeCode: m.storeCode
        };
      });

      setBranches(mappedBranches);
      try {
        localStorage.setItem('haste_cached_approved_branches', JSON.stringify(mappedBranches));
      } catch (e) {
        console.error('[HasteStore] Failed to cache approved branches:', e);
      }
    };

    fetchAndMerge();

    const handleSync = () => {
      fetchAndMerge();
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('haste_membership_updated', handleSync);
    window.addEventListener('haste_members_refreshed', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('haste_membership_updated', handleSync);
      window.removeEventListener('haste_members_refreshed', handleSync);
    };
  }, []);

  // Sync selected branch if none is set, or if current selection is not in list
  useEffect(() => {
    if (branches.length > 0) {
      const stillExists = branches.find(b => b.name === selectedBranch?.name);
      if (!stillExists) {
        setSelectedBranch(branches[0]);
      }
    } else {
      setSelectedBranch(null);
    }
  }, [branches]);

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          branch.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div id="store-views-root" className="py-4 md:py-8 bg-[var(--haste-body-bg)]">

      {/* Main Dual Grid View */}
      <section className="container mx-auto px-3 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-start">
        
        {/* Left Column branch list & search */}
        <div className={isComp ? "lg:col-span-12 flex flex-col gap-2" : "lg:col-span-8 flex flex-col gap-3"}>
          
          {/* List layout */}
          <div className={`flex flex-col pr-1 overflow-y-auto ${ isComp ? 'gap-1 max-h-[60vh]' : 'gap-1.5 max-h-[180px] md:max-h-[350px]' }`}>
            {filteredBranches.length > 0 ? (
              (() => {
                const renderBranchCard = (branch: StoreBranch) => {
                  const isSelected = selectedBranch?.name === branch.name;
                  return (
                    <div
                      id={`store-card-${branch.id}`}
                      key={branch.id}
                      onClick={() => setSelectedBranch(branch)}
                      className={`rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-row items-center justify-between group active:scale-[0.99] ${
                        isComp ? 'p-1 px-1.5 py-0.5 gap-1' : 'p-2 md:p-2 px-2.5 md:px-3 gap-2.5'
                      } ${ isSelected ? 'border-[#C5A059] bg-[#C5A059]/[0.06] shadow-xs' : 'border-[#C5A059]/30 hover:border-[#C5A059]/60 bg-white' }`}
                    >
                      <div className="flex justify-between items-center w-full min-w-0 gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0 max-w-[50%]">
                          <h4 className={`font-sans font-bold text-stone-900 flex items-center truncate ${
                            isComp ? 'text-[12px] gap-1' : 'text-base sm:text-lg gap-2'
                          }`}>
                            <HasteSymbol size={isComp ? 10 : 14} className="self-center flex-shrink-0" />
                            <span className="truncate">{branch.name}</span>
                            
                            {branch.storeType && (() => {
                              const isPremium = (branch.storeType as any) === 'HASTE_MEMBERSHIP' || branch.storeType === '프리미엄' || (branch.storeType as any) === 'PREMIUM';
                              const isExecutive = (branch.storeType as any) === 'EXECUTIVE' || branch.storeType === '임원';
                              if (isPremium) {
                                return (
                                  <span className={`haste-badge-haste-membership shrink-0 font-bold tracking-tight ${
                                    isComp ? '!text-[8px] !px-1' : '!text-[9px] !px-1.5 !py-0.5'
                                  }`}>
                                    헤이스트 멤버십
                                  </span>
                                );
                              } else {
                                const text = isExecutive ? '임원' : '멤버십';
                                return (
                                  <span className={`haste-badge-membership shrink-0 font-bold tracking-tight ${
                                    isComp ? '!text-[8px] !px-1' : '!text-[9px] !px-1.5 !py-0.5'
                                  }`}>
                                    {text}
                                  </span>
                                );
                              }
                            })()}
                          </h4>
                        </div>
                        
                        <div className="text-right min-w-0 flex-grow select-none flex items-center justify-end gap-1.5">
                          <p className={`text-stone-500 truncate font-light ${
                            isComp ? 'text-[9px]' : 'text-xs sm:text-sm'
                          }`} title={branch.address}>
                            {branch.address}
                          </p>
                          {isComp && (
                            <a 
                              href={`https://map.naver.com/v5/search/${encodeURIComponent(branch.name)}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="bg-stone-900 hover:bg-stone-850 border border-[#C5A059]/40 text-[#C5A059] hover:text-white rounded-lg font-bold text-[9px] px-2 py-1 flex items-center gap-1 flex-shrink-0 active:scale-95 transition-all select-none"
                            >
                              <Navigation size={9} strokeWidth={2.5} />
                              <span>길찾기</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                };
 
                return (
                  <div className="space-y-4">
                    <div className="w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2 border-b border-stone-200/60 px-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                          <span className={`font-sans tracking-wider font-extrabold text-[#C5A059] uppercase ${isComp ? 'text-[10px]' : 'text-xs'}`}>전국솔루션 회원 매장 ({filteredBranches.length}개소)</span>
                        </div>
                        <div className="relative w-full sm:max-w-[280px]">
                          <input 
                            id="store-search-field"
                            type="text"
                            placeholder="매장명 또는 주소 검색"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 text-[11px] focus:ring-1 focus:ring-[#C5A059]/50 focus:border-[#C5A059] outline-none text-stone-800 bg-white"
                          />
                          <Search className="absolute left-3 top-2 text-stone-400" size={13} />
                        </div>
                      </div>
                      <div className={`flex flex-col ${isComp ? 'gap-1' : 'gap-1.5'}`}>
                        {filteredBranches.map(renderBranchCard)}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="py-12 bg-white rounded-2xl border border-stone-200/60 text-center text-stone-400 font-light text-xs">
                조건에 일치하는 헤이스트 매장을 찾지 못했습니다.
              </div>
            )}
          </div>
        </div>

        {/* Right Column visual map canvas */}
        {!isComp && (
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-white border border-stone-200/80 shadow-sm overflow-hidden relative">
              
              <div className="flex justify-between items-center pb-3 border-b border-stone-100 mb-3">
                 <span className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                   <MapPin size={13} className="text-[#C5A059]" />
                   HASTE ACTIVE MAP
                 </span>
                 <span className="text-[11px] font-light text-stone-400 font-mono">
                   COORD: [{selectedBranch ? `${selectedBranch.mapX}, ${selectedBranch.mapY}` : '50, 50'}]
                 </span>
              </div>

              {/* Canvas Component Wrapper */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-100 shadow-[inset_0_3px_10px_rgba(0,0,0,0.02)]">
                <StoreCompMap selectedBranch={selectedBranch} branches={branches} isComp={isComp} />
                
                {selectedBranch ? (
                  <div className="relative mt-2.5 md:mt-0 md:absolute md:bottom-4 md:left-4 md:right-4 bg-stone-900/90 text-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-zinc-800/60 backdrop-blur-md flex items-center justify-between shadow-md md:shadow-2xl gap-3 md:gap-4">
                    <div className="flex-grow min-w-0">
                      <span className="text-[8px] md:text-[9px] font-bold text-[#C5A059] tracking-widest uppercase block mb-0.5 md:mb-1">CURRENTLY FOCUSED SITE</span>
                      <h5 className="font-sans text-xs md:text-sm font-bold text-neutral-100 flex flex-wrap items-center gap-1.5 md:gap-2 min-w-0">
                        <HasteSymbol size={12} className="self-center flex-shrink-0" />
                        <span className="truncate max-w-[120px] md:max-w-none">{selectedBranch.name}</span>

                        {selectedBranch.storeType && (() => {
                          const isPremium = (selectedBranch.storeType as any) === 'HASTE_MEMBERSHIP' || selectedBranch.storeType === '프리미엄' || (selectedBranch.storeType as any) === 'PREMIUM';
                          const isExecutive = (selectedBranch.storeType as any) === 'EXECUTIVE' || selectedBranch.storeType === '임원';
                          if (isPremium) {
                            return (
                              <span className="haste-badge-haste-membership !text-[9px] !px-1.5 !py-0.5 font-bold tracking-tight whitespace-nowrap">
                                헤이스트 멤버십
                              </span>
                            );
                          } else {
                            const text = isExecutive ? '임원' : '멤버십';
                            return (
                              <span className="haste-badge-membership !text-[9px] !px-1.5 !py-0.5 font-bold tracking-tight whitespace-nowrap">
                                {text}
                              </span>
                            );
                          }
                        })()}
                      </h5>
                      <p className="text-[9px] md:text-[10px] text-zinc-400 mt-0.5 md:mt-1 truncate">{selectedBranch.address}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <a 
                        id="naver-map-mock-link"
                        href={`https://map.naver.com/v5/search/${encodeURIComponent(selectedBranch.name)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="haste-primary-btn flex items-center gap-1 md:gap-1.5 !py-1.5 md:!py-2.5 !px-2.5 md:!px-4 font-bold text-[10px] md:text-xs text-[#C5A059] rounded-xl border border-stone-800 flex-shrink-0"
                      >
                        <Navigation className="w-3 md:w-3.5 h-3 md:h-3.5" strokeWidth={2.5} />
                        <span>길찾기</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="relative mt-2.5 md:mt-0 md:absolute md:bottom-4 md:left-4 md:right-4 bg-stone-900/90 text-white p-3 md:p-5 rounded-xl md:rounded-2xl border border-zinc-800/60 backdrop-blur-md text-center shadow-md md:shadow-2xl">
                    <span className="text-[8px] md:text-[9px] font-bold text-[#C5A059] tracking-widest uppercase block mb-1">WELCOME TO HASTE</span>
                    <h5 className="font-sans text-[10px] md:text-xs font-bold text-neutral-200">인증 완료된 헤이스트 매장이 없습니다.</h5>
                    <p className="text-[9px] md:text-[10px] text-zinc-400 mt-1">상단 회원가입 및 결제 메뉴에서 솔루션에 신규 매장을 등록해 주세요!</p>
                  </div>
                )}
              </div>

            </div>
            {/* Detailed Info Box removed */}
          </div>
        )}

      </section>

    </div>
  );
};
