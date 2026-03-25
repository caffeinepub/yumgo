import { Badge } from "@/components/ui/badge";
import type { Page } from "../App";
import type { Shop, useStore } from "../hooks/useStore";

type StoreType = ReturnType<typeof useStore>;

interface Props {
  store: StoreType;
  navigate: (page: Page, shopId?: string) => void;
  onLogout: () => void;
}

const EMOJI_FOOD = ["🍛", "🍜", "🥗", "🫓", "🥘", "🍱", "🧆", "🥙"];

const SHOP_CARD_COLORS = [
  { bg: "from-rose-400 to-pink-500", badge: "bg-pink-100 text-pink-700" },
  { bg: "from-amber-400 to-orange-500", badge: "bg-amber-100 text-amber-700" },
  {
    bg: "from-emerald-400 to-teal-500",
    badge: "bg-emerald-100 text-emerald-700",
  },
];

export default function StudentHome({ store, navigate, onLogout }: Props) {
  const session = store.getSession()!;
  const shops = store.getShops(session.collegeDomain);

  function getShopEmoji(i: number) {
    return EMOJI_FOOD[i % EMOJI_FOOD.length];
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        background:
          "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 pt-10 pb-6 rounded-b-3xl shadow-card"
        style={{
          background: "linear-gradient(135deg, #0f3460 0%, #533483 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <img
            src="/assets/uploads/logo.png-1.jpeg"
            alt="YumGo"
            className="h-10 w-auto object-contain brightness-0 invert"
          />
          <button
            type="button"
            onClick={onLogout}
            className="text-white/80 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>
        <p className="text-white/80 text-sm">
          Hello,{" "}
          <span className="font-semibold text-white">
            {session.name || session.email.split("@")[0]}
          </span>{" "}
          👋
        </p>
        <p className="text-white/60 text-xs mt-1">{session.collegeDomain}</p>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* Canteens — always visible */}
        <div>
          <h3 className="font-display text-xl font-bold mb-3 text-white">
            Canteens at {session.collegeDomain}
          </h3>
          {shops.length === 0 ? (
            <div
              className="text-center py-10 text-white/60"
              data-ocid="home.shops.empty_state"
            >
              <div className="text-5xl mb-3">🏪</div>
              <p>No canteens found for your college yet.</p>
              <p className="text-xs mt-2 text-white/40">
                Ask your canteen owner to register their shop.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {shops.map((shop, i) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  emoji={getShopEmoji(i)}
                  index={i + 1}
                  menuCount={store.getMenuItems(shop.id).length}
                  color={SHOP_CARD_COLORS[i % SHOP_CARD_COLORS.length]}
                  onClick={() => navigate("shop", shop.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t border-white/10 flex items-center justify-around py-3 px-4"
        style={{ background: "rgba(15,20,60,0.95)" }}
      >
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-sky-400"
        >
          <span className="text-xl">🏠</span>
          <span className="text-xs font-medium">Home</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-white/60"
        >
          <span className="text-xl">🍴</span>
          <span className="text-xs font-medium">Menu</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-white/60"
        >
          <span className="text-xl">👤</span>
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
}

function ShopCard({
  shop,
  emoji,
  index,
  menuCount,
  color,
  onClick,
}: {
  shop: Shop;
  emoji: string;
  index: number;
  menuCount: number;
  color: { bg: string; badge: string };
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={`home.shop.item.${index}`}
      className="w-full text-left bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-float transition-shadow active:scale-98"
    >
      <div
        className={`h-28 bg-gradient-to-br ${color.bg} flex items-center justify-center`}
      >
        {shop.logoUrl ? (
          <img
            src={shop.logoUrl}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl">{emoji}</span>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm truncate text-gray-900">
          {shop.name}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {shop.description ?? "Canteen shop"}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge className={`text-xs ${color.badge} border-0`}>
            {menuCount} items
          </Badge>
          <span className="text-xs text-green-600 font-medium">● Open</span>
        </div>
      </div>
    </button>
  );
}
