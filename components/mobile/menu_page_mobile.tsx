import React from 'react';
import { HasteMenu, CartItem } from '../menu_page_main';

interface HasteMenuMobileProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  defaultPickupBranch: string;
  onCheckout: () => void;
}

export const HasteMenuMobile: React.FC<HasteMenuMobileProps> = ({
  cart,
  setCart,
  defaultPickupBranch,
  onCheckout,
}) => {
  return (
    <HasteMenu
      cart={cart}
      setCart={setCart}
      defaultPickupBranch={defaultPickupBranch}
      onCheckout={onCheckout}
      isMobile={true}
    />
  );
};
