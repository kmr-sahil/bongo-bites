import { apiClient } from '@/lib/apiClient';
import type { SearchResult, DeliveryCheck } from '@/types';

export const searchService = {
  search: (query: string) =>
    apiClient.get<SearchResult>('/products/search', { query }),

  checkDelivery: (pincode: string, productId: string, quantity = 1) =>
    apiClient.get<DeliveryCheck>('/checkout/product-delivery-check', {
      pincode,
      product_id: productId,
      quantity,
      cod: 0,
    }),
};
