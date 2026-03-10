// ===== Core Entities =====

export type StockStatus = 'in-stock' | 'out-of-stock' | 'upcoming';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  category: string;
  category_slug: string;
  sku?: string;
  stock: number;
  stock_status: StockStatus;
  weight?: string;
  size_or_dimensions?: string;
  description: string;
  images: ProductImage[];
  rating?: number;
  review_count?: number;
  is_bestseller?: boolean;
  is_new?: boolean;
  is_visible?: boolean;
  seo_title?: string;
  meta_description?: string;
  seo_keywords?: string[];
  purchase_price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id?: string;
  url: string;
  alt_text?: string;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  product_count: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  items: OrderItem[];
  created_at: string;
  customer_name?: string;
  customer_email?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  product: Product;
}

export interface Blog {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category?: string;
  seo_title?: string;
  meta_description?: string;
  read_time?: string;
  created_at: string;
}

export interface DeliveryCheck {
  delivery_available: boolean;
  delivery_time_days: number;
}

export interface SearchResult {
  products: Product[];
  categories: Category[];
}

// ===== API Response Wrappers =====

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  total_orders: number;
  orders_today: number;
  orders_this_month: number;
  fulfilled_orders: number;
  pending_orders: number;
  in_delivery: number;
  total_revenue: number;
  revenue_this_month: number;
  total_products: number;
  out_of_stock: number;
  total_users: number;
}

export interface WishlistStats {
  product_id: string;
  product_name: string;
  wishlist_count: number;
}
