import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { orderService } from '@/services/orderService';
import { wishlistService } from '@/services/wishlistService';
import type { Product } from '@/types';
import type { PaymentMethod } from '@/services/adminService';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.getDashboard(),
  });
}

export function useAdminProducts(page = 1) {
  return useQuery({
    queryKey: ['admin', 'products', page],
    queryFn: () => adminService.getProducts(page),
  });
}

export function useAdminOrders(page = 1) {
  return useQuery({
    queryKey: ['admin', 'orders', page],
    queryFn: () => orderService.adminGetAll(page),
  });
}

export function useAdminWishlistStats() {
  return useQuery({
    queryKey: ['admin', 'wishlist-stats'],
    queryFn: () => wishlistService.getStats(),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product>) => adminService.createProduct(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => adminService.updateProduct(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}

export function useCreateManualOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { user_id?: string; email?: string; address?: string; items: { product_id: string; quantity: number }[] }) =>
      orderService.adminCreateManual(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string } }) =>
      orderService.adminUpdateStatus(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

// Payment Methods (Admin)
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['admin', 'payment-methods'],
    queryFn: () => adminService.getPaymentMethods(),
  });
}

// Public Payment Methods (for checkout - no auth required)
export function usePublicPaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => adminService.getPublicPaymentMethods(),
  });
}

export function useTogglePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payment_method, is_available }: { payment_method: string; is_available: boolean }) =>
      adminService.togglePaymentMethod(payment_method, is_available),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-methods'] });
    },
  });
}