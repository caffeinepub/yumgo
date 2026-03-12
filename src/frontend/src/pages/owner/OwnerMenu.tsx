import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../../App";
import type { MenuItem, useStore } from "../../hooks/useStore";

type StoreType = ReturnType<typeof useStore>;

interface Props {
  store: StoreType;
  navigate: (page: Page, shopId?: string) => void;
}

export default function OwnerMenu({ store, navigate }: Props) {
  const session = store.getSession()!;
  const shop = store.getMyShop(session.email);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [editingPrice, setEditingPrice] = useState<Record<string, string>>({});
  const imgRef = useRef<HTMLInputElement>(null);

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
    const item: MenuItem = {
      id: `item-${Date.now()}`,
      shopId: shop!.id,
      name: newName.trim(),
      imageUrl: newImageUrl,
      price: Number(newPrice),
      isDeleted: false,
    };
    store.saveMenuItem(item);
    setNewName("");
    setNewPrice("");
    setNewImageUrl("");
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

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewImageUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-primary text-primary-foreground px-4 pt-10 pb-6 rounded-b-3xl shadow-card">
        <button
          type="button"
          onClick={() => navigate("owner")}
          className="text-primary-foreground/80 text-sm mb-3"
        >
          ← Back
        </button>
        <h1 className="font-display text-2xl font-bold">Manage Menu</h1>
        <p className="text-primary-foreground/70 text-sm">
          {items.length} active items
        </p>
      </div>

      <div className="px-4 mt-5 space-y-3">
        {items.length === 0 ? (
          <div
            className="text-center py-10 text-muted-foreground"
            data-ocid="menu_mgmt.empty_state"
          >
            <div className="text-5xl mb-3">🍱</div>
            <p>No items yet. Add your first menu item!</p>
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={item.id}
              className="bg-card rounded-2xl shadow-xs p-3 flex gap-3 items-center"
            >
              <div className="w-14 h-14 rounded-xl bg-accent flex-shrink-0 flex items-center justify-center overflow-hidden">
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
                <p className="font-semibold text-sm truncate">{item.name}</p>
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
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="text-primary font-bold text-sm mt-0.5 hover:underline"
                    onClick={() =>
                      setEditingPrice((prev) => ({
                        ...prev,
                        [item.id]: String(item.price),
                      }))
                    }
                  >
                    ₹{item.price}{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      edit
                    </span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                data-ocid={`menu_mgmt.delete_button.${i + 1}`}
                className="w-8 h-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center text-lg"
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
          className="w-full h-12 rounded-xl font-semibold"
          onClick={() => setShowAdd(true)}
          data-ocid="menu_mgmt.add_item_button"
        >
          + Add Menu Item
        </Button>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
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
              <Label className="text-xs">Image (optional)</Label>
              {newImageUrl && (
                <img
                  src={newImageUrl}
                  alt="preview"
                  className="w-20 h-20 rounded-xl object-cover"
                />
              )}
              <input
                ref={imgRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => imgRef.current?.click()}
              >
                Upload Image
              </Button>
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
