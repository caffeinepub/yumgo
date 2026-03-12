import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import type { DeliveryDetails, OrderItem, useStore } from "../hooks/useStore";

type StoreType = ReturnType<typeof useStore>;

interface CartData {
  shopId: string;
  items: OrderItem[];
}

interface Props {
  store: StoreType;
  navigate: (page: Page, shopId?: string) => void;
}

export default function CheckoutPage({ store, navigate }: Props) {
  const session = store.getSession()!;
  const cartRaw = localStorage.getItem("cart");
  const cart: CartData | null = cartRaw ? JSON.parse(cartRaw) : null;

  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [delivery, setDelivery] = useState<DeliveryDetails>({
    name: "",
    department: "",
    year: "",
    floor: "",
    phone: "",
  });

  if (!cart) {
    navigate("home");
    return null;
  }

  const total = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shop = store
    .getShops(session.collegeDomain)
    .find((s) => s.id === cart.shopId);

  function handleProceed(e: React.FormEvent) {
    e.preventDefault();
    if (orderType === "delivery") {
      const { name, department, year, floor, phone } = delivery;
      if (!name || !department || !year || !floor || !phone) {
        toast.error("Fill in all delivery details");
        return;
      }
    }
    const order = store.placeOrder({
      shopId: cart!.shopId,
      studentEmail: session.email,
      items: cart!.items,
      orderType,
      deliveryDetails: orderType === "delivery" ? delivery : undefined,
      total,
    });
    localStorage.setItem("pendingOrderId", order.id);
    navigate("payment");
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="bg-primary text-primary-foreground px-4 pt-10 pb-6 rounded-b-3xl shadow-card">
        <button
          type="button"
          onClick={() => navigate("shop", cart.shopId)}
          className="text-primary-foreground/80 text-sm mb-3"
        >
          ← Back
        </button>
        <h1 className="font-display text-2xl font-bold">Your Order</h1>
        <p className="text-primary-foreground/70 text-sm">{shop?.name}</p>
      </div>

      <form onSubmit={handleProceed} className="px-4 mt-5 space-y-5">
        <div className="bg-card rounded-2xl shadow-xs p-4">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="space-y-2">
            {cart.items.map((item) => (
              <div key={item.itemId} className="flex justify-between text-sm">
                <span>
                  {item.name}{" "}
                  <span className="text-muted-foreground">
                    x{item.quantity}
                  </span>
                </span>
                <span className="font-medium">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">₹{total}</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-xs p-4">
          <h3 className="font-semibold mb-3">Order Type</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOrderType("pickup")}
              data-ocid="checkout.pickup_toggle"
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                orderType === "pickup"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border"
              }`}
            >
              <div className="text-2xl">👋</div>
              <div className="font-semibold text-sm mt-1">Pickup</div>
              <div className="text-xs text-muted-foreground">
                Collect at counter
              </div>
            </button>
            <button
              type="button"
              onClick={() => setOrderType("delivery")}
              data-ocid="checkout.delivery_toggle"
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                orderType === "delivery"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border"
              }`}
            >
              <div className="text-2xl">📦</div>
              <div className="font-semibold text-sm mt-1">Delivery</div>
              <div className="text-xs text-muted-foreground">
                Delivered to you
              </div>
            </button>
          </div>
        </div>

        {orderType === "delivery" && (
          <div className="bg-card rounded-2xl shadow-xs p-4 space-y-3 animate-slide-up">
            <h3 className="font-semibold">Delivery Details</h3>
            <div className="space-y-1">
              <Label className="text-xs">Full Name</Label>
              <Input
                placeholder="Your name"
                value={delivery.name}
                onChange={(e) =>
                  setDelivery((d) => ({ ...d, name: e.target.value }))
                }
                className="h-10 rounded-xl"
                data-ocid="delivery_form.name_input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Department</Label>
              <Input
                placeholder="e.g. Computer Science"
                value={delivery.department}
                onChange={(e) =>
                  setDelivery((d) => ({ ...d, department: e.target.value }))
                }
                className="h-10 rounded-xl"
                data-ocid="delivery_form.department_input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Year</Label>
                <Input
                  placeholder="e.g. 2nd Year"
                  value={delivery.year}
                  onChange={(e) =>
                    setDelivery((d) => ({ ...d, year: e.target.value }))
                  }
                  className="h-10 rounded-xl"
                  data-ocid="delivery_form.year_input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Floor</Label>
                <Input
                  placeholder="e.g. 3rd Floor"
                  value={delivery.floor}
                  onChange={(e) =>
                    setDelivery((d) => ({ ...d, floor: e.target.value }))
                  }
                  className="h-10 rounded-xl"
                  data-ocid="delivery_form.floor_input"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone Number</Label>
              <Input
                placeholder="10-digit mobile number"
                value={delivery.phone}
                type="tel"
                onChange={(e) =>
                  setDelivery((d) => ({ ...d, phone: e.target.value }))
                }
                className="h-10 rounded-xl"
                data-ocid="delivery_form.phone_input"
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Proceed to Payment → ₹{total}
        </Button>
      </form>
    </div>
  );
}
