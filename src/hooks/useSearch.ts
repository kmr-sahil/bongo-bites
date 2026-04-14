import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/services/searchService';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchService.search(query),
    enabled: query.length >= 2,
  });
}

export function useDeliveryCheck(pincode: string, productId: string) {
  return useQuery({
    queryKey: ['delivery', pincode, productId],
    queryFn: () => searchService.checkDelivery(pincode, productId),
    enabled: pincode.length === 6 && !!productId,
  });
}
