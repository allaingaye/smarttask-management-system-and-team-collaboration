import { useEffect, useState } from "react";
import {
  Bot, Bell, BarChart3, Shield, Users, Zap, CheckCircle2, ArrowRight,
  Sparkles, Workflow, Crown, UserCog, User, Clock, TrendingUp, GitBranch,
  MessageSquare, Activity, Moon, Lock, Gauge,
} from "lucide-react";

/**
 * SmartTask — Homepage (fully self-contained, single file)
 * --------------------------------------------------------
 * Drop this file into your /pages folder and render <Homepage />.
 *
 * Requirements:
 *   1. Tailwind CSS v4 (already in your project)
 *   2. `npm i lucide-react`
 *
 * That's it. No `<link>` tags in your index.html, no edits to your
 * global styles.css, no Tailwind config changes. Fonts are injected
 * at runtime, and all design tokens / custom utilities live in the
 * scoped <Styles /> block below — keyed to `.smarttask-root` so they
 * cannot leak into the rest of your app.
 */
export default function Homepage() {
  useFontLoader();
  return (
    <div className="smarttask-root">
      <Styles />
      <div className="st-shell min-h-screen overflow-x-hidden">
        <Nav />
        <Hero />
        <LogosBar />
        <Features />
        <Roles />
        <AIInsights />
        <Notifications />
        <Analytics />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}

/* ---------- FONT LOADER (injects Google Fonts <link>s at runtime) ---------- */
function useFontLoader() {
  useEffect(() => {
    const HREFS = [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ];
    const created = [];
    for (const attrs of HREFS) {
      const exists = document.head.querySelector(`link[href="${attrs.href}"]`);
      if (exists) continue;
      const link = document.createElement("link");
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === "crossOrigin") link.crossOrigin = v;
        else link.setAttribute(k, v);
      });
      link.setAttribute("data-smarttask-font", "1");
      document.head.appendChild(link);
      created.push(link);
    }
    return () => created.forEach((l) => l.remove());
  }, []);
}

