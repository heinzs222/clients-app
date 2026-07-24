import React, { useEffect, useState } from "react";
import { getUser, onAuthChange } from "@netlify/identity";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clipboard,
  LoaderCircle,
  X
} from "lucide-react";
import { copyText } from "../lib/capi.js";
import { hasPublicSessionHint, setPublicSessionHint } from "../lib/public-session.mjs";

const publicHrefs = {
  home: "/",
  meta: "/how-to-set-up-meta-capi",
  tiktok: "/how-to-set-up-tiktok-events-api",
  google: "/how-to-set-up-google-ads-enhanced-conversions",
  guide: "/emq-guide",
  docs: "/docs",
  services: "/meta-capi-setup-service",
  platforms: "/platforms",
  blogs: "/blogs",
  privacy: "/privacy",
  terms: "/terms",
  status: "/status",
  login: "/login",
  register: "/register"
};

function RouteLink({ route, navigate, className = "", children, ariaLabel }) {
  const requiresPageLoad = ["blogs", "services", "meta", "tiktok", "google"].includes(route);

  return (
    <a
      className={className}
      href={publicHrefs[route] || "/"}
      aria-label={ariaLabel}
      onClick={navigate && !requiresPageLoad ? (event) => { event.preventDefault(); navigate(route); } : undefined}
    >
      {children}
    </a>
  );
}

export function Brand({ compact = false }) {
  return (
    <span className={`brand ${compact ? "compact" : ""}`}>
      <img
        className="brandMark"
        src="/capi-tracker-mark.png"
        alt=""
        width="254"
        height="236"
      />
      <span className="brandName">Simple CAPI</span>
    </span>
  );
}

function usePublicSession(suppliedUser) {
  const hasSuppliedUser = suppliedUser !== undefined;
  const [session, setSession] = useState({
    status: hasSuppliedUser || hasPublicSessionHint() ? "ready" : "checking",
    authenticated: hasSuppliedUser ? Boolean(suppliedUser) : hasPublicSessionHint()
  });

  useEffect(() => {
    if (hasSuppliedUser) {
      setSession({ status: "ready", authenticated: Boolean(suppliedUser) });
      return undefined;
    }

    let active = true;
    getUser()
      .then((currentUser) => {
        if (!active) return;
        setPublicSessionHint(Boolean(currentUser));
        setSession({ status: "ready", authenticated: Boolean(currentUser) });
      })
      .catch(() => {
        if (active && !hasPublicSessionHint()) {
          setSession({ status: "ready", authenticated: false });
        }
      });

    const unsubscribe = onAuthChange((_event, currentUser) => {
      if (!active) return;
      setPublicSessionHint(Boolean(currentUser));
      setSession({ status: "ready", authenticated: Boolean(currentUser) });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [hasSuppliedUser, suppliedUser]);

  return hasSuppliedUser
    ? { status: "ready", authenticated: Boolean(suppliedUser) }
    : session;
}

export function PublicHeader({ route, navigate, user }) {
  const session = usePublicSession(user);

  return (
    <header className="publicHeader">
      <div className="publicHeaderInner">
        <RouteLink className="brandButton" route="home" navigate={navigate} ariaLabel="Simple CAPI home">
          <Brand compact />
        </RouteLink>
        <nav className="publicNav" aria-label="Main navigation">
          <RouteLink route="meta" navigate={navigate}>Meta CAPI</RouteLink>
          <RouteLink route="tiktok" navigate={navigate}>TikTok</RouteLink>
          <RouteLink route="google" navigate={navigate}>Google Ads</RouteLink>
          <RouteLink className={route === "blogs" ? "active" : ""} route="blogs" navigate={navigate}>Guides</RouteLink>
          <RouteLink className={route === "services" ? "active" : ""} route="services" navigate={navigate}>Done-for-you</RouteLink>
        </nav>
        <div className={`publicActions ${session.status === "checking" ? "checking" : ""}`}>
          {session.status === "checking" ? (
            <span className="publicSessionPlaceholder" aria-hidden="true" />
          ) : session.authenticated ? (
            navigate ? (
              <button className="button primary small" type="button" onClick={() => navigate("dashboard")}>Dashboard</button>
            ) : (
              <a className="button primary small" href="/?view=dashboard">Dashboard</a>
            )
          ) : (
            <>
              <RouteLink className="button ghost small" route="login" navigate={navigate}>Log in</RouteLink>
              <RouteLink className="button primary small" route="register" navigate={navigate}>Register</RouteLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter({ navigate }) {
  return (
    <footer className="publicFooter">
      <div className="publicFooterInner">
        <div>
          <Brand compact />
          <p>&copy; 2026 Simple CAPI. All rights reserved.</p>
        </div>
        <nav aria-label="Legal navigation">
          <RouteLink route="meta" navigate={navigate}>Easy Meta CAPI setup</RouteLink>
          <RouteLink route="tiktok" navigate={navigate}>TikTok Events API</RouteLink>
          <RouteLink route="google" navigate={navigate}>Google enhanced conversions</RouteLink>
          <RouteLink route="blogs" navigate={navigate}>Tracking guides</RouteLink>
          <RouteLink route="privacy" navigate={navigate}>Privacy Policy</RouteLink>
          <RouteLink route="terms" navigate={navigate}>Terms of Service</RouteLink>
          <RouteLink route="docs" navigate={navigate}>Product overview</RouteLink>
          <RouteLink route="services" navigate={navigate}>Done-for-you setup</RouteLink>
          <RouteLink route="status" navigate={navigate}>Status</RouteLink>
        </nav>
      </div>
    </footer>
  );
}

export function Field({ label, hint, error, children, className = "" }) {
  return (
    <label className={`field ${className}`}>
      <span className="fieldLabel">{label}</span>
      {children}
      {error ? <small className="fieldError">{error}</small> : hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function InputShell({ icon: Icon, action, children, code = false }) {
  return (
    <span className={`inputShell ${code ? "code" : ""}`}>
      {Icon ? <Icon size={18} aria-hidden="true" /> : null}
      {children}
      {action}
    </span>
  );
}

export function Notice({ tone = "info", title, children }) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div className={`notice ${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon size={19} />
      <div>
        {title ? <strong>{title}</strong> : null}
        <span>{children}</span>
      </div>
    </div>
  );
}

export function Spinner({ label = "Loading" }) {
  return (
    <span className="spinnerLabel" role="status">
      <LoaderCircle className="spin" size={18} /> {label}
    </span>
  );
}

export function CopyButton({ value, label = "Copy", compact = false, className = "" }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await copyText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      className={`copyButton ${compact ? "compact" : ""} ${className}`}
      type="button"
      onClick={copy}
      title={copied ? "Copied" : label}
      aria-label={copied ? "Copied" : label}
    >
      {copied ? <Check size={16} /> : <Clipboard size={16} />}
      {!compact ? (copied ? "Copied" : label) : null}
    </button>
  );
}

export function StatusPill({ state, label }) {
  const tone = state === "active" ? "active" : state === "pending" ? "pending" : "error";
  return <span className={`statusPill ${tone}`}><i />{label || tone}</span>;
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="emptyState">
      {Icon ? <span><Icon size={24} /></span> : null}
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}

export function Modal({ open, title, children, onClose, actions }) {
  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modalBackdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header>
          <h2 id="modal-title">{title}</h2>
          <button className="iconOnly" type="button" onClick={onClose} aria-label="Close dialog" title="Close">
            <X size={19} />
          </button>
        </header>
        <div className="modalBody">{children}</div>
        {actions ? <footer>{actions}</footer> : null}
      </section>
    </div>
  );
}
