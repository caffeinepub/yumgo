import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { Page } from "../App";
import type { MenuItem, useStore } from "../hooks/useStore";

type StoreType = ReturnType<typeof useStore>;

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  store: StoreType;
  shopId: string;
  navigate: (page: Page, shopId?: string) => void;
}

const FOOD_EMOJI: Record<string, string> = {
  burger: "🍔",
  roll: "🌯",
  fries: "🍟",
  coffee: "☕",
  chai: "🍵",
  tea: "🍵",
  dosa: "🥞",
  samosa: "🫓",
  rice: "🍚",
  dal: "🍲",
  roti: "🫓",
  paneer: "🧆",
  lassi: "🥛",
  vada: "🥞",
  toast: "🍞",
  butter: "🍞",
  thali: "🍱",
  default: "🍱",
};

function getFoodEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(FOOD_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return FOOD_EMOJI.default;
}

export default function ShopMenu({ store, shopId, navigate }: Props) {
  const session = store.getSession()!;
  const shop = store
    .getShops(session.collegeDomain)
    .find((s) => s.id === shopId);
  const items = store.getMenuItems(shopId);
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  const cartList = Object.values(cart);
  const cartCount = cartList.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartList.reduce((s, i) => s + i.price * i.quantity, 0);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: existing
          ? { ...existing, quantity: existing.quantity + 1 }
          : {
              itemId: item.id,
              name: item.name,
              price: item.price,
              quantity: 1,
            },
      };
    });
  }

  function removeFromCart(itemId: string) {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [itemId]: { ...existing, quantity: existing.quantity - 1 },
      };
    });
  }

  function goToCheckout() {
    localStorage.setItem("cart", JSON.stringify({ shopId, items: cartList }));
    navigate("checkout");
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 pt-10 pb-6 rounded-b-3xl shadow-card">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="text-primary-foreground/80 text-sm mb-3 flex items-center gap-1"
          data-ocid="menu.back_button"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          {shop?.logoUrl ? (
            <img
              src={shop.logoUrl}
              className="w-14 h-14 rounded-2xl object-cover"
              alt={shop?.name}
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center text-3xl">
              🏪
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl font-bold">
              {shop?.name ?? "Shop"}
            </h1>
            <p className="text-primary-foreground/70 text-sm">
              {items.length} items available
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 pt-4">
        {items.length === 0 ? (
          <div
            className="text-center py-10 text-muted-foreground"
            data-ocid="menu.empty_state"
          >
            <div className="text-5xl mb-3">🍱</div>
            <p>No items available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <div
                key={item.id}
                data-ocid={`menu.item.${i + 1}`}
                className="bg-card rounded-2xl shadow-xs flex items-center gap-3 p-3"
              >
                <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">{getFoodEmoji(item.name)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.name}</p>
                  <p className="text-primary font-bold text-sm">
                    ₹{item.price}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {cart[item.id] ? (
                    <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-1 py-1">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg"
                      >
                        −
                      </button>
                      <span className="w-5 text-center font-bold text-sm">
                        {cart[item.id].quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        data-ocid={`menu.add_button.${i + 1}`}
                        className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      data-ocid={`menu.add_button.${i + 1}`}
                      className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-xs"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 animate-slide-up">
          <button
            type="button"
            onClick={goToCheckout}
            data-ocid="menu.cart_button"
            className="w-full bg-primary text-primary-foreground rounded-2xl p-4 shadow-float flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Badge className="bg-primary-foreground text-primary font-bold">
                {cartCount}
              </Badge>
              <span className="font-semibold">View Cart</span>
            </div>
            <span className="font-bold">₹{cartTotal}</span>
          </button>
        </div>
      )}
    </div>
  );
}
