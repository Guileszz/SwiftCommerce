import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BarChart3,
  Boxes,
  CheckCircle2,
  CreditCard,
  FileText,
  Github,
  KeyRound,
  LayoutDashboard,
  LineChart,
  Lock,
  Mail,
  Package,
  Percent,
  Search,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Truck,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

// ------- data -------
const metrics = [
  { label: "Stores", value: 500, suffix: "+" },
  { label: "Orders", value: 1.2, suffix: "M" },
  { label: "Revenue", value: 8.4, suffix: "M", prefix: "$" },
  { label: "Uptime", value: 99.98, suffix: "%" },
];

const features = [
  { icon: Wallet, title: "Crypto Payments", desc: "Direct on-chain settlement to your vault." },
  { icon: Boxes, title: "Inventory", desc: "Real-time stock across warehouses." },
  { icon: LayoutDashboard, title: "Admin Dashboard", desc: "Operate the entire store from one pane." },
  { icon: Percent, title: "Coupons", desc: "Rules, tiers, and expiry built in." },
  { icon: Lock, title: "Authentication", desc: "Email, OAuth, and wallet sign-in." },
  { icon: Truck, title: "Order Tracking", desc: "Live status from packed to delivered." },
  { icon: BarChart3, title: "Analytics", desc: "Revenue, funnels, and cohorts." },
  { icon: FileText, title: "Invoices", desc: "Auto-generated PDF receipts." },
  { icon: KeyRound, title: "Role-Based Access", desc: "Owner, staff, and read-only roles." },
  { icon: Mail, title: "Email Notifications", desc: "Transactional and marketing emails." },
  { icon: LayoutDashboard, title: "Headless CMS", desc: "Manage collections and content." },
  { icon: Zap, title: "REST + GraphQL API", desc: "Public API for every resource." },
];

const inventory = [
  { name: "Aperture Camera M2", stock: 42, price: "$1,299", status: "In Stock" },
  { name: "Field Notes — Vol. 3", stock: 128, price: "$18", status: "In Stock" },
  { name: "Modular Desk Lamp", stock: 7, price: "$249", status: "Low" },
  { name: "Linear Keydeck 65", stock: 0, price: "$189", status: "Out" },
  { name: "Voyager Tote", stock: 61, price: "$79", status: "In Stock" },
];

const recentOrders = [
  { id: "#8241", customer: "Marcus Chen", amount: "$1,299", method: "USDC", status: "Paid" },
  { id: "#8240", customer: "Elena Rossi", amount: "$249", method: "ETH", status: "Paid" },
  { id: "#8239", customer: "Yuki Tanaka", amount: "$79", method: "SOL", status: "Shipped" },
  { id: "#8238", customer: "Amir Haddad", amount: "$189", method: "USDC", status: "Refunded" },
];

