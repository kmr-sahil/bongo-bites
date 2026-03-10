import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/useAuth";
import { useWishlist, useRemoveFromWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

export default function Wishlist() {
  const { isAuthenticated } = useAuth();
  const { data: wishlistItems, isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { addToCart } = useCart();

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="section-container section-padding text-center py-16">
          <Heart className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="font-display text-2xl font-bold mb-3">
            Sign In Required
          </h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to view your wishlist.
          </p>
          <Link to="/login">
            <Button size="lg">Sign In</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <Layout>
      <div className="bg-secondary/30 py-4">
        <div className="section-container">
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span>/</span>
            <Link to="/account" className="breadcrumb-link">
              My Account
            </Link>
            <span>/</span>
            <span className="text-foreground">Wishlist</span>
          </nav>
        </div>
      </div>

      <div className="section-container section-padding">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">
            My Wishlist
          </h1>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !wishlistItems || wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-lg font-medium mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Browse products and add them to your wishlist.
              </p>
              <Link to="/shop">
                <Button>Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={item.product.images?.[0]?.url || ""}
                      alt={item.product.name}
                      className="w-24 h-24 rounded-lg object-cover"
                      loading="lazy"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="font-medium hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.product.category}
                    </p>
                    <p className="font-bold mt-2">
                      {formatPrice(
                        item.product.sale_price || item.product.price,
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {item.product.stock_status === "in-stock" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          addToCart({
                            id: item.product.id,
                            name: item.product.name,
                            price:
                              item.product.sale_price || item.product.price,
                            image: item.product.images?.[0]?.url || "",
                            category: item.product.category,
                          })
                        }
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" /> Add
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeFromWishlist.mutate(item.product_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
