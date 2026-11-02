import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

/**
 * Shared mobile bottom navigation shell: a floating pill with up to four
 * destinations and a raised centre button that opens the remaining ones.
 *
 * Used by the public site, the member portal and the admin console so all three
 * share one design. It is fixed to the viewport, so the navigation never
 * scrolls away with the page content.
 *
 * items / moreItems: [{ key, label, icon, to?, onClick?, active }]
 *   - `to` renders a router link, `onClick` a button (in-app tab switching).
 */
export default function BottomNavBar({ items = [], moreItems = [], moreLabel = "More" }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const moreActive = moreItems.some((t) => t.active);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="mx-auto max-w-md px-6 pb-5">
        {open && (
          <>
            <div className="fixed inset-0 -z-10 bg-black/50 backdrop-blur-[3px]" onClick={close} />
            <div className="mx-auto mb-5 w-56 max-h-[55vh] overflow-y-auto rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
              {moreItems.map((t, i) => {
                const Icon = t.icon;
                const className = `flex w-full items-center gap-4 px-5 py-3.5 transition-colors ${
                  i > 0 ? "border-t border-white/5" : ""
                } ${t.active ? "text-primary" : "text-foreground/80 hover:text-primary"}`;
                const content = (
                  <>
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                    <span className="text-sm font-medium tracking-wide">{t.label}</span>
                  </>
                );

                return t.to ? (
                  <Link key={t.key} to={t.to} className={className} onClick={close}>
                    {content}
                  </Link>
                ) : (
                  <button
                    key={t.key}
                    type="button"
                    className={`${className} text-left`}
                    onClick={() => {
                      t.onClick?.();
                      close();
                    }}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="flex h-16 items-center rounded-full border border-primary/15 bg-background/85 px-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.55)]">
          {items.slice(0, 2).map((tab) => (
            <NavSlot key={tab.key} tab={tab} onNavigate={close} />
          ))}

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={moreLabel}
            aria-expanded={open}
            className={`mx-1 flex h-14 w-14 shrink-0 -translate-y-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background transition-all duration-300 ${
              open || moreActive
                ? "shadow-[0_0_24px_hsl(43_74%_61%/0.55)]"
                : "shadow-[0_4px_16px_hsl(43_74%_61%/0.3)]"
            }`}
          >
            <Plus className={`h-6 w-6 transition-transform duration-300 ${open ? "rotate-45" : ""}`} strokeWidth={2} />
          </button>

          {items.slice(2).map((tab) => (
            <NavSlot key={tab.key} tab={tab} onNavigate={close} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavSlot({ tab, onNavigate }) {
  const Icon = tab.icon;
  const className = `relative flex h-full flex-1 items-center justify-center transition-colors duration-200 ${
    tab.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
  }`;
  const content = (
    <>
      <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} />
      {tab.active && <span className="absolute bottom-2.5 h-1 w-1 rounded-full bg-primary shadow-[0_0_6px_hsl(43_74%_61%)]" />}
    </>
  );

  if (tab.to) {
    return (
      <Link to={tab.to} aria-label={tab.label} title={tab.label} className={className} onClick={onNavigate}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={tab.label}
      title={tab.label}
      className={className}
      onClick={() => {
        tab.onClick?.();
        onNavigate?.();
      }}
    >
      {content}
    </button>
  );
}
