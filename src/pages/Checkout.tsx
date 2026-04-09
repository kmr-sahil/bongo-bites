import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, MapPin, ShoppingBag, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { useAddresses } from "@/hooks/useAddresses";
import { usePublicPaymentMethods } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  checkoutService,
  type DeliveryOption,
} from "@/services/checkoutService";
import type { PublicPaymentMethod } from "@/services/adminService";

const PAYMENT_METHOD_LABELS: Record<string, { label: string; description: string }> = {
  cash_on_delivery: { 
    label: "Cash on Delivery", 
    description: "Pay when you receive your order"
  },
  phonepe: { 
    label: "PhonePe", 
    description: "Continue with Phone Pay for UPI, Net Banking & Credit/Debit Card"
  },
};

function getPaymentMethodInfo(method: string) {
  return (
    PAYMENT_METHOD_LABELS[method] || {
      label: method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      description: "Select this payment method",
    }
  );
}

export default function Checkout() {
  const { items, getCartTotal } = useCart();
  const { data: addresses, isLoading: isAddressLoading } = useAddresses();
  const { data: paymentMethods, isLoading: isPaymentMethodsLoading } = usePublicPaymentMethods();

  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<string>("");
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDeliveryCode, setSelectedDeliveryCode] = useState<string>("");
  const [isDeliveryOptionsLoading, setIsDeliveryOptionsLoading] = useState(false);
  const [isInitiating, setIsInitiating] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDeliveryPrice = (option: DeliveryOption) => {
    const price = Number(option.charge ?? option.rate ?? 0);
    return Number.isFinite(price) && price > 0 ? price : 0;
  };

  useEffect(() => {
    if (!addresses?.length) return;
    const defaultAddress = addresses.find((address) => address.is_default);
    setSelectedAddress(defaultAddress?.id ?? addresses[0].id);
  }, [addresses]);

  const subtotal = getCartTotal();

  const selectedAddressDetails = useMemo(
    () => addresses?.find((address) => address.id === selectedAddress),
    [addresses, selectedAddress],
  );

  const selectedDeliveryOption = useMemo(
    () => deliveryOptions.find((option) => option.code === selectedDeliveryCode),
    [deliveryOptions, selectedDeliveryCode],
  );

  const shipping = selectedDeliveryOption ? getDeliveryPrice(selectedDeliveryOption) : 0;
  const total = subtotal + shipping;

  useEffect(() => {
    if (!selectedAddress || !selectedPaymentGateway || items.length === 0) {
      setDeliveryOptions([]);
      setSelectedDeliveryCode("");
      return;
    }

    let isActive = true;

    const fetchDeliveryOptions = async () => {
      try {
        setIsDeliveryOptionsLoading(true);

        const response = await checkoutService.getDeliveryOptions({
          address_id: selectedAddress,
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
          payment_gateway: selectedPaymentGateway,
        });

        if (!isActive) return;

        const options = Array.isArray(response.options) ? response.options : [];
        setDeliveryOptions(options);

        setSelectedDeliveryCode((currentCode) => {
          if (options.some((option) => option.code === currentCode)) {
            return currentCode;
          }

          return response.selected_default_code || options[0]?.code || "";
        });
      } catch (error) {
        if (!isActive) return;
        console.error("[Checkout] Error fetching delivery options:", error);
        setDeliveryOptions([]);
        setSelectedDeliveryCode("");
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not fetch delivery options",
        );
      } finally {
        if (isActive) {
          setIsDeliveryOptionsLoading(false);
        }
      }
    };

    fetchDeliveryOptions();

    return () => {
      isActive = false;
    };
  }, [items, selectedAddress, selectedPaymentGateway]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    if (!selectedPaymentGateway) {
      toast.error("Please select a payment method.");
      return;
    }

    if (!selectedDeliveryCode) {
      toast.error("Please select a delivery type.");
      return;
    }

    try {
      setIsInitiating(true);

      const response = await checkoutService.initiate({
        address_id: selectedAddress,
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        subtotal,
        shipping_charge: shipping,
        total,
        payment_gateway: selectedPaymentGateway,
        delivery_option_code: selectedDeliveryCode,
        delivery_charge: shipping,
      });

      // Handle COD orders - redirect to orders page
      if (selectedPaymentGateway === "cash_on_delivery") {
        toast.success("Order placed successfully!", {
          description: "Your COD order has been confirmed. Pay when you receive your order.",
        });
        window.location.href = response.redirect_url || "/account/orders";
        return;
      }

      // Handle PhonePe orders - redirect to payment gateway
      if (!response.checkout_url) {
        throw new Error("PhonePe redirect URL missing");
      }

      window.location.href = response.checkout_url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start checkout");
    } finally {
      setIsInitiating(false);
    }
  };

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="section-container section-padding">
          <div className="max-w-md mx-auto text-center py-16">
            <ShoppingBag className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
            <h1 className="font-display text-2xl font-bold mb-3">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Add products to cart before proceeding to checkout.
            </p>
            <Link to="/shop">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-secondary/30 py-4">
        <div className="section-container">
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span>/</span>
            <Link to="/cart" className="breadcrumb-link">
              Cart
            </Link>
            <span>/</span>
            <span className="text-foreground">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="section-container section-padding">
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAddressLoading ? (
                  <p className="text-sm text-muted-foreground">Loading addresses...</p>
                ) : addresses && addresses.length > 0 ? (
                  <RadioGroup
                    value={selectedAddress}
                    onValueChange={setSelectedAddress}
                    className="space-y-3"
                  >
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="flex items-start gap-3 p-4 rounded-lg border border-border"
                      >
                        <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                        <Label htmlFor={address.id} className="cursor-pointer flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{address.name}</span>
                            {address.is_default && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {address.address}, {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{address.phone}</p>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      No saved addresses found. Add one to continue.
                    </p>
                    <Link to="/account/addresses">
                      <Button variant="outline" size="sm">Manage Addresses</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Delivery Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isDeliveryOptionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : !selectedAddress ? (
                  <p className="text-sm text-muted-foreground">
                    Select a delivery address to view available delivery options.
                  </p>
                ) : !selectedPaymentGateway ? (
                  <p className="text-sm text-muted-foreground">
                    Select a payment method to load courier rates.
                  </p>
                ) : deliveryOptions.length > 0 ? (
                  <RadioGroup
                    value={selectedDeliveryCode}
                    onValueChange={setSelectedDeliveryCode}
                    className="space-y-3"
                  >
                    {deliveryOptions.map((option) => (
                      <div
                        key={`${option.code}-${option.courier_company_id ?? option.courier_name}`}
                        className="rounded-lg border border-border bg-secondary/20 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <RadioGroupItem
                              value={option.code}
                              id={`delivery-${option.code}`}
                              className="mt-1"
                            />
                            <Label
                              htmlFor={`delivery-${option.code}`}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{option.label}</p>
                                <Badge variant="secondary">Courier</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Courier: {option.courier_name}
                              </p>
                              {(option.etd || option.estimated_delivery_days || option.estimated_delivery_text) && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  ETA: {option.etd || (option.estimated_delivery_days
                                    ? `${option.estimated_delivery_days} day(s)`
                                    : option.estimated_delivery_text)}
                                </p>
                              )}
                            </Label>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatPrice(getDeliveryPrice(option))}</p>
                            {selectedDeliveryCode === option.code && (
                              <Badge variant="secondary" className="mt-1">Selected</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Delivery options are unavailable for this address right now.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isPaymentMethodsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : paymentMethods && paymentMethods.length > 0 ? (
                  <RadioGroup
                    value={selectedPaymentGateway}
                    onValueChange={setSelectedPaymentGateway}
                    className="space-y-3"
                  >
                    {(Array.isArray(paymentMethods) ? paymentMethods : [])
                      .map((method: PublicPaymentMethod) => {
                        const methodInfo = getPaymentMethodInfo(method.payment_method);
                        return (
                          <div
                            key={method.id}
                            className="rounded-lg border border-border bg-secondary/20 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <RadioGroupItem
                                  value={method.payment_method}
                                  id={method.payment_method}
                                  className="mt-1"
                                />
                                <Label
                                  htmlFor={method.payment_method}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold">{methodInfo.label}</p>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {method.notes || methodInfo.description}
                                  </p>
                                </Label>
                              </div>
                              {selectedPaymentGateway === method.payment_method && (
                                <Badge variant="secondary">Selected</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </RadioGroup>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No payment methods available at the moment.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Please try again later or contact support.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Items ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-md object-cover border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-2">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-28">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5" /> Delivery
                    </span>
                    {shipping === 0 ? (
                      <span className="text-success font-medium">FREE</span>
                    ) : (
                      <span>{formatPrice(shipping)}</span>
                    )}
                  </div>
                  {selectedDeliveryOption && (
                    <p className="text-xs text-muted-foreground">
                      {selectedDeliveryOption.label} via {selectedDeliveryOption.courier_name}
                    </p>
                  )}
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {selectedAddressDetails && (
                  <div className="mt-4 text-xs rounded-md bg-secondary/40 p-3 text-muted-foreground">
                    Delivering to {selectedAddressDetails.city}, {selectedAddressDetails.state}
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full mt-5"
                  disabled={
                    isInitiating ||
                    isDeliveryOptionsLoading ||
                    !selectedAddress ||
                    !selectedPaymentGateway ||
                    !selectedDeliveryCode
                  }
                  onClick={handlePlaceOrder}
                >
                  {isInitiating 
                    ? "Processing..." 
                    : selectedPaymentGateway === "cash_on_delivery" 
                      ? "Place Order (COD)" 
                      : selectedPaymentGateway === "phonepe" 
                        ? "Pay with PhonePe" 
                        : "Place Order"
                  }
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  {selectedPaymentGateway === "cash_on_delivery" 
                    ? "Your order will be confirmed. Pay when you receive it."
                    : selectedPaymentGateway === "phonepe" 
                      ? "You will be redirected to PhonePe to complete payment."
                      : "Select a payment method to continue."
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
