import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Bell, Heart } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/useAuth';
import { useAddToWishlist } from '@/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const addToWishlist = useAddToWishlist();
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const mainImage = product.images?.[0]?.url || '';
  const discountPercentage = product.sale_price && product.price > product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;
  const displayPrice = product.sale_price || product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock_status !== 'in-stock') return;
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      originalPrice: product.sale_price ? product.price : undefined,
      image: mainImage,
      category: product.category,
    });
  };

  const handleNotifyMe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({ title: "You'll be notified!", description: `We'll let you know when "${product.name}" becomes available.` });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({ title: 'Sign in required', description: 'Please sign in to add items to your wishlist.' });
      return;
    }
    addToWishlist.mutate(product.id);
    toast({ title: 'Added to wishlist' });
  };

  const isAvailable = product.stock_status === 'in-stock';
  const isOutOfStock = product.stock_status === 'out-of-stock';
  const isUpcoming = product.stock_status === 'upcoming';

  return (
    <Link to={`/product/${product.slug}`} className="product-card group block">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={mainImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!isAvailable ? 'opacity-75' : ''}`}
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isUpcoming && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground">Coming Soon</span>}
          {isOutOfStock && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-muted text-muted-foreground">Out of Stock</span>}
          {product.is_bestseller && isAvailable && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground">Bestseller</span>}
          {product.is_new && isAvailable && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground">New</span>}
          {discountPercentage > 0 && isAvailable && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-destructive text-destructive-foreground">{discountPercentage}% OFF</span>}
        </div>

        {/* Wishlist */}
        <button onClick={handleWishlist} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors opacity-0 group-hover:opacity-100">
          <Heart className="h-4 w-4" />
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-sm font-semibold text-muted-foreground">Out of Stock</span>
          </div>
        )}

        {isAvailable ? (
          <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <Button onClick={handleAddToCart} className="w-full touch-target shadow-lg" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <Button onClick={handleNotifyMe} variant="outline" className="w-full touch-target shadow-lg bg-background" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notify Me
            </Button>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <h3 className="font-medium text-sm md:text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
        {product.rating && product.review_count && product.review_count > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({product.review_count})</span>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {isUpcoming ? (
            <span className="text-sm text-muted-foreground">Price TBD</span>
          ) : (
            <>
              <span className="text-lg font-bold">{formatPrice(displayPrice)}</span>
              {product.sale_price && product.price > product.sale_price && (
                <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
