import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Page } from "../../App";
import type { Order, useStore } from "../../hooks/useStore";

type StoreType = ReturnType<typeof useStore>;

interface Props {
  store: StoreType;
  navigate: (page: Page, shopId?: string) => void;
}

export default function OrderHistory({ store, navigate }: Props) {
  const session = store.getSession()!;
  const shop = store.getMyShop(session.email);
  const history = shop ? store.getOrderHistory(shop.id) : [];
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div
      className="min-h-screen pb-10"
      style={{
        background: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
      }}
    >
      <div className="bg-primary text-primary-foreground px-4 pt-10 pb-6 rounded-b-3xl shadow-card">
        <button
          type="button"
          onClick={() => navigate("owner")}
          className="text-primary-foreground/80 text-sm mb-3"
        >
          ← Back
        </button>
        <h1 className="font-display text-2xl font-bold">Order History</h1>
        <p className="text-primary-foreground/70 text-sm">
          {sortedHistory.length} completed orders
        </p>
      </div>

      <div className="px-4 mt-5 space-y-3">
        {sortedHistory.length === 0 ? (
          <div
            className="text-center py-10 text-muted-foreground"
            data-ocid="owner.history.empty_state"
          >
            <div className="text-5xl mb-3">📋</div>
            <p>No completed orders yet</p>
          </div>
        ) : (
          sortedHistory.map((order) => (
            <div key={order.id} className="bg-card rounded-2xl shadow-xs p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-primary text-sm">
                    #{order.billNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant={
                      order.orderType === "delivery" ? "default" : "secondary"
                    }
                  >
                    {order.orderType === "delivery"
                      ? "📦 Delivery"
                      : "👋 Pickup"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600"
                  >
                    Done
                  </Badge>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="space-y-1">
                {order.items.map((item) => (
                  <div
                    key={item.itemId}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-muted-foreground">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-sm">
                <span>Total</span>
                <span className="text-primary">₹{order.total}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
