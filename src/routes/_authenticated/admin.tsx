import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { Package, DollarSign, ShoppingBag, Plus, Trash2, Pencil, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/lib/use-auth";
import { SiteNav } from "@/components/site-nav";
import { formatPrice } from "@/lib/cart";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — SwiftCommerce" }] }),
  component: AdminPage,
});

type Product = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  stock: number;
  is_active: boolean;
  image_url: string;
  description: string;
  category_id: string | null;
};

type Category = { id: string; name: string };

type OrderRow = {
  id: string;
  status: string;
  total_cents: number;
  created_at: string;
  shipping_name: string;
};

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin(user?.id);
  const [tab, setTab] = useState<"overview" | "products" | "orders">("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  async function refresh() {
    const [{ data: p }, { data: c }, { data: o }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("orders").select("id, status, total_cents, created_at, shipping_name").order("created_at", { ascending: false }).limit(50),
    ]);
    setProducts((p as Product[]) ?? []);
    setCategories((c as Category[]) ?? []);
    setOrders((o as OrderRow[]) ?? []);
  }

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="max-w-6xl mx-auto p-8 text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteNav />
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold mb-3">Admin access only</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your account doesn't have admin privileges. To grant yourself admin access on this demo, run this in your Cloud SQL editor:
          </p>
          <pre className="text-left bg-muted rounded-lg p-4 text-xs overflow-x-auto">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${user?.id ?? "<your-user-id>"}', 'admin');`}
          </pre>
          <Link to="/" className="inline-block mt-6 text-sm underline">Back to home</Link>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total_cents, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <Toaster position="top-center" />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Admin dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">Manage products, orders, and view store performance.</p>

        <div className="flex gap-2 mb-8 border-b border-border">
          {(["overview", "products", "orders"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${
                tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid sm:grid-cols-3 gap-4">
            <Stat icon={<DollarSign className="size-5" />} label="Revenue" value={formatPrice(totalRevenue)} />
            <Stat icon={<ShoppingBag className="size-5" />} label="Orders" value={orders.length.toString()} />
            <Stat icon={<Package className="size-5" />} label="Products" value={products.length.toString()} />
          </div>
        )}

        {tab === "products" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">{products.length} products</div>
              <button
                onClick={() => setCreating(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium"
              >
                <Plus className="size-4" /> New product
              </button>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Product</th>
                    <th className="text-left px-4 py-3">Price</th>
                    <th className="text-left px-4 py-3">Stock</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img src={p.image_url} alt="" className="size-10 rounded object-cover" />
                        <span className="font-medium">{p.name}</span>
                      </td>
                      <td className="px-4 py-3">{formatPrice(p.price_cents)}</td>
                      <td className="px-4 py-3">{p.stock}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${p.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                          {p.is_active ? "Active" : "Draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setEditing(p)} className="p-1.5 hover:bg-muted rounded" aria-label="Edit">
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm("Delete this product?")) return;
                            const { error } = await supabase.from("products").delete().eq("id", p.id);
                            if (error) toast.error(error.message);
                            else {
                              toast.success("Deleted");
                              refresh();
                            }
                          }}
                          className="p-1.5 hover:bg-muted rounded text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "orders" && (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link to="/orders/$id" params={{ id: o.id }} className="hover:underline">
                        #{o.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{o.shipping_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={async (e) => {
                          const { error } = await supabase.from("orders").update({ status: e.target.value as "pending" | "paid" | "shipped" | "delivered" | "cancelled" }).eq("id", o.id);
                          if (error) toast.error(error.message);
                          else {
                            toast.success("Updated");
                            refresh();
                          }
                        }}
                        className="text-xs rounded border border-input bg-background px-2 py-1"
                      >
                        {["pending", "paid", "shipped", "delivered", "cancelled"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(o.total_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(editing || creating) && (
          <ProductModal
            initial={editing}
            categories={categories}
            onClose={() => {
              setEditing(null);
              setCreating(false);
            }}
            onSaved={() => {
              setEditing(null);
              setCreating(false);
              refresh();
            }}
          />
        )}
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function ProductModal({
  initial,
  categories,
  onClose,
  onSaved,
}: {
  initial: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<{ name: string; slug: string; description: string; price_cents: number; stock: number; image_url: string; category_id: string | null; is_active: boolean }>({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    price_cents: initial?.price_cents ?? 0,
    stock: initial?.stock ?? 0,
    image_url: initial?.image_url ?? "",
    category_id: initial?.category_id ?? categories[0]?.id ?? null,
    is_active: initial?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") };
      const { error } = initial
        ? await supabase.from("products").update(payload).eq("id", initial.id)
        : await supabase.from("products").insert(payload);
      if (error) throw error;
      toast.success(initial ? "Product updated" : "Product created");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h3 className="font-semibold">{initial ? "Edit product" : "New product"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="size-4" /></button>
        </div>
        <form onSubmit={save} className="p-5 space-y-3">
          <Row label="Name">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </Row>
          <Row label="Slug (auto if blank)">
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input" />
          </Row>
          <Row label="Description">
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
          </Row>
          <Row label="Image URL">
            <input required value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input" />
          </Row>
          <div className="grid grid-cols-2 gap-3">
            <Row label="Price (cents)">
              <input required type="number" min={0} value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: Number(e.target.value) })} className="input" />
            </Row>
            <Row label="Stock">
              <input required type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="input" />
            </Row>
          </div>
          <Row label="Category">
            <select value={form.category_id ?? ""} onChange={(e) => setForm({ ...form, category_id: (e.target.value || null) as string | null })} className="input">
              <option value="">— none —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Row>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Active (visible in shop)
          </label>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium disabled:opacity-50">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
      <style>{`.input{width:100%;border-radius:.5rem;border:1px solid hsl(var(--input));background:hsl(var(--background));padding:.5rem .75rem;font-size:.875rem}`}</style>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}
