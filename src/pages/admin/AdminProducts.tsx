import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";
import { useAdminProducts, useDeleteProduct } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import type { Product, StockStatus } from "@/types";

interface AdminProductsResponse {
  data: AdminProductRow[];
  total: number;
  page: number;
  limit: number;
}

type AdminProductRow = Product & {
  category_name?: string;
};

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminProducts(page) as {
    data?: AdminProductsResponse;
    isLoading: boolean;
  };
  const deleteProduct = useDeleteProduct();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    product: Product | null;
  }>({ open: false, product: null });
  const { toast } = useToast();
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string }[]
  >([]);

  useEffect(() => {
    apiClient
      .get<{ id: string; name: string; slug: string }[]>("/api/categories")
      .then((res) => {
      setCategories(res);
    });
  }, []);

  const products = data?.data || [];
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category_slug === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (product: AdminProductRow): StockStatus => {
    if (typeof product.stock === "number" && product.stock > 0) {
      return "in-stock";
    }
    return product.stock_status === "upcoming" ? "upcoming" : "out-of-stock";
  };

  const getStockBadge = (status: StockStatus) => {
    const config: Record<
      StockStatus,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      "in-stock": { variant: "default", label: "In Stock" },
      "out-of-stock": { variant: "destructive", label: "Out of Stock" },
      upcoming: { variant: "secondary", label: "Upcoming" },
    };
    return (
      <Badge variant={config[status].variant}>{config[status].label}</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-background rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Stock
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0]?.url && (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <span className="font-medium line-clamp-1">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {product.category_name}
                    </td>
                    <td className="py-3 px-4">
                      ₹{product.sale_price || product.price}
                    </td>
                    <td className="py-3 px-4">
                      {getStockBadge(getStockStatus(product))}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/product/${product.slug}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/products/${product.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDeleteModal({ open: true, product })
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No products found
            </div>
          )}
        </div>
      )}

      <DeleteConfirmModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, product: null })}
        productName={deleteModal.product?.name || ""}
        onConfirm={() => deleteProduct.mutate(deleteModal.product!.id)}
      />
    </div>
  );
}
