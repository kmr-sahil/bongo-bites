import { Loader2 } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats, useAdminOrders } from "@/hooks/useAdmin";
import {
  ShoppingCart,
  Package,
  IndianRupee,
  TrendingUp,
  Clock,
  Truck,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Box,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateOrder } from "@/hooks/useAdmin";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

function StatusDropdown({ order }: { order: any }) {
  const { mutate: updateOrder } = useUpdateOrder();

  const handleChange = (value: string) => {
    if (value === order.status) return;

    updateOrder(
      { id: order.id, data: { status: value } },
      {
        onSuccess: () => {
          toast.success(
            `Order marked as ${value.replace(/_/g, " ")}`,
            {
              description: "Status updated successfully",
            },
          );
        },
        onError: (error: any) => {
          toast.error("Could not update order status", {
            description: error?.message || "Something went wrong",
          });
        },
      },
    );
  };

  return (
    <Select defaultValue={order.status} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {STATUS_OPTIONS.map((status) => (
          <SelectItem key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: ordersData, isLoading: ordersLoading } = useAdminOrders();

  const recentOrders = ordersData?.data?.slice(0, 5) || [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Orders"
          value={stats?.total_orders ?? "—"}
          icon={ShoppingCart}
        />
        <StatCard
          title="Orders Today"
          value={stats?.orders_today ?? "—"}
          icon={Calendar}
        />
        <StatCard
          title="Orders This Month"
          value={stats?.orders_this_month ?? "—"}
          icon={TrendingUp}
        />
        <StatCard
          title="Fulfilled Orders"
          value={stats?.fulfilled_orders ?? "—"}
          icon={CheckCircle}
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pending_orders ?? "—"}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="In Delivery"
          value={stats?.in_delivery ?? "—"}
          icon={Truck}
        />
        <StatCard
          title="Total Revenue"
          value={
            stats?.total_revenue
              ? `₹${stats.total_revenue.toLocaleString("en-IN")}`
              : "—"
          }
          icon={IndianRupee}
        />
        <StatCard
          title="Revenue This Month"
          value={
            stats?.revenue_this_month
              ? `₹${stats.revenue_this_month.toLocaleString("en-IN")}`
              : "—"
          }
          icon={IndianRupee}
        />
        <StatCard
          title="Total Products"
          value={stats?.total_products ?? "—"}
          icon={Package}
        />
        <StatCard
          title="Out of Stock"
          value={stats?.out_of_stock ?? "—"}
          icon={AlertTriangle}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" /> Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="py-3 px-4 font-mono text-sm">
                        {order.order_number}
                      </td>
                      <td className="py-3 px-4">
                        {order.customer_name || "—"}
                      </td>
                      <td className="py-3 px-4">₹{order.total}</td>
                      <td className="py-3 px-4">
                        <StatusDropdown order={order} />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No orders yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
