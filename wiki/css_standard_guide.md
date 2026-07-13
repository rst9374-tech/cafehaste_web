# 공통 UI 스타일 CSS화 및 인라인 분기 금지 가이드 (CSS Standard Guide)

이 문서는 HASTE 웹 어플리케이션의 UI/UX 스타일 코딩 시 지켜야 하는 **CSS 공통화 및 인라인 JSX 분기 금지** 지침을 정리한 가이드입니다.

---

## 1. 지침 배경 (Rationale)
- **코드 복잡도 감소**: 프론트엔드 컴포넌트 내부에서 모바일 여부(`isMobile` / `isComp`)에 따라 복잡하게 클래스명을 삼항 연산자로 분기하거나 아이콘 크기(`size={...}`)를 일일이 지정하는 코드는 유지보수성을 크게 떨어뜨립니다.
- **500줄 이하 파일 청결도 유지**: 공통 스타일을 CSS로 완전 이관하여 JSX 코드를 슬림하게 유지하고 Clean Architecture를 실현합니다.
- **반응형 디자인의 일관성**: 브라우저 화면 크기 변화에 실시간으로 매끄럽게 반응하도록 인라인 렌더링 분기 대신 CSS 미디어 쿼리를 전사적으로 활용합니다.

---

## 2. 핵심 규약 (Core Rules)

1. **인라인 JSX 삼항 연산자 분기 금지**
   - 모바일/데스크톱 화면 크기에 따라 컴포넌트의 클래스명 전체를 삼항 연산자로 분기 처리하여 렌더링하지 않습니다.
   - *Bad*: `<button className={isMobile ? "absolute left-1 w-9 h-9" : "absolute left-4 w-10 h-10 bg-black"}>`
   - *Good*: `<button className="haste-slider-arrow haste-slider-arrow-left">`

2. **SVG/아이콘 크기의 CSS 공통 제어**
   - Lucide 등 아이콘의 크기를 JSX 속성(`size={...}`)으로 개별 지정하지 않고, 부모 CSS 클래스 하위의 `svg` 셀렉터에 미디어 쿼리(Media Query)를 입혀 크기를 일괄 제어합니다.
   - *Bad*: `<ChevronLeft size={isMobile ? 24 : 20} />`
   - *Good*: `<ChevronLeft />` (CSS에서 `.haste-slider-arrow svg` 크기 지정)

3. **시그니처 브론즈 골드(#C5A059) 테마 통일**
   - 모든 공통 UI 요소(화살표, 버튼, 보더, 하이라이트 등)의 포인트 컬러는 예외 없이 `#C5A059`를 사용하며, 타 색상(예: 노란색 등)의 임의 혼용을 원천 차단합니다.

---

## 3. 적용 사례: 글로벌 반응형 슬라이더 화살표 (`index.css`)

### CSS 정의
```css
/* 글로벌 반응형 슬라이더 화살표 공통 스타일 */
.haste-slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.haste-slider-arrow svg {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease-in-out;
}

/* 데스크톱 스타일 (768px 이상) */
@media (min-width: 768px) {
  .haste-slider-arrow {
    width: 2.5rem; /* w-10 */
    height: 2.5rem; /* h-10 */
    border-radius: 9999px;
    background-color: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  .haste-slider-arrow:hover {
    background-color: rgba(0, 0, 0, 0.75);
    transform: translateY(-50%) scale(1.1);
  }
  .haste-slider-arrow-left { left: 1rem; }
  .haste-slider-arrow-right { right: 1rem; }
  .haste-slider-arrow-left:hover svg { transform: translateX(-2px); }
  .haste-slider-arrow-right:hover svg { transform: translateX(2px); }
}

/* 모바일 스타일 (767px 이하) */
@media (max-width: 767px) {
  .haste-slider-arrow {
    width: 2.25rem; /* w-9 */
    height: 2.25rem; /* h-9 */
    background-color: transparent;
    border: 0;
    box-shadow: none;
    color: #C5A059; /* 시그니처 브론즈 골드 */
  }
  .haste-slider-arrow:active {
    transform: translateY(-50%) scale(0.9);
  }
  .haste-slider-arrow-left { left: 0.375rem; }
  .haste-slider-arrow-right { right: 0.375rem; }
  .haste-slider-arrow svg {
    width: 24px;
    height: 24px;
  }
}
```

### JSX 적용 코드
```tsx
// 복잡한 조건문 분기 대신, 단일 클래스로 모바일/데스크톱 반응형 자동 분기
<button className="haste-slider-arrow haste-slider-arrow-left" title="이전">
  <ChevronLeft />
</button>
<button className="haste-slider-arrow haste-slider-arrow-right" title="다음">
  <ChevronRight />
</button>
```
