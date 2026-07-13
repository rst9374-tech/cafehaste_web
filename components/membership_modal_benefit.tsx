import React from 'react';
import { Shield, Award, CheckCircle2, X, Sparkles, HeartHandshake, Music, ArrowRight, Settings, Truck, Calendar, BadgePercent, Store, BookOpen, Zap, Coffee, Megaphone, Gift, Smartphone } from 'lucide-react';
import { HASTE_BENEFIT_ITEMS } from './membership_types';

interface HasteBenefitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HasteBenefitModal: React.FC<HasteBenefitModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Settings': return <Settings size={16} />;
      case 'Shield': return <Shield size={16} />;
      case 'Truck': return <Truck size={16} />;
      case 'Calendar': return <Calendar size={16} />;
      case 'BadgePercent': return <BadgePercent size={16} />;
      case 'Store': return <Store size={16} />;
      case 'BookOpen': return <BookOpen size={16} />;
      case 'Zap': return <Zap size={16} />;
      case 'Coffee': return <Coffee size={16} />;
      case 'Music': return <Music size={16} />;
      case 'Megaphone': return <Megaphone size={16} />;
      case 'Gift': return <Gift size={16} />;
      case 'Smartphone': return <Smartphone size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans overflow-y-auto">
      <div className="bg-[#F4EADB] w-full max-w-2xl rounded-[30px] overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#15141D] border-b border-stone-800 py-4.5 px-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
              <Award size={14} />
            </div>
            <div>
              <span className="haste-category-label-en mb-0.5">HASTE BENEFITS</span>
              <h3 className="haste-section-title-3 !text-white leading-tight">13대 멤버십 혜택 안내</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-white transition-all rounded-lg cursor-pointer"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-base text-stone-600 max-h-[750px]">
          
          <div className="text-center pb-1">
            <span className="text-sm font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-1">MEMBERSHIP BENEFITS</span>
            <h4 className="text-stone-900 font-bold text-lg">헤이스트 멤버십 점주님만을 위한 13대 핵심 혜택</h4>
            <p className="text-[#A29A90] text-xs mt-1 leading-relaxed">이용 약정서에 근거하여 보장받는 정식 점주 전용 솔루션 지원 사항입니다.</p>
          </div>

          {/* Benefit Blocks */}
          <div className="flex flex-col gap-4">
            {HASTE_BENEFIT_ITEMS.map((b, i) => (
              <div 
                key={i} 
                className={`border rounded-2xl p-4 flex gap-3.5 relative overflow-hidden ${
                  ((parseInt(b.id.split('.')[0], 10) >= 9 && parseInt(b.id.split('.')[0], 10) !== 10) || parseInt(b.id.split('.')[0], 10) === 5)
                    ? 'bg-[#F4EADB] border-[#C5A059]/60' 
                    : 'bg-[#FAF9F6]/60 border-transparent'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-stone-900 text-[#C5A059] flex items-center justify-center font-bold text-xs shrink-0">
                  {renderIcon(b.iconName)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-[#C5A059] tracking-wider uppercase">BENEFIT {b.id}</span>
                    <div className="flex items-center gap-1">
                      {((parseInt(b.id.split('.')[0], 10) < 9 && parseInt(b.id.split('.')[0], 10) !== 5) || parseInt(b.id.split('.')[0], 10) === 10) && (
                        <span className="haste-badge-membership">멤버십</span>
                      )}
                      <span className="haste-badge-haste-membership">헤이스트 멤버십</span>
                    </div>
                  </div>
                  <strong className="text-stone-800 font-bold text-[15px] block mb-0.5">{b.title}</strong>
                  <p className="text-stone-600 leading-relaxed text-[13px]">{b.desc}</p>
                  {b.id.includes('10.') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.dispatchEvent(new CustomEvent('haste_navigate', { detail: { route: 'MUSIC' } }));
                        if (typeof onClose === 'function') onClose();
                      }}
                      title="헤이스트 뮤직 스트리밍 바로가기"
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A059]/10 hover:bg-[#C5A059]/25 text-[#C5A059] text-[10.5px] font-bold rounded-lg border border-[#C5A059]/30 transition-all duration-300 active:scale-95 cursor-pointer shadow-2xs group"
                    >
                      <Music size={12} className="group-hover:scale-110 transition-transform" />
                      <span>플레이리스트 바로가기</span>
                      <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 멤버십 종류별 브랜드 사용/미사용 비교 안내 */}
          <div className="mt-2 p-4 bg-[#FAF9F6] border border-stone-200 rounded-2xl text-[11px] text-stone-600 leading-relaxed flex flex-col gap-2.5 font-sans shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <strong className="text-stone-800">멤버십 구분 안내</strong>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="haste-badge-membership text-[9px] w-[80px] text-center shrink-0">멤버십</span>
                <span className="text-stone-500">헤이스트 브랜드 미사용 점포 (자체 브랜딩 운영)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="haste-badge-haste-membership text-[9px] w-[80px] text-center shrink-0">헤이스트 멤버십</span>
                <span className="text-stone-700 font-medium">헤이스트 무상 브랜드 사용 점포 (브랜드 상표 노출)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#FAF6EE] border-t border-stone-300/85 p-4 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="haste-primary-btn !py-2 !px-4.5 !text-xs w-full sm:w-auto cursor-pointer"
          >
            혜택 안내 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
