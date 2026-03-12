import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../../App";
import type { Shop, useStore } from "../../hooks/useStore";

type StoreType = ReturnType<typeof useStore>;

interface Props {
  store: StoreType;
  navigate: (page: Page, shopId?: string) => void;
}

export default function OwnerSettings({ store, navigate }: Props) {
  const session = store.getSession()!;
  const shop = store.getMyShop(session.email);

  const [name, setName] = useState(shop?.name ?? "");
  const [upiId, setUpiId] = useState(shop?.upiId ?? "");
  const [pin, setPin] = useState("");
  const [logoUrl, setLogoUrl] = useState(shop?.logoUrl ?? "");
  const [qrUrl, setQrUrl] = useState(shop?.upiQrUrl ?? "");
  const [saving, setSaving] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "qr",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (type === "logo") setLogoUrl(url);
      else setQrUrl(url);
    };
    reader.readAsDataURL(file);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!shop) {
      toast.error("No shop found. Go back and create one first.");
      return;
    }
    setSaving(true);
    const updated: Shop = {
      ...shop,
      name: name.trim() || shop.name,
      upiId: upiId.trim() || shop.upiId,
      logoUrl,
      upiQrUrl: qrUrl,
      pinHash: pin ? btoa(pin) : shop.pinHash,
    };
    setTimeout(() => {
      store.saveShop(updated);
      setSaving(false);
      toast.success("Settings saved!");
      navigate("owner");
    }, 500);
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="bg-primary text-primary-foreground px-4 pt-10 pb-6 rounded-b-3xl shadow-card">
        <button
          type="button"
          onClick={() => navigate("owner")}
          className="text-primary-foreground/80 text-sm mb-3"
        >
          ← Back
        </button>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-primary-foreground/70 text-sm">
          Manage your shop details
        </p>
      </div>

      <form onSubmit={handleSave} className="px-4 mt-5 space-y-4">
        <div className="bg-card rounded-2xl shadow-xs p-4 space-y-3">
          <h3 className="font-semibold">Shop Info</h3>
          <div className="space-y-1">
            <Label className="text-xs">Shop Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shop name"
              className="h-10 rounded-xl"
              data-ocid="settings.shop_name_input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">UPI ID</Label>
            <Input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. myshop@paytm"
              className="h-10 rounded-xl"
              data-ocid="settings.upi_id_input"
            />
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-xs p-4 space-y-3">
          <h3 className="font-semibold">Shop Logo</h3>
          {logoUrl && (
            <div className="flex justify-center">
              <img
                src={logoUrl}
                alt="Logo"
                className="w-24 h-24 rounded-2xl object-cover"
              />
            </div>
          )}
          <input
            ref={logoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e, "logo")}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => logoRef.current?.click()}
            data-ocid="settings.logo_upload_button"
          >
            {logoUrl ? "Change Logo" : "Upload Logo"}
          </Button>
        </div>

        <div className="bg-card rounded-2xl shadow-xs p-4 space-y-3">
          <h3 className="font-semibold">UPI QR Code</h3>
          {qrUrl && (
            <div className="flex justify-center">
              <img
                src={qrUrl}
                alt="UPI QR"
                className="w-40 h-40 rounded-xl object-contain"
              />
            </div>
          )}
          <input
            ref={qrRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e, "qr")}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => qrRef.current?.click()}
            data-ocid="settings.qr_upload_button"
          >
            {qrUrl ? "Change QR Code" : "Upload UPI QR Code"}
          </Button>
        </div>

        <div className="bg-card rounded-2xl shadow-xs p-4 space-y-3">
          <h3 className="font-semibold">PIN Protection (Optional)</h3>
          <p className="text-xs text-muted-foreground">
            Set a 4-digit PIN to protect your shop panel
          </p>
          <Input
            type="password"
            placeholder="Enter new 4-digit PIN"
            maxLength={4}
            value={pin}
            onChange={(e) =>
              setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            className="h-10 rounded-xl tracking-widest text-center text-lg"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl font-semibold"
          disabled={saving}
          data-ocid="settings.save_button"
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
