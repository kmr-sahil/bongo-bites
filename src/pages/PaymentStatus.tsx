import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { checkoutService } from "@/services/checkoutService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusState {
  orderId: string;
  orderStatus: string;
  paymentStatus: "pending" | "paid" | "failed";
  phonePeState: string;
}

export default function PaymentStatus() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  const [status, setStatus] = useState<StatusState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!orderId) return;

    setError(null);
    try {
      const response = await checkoutService.getStatus(orderId);
      setStatus({
        orderId: response.order_id,
        orderStatus: response.order_status,
        paymentStatus: response.payment_status,
        phonePeState: response.phonepe_state,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payment status");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (status?.paymentStatus !== "pending") return;

    const timer = window.setInterval(() => {
      void fetchStatus();
    }, 7000);

    return () => window.clearInterval(timer);
  }, [fetchStatus, status?.paymentStatus]);

  const statusMeta = useMemo(() => {
    if (!status) {
      return {
        title: "Checking payment status",
        description: "Please wait while we fetch the latest update.",
        icon: <Clock3 className="h-7 w-7 text-primary" />,
        badge: "Checking",
      };
    }

    if (status.paymentStatus === "paid") {
      return {
        title: "Payment successful",
        description: "Your payment is confirmed. We have started processing your order.",
        icon: <CheckCircle2 className="h-7 w-7 text-green-600" />,
        badge: "Paid",
      };
    }

    if (status.paymentStatus === "failed") {
      return {
        title: "Payment failed",
        description: "Payment did not complete. You can retry checkout from your cart.",
        icon: <XCircle className="h-7 w-7 text-red-600" />,
        badge: "Failed",
      };
    }

    return {
      title: "Payment pending",
      description: "Your payment is still being verified by PhonePe. This page refreshes automatically.",
      icon: <Clock3 className="h-7 w-7 text-amber-600" />,
      badge: "Pending",
    };
  }, [status]);

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

  return (
    <Layout>
      <div className="bg-secondary/30 py-4">
        <div className="section-container">
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Payment Status</span>
          </nav>
        </div>
      </div>

      <div className="section-container section-padding">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-xl">Order Payment Status</CardTitle>
                <Badge variant="secondary">{statusMeta.badge}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {!orderId ? (
                <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Missing order id. Please retry payment from checkout.
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                    {statusMeta.icon}
                    <div>
                      <p className="font-semibold">{statusMeta.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {statusMeta.description}
                      </p>
                    </div>
                  </div>

                  {isLoading && (
                    <p className="text-sm text-muted-foreground">Loading latest payment update...</p>
                  )}

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  {status && (
                    <div className="rounded-lg bg-secondary/30 p-4 text-sm space-y-2">
                      <p>
                        <span className="text-muted-foreground">Order ID:</span> {status.orderId}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Payment:</span> {status.paymentStatus}
                      </p>
                      <p>
                        <span className="text-muted-foreground">PhonePe State:</span> {status.phonePeState}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Order Processing:</span> {status.orderStatus}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => void fetchStatus()} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Status
                </Button>
                <Link to="/account/orders">
                  <Button>View My Orders</Button>
                </Link>
                <Link to="/shop">
                  <Button variant="ghost">Continue Shopping</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
