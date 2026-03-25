import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../../App";
import type { Order, Shop, useStore } from "../../hooks/useStore";

type StoreType = ReturnType<typeof useStore>;

interface Props {
  store: StoreType;
  navigate: (page: Page, shopId?: string) => void;
  onLogout: () => void;
}

export default function OwnerDashboard({ store, navigate, onLogout }: Props) {
  const session = store.getSession()!;
  const shop = store.getMyShop(session.email);
  const [showSetup, setShowSetup] = useState(!shop);
  const [setupName, setSetupName] = useState("");
  const [setupUpi, setSetupUpi] = useState("");
  const activeOrders = shop ? store.getActiveOrders(shop.id) : [];

  function handleSetupShop(e: React.FormEvent) {
    e.preventDefault();
    if (!setupName.trim() || !setupUpi.trim()) {
      toast.error("Please fill in shop name and UPI ID");
      return;
    }
    const newShop: Shop = {
      id: `shop-${Date.now()}`,
      ownerId: session.email,
      collegeDomain: session.collegeDomain,
      name: setupName.trim(),
      logoUrl: "",
      upiQrUrl: "",
      upiId: setupUpi.trim(),
    };
    store.saveShop(newShop);
    setShowSetup(false);
    toast.success("Shop created!");
  }

  function handleComplete(orderId: string) {
    store.completeOrder(orderId);
    toast.success("Order marked as completed");
  }

  return (
    <div
      className="min-h-screen pb-10"
      style={{
        background:
          "linear-gradient(160deg, #0a0a0a 0%, #1a0533 50%, #2d1b69 100%)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 pt-10 pb-6 rounded-b-3xl shadow-card"
        style={{
          background: "linear-gradient(135deg, #1a0533 0%, #4a1f6d 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <img
            src="/assets/uploads/logo.png-1.jpeg"
            alt="YumGo"
            className="h-10 w-auto object-contain brightness-0 invert"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate("owner-history")}
              data-ocid="owner.history_button"
              className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-lg font-medium"
            >
              History
            </button>
            <button
              type="button"
              onClick={() => navigate("owner-settings")}
              data-ocid="owner.settings_button"
              className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-lg font-medium"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="text-xs text-white/60"
            >
              Logout
            </button>
          </div>
        </div>
        <h2 className="text-white font-display text-2xl font-bold mt-2">
          {shop?.name ?? "My Shop"}
        </h2>
        <p className="text-white/60 text-sm">
          Hello, {session.name || session.email.split("@")[0]} 👋
        </p>
      </div>

      <div className="px-4 mt-5 space-y-4">
        {/* Setup Prompt */}
        {showSetup && (
          <div className="bg-white rounded-2xl shadow-xs p-5 animate-pop">
            <h3 className="font-display text-lg font-bold mb-4">
              🏪 Setup Your Shop
            </h3>
            <form onSubmit={handleSetupShop} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Shop Name</Label>
                <Input
                  placeholder="e.g. Campus Bites"
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">UPI ID</Label>
                <Input
                  placeholder="e.g. myshop@paytm"
                  value={setupUpi}
                  onChange={(e) => setSetupUpi(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full rounded-xl">
                Create Shop
              </Button>
            </form>
          </div>
        )}

        {/* Quick Actions */}
        {shop && (
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => navigate("owner-menu")}
              data-ocid="owner.menu_button"
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-left hover:bg-white/20 transition-colors"
            >
              <div className="text-2xl mb-1">🍴</div>
              <p className="font-semibold text-sm text-white">Menu</p>
              <p className="text-xs text-white/50">
                {
                  store.getAllMenuItems(shop.id).filter((i) => !i.isDeleted)
                    .length
                }{" "}
                items
              </p>
            </button>
            <button
              type="button"
              onClick={() => navigate("owner-menu")}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-left hover:bg-white/20 transition-colors"
            >
              <div className="text-2xl mb-1">📦</div>
              <p className="font-semibold text-sm text-white">Stock</p>
              <p className="text-xs text-white/50">Manage stock</p>
            </button>
            <button
              type="button"
              onClick={() => navigate("owner-settings")}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-left hover:bg-white/20 transition-colors"
            >
              <div className="text-2xl mb-1">⚙️</div>
              <p className="font-semibold text-sm text-white">Settings</p>
              <p className="text-xs text-white/50">Shop & UPI</p>
            </button>
          </div>
        )}

        {/* Active Orders */}
        {shop && (
          <div data-ocid="owner.orders_panel">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg font-bold text-white">
                Live Orders
              </h3>
              {activeOrders.length > 0 && (
                <Badge className="bg-rose-500">{activeOrders.length} new</Badge>
              )}
            </div>
            {activeOrders.length === 0 ? (
              <div
                className="text-center py-10 bg-white/10 rounded-2xl text-white/60"
                data-ocid="owner.orders.empty_state"
              >
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-sm">No active orders right now</p>
                <p className="text-xs mt-1 text-white/40">
                  New orders will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((order, i) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    index={i + 1}
                    onComplete={() => handleComplete(order.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  index,
  onComplete,
}: { order: Order; index: number; onComplete: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-xs p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-bold text-purple-700 text-sm">
            #{order.billNumber}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <Badge
          variant={order.orderType === "delivery" ? "default" : "secondary"}
        >
          {order.orderType === "delivery" ? "📦 Delivery" : "👋 Pickup"}
        </Badge>
      </div>
      <Separator className="my-2" />
      <div className="space-y-1 mb-3">
        {order.items.map((item) => (
          <div key={item.itemId} className="flex justify-between text-sm">
            <span>
              {item.name} x{item.quantity}
            </span>
            <span className="text-gray-500">₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm">Total: ₹{order.total}</span>
      </div>
      {order.deliveryDetails && (
        <div className="mt-2 bg-gray-50 rounded-xl p-2 text-xs">
          <p className="font-semibold">
            📦 Deliver to: {order.deliveryDetails.name}
          </p>
          <p className="text-gray-500">
            {order.deliveryDetails.department}, {order.deliveryDetails.year},{" "}
            {order.deliveryDetails.floor}
          </p>
          <p className="text-gray-500">📞 {order.deliveryDetails.phone}</p>
        </div>
      )}
      <Button
        className="w-full mt-3 rounded-xl h-9 text-sm bg-purple-600 hover:bg-purple-700"
        onClick={onComplete}
        data-ocid={`owner.complete_button.${index}`}
      >
        Mark Complete ✓
      </Button>
    </div>
  );
}
