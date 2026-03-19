import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import type { useStore } from "../hooks/useStore";

type StoreType = ReturnType<typeof useStore>;

interface Props {
  store: StoreType;
  navigate: (page: Page, shopId?: string) => void;
}

export default function PaymentPage({ store, navigate }: Props) {
  const session = store.getSession()!;
  const orderId = localStorage.getItem("pendingOrderId");
  const cartRaw = localStorage.getItem("cart");
  const cart = cartRaw ? JSON.parse(cartRaw) : null;
  const [confirming, setConfirming] = useState(false);

  if (!orderId || !cart) {
    navigate("home");
    return null;
  }

  const shop = store
    .getShops(session.collegeDomain)
    .find((s) => s.id === cart.shopId);
  const total = cart.items.reduce(
    (s: number, i: { price: number; quantity: number }) =>
      s + i.price * i.quantity,
    0,
  );
  const upiId = shop?.upiId ?? "canteen@upi";
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&am=${total}&cu=INR&tn=CanteenQ+Order`;

  function handleConfirm() {
    setConfirming(true);
    setTimeout(() => {
      store.confirmPayment(orderId as string);
      localStorage.removeItem("pendingOrderId");
      setConfirming(false);
      navigate("order-confirmed");
    }, 800);
  }

  return (
    <div
      className="min-h-screen pb-10"
      style={{
        background: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
      }}
    >
      <div className="bg-primary text-primary-foreground px-4 pt-10 pb-6 rounded-b-3xl shadow-card">
        <button
          type="button"
          onClick={() => navigate("checkout")}
          className="text-primary-foreground/80 text-sm mb-3"
        >
          ← Back
        </button>
        <h1 className="font-display text-2xl font-bold">Payment</h1>
        <p className="text-primary-foreground/70 text-sm">
          Complete your order
        </p>
      </div>

      <div className="px-4 mt-5 space-y-4">
        {/* Amount */}
        <div className="bg-card rounded-2xl shadow-xs p-4 text-center">
          <p className="text-muted-foreground text-sm">Total Amount</p>
          <p className="font-display text-4xl font-bold text-primary mt-1">
            ₹{total}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Pay to: <span className="font-medium text-foreground">{upiId}</span>
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-card rounded-2xl shadow-xs p-4">
          <h3 className="font-semibold text-center mb-3">Scan QR Code</h3>
          <div className="flex justify-center">
            {shop?.upiQrUrl ? (
              <img
                src={shop.upiQrUrl}
                alt="UPI QR"
                className="w-48 h-48 rounded-xl object-contain"
              />
            ) : (
              <div className="w-48 h-48 bg-muted rounded-xl flex flex-col items-center justify-center gap-2">
                <span className="text-5xl">📱</span>
                <p className="text-xs text-muted-foreground text-center px-2">
                  QR Code will appear once the shop owner sets it up
                </p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <p className="text-center text-sm text-muted-foreground">
          Or pay directly via UPI app
        </p>

        {/* UPI Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={upiLink}
            data-ocid="payment.gpay_button"
            className="flex items-center justify-center gap-2 bg-card border-2 border-border rounded-2xl p-3 font-semibold text-sm hover:border-primary transition-colors"
          >
            <span className="text-2xl">💳</span> GPay
          </a>
          <a
            href={upiLink}
            data-ocid="payment.phonepe_button"
            className="flex items-center justify-center gap-2 bg-card border-2 border-border rounded-2xl p-3 font-semibold text-sm hover:border-primary transition-colors"
          >
            <span className="text-2xl">💸</span> PhonePe
          </a>
        </div>

        <Button
          className="w-full h-12 rounded-xl text-base font-semibold"
          onClick={handleConfirm}
          disabled={confirming}
          data-ocid="payment.confirm_button"
        >
          {confirming ? "Confirming..." : "I've Paid ✓"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Tap above after completing payment. Your order will be sent to the
          shop.
        </p>
      </div>
    </div>
  );
}
