import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  ShoppingCart,
  Check,
  Truck,
  Shield,
  ArrowLeft,
  Star,
  Bell,
  Clock,
  Heart,
  Loader2,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useDeliveryCheck } from "@/hooks/useSearch";
import { useAddToWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/useAuth";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/products/ProductCard";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(slug || "");
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const addToWishlist = useAddToWishlist();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [pincode, setPincode] = useState("");
  const { data: deliveryInfo, isLoading: checkingDelivery } =
    useDeliveryCheck(pincode);

  // Fetch related products
  const { data: relatedData } = useProducts({
    category: product?.category_slug,
    per_page: 4,
  });
  const relatedProducts = (relatedData?.data || [])
    .filter((p) => p.id !== product?.id)
    .slice(0, 4);

  if (isLoading) {
    return (
      <Layout>
        <div className="section-container section-padding flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="section-container section-padding text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
        </div>
      </Layout>
    );
  }

  const images = product.images || [];
  const mainImage = images[selectedImage]?.url || images[0]?.url || "";
  const displayPrice = product.sale_price || product.price;
  const discountPercentage =
    product.sale_price && product.price > product.sale_price
      ? Math.round(((product.price - product.sale_price) / product.price) * 100)
      : 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const isAvailable = product.stock_status === "in-stock";
  const isOutOfStock = product.stock_status === "out-of-stock";
  const isUpcoming = product.stock_status === "upcoming";

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: displayPrice,
        originalPrice: product.sale_price ? product.price : undefined,
        image: mainImage,
        category: product.category,
      },
      quantity,
    );
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add to wishlist.",
      });
      return;
    }
    addToWishlist.mutate(product.id);
    toast({ title: "Added to wishlist" });
  };

  const handleNotifyMe = () => {
    toast({
      title: "You'll be notified!",
      description: `We'll let you know when "${product.name}" becomes available.`,
    });
  };

  return (
    <Layout>
      {/* SEO meta tags would be handled by a helmet/head manager */}
      <div className="bg-secondary/30 py-4">
        <div className="section-container">
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span>/</span>
            <Link to="/shop" className="breadcrumb-link">
              Shop
            </Link>
            <span>/</span>
            <Link
              to={`/category/${product.category_slug}`}
              className="breadcrumb-link"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="section-container section-padding">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 md:hidden"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary relative">
              {mainImage && (
                <img
                  src={mainImage}
                  alt={product.name}
                  className={`w-full h-full object-cover ${!isAvailable ? "opacity-75" : ""}`}
                  loading="lazy"
                />
              )}
              {isUpcoming && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-accent text-accent-foreground">
                    Coming Soon
                  </span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === idx ? "border-primary" : "border-transparent"}`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt_text || ""}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              {isAvailable && (
                <span className="stock-badge stock-badge-in">
                  <Check className="h-4 w-4" /> In Stock
                </span>
              )}
              {isOutOfStock && (
                <span className="stock-badge stock-badge-out">
                  Out of Stock
                </span>
              )}
              {isUpcoming && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-accent/10 text-accent">
                  <Clock className="h-4 w-4" /> Coming Soon
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
              {product.name}
            </h1>
            <Link
              to={`/category/${product.category_slug}`}
              className="text-sm text-primary hover:underline"
            >
              {product.category}
            </Link>

            {product.rating &&
              product.review_count &&
              product.review_count > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.rating!) ? "fill-accent text-accent" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({product.review_count} reviews)
                  </span>
                </div>
              )}

            <div className="flex items-center gap-3 mt-6 mb-6">
              {isUpcoming ? (
                <span className="text-lg text-muted-foreground">
                  Price coming soon
                </span>
              ) : (
                <>
                  <span className="text-3xl font-bold">
                    {formatPrice(displayPrice)}
                  </span>
                  {discountPercentage > 0 && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="price-discount">
                        {discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </>
              )}
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              {product.description?.slice(0, 200)}...
            </p>

            {/* Quantity & Actions */}
            {isAvailable ? (
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="qty-btn"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="qty-btn"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    className="flex-1 touch-target"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
                  </Button>
                  <Button
                    onClick={handleWishlist}
                    variant="outline"
                    size="lg"
                    className="touch-target"
                  >
                    <Heart className="h-5 w-5 mr-2" /> Wishlist
                  </Button>
                </div>
                <a
                  href={`https://wa.me/919330396636?text=Hi, I'm interested in ${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full touch-target border-whatsapp text-whatsapp hover:bg-whatsapp hover:text-whatsapp-foreground"
                  >
                    Order via WhatsApp
                  </Button>
                </a>
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                <Button
                  onClick={handleNotifyMe}
                  size="lg"
                  variant="outline"
                  className="w-full touch-target"
                >
                  <Bell className="h-5 w-5 mr-2" /> Notify Me When Available
                </Button>
              </div>
            )}

            {/* Pincode Delivery Check */}
            <div className="mb-6 p-4 rounded-xl border border-border">
              <p className="text-sm font-medium mb-2">
                Check Delivery Availability
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) =>
                    setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  className="flex-1"
                />
                {checkingDelivery && (
                  <Loader2 className="h-5 w-5 animate-spin self-center text-muted-foreground" />
                )}
              </div>
              {deliveryInfo && (
                <p
                  className={`text-sm mt-2 ${deliveryInfo.delivery_available ? "text-success" : "text-destructive"}`}
                >
                  {deliveryInfo.delivery_available
                    ? `✓ Delivery available – estimated ${deliveryInfo.delivery_time_days} day${deliveryInfo.delivery_time_days > 1 ? "s" : ""}`
                    : "✗ Delivery not available in this area"}
                </p>
              )}
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 gap-4 py-6 border-t border-b border-border">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Secure Checkout</p>
                  <p className="text-xs text-muted-foreground">
                    100% protected
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Freshly Packed</p>
                  <p className="text-xs text-muted-foreground">
                    Quality guaranteed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Fast Shipping</p>
                  <p className="text-xs text-muted-foreground">
                    Worldwide delivery
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Quality Assured</p>
                  <p className="text-xs text-muted-foreground">
                    Authentic products
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="additional"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Additional Information
              </TabsTrigger>
            </TabsList>
            <div className="py-6">
              <TabsContent value="description" className="mt-0">
                <p className="text-muted-foreground leading-relaxed max-w-3xl">
                  {product.description}
                </p>
              </TabsContent>
              <TabsContent value="additional" className="mt-0">
                <table className="text-sm">
                  <tbody>
                    {product.weight && (
                      <tr>
                        <td className="py-2 pr-8 font-medium text-foreground">
                          Weight
                        </td>
                        <td className="py-2 text-muted-foreground">
                          {product.weight}
                        </td>
                      </tr>
                    )}
                    {product.size_or_dimensions && (
                      <tr>
                        <td className="py-2 pr-8 font-medium text-foreground">
                          Size / Dimensions
                        </td>
                        <td className="py-2 text-muted-foreground">
                          {product.size_or_dimensions}
                        </td>
                      </tr>
                    )}
                    {product.sku && (
                      <tr>
                        <td className="py-2 pr-8 font-medium text-foreground">
                          SKU
                        </td>
                        <td className="py-2 text-muted-foreground">
                          {product.sku}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bar */}
      {isAvailable ? (
        <div className="sticky-cart-mobile">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xl font-bold">{formatPrice(displayPrice)}</p>
              {discountPercentage > 0 && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </p>
              )}
            </div>
            <Button onClick={handleAddToCart} className="flex-1 touch-target">
              <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
            </Button>
          </div>
        </div>
      ) : (
        <div className="sticky-cart-mobile">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-muted-foreground">
              {isUpcoming ? "Coming Soon" : "Out of Stock"}
            </p>
            <Button
              onClick={handleNotifyMe}
              variant="outline"
              className="flex-1 touch-target"
            >
              <Bell className="h-5 w-5 mr-2" /> Notify Me
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
}
