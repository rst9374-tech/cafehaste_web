import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Minus, Plus } from 'lucide-react';
import { CartItem, getDrinkSvg, handleImageError } from './menu_page_main';

interface MenuDrawerCartProps {
  isMiniCartOpen: boolean;
  setIsMiniCartOpen: (open: boolean) => void;
  cart: CartItem[];
  defaultPickupBranch: string;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, change: number) => void;
  onCheckout: () => void;
}

export const MenuDrawerCart: React.FC<MenuDrawerCartProps> = ({
  isMiniCartOpen,
  setIsMiniCartOpen,
  cart,
  defaultPickupBranch,
  removeItem,
  updateQuantity,
  onCheckout
}) => {
  const cartTotalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isMiniCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          {/* Click backdrop to close */}
          <div className="absolute inset-0 z-0" onClick={() => setIsMiniCartOpen(false)} />
          
          <motion.div
            id="shopping-cart-sidebar"
            key="cart-sidebar"
            initial={{ x: "100%", opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.9 }}
            transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
            className="relative z-10 w-full max-w-md bg-[var(--haste-body-bg)] h-full shadow-2xl border-l border-stone-200 p-6 flex flex-col justify-between"
          >
            {/* Header */}
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-stone-200 mb-6">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="text-[#C5A059]" size={20} />
                  <h3 className="font-serif text-lg font-bold text-stone-900">쇼핑백 (HASTE BAG)</h3>
                  <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-500 font-mono text-[10px] font-bold">
                    {cartTotalItemsCount}
                  </span>
                </div>
                <button
                  id="close-cart-sidebar"
                  onClick={() => setIsMiniCartOpen(false)}
                  className="p-1 px-1.5 rounded-lg bg-stone-100 hover:bg-stone-150 text-stone-600 hover:text-stone-950 transition-colors cursor-pointer text-xs font-bold"
                >
                  CLOSE
                </button>
              </div>

              {/* Pickup location notice */}
              <div className="p-3.5 bg-stone-900 text-white rounded-xl border border-stone-850 text-xs flex justify-between items-center gap-3 mb-6">
                <div>
                  <span className="text-[9px] text-[#C5A059] font-bold tracking-widest uppercase block mb-0.5">CURRENT SERVICE SITE</span>
                  <p className="font-serif font-bold text-neutral-100 truncate">{defaultPickupBranch}</p>
                </div>
                <span className="px-2 py-0.5 text-[8px] bg-[#C5A059]/10 border border-[#C5A059]/40 text-[#C5A059] font-bold rounded">
                  PICKUP_FAST
                </span>
              </div>

              {/* Item lists */}
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[50vh] pr-1">
                {cart.length > 0 ? (
                  cart.map(cartItem => (
                    <div
                      id={`cart-row-${cartItem.id}`}
                      key={cartItem.id}
                      className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex justify-between items-center group relative gap-4"
                    >
                      {/* Thumbnail image */}
                      <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
                        <img 
                          src={getDrinkSvg(cartItem.menuItem, cartItem.temperature)} 
                          alt={cartItem.menuItem.nameKr} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e, cartItem.menuItem.id)}
                        />
                      </div>

                      {/* Title and customize tags summary */}
                      <div className="flex-grow min-w-0">
                        <h4 className="font-serif text-xs font-bold text-stone-900 truncate">
                          {cartItem.menuItem.nameKr}
                        </h4>
                        
                        {/* Config info */}
                        <div className="flex flex-wrap gap-1 text-[8px] mt-1 text-zinc-500 font-mono tracking-wide">
                          <span className={cartItem.temperature === 'ICE' ? 'text-blue-500' : 'text-orange-500'}>
                            {cartItem.temperature}
                          </span>
                          <span className="opacity-35">|</span>
                          <span>SHOT: +{cartItem.shots}</span>
                          <span className="opacity-35">|</span>
                          <span>SUGAR: {cartItem.sweetness}</span>
                          {cartItem.milkType !== 'REGULAR' && (
                            <>
                              <span className="opacity-35">|</span>
                              <span className="text-amber-600">MILK: {cartItem.milkType}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Dynamic Counter & delete row */}
                      <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                        {/* Delete button (trash icon) */}
                        <button
                          id={`cart-delete-${cartItem.id}`}
                          onClick={() => removeItem(cartItem.id)}
                          className="p-1 text-stone-400 hover:text-red-500 transition-colors cursor-pointer self-end rounded"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>

                        {/* Plus and minus modifier */}
                        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg scale-90 border border-stone-150">
                          <button
                            id={`cart-qty-minus-${cartItem.id}`}
                            onClick={() => updateQuantity(cartItem.id, -1)}
                            className="w-4 h-4 rounded hover:bg-stone-200 flex items-center justify-center text-stone-800 text-xs font-bold cursor-pointer"
                          >
                            <Minus size={9} />
                          </button>
                          <span className="text-[10px] font-bold text-stone-850 px-1 font-mono min-w-[12px] text-center">
                            {cartItem.quantity}
                          </span>
                          <button
                            id={`cart-qty-plus-${cartItem.id}`}
                            onClick={() => updateQuantity(cartItem.id, 1)}
                            className="w-4 h-4 rounded hover:bg-stone-200 flex items-center justify-center text-stone-800 text-xs font-bold cursor-pointer"
                          >
                            <Plus size={9} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center text-stone-400 font-light text-xs border border-dashed border-stone-205 rounded-2xl flex flex-col items-center gap-2 bg-white">
                    <span>쇼핑백이 완전히 비어 있습니다.</span>
                    <p className="text-[10px] text-stone-400 font-serif">*헤이스트 원두 각성 음료를 수급해 주세요!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer billing summary & coupon */}
            <div className="flex flex-col gap-4 border-t border-stone-200 pt-6">
              {/* Totals */}
              <div className="flex flex-col gap-2 font-mono text-xs text-stone-500">
                <div className="flex justify-between items-center border-t border-stone-200/50 pt-2 text-stone-900 text-sm font-black">
                  <span className="font-sans font-bold">최종 주문 수량 (Total Items)</span>
                  <span className="text-base font-extrabold text-[#D97706]/90">
                    {cartTotalItemsCount}개
                  </span>
                </div>
              </div>

              {/* Place Quick order trigger button */}
              <button
                id="checkout-cart-btn"
                onClick={onCheckout}
                disabled={cart.length === 0}
                className={`w-full py-4 rounded-xl font-bold uppercase text-xs tracking-widest text-center transition-all cursor-pointer ${ cart.length > 0 ? 'bg-[#C5A059] hover:bg-[#B8964C] text-stone-950 shadow-lg shadow-[#C5A059]/20' : 'bg-stone-200 text-stone-400 cursor-not-allowed' }`}
              >
                헤이스트 모바일 픽업 주문 전송 (FAST_LINE)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
