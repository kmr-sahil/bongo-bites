import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cartService } from "@/services/cartService";

export interface CartItem {
  id: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  category: string;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const loadCart = async () => {
      if (authLoading) return;
      if (!isAuthenticated) {
        setItems([]);
        return;
      }

      setIsLoading(true);
      try {
        const backendItems = await cartService.getAll();
        setItems(backendItems);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not load cart");
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, authLoading]);

  const addToCart = async (item: Omit<CartItem, "quantity">, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    try {
      setIsLoading(true);
      const updatedItems = await cartService.add(item.id, quantity);
      const existedBefore = items.some((existing) => existing.id === item.id);
      setItems(updatedItems);
      toast.success(
        existedBefore ? `Updated ${item.name} quantity in cart` : `${item.name} added to cart!`,
      );
      setIsCartOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add item to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (id: string) => {
    const item = items.find((i) => i.id === id);

    if (!isAuthenticated) {
      setItems((prevItems) => prevItems.filter((cartItem) => cartItem.id !== id));
      return;
    }

    try {
      setIsLoading(true);
      const updatedItems = await cartService.remove(id);
      setItems(updatedItems);
      if (item) {
        toast.success(`${item.name} removed from cart`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove item");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(id);
      return;
    }

    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const updatedItems = await cartService.updateQuantity(id, quantity);
      setItems(updatedItems);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update quantity");
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!items.length) return;

    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      await Promise.all(items.map((item) => cartService.remove(item.id)));
      setItems([]);
      toast.success("Cart cleared");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not clear cart");
    } finally {
      setIsLoading(false);
    }
  };

  const getCartTotal = () => {
    return items.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0,
    );
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