/* ---------- SCOPED STYLES (all custom CSS lives here, prefixed .smarttask-root) ---------- */
function Styles() {
  // Plain CSS — no @apply, no Tailwind directives — so it works in any project.
  const css = `
.smarttask-root {
  /* design tokens */
  --st-bg: oklch(0.16 0.02 270);
  --st-fg: oklch(0.98 0.005 270);
  --st-card: oklch(0.21 0.025 270);
  --st-muted-fg: oklch(0.72 0.025 270);
  --st-accent: oklch(0.32 0.05 285);
  --st-accent-fg: oklch(0.98 0.005 270);
  --st-primary: oklch(0.7 0.19 290);
  --st-primary-fg: oklch(0.12 0.02 270);
  --st-border: oklch(1 0 0 / 10%);

  --st-brand: oklch(0.72 0.18 295);
  --st-brand-2: oklch(0.74 0.16 220);
  --st-brand-3: oklch(0.78 0.17 165);
  --st-success: oklch(0.78 0.17 160);
  --st-warning: oklch(0.82 0.16 80);

  --st-gradient-brand: linear-gradient(135deg, oklch(0.72 0.2 295), oklch(0.74 0.16 220) 60%, oklch(0.78 0.17 165));
  --st-shadow-glow: 0 0 60px -10px oklch(0.72 0.2 295 / 0.55);
  --st-shadow-card: 0 20px 60px -20px oklch(0.05 0 0 / 0.6);

  --st-font-display: "Space Grotesk", system-ui, sans-serif;
  --st-font-sans: "Inter", system-ui, sans-serif;
  --st-font-mono: "JetBrains Mono", ui-monospace, monospace;
}

/* Base shell — backdrop + base typography (scoped to homepage only) */
.smarttask-root .st-shell {
  background-color: var(--st-bg);
  color: var(--st-fg);
  font-family: var(--st-font-sans);
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.72 0.2 295 / 0.18), transparent 60%),
    radial-gradient(ellipse 60% 40% at 90% 10%, oklch(0.74 0.16 220 / 0.12), transparent 60%);
  background-attachment: fixed;
  scroll-behavior: smooth;
}
.smarttask-root .st-shell h1,
.smarttask-root .st-shell h2,
.smarttask-root .st-shell h3,
.smarttask-root .st-shell h4 {
  font-family: var(--st-font-display);
  letter-spacing: -0.02em;
}

/* Color / token utility classes — scoped so they don't collide with your app */
.smarttask-root .text-foreground { color: var(--st-fg); }
.smarttask-root .text-muted-foreground { color: var(--st-muted-fg); }
.smarttask-root .text-primary { color: var(--st-primary); }
.smarttask-root .text-primary-foreground { color: var(--st-primary-fg); }
.smarttask-root .text-accent-foreground { color: var(--st-accent-fg); }
.smarttask-root .text-background { color: var(--st-bg); }

.smarttask-root .bg-card { background-color: var(--st-card); }
.smarttask-root .bg-background { background-color: var(--st-bg); }
.smarttask-root .bg-accent { background-color: var(--st-accent); }
.smarttask-root .bg-card\\/50 { background-color: color-mix(in oklab, var(--st-card) 50%, transparent); }
.smarttask-root .bg-background\\/40 { background-color: color-mix(in oklab, var(--st-bg) 40%, transparent); }
.smarttask-root .bg-background\\/60 { background-color: color-mix(in oklab, var(--st-bg) 60%, transparent); }
.smarttask-root .bg-background\\/70 { background-color: color-mix(in oklab, var(--st-bg) 70%, transparent); }
.smarttask-root .hover\\:bg-card:hover { background-color: var(--st-card); }
.smarttask-root .hover\\:bg-accent\\/80:hover { background-color: color-mix(in oklab, var(--st-accent) 80%, transparent); }

.smarttask-root .border-border { border-color: var(--st-border); }
.smarttask-root .border-card { border-color: var(--st-card); }
.smarttask-root .border-primary\\/60 { border-color: color-mix(in oklab, var(--st-primary) 60%, transparent); }
.smarttask-root .border-border\\/60 { border-color: color-mix(in oklab, var(--st-border) 60%, transparent); }
.smarttask-root .hover\\:border-primary\\/50:hover { border-color: color-mix(in oklab, var(--st-primary) 50%, transparent); }

.smarttask-root .font-display { font-family: var(--st-font-display); }
.smarttask-root .font-mono { font-family: var(--st-font-mono); }

/* Custom utility classes */
.smarttask-root .glass {
  background: color-mix(in oklab, var(--st-card) 60%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid color-mix(in oklab, white 8%, transparent);
}
.smarttask-root .text-gradient {
  background: var(--st-gradient-brand);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.smarttask-root .glow-ring { box-shadow: var(--st-shadow-glow); }

/* Keyframes (global names; safe — prefixed) */
@keyframes st-float-y { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
@keyframes st-pulse-dot { 0%,100% { opacity: 1; transform: scale(1) } 50% { opacity: .5; transform: scale(1.3) } }
@keyframes st-shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
@keyframes st-blob { 0%,100% { transform: translate(0,0) scale(1) } 33% { transform: translate(30px,-20px) scale(1.1) } 66% { transform: translate(-20px,20px) scale(.95) } }

.smarttask-root .animate-float { animation: st-float-y 6s ease-in-out infinite; }
.smarttask-root .animate-pulse-dot { animation: st-pulse-dot 1.6s ease-in-out infinite; }
.smarttask-root .animate-blob { animation: st-blob 14s ease-in-out infinite; }
.smarttask-root .animate-shimmer {
  background: linear-gradient(90deg, transparent, oklch(1 0 0 / 0.08), transparent);
  background-size: 200% 100%;
  animation: st-shimmer 2.4s linear infinite;
}
`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

/* CSS-var shortcuts used in inline styles below */
const T = {
  gradient: "var(--st-gradient-brand)",
  brand: "var(--st-brand)",
  brand2: "var(--st-brand-2)",
  brand3: "var(--st-brand-3)",
  success: "var(--st-success)",
  warning: "var(--st-warning)",
  shadowCard: "var(--st-shadow-card)",
};

/* ---------- NAV ---------- */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20);
    f(); window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  const links = [
    { href: "#features", label: "Features" },
    { href: "#roles", label: "Roles" },
    { href: "#ai", label: "AI Insights" },
    { href: "#analytics", label: "Analytics" },
  ];
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all ${scrolled ? "py-3" : "py-5"}`}>
      <div className="mx-auto max-w-6xl px-4">
        <div className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-all ${scrolled ? "glass" : ""}`}
             style={scrolled ? { boxShadow: T.shadowCard } : undefined}>
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative h-8 w-8 rounded-lg grid place-items-center" style={{ background: T.gradient }}>
              <Sparkles className="h-4 w-4 text-background" />
              <div className="absolute inset-0 rounded-lg blur-md opacity-60 -z-10" style={{ background: T.gradient }} />
            </div>
            <span className="font-display font-semibold text-lg tracking-tight">SmartTask</span>
          </a>
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <a key={l.href} href={l.href} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="/login" className="hidden sm:inline-flex px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</a>
            <a href="/login" className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
               style={{ background: T.gradient }}>
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <section className="relative pt-36 pb-24 px-4">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-20 h-80 w-80 rounded-full blur-3xl opacity-40 animate-blob"
             style={{ background: "oklch(0.72 0.2 295 / 0.5)" }} />
        <div className="absolute top-40 right-0 h-96 w-96 rounded-full blur-3xl opacity-30 animate-blob"
             style={{ background: "oklch(0.74 0.16 220 / 0.5)", animationDelay: "-4s" }} />
      </div>

      <div className="relative mx-auto max-w-6xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground mb-6">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse-dot" style={{ background: T.brand3 }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: T.brand3 }} />
          </span>
          New — AI workload balancer is live
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight max-w-4xl mx-auto">
          Smarter tasks. <br className="hidden md:block" />
          <span className="text-gradient">Sharper teams.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          SmartTask blends AI insights, real-time collaboration, and role-based control
          into one calm, beautiful workspace built for managers and makers.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a href="#cta" className="group inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium text-primary-foreground glow-ring transition-transform hover:scale-[1.03]"
             style={{ background: T.gradient }}>
            Start free <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a href="#features" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium glass hover:bg-card transition-colors">
            Explore features
          </a>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" style={{ color: T.success }} /> JWT secured</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" style={{ color: T.success }} /> Real-time</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" style={{ color: T.success }} /> Role-based</span>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  const [tab, setTab] = useState("board");
  return (
    <div className="mt-16 relative mx-auto max-w-5xl">
      <div className="absolute -inset-6 rounded-3xl blur-3xl opacity-50 -z-10" style={{ background: T.gradient }} />
      <div className="glass rounded-3xl p-3 md:p-4" style={{ boxShadow: T.shadowCard }}>
        <div className="flex items-center justify-between px-2 pb-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "oklch(0.7 0.2 25)" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "oklch(0.82 0.16 80)" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "oklch(0.78 0.17 160)" }} />
          </div>
          <div className="flex gap-1 text-xs">
            {["board", "ai", "analytics"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md capitalize transition-colors ${tab === t ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground font-mono">smarttask.app</div>
        </div>

        <div className="rounded-2xl bg-background/60 border border-border p-4 min-h-[360px]">
          {tab === "board" && <BoardPreview />}
          {tab === "ai" && <AIPreview />}
          {tab === "analytics" && <AnalyticsPreview />}
        </div>
      </div>
    </div>
  );
}

function BoardPreview() {
  const cols = [
    { name: "To do", color: T.brand2, items: ["Define onboarding flow", "Audit auth tokens", "Wireframe sprint board"] },
    { name: "In progress", color: T.brand, items: ["Real-time notifications", "AI overdue risk model"] },
    { name: "Done", color: T.success, items: ["JWT role middleware", "Project CRUD", "Member invites"] },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-3 text-left">
      {cols.map(c => (
        <div key={c.name} className="rounded-xl bg-card/50 p-3">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium">
            <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
            {c.name}
            <span className="ml-auto text-xs text-muted-foreground">{c.items.length}</span>
          </div>
          <div className="space-y-2">
            {c.items.map(t => (
              <div key={t} className="group rounded-lg bg-background/70 border border-border p-3 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="text-sm">{t}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> 2d</span>
                  <div className="flex -space-x-1.5">
                    <span className="h-5 w-5 rounded-full border border-card" style={{ background: T.brand }} />
                    <span className="h-5 w-5 rounded-full border border-card" style={{ background: T.brand2 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AIPreview() {
  const insights = [
    { icon: TrendingUp, color: T.brand, title: "Workload imbalance detected", body: "Maya is overloaded by 38% this sprint. Reassign 2 tasks to Theo to balance." },
    { icon: Clock, color: T.warning, title: "Overdue risk: Auth refactor", body: "Task is 85% likely to miss the Friday deadline based on velocity." },
    { icon: Sparkles, color: T.brand3, title: "Prioritization tip", body: "Pull \u201CSchema migration\u201D forward — 4 downstream tasks depend on it." },
  ];
  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Bot className="h-4 w-4" style={{ color: T.brand }} /> AI assistant · live recommendations
      </div>
      {insights.map((i, k) => (
        <div key={k} className="rounded-xl glass p-4 flex gap-3 items-start hover:translate-x-0.5 transition-transform">
          <div className="h-9 w-9 rounded-lg grid place-items-center shrink-0" style={{ background: `color-mix(in oklab, ${i.color} 22%, transparent)` }}>
            <i.icon className="h-4 w-4" style={{ color: i.color }} />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{i.title}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{i.body}</div>
          </div>
          <button className="text-xs px-2.5 py-1.5 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 transition-colors">Apply</button>
        </div>
      ))}
    </div>
  );
}

function AnalyticsPreview() {
  const bars = [40, 65, 50, 78, 62, 88, 72];
  return (
    <div className="grid md:grid-cols-3 gap-4 text-left">
      <Stat label="Total projects" value="48" trend="+12%" />
      <Stat label="Completion rate" value="87%" trend="+4%" />
      <Stat label="Overdue tasks" value="6" trend="-23%" good />
      <div className="md:col-span-3 rounded-xl bg-card/50 p-4">
        <div className="text-sm text-muted-foreground mb-3">Weekly velocity</div>
        <div className="flex items-end gap-2 h-32">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%`, background: T.gradient, opacity: 0.4 + i * 0.08 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, trend, good }) {
  return (
    <div className="rounded-xl bg-card/50 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-3xl mt-1">{value}</div>
      <div className="text-xs mt-1" style={{ color: good ? T.success : T.brand2 }}>{trend} vs last week</div>
    </div>
  );
}

/* ---------- LOGOS ---------- */
function LogosBar() {
  const labels = ["Django Channels", "React", "JWT Auth", "WebSockets", "PostgreSQL", "OpenAI"];
  return (
    <section className="py-10 border-y border-border/60">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-5">Built on a battle-tested stack</div>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
          {labels.map(l => <span key={l} className="hover:text-foreground transition-colors">{l}</span>)}
        </div>
      </div>
    </section>
  );
}

/* ---------- FEATURES ---------- */
function Features() {
  const items = [
    { icon: Workflow, title: "Projects & tasks, done right", body: "Full CRUD for projects and tasks, scoped permissions, and clean traceability across every change.", color: T.brand },
    { icon: Bell, title: "Real-time notifications", body: "Django Channels + WebSockets keep your team in sync — new tasks, overdue alerts, project updates.", color: T.brand2 },
    { icon: Bot, title: "AI insights", body: "Workload balance, overdue risk prediction, prioritization tips, and personal task guidance.", color: T.brand3 },
    { icon: BarChart3, title: "Analytics dashboard", body: "Aggregated metrics, completion rates, overdue trends — visualized for leaders and contributors alike.", color: T.warning },
    { icon: Shield, title: "Role-based security", body: "JWT tokens and role-aware endpoints. Admin, Manager, Member — each sees exactly what they should.", color: T.brand },
    { icon: Moon, title: "Designed for focus", body: "Dark mode, calm typography, responsive layouts, role-specific sidebars. Beautiful by default.", color: T.brand2 },
  ];
  return (
    <section id="features" className="py-28 px-4">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow="Features" title={<>Everything your team needs, <span className="text-gradient">nothing it doesn't</span></>}
          sub="A focused toolkit: projects, tasks, notifications, analytics, and AI — all wired together." />
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((f, i) => (
            <div key={i} className="group relative rounded-2xl glass p-6 hover:-translate-y-1 transition-transform overflow-hidden">
              <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity"
                   style={{ background: f.color }} />
              <div className="h-11 w-11 rounded-xl grid place-items-center mb-4" style={{ background: `color-mix(in oklab, ${f.color} 22%, transparent)` }}>
                <f.icon className="h-5 w-5" style={{ color: f.color }} />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, sub }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">{eyebrow}</div>
      <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight">{title}</h2>
      <p className="mt-4 text-muted-foreground">{sub}</p>
    </div>
  );
}

/* ---------- ROLES ---------- */
function Roles() {
  const [role, setRole] = useState("manager");
  const data = {
    admin: {
      icon: Crown, color: T.brand,
      title: "Admin", tag: "Full control",
      perks: ["Manage all projects & users", "Configure roles and policies", "Org-wide analytics", "Audit logs & traceability"],
    },
    manager: {
      icon: UserCog, color: T.brand2,
      title: "Manager", tag: "Project authority",
      perks: ["Create & edit owned projects", "Assign tasks to team members", "Project-level AI summaries", "Workload & completion reports"],
    },
    member: {
      icon: User, color: T.brand3,
      title: "Member", tag: "Focused execution",
      perks: ["View & update assigned tasks", "Personal AI guidance", "Real-time task notifications", "Personal productivity stats"],
    },
  };
  const r = data[role];
  return (
    <section id="roles" className="py-28 px-4">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow="Roles" title={<>One platform, <span className="text-gradient">three perspectives</span></>}
          sub="Scoped authority by design. Everyone sees what's relevant — nothing more." />
        <div className="mt-12 grid lg:grid-cols-[1fr_1.4fr] gap-6">
          <div className="space-y-2">
            {Object.keys(data).map(k => {
              const d = data[k];
              const active = role === k;
              return (
                <button key={k} onClick={() => setRole(k)}
                  className={`w-full text-left rounded-xl p-4 border transition-all flex items-center gap-3 ${active ? "border-primary/60 bg-card" : "border-border glass hover:bg-card"}`}>
                  <div className="h-10 w-10 rounded-lg grid place-items-center" style={{ background: `color-mix(in oklab, ${d.color} 22%, transparent)` }}>
                    <d.icon className="h-5 w-5" style={{ color: d.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{d.title}</div>
                    <div className="text-xs text-muted-foreground">{d.tag}</div>
                  </div>
                  {active && <ArrowRight className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
          <div className="rounded-2xl glass p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl opacity-30" style={{ background: r.color }} />
            <div className="relative">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <r.icon className="h-3.5 w-3.5" style={{ color: r.color }} /> {r.title} role
              </div>
              <h3 className="font-display text-3xl mt-3">What a {r.title} can do</h3>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                {r.perks.map(p => (
                  <li key={p} className="flex items-start gap-2.5 rounded-lg bg-background/40 border border-border p-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: r.color }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- AI INSIGHTS ---------- */
function AIInsights() {
  return (
    <section id="ai" className="py-28 px-4">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">AI Insights</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
            An assistant that <span className="text-gradient">thinks ahead</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg">
            SmartTask studies your team's rhythm to recommend balanced workloads,
            flag overdue risk before it happens, and surface what truly matters next.
          </p>
          <ul className="mt-7 space-y-3">
            {[
              { icon: Gauge, t: "Workload balancing", d: "Automatic suggestions to redistribute overloaded members." },
              { icon: Activity, t: "Overdue risk scoring", d: "Predicts which tasks are likely to slip — before they do." },
              { icon: GitBranch, t: "Smart prioritization", d: "Surfaces blockers and dependencies you should tackle first." },
            ].map((x, i) => (
              <li key={i} className="flex gap-3 items-start">
                <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0" style={{ background: `color-mix(in oklab, ${T.brand} 22%, transparent)` }}>
                  <x.icon className="h-5 w-5" style={{ color: T.brand }} />
                </div>
                <div>
                  <div className="font-medium">{x.t}</div>
                  <div className="text-sm text-muted-foreground">{x.d}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-3xl blur-3xl opacity-40 -z-10" style={{ background: T.gradient }} />
          <div className="glass rounded-2xl p-5" style={{ boxShadow: T.shadowCard }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg grid place-items-center" style={{ background: T.gradient }}>
                <Bot className="h-4 w-4 text-background" />
              </div>
              <div>
                <div className="text-sm font-medium">SmartTask AI</div>
                <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse-dot" style={{ background: T.success }} /> analyzing sprint 14
                </div>
              </div>
            </div>
            <ChatBubble who="ai">
              I noticed <b>3 tasks</b> assigned to Maya are due Friday but her velocity averages 2/week.
              Want me to reassign one to Theo (currently 35% under capacity)?
            </ChatBubble>
            <ChatBubble who="me">Yes, balance it.</ChatBubble>
            <ChatBubble who="ai">
              Done. Reassigned <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-accent">TASK-218 · API refactor</span> to Theo.
              Predicted on-time delivery rose from <span style={{ color: T.warning }}>62%</span> to{" "}
              <span style={{ color: T.success }}>91%</span>.
            </ChatBubble>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-background/60 border border-border p-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground ml-2" />
              <input className="flex-1 bg-transparent text-sm outline-none py-2" placeholder="Ask SmartTask anything…" />
              <button className="text-xs px-3 py-1.5 rounded-md text-primary-foreground" style={{ background: T.gradient }}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({ who, children }) {
  const mine = who === "me";
  return (
    <div className={`flex mb-2 ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] text-sm rounded-2xl px-4 py-2.5 ${mine ? "text-primary-foreground" : "bg-card border border-border"}`}
           style={mine ? { background: T.gradient } : undefined}>
        {children}
      </div>
    </div>
  );
}

/* ---------- NOTIFICATIONS ---------- */
function Notifications() {
  const items = [
    { icon: Bell, color: T.brand, title: "New task assigned", body: "“Build analytics endpoint” → you", time: "just now" },
    { icon: Clock, color: T.warning, title: "Overdue alert", body: "Schema migration is 1 day overdue", time: "2m" },
    { icon: Users, color: T.brand2, title: "Project updated", body: "Maya updated SmartTask v2 milestones", time: "8m" },
    { icon: CheckCircle2, color: T.success, title: "Task completed", body: "Theo finished JWT middleware", time: "1h" },
  ];
  return (
    <section className="py-28 px-4">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
        <div className="space-y-3">
          {items.map((n, i) => (
            <div key={i} className="rounded-xl glass p-4 flex items-start gap-3 relative overflow-hidden">
              <div className="absolute inset-0 animate-shimmer opacity-50" />
              <div className="relative h-10 w-10 rounded-lg grid place-items-center shrink-0" style={{ background: `color-mix(in oklab, ${n.color} 22%, transparent)` }}>
                <n.icon className="h-5 w-5" style={{ color: n.color }} />
              </div>
              <div className="relative flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{n.title}</span>
                  <span className="text-xs text-muted-foreground">· {n.time}</span>
                </div>
                <div className="text-sm text-muted-foreground">{n.body}</div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">Real-time</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
            Stay in sync, <span className="text-gradient">instantly</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Powered by Django Channels and WebSockets, SmartTask pushes new tasks,
            overdue warnings, and project updates the moment they happen — no refresh required.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["WebSockets", "Channels", "Toasts", "Email digest"].map(t => (
              <span key={t} className="text-xs glass rounded-full px-3 py-1.5 text-muted-foreground">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- ANALYTICS ---------- */
function Analytics() {
  return (
    <section id="analytics" className="py-28 px-4">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow="Analytics" title={<>Decisions backed by <span className="text-gradient">real data</span></>}
          sub="Aggregate metrics across projects, tasks, and teams. Clarity for admins, focus for everyone else." />
        <div className="mt-12 grid md:grid-cols-4 gap-4">
          {[
            { label: "Projects", value: "128", icon: Workflow },
            { label: "Active tasks", value: "1,402", icon: Zap },
            { label: "Completion rate", value: "92%", icon: CheckCircle2 },
            { label: "Overdue", value: "14", icon: Clock },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl glass p-5">
              <s.icon className="h-5 w-5 text-muted-foreground" />
              <div className="font-display text-3xl mt-3">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function CTA() {
  return (
    <section id="cta" className="py-28 px-4">
      <div className="mx-auto max-w-4xl relative rounded-3xl glass p-10 md:p-16 text-center overflow-hidden">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full blur-3xl opacity-50 animate-blob" style={{ background: "oklch(0.72 0.2 295 / 0.55)" }} />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full blur-3xl opacity-50 animate-blob" style={{ background: "oklch(0.74 0.16 220 / 0.5)", animationDelay: "-5s" }} />
        <div className="relative">
          <Lock className="h-7 w-7 mx-auto text-muted-foreground" />
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-semibold leading-tight">
            Ready to make your team <span className="text-gradient">smarter?</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Bring AI insights, real-time collaboration, and role-based control to your workflow today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-primary-foreground glow-ring transition-transform hover:scale-[1.03]"
               style={{ background: T.gradient }}>
              Start free <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium glass hover:bg-card transition-colors">
              Book a demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FOOTER ---------- */
function Footer() {
  return (
    <footer className="border-t border-border/60 py-12 px-4">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md grid place-items-center" style={{ background: T.gradient }}>
            <Sparkles className="h-3 w-3 text-background" />
          </div>
          <span className="font-display font-semibold text-foreground">SmartTask</span>
          <span>· © {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-5">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
