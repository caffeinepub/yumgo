import { useCallback, useState } from "react";

export interface Session {
  email: string;
  role: "student" | "shopOwner";
  collegeDomain: string;
}

export interface MenuItem {
  id: string;
  shopId: string;
  name: string;
  imageUrl: string;
  price: number;
  isDeleted: boolean;
}

export interface Shop {
  id: string;
  ownerId: string; // email
  collegeDomain: string;
  name: string;
  logoUrl: string;
  upiQrUrl: string;
  upiId: string;
  pinHash?: string;
  description?: string;
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface DeliveryDetails {
  name: string;
  department: string;
  year: string;
  floor: string;
  phone: string;
}

export interface Order {
  id: string;
  billNumber: string;
  shopId: string;
  studentEmail: string;
  items: OrderItem[];
  orderType: "pickup" | "delivery";
  deliveryDetails?: DeliveryDetails;
  status: "pending" | "confirmed" | "completed";
  createdAt: string;
  total: number;
}

const DEMO_DOMAIN = "demo.edu";

const DEMO_SHOPS: Shop[] = [
  {
    id: "shop-1",
    ownerId: "owner1@demo.edu",
    collegeDomain: DEMO_DOMAIN,
    name: "Campus Bites",
    logoUrl: "",
    upiQrUrl: "",
    upiId: "campusbites@upi",
    description: "Hot meals, snacks & beverages",
  },
  {
    id: "shop-2",
    ownerId: "owner2@demo.edu",
    collegeDomain: DEMO_DOMAIN,
    name: "The Chai Corner",
    logoUrl: "",
    upiQrUrl: "",
    upiId: "chaicorner@upi",
    description: "Chai, coffee & light bites",
  },
  {
    id: "shop-3",
    ownerId: "owner3@demo.edu",
    collegeDomain: DEMO_DOMAIN,
    name: "Desi Dhaba",
    logoUrl: "",
    upiQrUrl: "",
    upiId: "desidhaba@upi",
    description: "Authentic Indian thalis & curries",
  },
];

const DEMO_MENU: Record<string, MenuItem[]> = {
  "shop-1": [
    {
      id: "m1",
      shopId: "shop-1",
      name: "Veg Burger",
      imageUrl: "",
      price: 60,
      isDeleted: false,
    },
    {
      id: "m2",
      shopId: "shop-1",
      name: "Paneer Roll",
      imageUrl: "",
      price: 50,
      isDeleted: false,
    },
    {
      id: "m3",
      shopId: "shop-1",
      name: "French Fries",
      imageUrl: "",
      price: 40,
      isDeleted: false,
    },
    {
      id: "m4",
      shopId: "shop-1",
      name: "Cold Coffee",
      imageUrl: "",
      price: 45,
      isDeleted: false,
    },
    {
      id: "m5",
      shopId: "shop-1",
      name: "Samosa (2 pcs)",
      imageUrl: "",
      price: 20,
      isDeleted: false,
    },
    {
      id: "m6",
      shopId: "shop-1",
      name: "Masala Dosa",
      imageUrl: "",
      price: 55,
      isDeleted: false,
    },
  ],
  "shop-2": [
    {
      id: "m7",
      shopId: "shop-2",
      name: "Masala Chai",
      imageUrl: "",
      price: 15,
      isDeleted: false,
    },
    {
      id: "m8",
      shopId: "shop-2",
      name: "Filter Coffee",
      imageUrl: "",
      price: 20,
      isDeleted: false,
    },
    {
      id: "m9",
      shopId: "shop-2",
      name: "Bread Butter Toast",
      imageUrl: "",
      price: 25,
      isDeleted: false,
    },
    {
      id: "m10",
      shopId: "shop-2",
      name: "Bun Maska",
      imageUrl: "",
      price: 20,
      isDeleted: false,
    },
    {
      id: "m11",
      shopId: "shop-2",
      name: "Vada Pav",
      imageUrl: "",
      price: 25,
      isDeleted: false,
    },
  ],
  "shop-3": [
    {
      id: "m12",
      shopId: "shop-3",
      name: "Veg Thali",
      imageUrl: "",
      price: 80,
      isDeleted: false,
    },
    {
      id: "m13",
      shopId: "shop-3",
      name: "Dal Tadka",
      imageUrl: "",
      price: 50,
      isDeleted: false,
    },
    {
      id: "m14",
      shopId: "shop-3",
      name: "Roti (3 pcs)",
      imageUrl: "",
      price: 15,
      isDeleted: false,
    },
    {
      id: "m15",
      shopId: "shop-3",
      name: "Rice + Dal",
      imageUrl: "",
      price: 45,
      isDeleted: false,
    },
    {
      id: "m16",
      shopId: "shop-3",
      name: "Paneer Butter Masala",
      imageUrl: "",
      price: 90,
      isDeleted: false,
    },
    {
      id: "m17",
      shopId: "shop-3",
      name: "Mango Lassi",
      imageUrl: "",
      price: 35,
      isDeleted: false,
    },
  ],
};

function getLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setLS<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function extractDomain(email: string): string {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : "";
}

export function generateBillNumber(): string {
  const counter = getLS<number>("billCounter", 0) + 1;
  setLS("billCounter", counter);
  return `CCO-${String(counter).padStart(6, "0")}`;
}

export function useStore() {
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  function getSession(): Session | null {
    return getLS<Session | null>("session", null);
  }

  function setSession(s: Session | null): void {
    setLS("session", s);
    refresh();
  }

  function getShops(collegeDomain: string): Shop[] {
    const all = getLS<Shop[]>("shops", []);
    const domainShops = all.filter((s) => s.collegeDomain === collegeDomain);
    // Inject demo shops for demo.edu
    if (collegeDomain === DEMO_DOMAIN) {
      const existingIds = new Set(domainShops.map((s) => s.id));
      const demos = DEMO_SHOPS.filter((d) => !existingIds.has(d.id));
      return [...demos, ...domainShops];
    }
    return domainShops;
  }

  function getAllShops(): Shop[] {
    return getLS<Shop[]>("shops", []);
  }

  function getMyShop(email: string): Shop | null {
    const all = getLS<Shop[]>("shops", []);
    return all.find((s) => s.ownerId === email) ?? null;
  }

  function saveShop(shop: Shop): void {
    const all = getLS<Shop[]>("shops", []);
    const idx = all.findIndex((s) => s.id === shop.id);
    if (idx >= 0) all[idx] = shop;
    else all.push(shop);
    setLS("shops", all);
    refresh();
  }

  function getMenuItems(shopId: string): MenuItem[] {
    const all = getLS<Record<string, MenuItem[]>>("menuItems", {});
    const items = all[shopId] ?? [];
    // Inject demo items for demo shops
    if (DEMO_MENU[shopId]) {
      const existingIds = new Set(items.map((i) => i.id));
      const demos = DEMO_MENU[shopId].filter((d) => !existingIds.has(d.id));
      return [...demos, ...items].filter((i) => !i.isDeleted);
    }
    return items.filter((i) => !i.isDeleted);
  }

  function getAllMenuItems(shopId: string): MenuItem[] {
    const all = getLS<Record<string, MenuItem[]>>("menuItems", {});
    const stored = all[shopId] ?? [];
    if (DEMO_MENU[shopId]) {
      const existingIds = new Set(stored.map((i) => i.id));
      const demos = DEMO_MENU[shopId].filter((d) => !existingIds.has(d.id));
      return [...demos, ...stored];
    }
    return stored;
  }

  function saveMenuItem(item: MenuItem): void {
    const all = getLS<Record<string, MenuItem[]>>("menuItems", {});
    const items = all[item.shopId] ?? [];
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    all[item.shopId] = items;
    setLS("menuItems", all);
    refresh();
  }

  function deleteMenuItem(shopId: string, itemId: string): void {
    const all = getLS<Record<string, MenuItem[]>>("menuItems", {});
    let items = all[shopId] ?? [];
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx >= 0) {
      items[idx] = { ...items[idx], isDeleted: true };
    } else if (DEMO_MENU[shopId]) {
      // Need to store demo item as deleted
      const demoItem = DEMO_MENU[shopId].find((i) => i.id === itemId);
      if (demoItem) items.push({ ...demoItem, isDeleted: true });
    }
    all[shopId] = items;
    setLS("menuItems", all);
    refresh();
  }

