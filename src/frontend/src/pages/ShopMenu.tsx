import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";
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

function getCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.match(/coffee|chai|tea|juice|lassi|drink|water|shake/))
    return "Drinks";
  if (lower.match(/burger|roll|sandwich|wrap|toast|bread/)) return "Snacks";
  if (lower.match(/rice|dal|roti|thali|biryani|curry|sabzi|meal/))
    return "Meals";
  return "Others";
}

export default function ShopMenu({ store, shopId, navigate }: Props) {
  const session = store.getSession()!;
  const shop = store
    .getShops(session.collegeDomain)
    .find((s) => s.id === shopId);
  const items = store.getMenuItems(shopId);
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  // Category state
  const categories = [
    "All",
    ...Array.from(new Set(items.map((i) => getCategory(i.name)))),
  ];
  const [activeCatIndex, setActiveCatIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const [animating, setAnimating] = useState(false);

  // Touch tracking
  const touchStartX = useRef<number | null>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Auto-scroll active tab into view
  useEffect(() => {
    const el = tabRefs.current[activeCatIndex];
    if (el && tabBarRef.current) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeCatIndex]);

  const activeCategory = categories[activeCatIndex];
  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((i) => getCategory(i.name) === activeCategory);

  function switchCategory(newIndex: number) {
    if (newIndex === activeCatIndex || animating) return;
    const dir = newIndex > activeCatIndex ? "left" : "right";
    setSlideDir(dir);
    setAnimating(true);
    setTimeout(() => {
      setActiveCatIndex(newIndex);
      setSlideDir(null);
      setTimeout(() => setAnimating(false), 20);
    }, 220);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    if (delta < 0 && activeCatIndex < categories.length - 1) {
      switchCategory(activeCatIndex + 1);
    } else if (delta > 0 && activeCatIndex > 0) {
      switchCategory(activeCatIndex - 1);
    }
  }

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

  // Slide animation class
  const slideClass = animating
    ? slideDir === "left"
      ? "swipe-exit-left"
      : "swipe-exit-right"
    : "swipe-enter";

  return (
    <div className="min-h-screen bg-background pb-32">
      <style>{`
        @keyframes swipeEnter {
          from { opacity: 0; transform: translateX(0); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes swipeExitLeft {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-32px); }
        }
        @keyframes swipeExitRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(32px); }
        }
        .swipe-enter {
          animation: swipeEnter 0.25s ease both;
        }
        .swipe-exit-left {
          animation: swipeExitLeft 0.22s ease both;
        }
        .swipe-exit-right {
          animation: swipeExitRight 0.22s ease both;
        }
      `}</style>

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

      {/* Category Tab Bar */}
      <div
        ref={tabBarRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        data-ocid="menu.tab"
      >
        {categories.map((cat, idx) => (
          <button
            key={cat}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            type="button"
            onClick={() => switchCategory(idx)}
            data-ocid={`menu.tab.${idx + 1}`}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
              idx === activeCatIndex
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-foreground border-border hover:bg-accent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items with swipe */}
      <div
        className="px-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <h2 className="font-display text-lg font-bold mb-3">
          {activeCategory === "All" ? "All Items" : activeCategory}
        </h2>

        <div className={slideClass}>
          {filteredItems.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground"
              data-ocid="menu.empty_state"
            >
              <div className="text-5xl mb-3">🍱</div>
              <p>No items in this category</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, i) => (
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
                      <span className="text-3xl">
                        {getFoodEmoji(item.name)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {item.name}
                    </p>
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
