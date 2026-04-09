import { useState } from "react";
import { Loader2, CreditCard, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePaymentMethods, useTogglePaymentMethod } from "@/hooks/useAdmin";
import { toast } from "sonner";

const PAYMENT_METHOD_LABELS: Record<string, { label: string; icon: string }> = {
  cash_on_delivery: { label: "Cash on Delivery", icon: "💵" },
  phonepe: { label: "PhonePe UPI", icon: "📱" },
  stripe: { label: "Stripe", icon: "💳" },
  razorpay: { label: "Razorpay", icon: "💳" },
};

function getPaymentMethodInfo(method: string) {
  return (
    PAYMENT_METHOD_LABELS[method] || {
      label: method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      icon: "💳",
    }
  );
}

export default function AdminPaymentSettings() {
  const { data: paymentMethods, isLoading, refetch } = usePaymentMethods();
  const toggleMutation = useTogglePaymentMethod();
  const [updatingMethod, setUpdatingMethod] = useState<string | null>(null);

  const handleToggle = async (paymentMethod: string, currentStatus: boolean) => {
    setUpdatingMethod(paymentMethod);
    
    toggleMutation.mutate(
      { payment_method: paymentMethod, is_available: !currentStatus },
      {
        onSuccess: (response) => {
          const methodInfo = getPaymentMethodInfo(paymentMethod);
          toast.success(
            `${methodInfo.label} ${!currentStatus ? "enabled" : "disabled"}`,
            {
              description: `Payment method is now ${!currentStatus ? "available" : "unavailable"} for customers`,
            }
          );
          setUpdatingMethod(null);
        },
        onError: (error: any) => {
          toast.error("Failed to update payment method", {
            description: error?.message || "Something went wrong",
          });
          setUpdatingMethod(null);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const methods = paymentMethods || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Settings</h1>
          <p className="text-muted-foreground">
            Manage available payment methods for your store
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {methods.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment methods configured</p>
              <p className="text-sm">Contact your developer to add payment methods</p>
            </CardContent>
          </Card>
        ) : (
          methods.map((method) => {
            const methodInfo = getPaymentMethodInfo(method.payment_method);
            const isUpdating = updatingMethod === method.payment_method;

            return (
              <Card key={method.id} className={method.is_available ? "border-green-200" : "border-gray-200"}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                        {methodInfo.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{methodInfo.label}</h3>
                          {method.is_available ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="h-3 w-3 mr-1" />
                              Disabled
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {method.notes || `Enable ${methodInfo.label} for customer payments`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Method ID: <code className="bg-muted px-1 rounded">{method.payment_method}</code>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {isUpdating ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <Switch
                          checked={method.is_available}
                          onCheckedChange={() =>
                            handleToggle(method.payment_method, method.is_available)
                          }
                          disabled={toggleMutation.isPending}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium">About Payment Methods</CardTitle>
          <CardDescription className="text-xs">
            Toggle switches to enable or disable payment methods. Disabled methods will not be shown to customers during checkout.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
