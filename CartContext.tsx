/* This is from the cart context for AnderprintsDTF.com */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getRate, roundNumber, uploadToStorage } from '../utils/helpers';
import { AddressValues, DialogDetails } from '../components/Checkout/types';
import { defaultAddressVal, salesTax, shipping } from '../utils/constants';
import { v4 as uuidv4 } from 'uuid';

export type CartCTX = {
  addToCart: (cartItem: CartItem) => Promise<boolean | string>;
  deleteFromCart: (id: string) => void;
  changeQty: (id: string, newQty: number) => void;
  cartId: string;
  setCartId: React.Dispatch<React.SetStateAction<string>>;
  cartItems: CartItem[];
  cartQuantity: number;
  cartSubtotal: number;
  cartTax: number;
  cartOpen: boolean;
  setCartOpen: any;
  getShippingCost: (bothAddresses: any) => number;
  shippingAddress: AddressValues;
  setShippingAddress: React.Dispatch<React.SetStateAction<AddressValues>>;
  activeCheckoutStep: number;
  setActiveCheckoutStep: React.Dispatch<React.SetStateAction<number>>;
  clearCart: () => void;
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  dialogDetails: DialogDetails;
  setDialogDetails: React.Dispatch<React.SetStateAction<DialogDetails>>;
};

export type CartItem = {
  id: string;
  fileName: string;
  notes: string;
  file: File;
  size: number;
  quantity: number;
};

export type SaveFileResponse = {
  success: boolean;
  message?: string;
};

const CartContext = createContext({} as CartCTX);

export const useCart = () => useContext(CartContext);

export const CartContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSubtotal, setCartSubtotal] = useState<number>(0);
  const [cartTax, setCartTax] = useState<number>(0);
  const [cartId, setCartId] = useState<string>('');
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCheckoutStep, setActiveCheckoutStep] = useState(0);
  const [shippingAddress, setShippingAddress] =
    useState<AddressValues>(defaultAddressVal);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogDetails, setDialogDetails] = useState({} as DialogDetails);
  //const cartQuantity = cartItems.reduce((qty, item) => item.quantity + qty, 0);
  const cartQuantity = cartItems.length;

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartId =
      localStorage.getItem('cartId') || uuidv4().replaceAll('-', '');
    const shippingAddress =
      JSON.parse(
        localStorage.getItem('shippingAddress') ||
          JSON.stringify(defaultAddressVal)
      ) || defaultAddressVal;
    setShippingAddress(shippingAddress);
    setCartItems(cart);
    setCartId(cartId);
  }, []);

  useEffect(() => {
    let accumulator = 0;
    cartItems.map((item) => {
      const total = getRate(item.quantity, item.size) * item.quantity;
      accumulator += total;
    });
    const subtotal = accumulator.toFixed(2);

    const tax = accumulator * salesTax;
    const roundedTax = roundNumber(tax, 2).toFixed(2);
    setCartTax(parseFloat(roundedTax));
    setCartSubtotal(parseFloat(subtotal));

    localStorage.setItem('cart', JSON.stringify(cartItems));
    localStorage.setItem('cartId', cartId);
    localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
    //console.log('cartId', cartId);
    //console.log('cartId', shippingAddress);
  }, [cartItems, cartId, shippingAddress]);

  const addToCart = async (cartItem: CartItem) => {
    const res = await uploadToStorage(cartItem.file, cartId);
    if (res) {
      setCartItems([...cartItems, cartItem]);
    }
    return res;
  };

  const deleteFromCart = (id: string) => {
    const arr = cartItems.filter((item) => {
      if (item.id !== id) return item;
    });
    setCartItems([...arr]);
  };

  const changeQty = (id: string, newQty: number) => {
    const arr = cartItems.map((item) => {
      if (item.id === id && newQty > 0) item.quantity = newQty;
      return item;
    });
    setCartItems([...arr]);
  };

  const getShippingCost = (bothAddresses: any) => {
    //shipping cost
    const shipCost =
      bothAddresses?.new?.regionCode === 'US' ||
      bothAddresses?.new?.regionCode === undefined
        ? shipping.us
        : shipping.international;
    return shipCost;
  };

  const clearCart = () => {
    setCartItems([]);
    setShippingAddress(defaultAddressVal);
    setCartId(uuidv4().replaceAll('-', ''));
    setCartSubtotal(0);
    setCartTax(0);
  };

  return (
    <CartContext.Provider
      value={{
        addToCart,
        deleteFromCart,
        changeQty,
        setCartId,
        cartId,
        cartItems,
        cartQuantity,
        cartSubtotal,
        cartTax,
        cartOpen,
        setCartOpen,
        getShippingCost,
        shippingAddress,
        setShippingAddress,
        activeCheckoutStep,
        setActiveCheckoutStep,
        clearCart,
        openDialog,
        setOpenDialog,
        setDialogDetails,
        dialogDetails,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
