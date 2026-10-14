"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { useShopData } from "@/components/providers/ShopDataProvider";
import type { OrderLine } from "@/lib/whatsapp";

type State = Record<string, number>; // id menu -> qty
type Action =
  | { type: "add"; id: string }
  | { type: "decrement"; id: string }
  | { type: "remove"; id: string }
  | { type: "clear" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add":
      return { ...state, [action.id]: (state[action.id] ?? 0) + 1 };
    case "decrement": {
      const next = (state[action.id] ?? 0) - 1;
      const { [action.id]: _removed, ...rest } = state;
      return next > 0 ? { ...rest, [action.id]: next } : rest;
    }
    case "remove": {
      const { [action.id]: _removed, ...rest } = state;
      return rest;
    }
    case "clear":
      return {};
  }
}

type CartContextValue = {
  lines: OrderLine[];
  totalQty: number;
  totalPrice: number;
  qtyOf: (id: string) => number;
  add: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { getItem } = useShopData();
  const [state, dispatch] = useReducer(reducer, {});
  const [isOpen, setIsOpen] = useState(false);

  const lines = useMemo<OrderLine[]>(
    () =>
      Object.entries(state).flatMap(([id, qty]) => {
        const item = getItem(id);
        // Menu yang dihapus / ditandai habis oleh admin otomatis keluar dari keranjang
        return item && !item.soldOut ? [{ item, qty }] : [];
      }),
    [state, getItem],
  );

  const totalQty = lines.reduce((s, l) => s + l.qty, 0);
  const totalPrice = lines.reduce((s, l) => s + l.qty * l.item.price, 0);

  const qtyOf = useCallback((id: string) => state[id] ?? 0, [state]);

  const value: CartContextValue = {
    lines,
    totalQty,
    totalPrice,
    qtyOf,
    add: (id) => {
      const item = getItem(id);
      if (!item || item.soldOut) return; // menu habis tidak bisa ditambah
      dispatch({ type: "add", id });
    },
    decrement: (id) => dispatch({ type: "decrement", id }),
    remove: (id) => dispatch({ type: "remove", id }),
    clear: () => dispatch({ type: "clear" }),
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus dipakai di dalam <CartProvider>");
  return ctx;
}