  function placeOrder(
    order: Omit<Order, "id" | "billNumber" | "status" | "createdAt">,
  ): Order {
    const orders = getLS<Order[]>("orders", []);
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      billNumber: generateBillNumber(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    setLS("orders", orders);
    setLS("lastOrder", newOrder);
    refresh();
    return newOrder;
  }

  function confirmPayment(orderId: string): void {
    const orders = getLS<Order[]>("orders", []);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx >= 0) orders[idx].status = "confirmed";
    setLS("orders", orders);
    const last = getLS<Order | null>("lastOrder", null);
    if (last && last.id === orderId)
      setLS("lastOrder", { ...last, status: "confirmed" });
    refresh();
  }

  function completeOrder(orderId: string): void {
    const orders = getLS<Order[]>("orders", []);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx >= 0) orders[idx].status = "completed";
    setLS("orders", orders);
    refresh();
  }

  function getActiveOrders(shopId: string): Order[] {
    return getLS<Order[]>("orders", []).filter(
      (o) => o.shopId === shopId && o.status === "confirmed",
    );
  }

  function getOrderHistory(shopId: string): Order[] {
    return getLS<Order[]>("orders", []).filter(
      (o) => o.shopId === shopId && o.status === "completed",
    );
  }

  function getLastOrder(): Order | null {
    return getLS<Order | null>("lastOrder", null);
  }

  return {
    getSession,
    setSession,
    getShops,
    getAllShops,
    getMyShop,
    saveShop,
    getMenuItems,
    getAllMenuItems,
    saveMenuItem,
    deleteMenuItem,
    placeOrder,
    confirmPayment,
    completeOrder,
    getActiveOrders,
    getOrderHistory,
    getLastOrder,
  };
}