const products = [
  { name: "Aperture Camera M2", category: "Electronics", price: "$1,299", badge: "New", image: "https://images.unsplash.com/photo-1519638831568-d9897f54ed69?w=800&q=80" },
  { name: "Runner OS-1", category: "Footwear", price: "$189", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80" },
  { name: "Field Notes — Vol. 3", category: "Books", price: "$18", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80" },
  { name: "Modular Desk Lamp", category: "Home", price: "$249", badge: "Low", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80" },
  { name: "Voyager Tote", category: "Accessories", price: "$79", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80" },
  { name: "Meridian Coffee 250g", category: "Coffee", price: "$24", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80" },
  { name: "Linear Keydeck 65", category: "Electronics", price: "$189", badge: "Sold Out", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80" },
  { name: "Atlas Wool Coat", category: "Fashion", price: "$420", image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80" },
];

const stack = [
  "Next.js", "React", "TypeScript", "MongoDB", "Prisma",
  "TailwindCSS", "NextAuth", "Cloudinary", "Resend", "Redis",
  "TanStack Query", "Recharts",
];

const testimonials = [
  { name: "Aris Labs", tag: "DTC" },
  { name: "Form Studio", tag: "Design" },
  { name: "Meridian", tag: "Coffee" },
  { name: "Kōbo", tag: "Books" },
  { name: "Northline", tag: "Apparel" },
  { name: "Signal Optics", tag: "Optics" },
];

const faqs = [
  { q: "How are payments settled?", a: "Directly on-chain to your vault address. We never touch your liquidity." },
  { q: "Which networks are supported?", a: "Ethereum, Solana, Polygon, Base, and Arbitrum by default." },
  { q: "Is there a platform commission?", a: "Zero. Flat license, not a percentage of your growth." },
  { q: "Can I self-host?", a: "Yes. Deploy to your own infra with the same admin and API surface." },
];

// ------- animated counter -------
function useCountUp(target: number, durationMs = 1400, start = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, start]);
  return val;
}

function formatMetric(v: number, m: typeof metrics[number]) {
  const decimals = m.value % 1 === 0 ? 0 : m.value < 10 ? 2 : 1;
  return `${m.prefix ?? ""}${v.toFixed(decimals)}${m.suffix ?? ""}`;
}

function AnimatedMetric({ m }: { m: typeof metrics[number] }) {
  const v = useCountUp(m.value);
  return (
    <div className="flex flex-col gap-1">
      <div className="text-3xl md:text-4xl font-semibold tracking-tight font-[family-name:var(--font-display)] tabular-nums">
        {formatMetric(v, m)}
      </div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{m.label}</div>
    </div>
  );
}

// ------- dashboard mockup (right side of hero + preview section) -------
function RevenueChart({ animate = true }: { animate?: boolean }) {
  const points = [12, 18, 15, 22, 19, 28, 26, 34, 30, 38, 42, 48];
  const max = Math.max(...points);
  const width = 320;
  const height = 96;
  const step = width / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${height - (p / max) * height}`)
    .join(" ");
  const area = `${path} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24">
      <defs>
        <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#rev)" className="text-foreground" />
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={`text-foreground ${animate ? "[stroke-dasharray:600] [stroke-dashoffset:600] [animation:_draw_1.6s_ease-out_forwards]" : ""}`}
      />
      <style>{`@keyframes _draw { to { stroke-dashoffset: 0 } }`}</style>
    </svg>
  );
}

function DashboardMock() {
  const rev = useCountUp(24583);
  const orders = useCountUp(423);
  const inv = useCountUp(1234);
  const cust = useCountUp(892);
  return (
    <div className="relative w-full rounded-[min(1.4vw,20px)] bg-card ring-1 ring-foreground/10 shadow-[0_40px_80px_-40px_rgb(0_0_0_/_0.25)] overflow-hidden">
      {/* top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/5 bg-muted/40">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-foreground/10" />
          <span className="size-2.5 rounded-full bg-foreground/10" />
          <span className="size-2.5 rounded-full bg-foreground/10" />
        </div>
        <div className="text-[11px] font-mono text-muted-foreground">admin.swiftcommerce.io</div>
        <div className="w-10" />
      </div>

      <div className="grid grid-cols-12 min-h-[420px]">
        {/* sidebar */}
        <aside className="col-span-3 border-r border-foreground/5 p-3 space-y-1 text-xs">
          {[
            { icon: LayoutDashboard, label: "Overview", active: true },
            { icon: ShoppingBag, label: "Orders" },
            { icon: Package, label: "Products" },
            { icon: Users, label: "Customers" },
            { icon: BarChart3, label: "Analytics" },
            { icon: Tag, label: "Coupons" },
          ].map((it) => (
            <div
              key={it.label}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-md ${
                it.active ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
            >
              <it.icon className="size-3.5" />
              <span className="font-medium">{it.label}</span>
            </div>
          ))}
        </aside>

        {/* main */}
        <div className="col-span-9 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Revenue", val: `$${rev.toFixed(0)}`, delta: "+12%" },
              { label: "Orders", val: orders.toFixed(0), delta: "+8%" },
              { label: "Inventory", val: inv.toFixed(0), delta: "−3%" },
              { label: "Customers", val: cust.toFixed(0), delta: "+21%" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg ring-1 ring-foreground/5 p-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-lg font-semibold tabular-nums">{s.val}</span>
                  <span className="text-[10px] text-muted-foreground">{s.delta}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg ring-1 ring-foreground/5 p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Revenue — 12mo
              </div>
              <div className="text-[10px] text-muted-foreground">+38.2%</div>
            </div>
            <RevenueChart />
          </div>

          <div className="rounded-lg ring-1 ring-foreground/5">
            <div className="px-3 py-2 border-b border-foreground/5 text-[10px] uppercase tracking-widest text-muted-foreground">
              Recent Orders
            </div>
            <div className="divide-y divide-foreground/5 text-xs">
              {recentOrders.slice(0, 3).map((o) => (
                <div key={o.id} className="flex items-center justify-between px-3 py-2">
                  <span className="font-mono text-muted-foreground">{o.id}</span>
                  <span className="flex-1 px-3 truncate">{o.customer}</span>
                  <span className="text-muted-foreground">{o.method}</span>
                  <span className="ml-3 font-medium tabular-nums">{o.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* floating notification */}
      <div className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-foreground text-background text-xs px-3 py-2 shadow-lg animate-fade-in">
        <CheckCircle2 className="size-3.5" />
        <span>Order #8241 settled — 0.42 ETH</span>
      </div>
    </div>
  );
}

// ------- product tile placeholder -------
function ProductTile({ p }: { p: (typeof products)[number] }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[4/5] rounded-[min(1vw,12px)] ring-1 ring-foreground/5 bg-muted overflow-hidden">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground bg-gradient-to-t from-background/90 to-transparent pt-8">
          <span>{p.category}</span>
          {p.badge && (
            <span className="bg-foreground text-background px-1.5 py-0.5 rounded font-semibold">
              {p.badge}
            </span>
          )}
        </div>
      </div>
      <div className="flex justify-between text-sm mt-3">
        <span className="font-medium">{p.name}</span>
        <span className="text-muted-foreground tabular-nums">{p.price}</span>
      </div>
    </div>
  );
}

// ------- checkout flow -------
function FlowStep({
  icon: Icon,
  label,
  index,
  active,
}: {
  icon: typeof Wallet;
  label: string;
  index: number;
  active: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
      <div
        className={`size-12 grid place-items-center rounded-full ring-1 transition-all ${
          active
            ? "bg-foreground text-background ring-foreground"
            : "bg-background text-muted-foreground ring-foreground/10"
        }`}
      >
        <Icon className="size-5" />
      </div>
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Step {index}
        </div>
        <div className="text-sm font-medium mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function CheckoutFlow() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 5), 1600);
    return () => clearInterval(id);
  }, []);
  const steps = [
    { icon: ShoppingBag, label: "Product" },
    { icon: ShoppingCart, label: "Cart" },
    { icon: CreditCard, label: "Checkout" },
    { icon: Wallet, label: "Crypto Pay" },
    { icon: CheckCircle2, label: "Confirmed" },
  ];
  return (
    <div className="rounded-[min(1.4vw,20px)] ring-1 ring-foreground/10 p-8 md:p-12 bg-card">
      <div className="flex items-start gap-2 md:gap-4 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s.label} className="contents">
            <FlowStep icon={s.icon} label={s.label} index={i + 1} active={i <= step} />
            {i < steps.length - 1 && (
              <div className="flex-1 h-px bg-foreground/10 mt-6 relative overflow-hidden min-w-4">
                <div
                  className={`absolute inset-0 bg-foreground transition-transform duration-700 origin-left ${
                    i < step ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniCheckout() {
  return (
    <div className="rounded-[min(1vw,16px)] ring-1 ring-foreground/10 bg-card p-6 max-w-md">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
        Order Summary
      </div>
      <div className="space-y-3 text-sm">
        {[
          ["Subtotal", "$1,547.00"],
          ["Shipping", "$0.00"],
          ["Tax (est.)", "$123.76"],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between text-muted-foreground">
            <span>{l}</span>
            <span className="tabular-nums text-foreground">{v}</span>
          </div>
        ))}
        <div className="border-t border-foreground/10 pt-3 flex justify-between font-medium">
          <span>Total</span>
          <span className="tabular-nums">$1,670.76</span>
        </div>
      </div>
      <button className="mt-6 w-full bg-foreground text-background rounded-full py-3 text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
        <Wallet className="size-4" />
        Pay with Crypto
      </button>
      <div className="mt-3 text-[10px] font-mono text-muted-foreground text-center break-all">
        0x71C7…8976F · settles in ~14s
      </div>
    </div>
  );
}

// ------- section reveal on scroll -------
function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {children}
    </div>
  );
}

function Index() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md ring-1 ring-foreground/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight font-[family-name:var(--font-display)]">
            SwiftCommerce
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#admin" className="hover:text-foreground transition-colors">Admin</a>
            <a href="#drops" className="hover:text-foreground transition-colors">Store</a>
            <a href="#stack" className="hover:text-foreground transition-colors">Stack</a>
            <a href="#faq" className="hover:text-foreground transition-colors">Protocol</a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark((v) => !v)}
              aria-label="Toggle theme"
              className="hidden sm:grid size-9 place-items-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
              </svg>
            </button>
            <Link to="/cart" className="relative flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium hover:bg-foreground hover:text-background transition-colors">
              <ShoppingCart className="size-3.5" />
              <span className="tabular-nums">Cart</span>
            </Link>
            <Link to="/shop" className="text-sm font-medium py-2 px-4 hover:bg-muted rounded-full transition-colors">
              Shop
            </Link>
            <Link to="/auth" className="text-sm font-medium py-2 px-4 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity">
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero — split */}
        <section className="pt-16 md:pt-24 pb-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02] text-balance font-[family-name:var(--font-display)] mb-6">
                Commerce without the intermediaries.
              </h1>
              <p className="text-base md:text-lg text-muted-foreground text-pretty mb-8 max-w-[52ch]">
                A production-grade storefront and admin engine. Direct on-chain settlement,
                inventory, analytics, coupons, and role-based access — everything a real store needs.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/shop"
                  className="bg-foreground text-background px-5 py-3 rounded-full font-medium text-sm ring-1 ring-foreground hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                >
                  Shop the store <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/auth"
                  className="flex items-center py-2.5 px-4 text-sm font-medium hover:bg-muted rounded-full transition-colors"
                >
                  Sign in / Sign up
                </Link>
              </div>
              <div className="mt-12 grid grid-cols-4 gap-6">
                {metrics.map((m) => (
                  <AnimatedMetric key={m.label} m={m} />
                ))}
              </div>
            </div>
            <div className="relative">
              <DashboardMock />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 border-t border-foreground/5 bg-muted/40">
          <div className="max-w-7xl mx-auto">
            <Reveal className="max-w-2xl mb-14">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Platform
              </div>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight font-[family-name:var(--font-display)]">
                Everything a real store runs on.
              </h2>
            </Reveal>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-foreground/5 ring-1 ring-foreground/5 rounded-[min(1vw,16px)] overflow-hidden">
              {features.map((f) => (
                <div key={f.title} className="bg-background p-6 group hover:bg-muted/60 transition-colors">
                  <f.icon className="size-5 mb-6 text-foreground" strokeWidth={1.6} />
                  <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Admin Dashboard Preview (full width) */}
        <section id="admin" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <Reveal className="flex items-end justify-between flex-wrap gap-6 mb-10">
              <div className="max-w-xl">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                  Admin
                </div>
                <h2 className="text-3xl md:text-4xl font-medium tracking-tight font-[family-name:var(--font-display)]">
                  A dashboard operators actually use.
                </h2>
              </div>
              <a href="#" className="text-sm font-medium border-b border-foreground/10 pb-1 hover:border-foreground inline-flex items-center gap-1">
                Open live demo <ArrowUpRight className="size-3.5" />
              </a>
            </Reveal>

            <Reveal className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Analytics card */}
              <div className="lg:col-span-2 rounded-[min(1.4vw,20px)] ring-1 ring-foreground/10 bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Revenue
                    </div>
                    <div className="text-3xl font-semibold tracking-tight tabular-nums font-[family-name:var(--font-display)] mt-1">
                      $284,591
                    </div>
                  </div>
                  <div className="flex gap-2 text-[10px]">
                    {["7D", "30D", "12M"].map((r, i) => (
                      <span
                        key={r}
                        className={`px-2 py-1 rounded-full ${
                          i === 2 ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <RevenueChart />
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-foreground/5">
                  {[
                    ["Orders", "12,481"],
                    ["Visitors", "94.2K"],
                    ["Conversion", "3.8%"],
                    ["AOV", "$142"],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</div>
                      <div className="text-lg font-semibold tabular-nums mt-1">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent sales */}
              <div className="rounded-[min(1.4vw,20px)] ring-1 ring-foreground/10 bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Recent Sales
                  </div>
                  <Bell className="size-4 text-muted-foreground" />
                </div>
                <div className="divide-y divide-foreground/5">
                  {recentOrders.map((o) => (
                    <div key={o.id} className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium">{o.customer}</div>
                        <div className="text-xs text-muted-foreground">
                          {o.id} · {o.method}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium tabular-nums">{o.amount}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {o.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory table */}
              <div className="lg:col-span-3 rounded-[min(1.4vw,20px)] ring-1 ring-foreground/10 bg-card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/5">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Inventory
                  </div>
                  <div className="relative">
                    <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      readOnly
                      placeholder="Search products…"
                      className="bg-muted rounded-full pl-8 pr-3 py-1.5 text-xs w-56 focus:outline-none"
                    />
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted/40">
                    <tr>
                      <th className="text-left font-medium px-6 py-3">Product</th>
                      <th className="text-right font-medium px-6 py-3">Stock</th>
                      <th className="text-right font-medium px-6 py-3">Price</th>
                      <th className="text-right font-medium px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/5">
                    {inventory.map((row) => (
                      <tr key={row.name}>
                        <td className="px-6 py-3 font-medium">{row.name}</td>
                        <td className="px-6 py-3 text-right tabular-nums">{row.stock}</td>
                        <td className="px-6 py-3 text-right tabular-nums">{row.price}</td>
                        <td className="px-6 py-3 text-right">
                          <span
                            className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${
                              row.status === "In Stock"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : row.status === "Low"
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                : "bg-foreground/5 text-muted-foreground"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Checkout Flow */}
        <section className="py-24 px-6 bg-muted/40 border-y border-foreground/5">
          <div className="max-w-7xl mx-auto">
            <Reveal className="max-w-2xl mb-12">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Checkout
              </div>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight font-[family-name:var(--font-display)]">
                From product to paid in one flow.
              </h2>
            </Reveal>
            <Reveal className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <CheckoutFlow />
              </div>
              <MiniCheckout />
            </Reveal>
          </div>
        </section>

        {/* Products */}
        <section id="drops" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <Reveal className="flex justify-between items-end mb-12">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                  Storefront
                </div>
                <h2 className="text-3xl md:text-4xl font-medium tracking-tight font-[family-name:var(--font-display)]">
                  Curated products.
                </h2>
              </div>
              <a href="#" className="text-sm font-medium border-b border-foreground/10 pb-1 hover:border-foreground transition-colors">
                View all
              </a>
            </Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((p) => (
                <ProductTile key={p.name} p={p} />
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section id="stack" className="py-24 px-6 border-t border-foreground/5 bg-zinc-950 text-zinc-100">
          <div className="max-w-7xl mx-auto">
            <Reveal className="max-w-2xl mb-14">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                Stack
              </div>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight font-[family-name:var(--font-display)]">
                Built on the modern web.
              </h2>
            </Reveal>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-zinc-800 ring-1 ring-zinc-800 rounded-[min(1vw,16px)] overflow-hidden">
              {stack.map((s) => (
                <div key={s} className="bg-zinc-950 aspect-[3/2] flex items-center justify-center text-sm font-medium hover:bg-zinc-900 transition-colors">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trusted / brand logos */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <Reveal className="text-center max-w-2xl mx-auto mb-14">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Trusted by
              </div>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight font-[family-name:var(--font-display)]">
                Brands moving beyond legacy commerce.
              </h2>
            </Reveal>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-foreground/5 ring-1 ring-foreground/5 rounded-[min(1vw,16px)] overflow-hidden mb-14">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-background aspect-[3/2] flex flex-col items-center justify-center gap-1 hover:bg-muted/40 transition-colors">
                  <div className="text-base font-semibold font-[family-name:var(--font-display)]">
                    {t.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t.tag}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
              {[
                ["99.98%", "Uptime SLA"],
                ["50k+", "Orders / month"],
                ["18", "Countries"],
                ["4.9★", "Avg rating"],
              ].map(([v, l]) => (
                <div key={l}>
                  <div className="text-3xl md:text-4xl font-semibold tracking-tight font-[family-name:var(--font-display)] tabular-nums">
                    {v}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 px-6 bg-muted/40 border-t border-foreground/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-medium mb-12 text-center font-[family-name:var(--font-display)]">
              Technical Inquiries
            </h2>
            <div className="divide-y divide-foreground/10 rounded-[min(1vw,16px)] ring-1 ring-foreground/10 bg-background px-6">
              {faqs.map((f) => (
                <div key={f.q} className="py-6">
                  <h4 className="text-base font-medium mb-2">{f.q}</h4>
                  <p className="text-muted-foreground text-sm text-pretty leading-relaxed">
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto rounded-[min(1.4vw,24px)] bg-zinc-950 p-12 md:p-20 text-center">
            <h2 className="text-3xl md:text-4xl font-medium text-zinc-100 mb-4 font-[family-name:var(--font-display)]">
              Join the internal protocol list.
            </h2>
            <p className="text-zinc-400 mb-10 max-w-[44ch] mx-auto text-sm">
              Early access to new modules and network updates before general release.
            </p>
            <form className="max-w-md mx-auto flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="address@email.com"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-6 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
              />
              <button
                type="submit"
                className="bg-zinc-100 text-zinc-950 px-6 py-3 rounded-full font-medium text-sm hover:bg-white transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-foreground/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-2 space-y-6 max-w-sm">
            <div className="text-lg font-semibold tracking-tight font-[family-name:var(--font-display)]">
              SwiftCommerce
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The architectural standard for decentralized commerce. Open, secure, performant.
            </p>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter break-all">
              Deposit: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F
            </div>
          </div>
          {[
            { title: "Product", items: ["Live Demo", "Documentation", "API", "Changelog"] },
            { title: "Resources", items: ["GitHub", "Guides", "Status", "Security"] },
            { title: "Legal", items: ["Privacy", "Terms", "Licenses"] },
          ].map((col) => (
            <div key={col.title} className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-widest">{col.title}</h5>
              <ul className="text-sm text-muted-foreground space-y-2">
                {col.items.map((i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                      {i === "GitHub" && <Github className="size-3.5" />}
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2024 SwiftCommerce Systems Inc.</p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <span>v4.2.0-stable</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Uptime 99.98%
            </span>
          </div>
        </div>
      </footer>

      {/* Floating cart */}
      <div className="fixed bottom-6 right-6 z-40">
        <button className="flex items-center gap-3 rounded-full bg-foreground text-background pl-4 pr-5 py-3 text-sm font-medium shadow-[0_20px_40px_-15px_rgb(0_0_0_/_0.35)] hover:opacity-90 transition-opacity">
          <span className="relative">
            <ShoppingCart className="size-4" />
            <span className="absolute -top-1.5 -right-1.5 size-4 grid place-items-center rounded-full bg-emerald-500 text-[9px] font-bold text-background">
              3
            </span>
          </span>
          <span className="tabular-nums">$1,547.00</span>
        </button>
      </div>
    </div>
  );
}
