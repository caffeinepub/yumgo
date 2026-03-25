import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../../App";
import type { MenuItem, useStore } from "../../hooks/useStore";

type StoreType = ReturnType<typeof useStore>;

interface Props {
  store: StoreType;
  navigate: (page: Page, shopId?: string) => void;
}

function generateFoodImageUrl(foodName: string, seed?: number) {
  const s = seed ?? Math.floor(Math.random() * 10000);
  const prompt = encodeURIComponent(
    `${foodName}, delicious Indian canteen food, close-up food photography, vibrant colors, appetizing, white background`,
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&nologo=true&seed=${s}`;
}

export default function OwnerMenu({ store, navigate }: Props) {
  const session = store.getSession()!;
  const shop = store.getMyShop(session.email);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [editingPrice, setEditingPrice] = useState<Record<string, string>>({});
  const [editingStock, setEditingStock] = useState<Record<string, string>>({});

  // Auto-generate preview when name is typed (debounced)
  useEffect(() => {
    if (!newName.trim() || newName.trim().length < 3) {
      setPreviewImageUrl("");
      setImageError(false);
      return;
    }
    const timer = setTimeout(() => {
      setImageLoading(true);
      setImageError(false);
      setPreviewImageUrl(generateFoodImageUrl(newName.trim()));
    }, 800);
    return () => clearTimeout(timer);
  }, [newName]);

  function handleRegenerate() {
    if (!newName.trim()) return;
    setImageLoading(true);
    setImageError(false);
    setPreviewImageUrl(generateFoodImageUrl(newName.trim()));
  }

  if (!shop) {
    navigate("owner");
    return null;
  }

  const items = store.getAllMenuItems(shop.id).filter((i) => !i.isDeleted);

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newPrice) {
      toast.error("Enter item name and price");
      return;
    }
    const imageUrl = previewImageUrl || generateFoodImageUrl(newName.trim());
    const item: MenuItem = {
      id: `item-${Date.now()}`,
      shopId: shop!.id,
      name: newName.trim(),
      imageUrl,
      price: Number(newPrice),
      isDeleted: false,
      stock: newStock !== "" ? Number(newStock) : undefined,
    };
    store.saveMenuItem(item);
    setNewName("");
    setNewPrice("");
    setNewStock("");
    setPreviewImageUrl("");
    setImageLoading(false);
    setImageError(false);
    setShowAdd(false);
    toast.success("Item added!");
  }

  function handleDelete(itemId: string) {
    store.deleteMenuItem(shop!.id, itemId);
    toast.success("Item removed");
  }

  function handleSavePrice(item: MenuItem) {
    const newP = editingPrice[item.id];
    if (!newP || Number.isNaN(Number(newP))) {
      toast.error("Invalid price");
      return;
    }
    store.saveMenuItem({ ...item, price: Number(newP) });
    setEditingPrice((prev) => {
      const { [item.id]: _, ...rest } = prev;
      return rest;
    });
    toast.success("Price updated");
  }

  function handleSaveStock(item: MenuItem) {
    const val = editingStock[item.id];
    if (val === undefined || Number.isNaN(Number(val))) {
      toast.error("Invalid stock");
      return;
    }
    store.saveMenuItem({
      ...item,
      stock: val === "" ? undefined : Number(val),
    });
    setEditingStock((prev) => {
      const { [item.id]: _, ...rest } = prev;
      return rest;
    });
    toast.success("Stock updated");
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        background:
          "linear-gradient(160deg, #0d1117 0%, #0a2744 50%, #003d82 100%)",
      }}
    >
      <div
        className="px-4 pt-10 pb-6 rounded-b-3xl shadow-card"
        style={{
          background: "linear-gradient(135deg, #0a2744 0%, #1565c0 100%)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("owner")}
          className="text-white/80 text-sm mb-3"
        >
          ← Back
        </button>
        <h1 className="text-white font-display text-2xl font-bold">
          Manage Menu & Stock
        </h1>
        <p className="text-white/60 text-sm">{items.length} active items</p>
      </div>

      <div className="px-4 mt-5 space-y-3">
        {items.length === 0 ? (
          <div
            className="text-center py-10 text-white/60"
            data-ocid="menu_mgmt.empty_state"
          >
            <div className="text-5xl mb-3">🍱</div>
            <p>No items yet. Add your first menu item!</p>
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-xs p-3 flex gap-3 items-start"
            >
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">🍱</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-gray-900">
                  {item.name}
                </p>

                {/* Price row */}
                {editingPrice[item.id] !== undefined ? (
                  <div className="flex gap-1 mt-1">
                    <Input
                      type="number"
                      value={editingPrice[item.id]}
                      onChange={(e) =>
                        setEditingPrice((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      className="h-7 rounded-lg text-xs w-20"
                      data-ocid={`menu_mgmt.price_input.${i + 1}`}
                    />
                    <Button
                      size="sm"
                      className="h-7 text-xs rounded-lg px-2"
                      onClick={() => handleSavePrice(item)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs rounded-lg px-2"
                      onClick={() =>
                        setEditingPrice((prev) => {
                          const { [item.id]: _, ...rest } = prev;
                          return rest;
                        })
                      }
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="text-blue-600 font-bold text-sm mt-0.5 hover:underline"
                    onClick={() =>
                      setEditingPrice((prev) => ({
                        ...prev,
                        [item.id]: String(item.price),
                      }))
                    }
                  >
                    ₹{item.price}{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      edit price
                    </span>
                  </button>
                )}

                {/* Stock row */}
                <div className="mt-1.5">
                  {editingStock[item.id] !== undefined ? (
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        placeholder="Stock qty"
                        value={editingStock[item.id]}
                        onChange={(e) =>
                          setEditingStock((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        className="h-7 rounded-lg text-xs w-24"
                        data-ocid={`menu_mgmt.stock_input.${i + 1}`}
                      />
                      <Button
                        size="sm"
                        className="h-7 text-xs rounded-lg px-2 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleSaveStock(item)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs rounded-lg px-2"
                        onClick={() =>
                          setEditingStock((prev) => {
                            const { [item.id]: _, ...rest } = prev;
                            return rest;
                          })
                        }
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-xs"
                      onClick={() =>
                        setEditingStock((prev) => ({
                          ...prev,
                          [item.id]:
                            item.stock !== undefined ? String(item.stock) : "",
                        }))
                      }
                      data-ocid={`menu_mgmt.stock_button.${i + 1}`}
                    >
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold ${
                          item.stock === undefined
                            ? "bg-gray-100 text-gray-500"
                            : item.stock <= 0
                              ? "bg-red-100 text-red-600"
                              : item.stock <= 5
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        📦{" "}
                        {item.stock === undefined
                          ? "Unlimited"
                          : item.stock <= 0
                            ? "Out of stock"
                            : `${item.stock} left`}
                      </span>
                      <span className="text-gray-400">tap to update</span>
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                data-ocid={`menu_mgmt.delete_button.${i + 1}`}
                className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-lg flex-shrink-0"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-4 left-4 right-4">
        <Button
          className="w-full h-12 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowAdd(true)}
          data-ocid="menu_mgmt.add_item_button"
        >
          + Add Menu Item
        </Button>
      </div>

      {/* Add Item Dialog */}
      <Dialog
        open={showAdd}
        onOpenChange={(open) => {
          if (!open) {
            setNewName("");
            setNewPrice("");
            setNewStock("");
            setPreviewImageUrl("");
            setImageLoading(false);
            setImageError(false);
          }
          setShowAdd(open);
        }}
      >
        <DialogContent className="rounded-2xl mx-4">
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Item Name</Label>
              <Input
                placeholder="e.g. Veg Burger"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>

            {/* AI-generated photo preview */}
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <span>🤖 AI Photo</span>
                {imageLoading && previewImageUrl && !imageError && (
                  <span className="text-blue-500 text-xs">Loading...</span>
                )}
              </Label>
              <div className="w-full h-36 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-dashed border-gray-300 relative">
                {previewImageUrl && !imageError ? (
                  <img
                    src={previewImageUrl}
                    alt="AI preview"
                    className="w-full h-full object-cover rounded-xl"
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageLoading(false);
                      setImageError(true);
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-400 text-xs px-4">
                    <div className="text-3xl mb-1">🍽️</div>
                    <p>
                      {imageError
                        ? "Photo failed to load. Try regenerating."
                        : "Type the item name above and AI will generate a photo automatically"}
                    </p>
                  </div>
                )}
              </div>
              {/* Regenerate button */}
              {newName.trim().length >= 3 && (
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors"
                >
                  🔄 Regenerate Photo
                </button>
              )}
              <p className="text-xs text-gray-400">
                Photo is automatically generated based on the item name
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Price (₹)</Label>
              <Input
                type="number"
                placeholder="e.g. 60"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Stock Available (optional)</Label>
              <Input
                type="number"
                placeholder="Leave blank for unlimited"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="h-10 rounded-xl"
              />
              <p className="text-xs text-gray-400">
                Students will see how many portions are left
              </p>
            </div>
            <Button type="submit" className="w-full rounded-xl">
              Add Item
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
