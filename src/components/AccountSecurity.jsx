import React, { useEffect, useState } from "react";
import { CheckCircle2, Copy, KeyRound, LockKeyhole, LogOut, ShieldCheck } from "lucide-react";
import { Brand, Field, InputShell, Notice, Spinner } from "./UI.jsx";

export default function AccountSecurity({ user, security, onStart, onVerify, onLogout, busy }) {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (security.status === "ready" && !security.complete && !security.secret && !security.error) onStart();
  }, [security.status, security.complete, security.secret, security.error, onStart]);

  async function submit(event) {
    event.preventDefault();
    if (/^\d{6}$/.test(code)) await onVerify(code);
  }

  async function copySecret() {
    if (!security.secret) return;
    await navigator.clipboard.writeText(security.secret);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="securityGate">
      <header className="securityGateHeader"><Brand compact /><button className="button ghost" type="button" onClick={onLogout} disabled={busy}><LogOut size={17} /> Log out</button></header>
      <main className="securityGateMain">
        <section className="securityCard">
          <span className="securityIcon"><ShieldCheck size={27} /></span>
          <div className="securityTitle"><span className="eyebrow">Account verification</span><h1>Secure your free script</h1><p>Connect an authenticator app before entering the workspace. This protects your account and helps prevent repeated free-script claims.</p></div>
          {security.error ? <Notice tone="error" title="Verification unavailable">{security.error}</Notice> : null}
          {security.status === "loading" || security.status === "idle" ? <div className="securityLoading"><Spinner label="Preparing secure setup" /></div> : null}
          {security.secret ? (
            <form className="authForm" onSubmit={submit}>
              <div className="securitySteps">
                <div><span>1</span><p><strong>Open an authenticator app</strong><small>Use Google Authenticator, Microsoft Authenticator, Authy, 1Password, or another TOTP app.</small></p></div>
                <div><span>2</span><p><strong>Add the setup key</strong><small>Choose manual entry, name it Simple CAPI, and use a time-based key.</small></p></div>
              </div>
              <div className="securitySecret"><code>{security.secret.match(/.{1,4}/g)?.join(" ")}</code><button className="button secondary" type="button" onClick={copySecret}><Copy size={16} /> {copied ? "Copied" : "Copy"}</button></div>
              <Field label="6-digit authenticator code" hint="Enter the current code shown in your app.">
                <InputShell icon={KeyRound}><input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" required /></InputShell>
              </Field>
              <Notice tone="info" title="Free-script controls">One free script is allowed per verified account, network, and device. A Meta Dataset ID active on another account cannot be added here.</Notice>
              <button className="button primary full" type="submit" disabled={busy || !/^\d{6}$/.test(code)}>{busy ? <Spinner label="Verifying" /> : <><LockKeyhole size={18} /> Verify and continue</>}</button>
            </form>
          ) : security.status === "error" ? <button className="button primary full" type="button" onClick={onStart} disabled={busy}>Try again</button> : null}
        </section>
        <aside className="securityBenefits">
          <h2>What this protects</h2>
          <ul>
            <li><CheckCircle2 size={19} /><span><strong>Your account</strong><small>Authenticator verification is required before workspace access.</small></span></li>
            <li><CheckCircle2 size={19} /><span><strong>Your free script</strong><small>The first eligible script costs $0. Additional Lead or Schedule scripts remain $5 each.</small></span></li>
            <li><CheckCircle2 size={19} /><span><strong>Your datasets</strong><small>Each Meta Dataset ID stays assigned to its original account.</small></span></li>
          </ul>
          <p>Signed in as <strong>{user.email}</strong></p>
        </aside>
      </main>
    </div>
  );
}
