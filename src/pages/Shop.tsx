import { useState, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { SlidersHorizontal, X, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { CATEGORIES } from "@/data/categories";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

type SortOption =
  | "newest"
  | "price-low"
  | "price-high"
  | "bestseller"
  | "most-wishlisted";

export default function Shop() {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categorySlug ? [categorySlug] : [],
  );
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  const category = categorySlug
    ? CATEGORIES.find((c) => c.slug === categorySlug)
    : null;

  const { data, isLoading, error } = useProducts({
    category: categorySlug
      ? categorySlug
      : selectedCategories.length > 0
        ? selectedCategories
        : undefined,
    min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
    max_price: priceRange[1] < 5000 ? priceRange[1] : undefined,
    in_stock: inStockOnly || undefined,
    sort: sortBy,
    page,
    per_page: 20,
    q: searchQuery || undefined,
  });

  const products = data?.data || [];
  const totalPages = data?.total_pages || 1;


  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug],
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 5000]);
    setInStockOnly(false);
    setSortBy("newest");
    setPage(1);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 5000 ||
    inStockOnly;

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="filter-section">
        <h4 className="font-semibold mb-4">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          onValueCommit={(v) => {
            setPriceRange(v);
            setPage(1);
          }}
          min={0}
          max={5000}
          step={50}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      {!categorySlug && (
        <div className="filter-section">
          <h4 className="font-semibold mb-4">Categories</h4>
          <div className="space-y-3">
            {CATEGORIES.map((cat) => (
              <label
                key={cat.slug}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <Checkbox
                  checked={selectedCategories.includes(cat.slug)}
                  onCheckedChange={() => toggleCategory(cat.slug)}
                />
                <span className="text-sm group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="filter-section">
        <h4 className="font-semibold mb-4">Availability</h4>
        <label className="flex items-center gap-3 cursor-pointer group">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(v) => {
              setInStockOnly(!!v);
              setPage(1);
            }}
          />
          <span className="text-sm group-hover:text-primary transition-colors">
            In Stock Only
          </span>
        </label>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="bg-secondary/30 py-4">
        <div className="section-container">
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span>/</span>
            {category ? (
              <>
                <Link to="/shop" className="breadcrumb-link">
                  Shop
                </Link>
                <span>/</span>
                <span className="text-foreground">{category.name}</span>
              </>
            ) : (
              <span className="text-foreground">
                {searchQuery ? `Search: "${searchQuery}"` : "Shop"}
              </span>
            )}
          </nav>
        </div>
      </div>

      <div className="section-container section-padding">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28">
              <h3 className="font-display text-lg font-semibold mb-6">
                Filters
              </h3>
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  {category
                    ? category.name
                    : searchQuery
                      ? `Results for "${searchQuery}"`
                      : "All Products"}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {data
                    ? `Showing ${products.length} of ${data.total} products`
                    : "Loading..."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="sm" className="gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <Select
                  value={sortBy}
                  onValueChange={(v) => {
                    setSortBy(v as SortOption);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="bestseller">Bestseller</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="most-wishlisted">
                      Most Wishlisted
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-destructive mb-4">
                  Failed to load products. Please try again.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">
                  No products found matching your filters.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
