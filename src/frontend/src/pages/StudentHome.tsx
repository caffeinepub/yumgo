import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import type { Page } from "../App";
import type { Shop, useStore } from "../hooks/useStore";

type StoreType = ReturnType<typeof useStore>;

interface Props {
  store: StoreType;
  navigate: (page: Page, shopId?: string) => void;
  onLogout: () => void;
}

const EMOJI_FOOD = ["🍛", "🍜", "🥗", "🫓", "🥘", "🍱", "🧆", "🥙"];

export default function StudentHome({ store, navigate, onLogout }: Props) {
  const session = store.getSession()!;
  const [showShops, setShowShops] = useState(false);
  const shops = store.getShops(session.collegeDomain);

  function getShopEmoji(i: number) {
    return EMOJI_FOOD[i % EMOJI_FOOD.length];
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 pt-10 pb-6 rounded-b-3xl shadow-card">
        <div className="flex items-center justify-between mb-4">
          <img
            src="/assets/uploads/logo.png-1.jpeg"
            alt="YumGo"
            className="h-10 w-auto object-contain brightness-0 invert"
          />
          <button
            type="button"
            onClick={onLogout}
            className="text-primary-foreground/80 hover:text-primary-foreground text-sm"
          >
            Logout
          </button>
        </div>
        <p className="text-primary-foreground/80 text-sm">
          Hi,{" "}
          <span className="font-semibold text-primary-foreground">
            {session.email.split("@")[0]}
          </span>{" "}
          👋
        </p>
        <p className="text-primary-foreground/70 text-xs mt-1">
          {session.collegeDomain}
        </p>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
            Order ahead, skip the queue
          </p>
          <h2 className="font-display text-2xl font-bold mt-1">Hungry? 🍽️</h2>
          <p className="text-sm opacity-80 mt-1">
            Pre-order from your college canteen
          </p>
          <Button
            variant="secondary"
            className="mt-4 rounded-xl font-semibold"
            onClick={() => setShowShops(true)}
            data-ocid="home.menu_button"
          >
            Browse Canteens
          </Button>
        </div>

        {/* Shops */}
        {showShops && (
          <div className="animate-slide-up">
            <h3 className="font-display text-xl font-bold mb-3">
              Canteens at {session.collegeDomain}
            </h3>
            {shops.length === 0 ? (
              <div
                className="text-center py-10 text-muted-foreground"
                data-ocid="home.shops.empty_state"
              >
                <div className="text-5xl mb-3">🏪</div>
                <p>No canteens found for your college yet.</p>
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
                    onClick={() => navigate("shop", shop.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!showShops && (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-4 shadow-xs">
                <Skeleton className="h-20 w-full rounded-xl mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around py-3 px-4">
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-primary"
        >
          <span className="text-xl">🏠</span>
          <span className="text-xs font-medium">Home</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-muted-foreground"
          onClick={() => setShowShops(true)}
          data-ocid="home.menu_button"
        >
          <span className="text-xl">🍴</span>
          <span className="text-xs font-medium">Menu</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-muted-foreground"
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
  onClick,
}: {
  shop: Shop;
  emoji: string;
  index: number;
  menuCount: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={`home.shop.item.${index}`}
      className="w-full text-left bg-card rounded-2xl shadow-card overflow-hidden hover:shadow-float transition-shadow"
    >
      <div className="h-28 bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
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
        <h4 className="font-semibold text-sm truncate">{shop.name}</h4>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {shop.description ?? "Canteen shop"}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {menuCount} items
          </Badge>
          <span className="text-xs text-green-600 font-medium">Open</span>
        </div>
      </div>
    </button>
  );
}
