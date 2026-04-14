import { apiClient } from "@/lib/apiClient";

interface CheckoutItemPayload {
  product_id: string;
  quantity: number;
}

interface InitiateCheckoutPayload {
  address_id: string;
  items: CheckoutItemPayload[];
  subtotal: number;
  shipping_charge?: number;
  total: number;
  payment_gateway: string;
  delivery_option_code?: string;
  delivery_charge?: number;
  courier_company_id?: number | null;
}

export interface DeliveryOption {
  code: string;
  type: string;
  label: string;
  courier_name: string;
  courier_company_id: number | null;
  rate: number;
  etd: string | null;
  charge: number;
  estimated_delivery_days: number | null;
  estimated_delivery_text: string | null;
}

interface DeliveryOptionsPayload {
  address_id: string;
  items: CheckoutItemPayload[];
  payment_gateway: string;
}

interface DeliveryOptionsResponse {
  message: string;
  pincode: string;
  total_weight_kg: number;
  dimensions?: {
    length: number;
    breadth: number;
    height: number;
  };
  selected_default_code: string | null;
  options: DeliveryOption[];
}

interface InitiateCheckoutResponse {
  message: string;
  order_id: string;
  subtotal?: number;
  shipping_charge?: number;
  delivery_charge?: number;
  delivery_option?: DeliveryOption;
  total?: number;
  checkout_url?: string;
  redirect_url?: string;
  payment_gateway: string;
}

interface CheckoutStatusResponse {
  order_id: string;
  order_status: string;
  payment_status: "pending" | "paid" | "failed";
  phonepe_state: string;
}

export const checkoutService = {
  getDeliveryOptions: (payload: DeliveryOptionsPayload) =>
    apiClient.post<DeliveryOptionsResponse>("/checkout/delivery-options", payload),

  initiate: (payload: InitiateCheckoutPayload) =>
    apiClient.post<InitiateCheckoutResponse>("/checkout/initiate", payload),

  getStatus: (orderId: string) =>
    apiClient.get<CheckoutStatusResponse>(`/checkout/status/${orderId}`),
};
