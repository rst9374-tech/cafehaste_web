import React from 'react';
import { HasteMenuAll } from '../menu_page_main_all';
import type { CartItem } from '../menu_types';

interface HasteMenuAllMobileProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  defaultPickupBranch: string;
  onCheckout: () => void;
}

export const HasteMenuAllMobile: React.FC<HasteMenuAllMobileProps> = ({
  cart,
  setCart,
  defaultPickupBranch,
  onCheckout,
}) => {
  return (
    <HasteMenuAll
      cart={cart}
      setCart={setCart}
      defaultPickupBranch={defaultPickupBranch}
      onCheckout={onCheckout}
      isMobile={true}
    />
  );
};
