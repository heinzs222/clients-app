import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clipboard,
  LoaderCircle,
  X
} from "lucide-react";
import { copyText } from "../lib/capi.js";

const publicHrefs = {
  home: "/",
  guide: "/emq-guide",
  docs: "/docs",
  privacy: "/privacy",
  terms: "/terms",
  status: "/status",
  login: "/login",
  register: "/register"
};

function RouteLink({ route, navigate, className = "", children, ariaLabel }) {
  return (
    <a
      className={className}
      href={publicHrefs[route] || "/"}
      aria-label={ariaLabel}
      onClick={(event) => { event.preventDefault(); navigate(route); }}
    >
      {children}
    </a>
  );
}

export function Brand({ compact = false }) {
  return (
    <span className={`brand ${compact ? "compact" : ""}`}>
      <img className="brandMark" src="/capi-tracker-mark.png" alt="" width="254" height="236" />
      <strong className="brandName">Simple CAPI</strong>
    </span>
  );
}

export function PublicHeader({ route, navigate, user }) {
  return (
    <header className="publicHeader">
      <div className="publicHeaderInner">
        <RouteLink className="brandButton" route="home" navigate={navigate} ariaLabel="Simple CAPI home">
          <Brand compact />
        </RouteLink>
        <nav className="publicNav" aria-label="Main navigation">
          <RouteLink className={route === "home" ? "active" : ""} route="home" navigate={navigate}>Home</RouteLink>
          <RouteLink className={route === "guide" ? "active" : ""} route="guide" navigate={navigate}>Free guide</RouteLink>
          <RouteLink className={route === "docs" ? "active" : ""} route="docs" navigate={navigate}>Docs</RouteLink>
          <RouteLink className={route === "status" ? "active" : ""} route="status" navigate={navigate}>Status</RouteLink>
        </nav>
        <div className="publicActions">
          {user ? (
            <button className="button primary small" type="button" onClick={() => navigate("dashboard")}>Open dashboard</button>
          ) : (
            <RouteLink className="button ghost small" route="login" navigate={navigate}>Log in</RouteLink>
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
          <RouteLink route="privacy" navigate={navigate}>Privacy Policy</RouteLink>
          <RouteLink route="terms" navigate={navigate}>Terms of Service</RouteLink>
          <RouteLink route="guide" navigate={navigate}>Free 9.3 EMQ Guide</RouteLink>
          <RouteLink route="docs" navigate={navigate}>Documentation</RouteLink>
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
