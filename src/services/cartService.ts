import { apiClient } from "@/lib/apiClient";

interface BackendCartItem {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  quantity: number;
  category_name: string;
  category_slug: string;
  images: string[];
  created_at: string;
}

export interface CartServiceItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  category: string;
}

const toCartServiceItem = (item: BackendCartItem): CartServiceItem => {
  const currentPrice = Number(item.sale_price ?? item.price);
  const originalPrice = item.sale_price ? Number(item.price) : undefined;

  return {
    id: item.product_id,
    name: item.name,
    slug: item.slug,
    price: currentPrice,
    originalPrice,
    quantity: item.quantity,
    image: item.images?.[0] ?? "",
    category: item.category_name,
  };
};

export const cartService = {
  getAll: async (): Promise<CartServiceItem[]> => {
    const rows = await apiClient.get<BackendCartItem[]>("/store/cart");
    return rows.map(toCartServiceItem);
  },

  add: async (productId: string, quantity = 1): Promise<CartServiceItem[]> => {
    await apiClient.post<unknown>("/store/cart", {
      product_id: productId,
      quantity,
    });
    return cartService.getAll();
  },

  updateQuantity: async (
    productId: string,
    quantity: number,
  ): Promise<CartServiceItem[]> => {
    await apiClient.put<unknown>(`/store/cart/${productId}`, { quantity });
    return cartService.getAll();
  },

  remove: async (productId: string): Promise<CartServiceItem[]> => {
    await apiClient.delete<unknown>(`/store/cart/${productId}`);
    return cartService.getAll();
  },

  clear: async (productIds: string[]): Promise<void> => {
    await Promise.all(productIds.map((productId) => cartService.remove(productId)));
  },
};
