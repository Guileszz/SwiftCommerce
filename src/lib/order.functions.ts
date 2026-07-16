import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
  shipping_name: z.string().trim().min(1).max(100),
  shipping_email: z.string().trim().email().max(255),
  shipping_address: z.string().trim().min(1).max(300),
  shipping_city: z.string().trim().min(1).max(100),
  shipping_country: z.string().trim().min(1).max(100),
  wallet_address: z.string().trim().min(1).max(120),
  tx_hash: z.string().trim().max(200).optional(),
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Fetch canonical product prices from DB (never trust client cents)
    const ids = data.items.map((i) => i.product_id);
    const { data: products, error: pErr } = await supabase
      .from("products")
      .select("id, name, image_url, price_cents, stock, is_active")
      .in("id", ids);
    if (pErr) throw new Error(pErr.message);
    if (!products || products.length !== ids.length) throw new Error("Some products not found");

    let total = 0;
    const rows = data.items.map((it) => {
      const p = products.find((x) => x.id === it.product_id);
      if (!p) throw new Error("Product missing");
      if (!p.is_active) throw new Error(`${p.name} is not available`);
      if (p.stock < it.quantity) throw new Error(`${p.name}: only ${p.stock} in stock`);
      total += p.price_cents * it.quantity;
      return {
        product_id: p.id,
        product_name: p.name,
        product_image: p.image_url,
        unit_price_cents: p.price_cents,
        quantity: it.quantity,
      };
    });

    const { data: order, error: oErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        total_cents: total,
        wallet_address: data.wallet_address,
        shipping_name: data.shipping_name,
        shipping_email: data.shipping_email,
        shipping_address: data.shipping_address,
        shipping_city: data.shipping_city,
        shipping_country: data.shipping_country,
        tx_hash: data.tx_hash ?? null,
        status: data.tx_hash ? "paid" : "pending",
      })
      .select("id")
      .single();
    if (oErr || !order) throw new Error(oErr?.message ?? "Order failed");

    const { error: iErr } = await supabase
      .from("order_items")
      .insert(rows.map((r) => ({ ...r, order_id: order.id })));
    if (iErr) throw new Error(iErr.message);

    return { order_id: order.id, total_cents: total };
  });
