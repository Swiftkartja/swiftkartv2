import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number, options?: { optionId: string; choiceIds: string[] }[]) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product: Product, quantity: number, options?: { optionId: string; choiceIds: string[] }[]) => {
        const { items } = get();
        
        // Check if item already exists in cart
        const existingItemIndex = items.findIndex(item => 
          item.productId === product.id && 
          JSON.stringify(item.options) === JSON.stringify(options)
        );
        
        if (existingItemIndex !== -1) {
          // Update quantity if item exists
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
          set({ items: updatedItems });
        } else {
          // Add new item if it doesn't exist
          const newItem: CartItem = {
            id: `cart-item-${Date.now()}`,
            productId: product.id,
            name: product.name,
            price: product.discountPrice || product.price,
            quantity,
            image: product.image,
            vendorId: product.vendorId,
            options,
          };
          
          set({ items: [...items, newItem] });
        }
      },
      
      removeItem: (id: string) => {
        const { items } = get();
        set({ items: items.filter(item => item.id !== id) });
      },
      
      updateQuantity: (id: string, quantity: number) => {
        const { items } = get();
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          set({ items: items.filter(item => item.id !== id) });
        } else {
          // Update quantity
          const updatedItems = items.map(item => 
            item.id === id ? { ...item, quantity } : item
          );
          set({ items: updatedItems });
        }
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getCartCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);