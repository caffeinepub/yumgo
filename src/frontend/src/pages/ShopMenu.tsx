import { Badge } from "@/components/ui/badge";
import { useRef, useState } from "react";
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

const CARD_COLORS = [
  { bg: "from-rose-400 to-pink-600", accent: "#be185d" },
  { bg: "from-amber-400 to-orange-500", accent: "#c2410c" },
  { bg: "from-emerald-400 to-teal-600", accent: "#0f766e" },
  { bg: "from-violet-400 to-purple-600", accent: "#7e22ce" },
  { bg: "from-sky-400 to-blue-600", accent: "#1d4ed8" },
  { bg: "from-lime-400 to-green-600", accent: "#166534" },
];

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
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  function handleScroll() {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = el.scrollWidth / items.length;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIdx(Math.min(idx, items.length - 1));
  }

  function scrollToCard(idx: number) {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = el.scrollWidth / items.length;
    el.scrollTo({ left: idx * cardWidth, behavior: "smooth" });
    setActiveIdx(idx);
  }

  return (
    <div
      className="min-h-screen pb-32 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 pt-10 pb-6 rounded-b-3xl shadow-card"
        style={{
          background: "linear-gradient(135deg, #302b63 0%, #6a3093 100%)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("home")}
          className="text-white/80 text-sm mb-3 flex items-center gap-1"
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
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
              🏪
            </div>
          )}
          <div>
            <h1 className="text-white font-display text-2xl font-bold">
              {shop?.name ?? "Shop"}
            </h1>
            <p className="text-white/70 text-sm">
              {items.length} items available
            </p>
          </div>
        </div>
      </div>

      {/* Swipe Instruction */}
      {items.length > 0 && (
        <div className="text-center mt-4 text-white/60 text-xs animate-bounce">
          ← Swipe to explore food items →
        </div>
      )}

      {/* Swipeable Food Cards */}
      {items.length === 0 ? (
        <div
          className="text-center py-10 text-white/60"
          data-ocid="menu.empty_state"
        >
          <div className="text-5xl mb-3">🍱</div>
          <p>No items available</p>
        </div>
      ) : (
        <div className="mt-3 relative">
          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mb-3">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToCard(i)}
                className={`rounded-full transition-all ${
                  i === activeIdx ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"
                }`}
              />
            ))}
          </div>

          {/* Horizontal scroll container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-8 pb-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {items.map((item, i) => {
              const color = CARD_COLORS[i % CARD_COLORS.length];
              const inCart = cart[item.id];
              const outOfStock = item.stock !== undefined && item.stock <= 0;
              return (
                <div
                  key={item.id}
                  data-ocid={`menu.item.${i + 1}`}
                  className="snap-center flex-shrink-0 w-72 rounded-3xl overflow-hidden shadow-2xl"
                  style={{ minWidth: "280px" }}
                >
                  {/* Image / Emoji section */}
                  <div
                    className={`bg-gradient-to-br ${color.bg} h-48 flex items-center justify-center relative`}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-8xl drop-shadow-lg">
                        {getFoodEmoji(item.name)}
                      </span>
                    )}
                    {/* Stock badge */}
                    {item.stock !== undefined && (
                      <div
                        className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${
                          outOfStock
                            ? "bg-red-600 text-white"
                            : item.stock <= 5
                              ? "bg-amber-500 text-white"
                              : "bg-white/90 text-gray-800"
                        }`}
                      >
                        {outOfStock ? "Sold Out" : `${item.stock} left`}
                      </div>
                    )}
                  </div>

                  {/* Info section */}
                  <div className="bg-white p-4">
                    <h3 className="font-bold text-lg text-gray-900">
                      {item.name}
                    </h3>
                    <p
                      className="font-bold text-xl mt-1"
                      style={{ color: color.accent }}
                    >
                      ₹{item.price}
                    </p>

                    {/* Add to cart controls */}
                    {outOfStock ? (
                      <div className="mt-3 w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 text-center font-semibold text-sm">
                        Out of Stock
                      </div>
                    ) : inCart ? (
                      <div className="mt-3 flex items-center justify-between bg-gray-100 rounded-xl px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xl text-white"
                          style={{ background: color.accent }}
                        >
                          −
                        </button>
                        <span className="font-bold text-lg text-gray-900">
                          {inCart.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          data-ocid={`menu.add_button.${i + 1}`}
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xl text-white"
                          style={{ background: color.accent }}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        data-ocid={`menu.add_button.${i + 1}`}
                        className="mt-3 w-full py-2.5 rounded-xl text-white font-bold text-sm shadow-md active:scale-95 transition-transform"
                        style={{
                          background: `linear-gradient(135deg, ${color.accent}, ${color.accent}cc)`,
                        }}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cart summary strip */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 animate-slide-up z-50">
          <button
            type="button"
            onClick={goToCheckout}
            data-ocid="menu.cart_button"
            className="w-full rounded-2xl p-4 shadow-float flex items-center justify-between text-white"
            style={{ background: "linear-gradient(135deg, #6a3093, #302b63)" }}
          >
            <div className="flex items-center gap-2">
              <Badge className="bg-white text-purple-800 font-bold">
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
