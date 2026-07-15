import React, { useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Rocket,
  ShieldCheck
} from "lucide-react";
import { Brand, Field, InputShell, Notice, PublicFooter, PublicHeader } from "./UI.jsx";

export default function AuthScreen({
  mode,
  navigate,
  authForm,
  patchAuthForm,
  onLogin,
  onGoogleLogin,
  onRegister,
  onForgot,
  onReset,
  onPreview,
  busy,
  googleLoginEnabled,
  error,
  message,
  callbackReady
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";
  const canPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname);

  function submit(event) {
    event.preventDefault();
    if (isLogin) onLogin();
    else if (isRegister) onRegister();
    else if (isForgot) onForgot();
    else if (isReset) onReset();
  }

  const googleButton = googleLoginEnabled ? (
    <button className="button oauthButton full" type="button" onClick={onGoogleLogin} disabled={busy}>
      <span className="googleMark" aria-hidden="true">G</span>
      Continue with Google
    </button>
  ) : null;

  const googleChoice = googleLoginEnabled ? (
    <>
      {googleButton}
      <div className="authDivider"><span>or continue with email</span></div>
    </>
  ) : null;

  if (isRegister) {
    return (
      <div className="publicPage authPage">
        <PublicHeader route="register" navigate={navigate} />
        <main className="registerMain">
          <section className="registerFormPane">
            <div className="authTitle">
              <span className="eyebrow">Secure workspace</span>
              <h1>Create your account</h1>
              <p>Create and manage client Meta tracking from one workspace.</p>
            </div>
            {googleChoice}
            <form className="authForm" onSubmit={submit}>
              <Field label="Full name">
                <InputShell>
                  <input value={authForm.fullName} onChange={(event) => patchAuthForm({ fullName: event.target.value })} placeholder="Jane Doe" autoComplete="name" required />
                </InputShell>
              </Field>
              <Field label="Work email">
                <InputShell icon={Mail}>
                  <input type="email" value={authForm.email} onChange={(event) => patchAuthForm({ email: event.target.value })} placeholder="jane@company.com" autoComplete="email" required />
                </InputShell>
              </Field>
              <Field label="Password" hint="Use at least 10 characters.">
                <InputShell icon={LockKeyhole} action={
                  <button className="inputAction" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }>
                  <input type={showPassword ? "text" : "password"} value={authForm.password} onChange={(event) => patchAuthForm({ password: event.target.value })} placeholder="Enter a strong password" autoComplete="new-password" required />
                </InputShell>
              </Field>
              <Field label="Confirm password">
                <InputShell icon={KeyRound}>
                  <input type={showPassword ? "text" : "password"} value={authForm.confirmPassword} onChange={(event) => patchAuthForm({ confirmPassword: event.target.value })} placeholder="Repeat your password" autoComplete="new-password" required />
                </InputShell>
              </Field>
              {error ? <Notice tone="error">{error}</Notice> : null}
              {message ? <Notice tone="success">{message}</Notice> : null}
              <button className="button primary full" type="submit" disabled={busy}>
                {busy ? "Creating account..." : "Create account"}{!busy ? <ArrowRight size={18} /> : null}
              </button>
            </form>
            <div className="authFineprint">
              <p>By creating an account, you agree to the <button type="button" onClick={() => navigate("terms")}>Terms</button> and <button type="button" onClick={() => navigate("privacy")}>Privacy Policy</button>.</p>
              <p>Already have an account? <button type="button" onClick={() => navigate("login")}>Log in</button></p>
            </div>
          </section>

          <aside className="registerVisual">
            <div className="registerPipeline">
              <span className="eyebrow light"><i /> Built for agencies</span>
              <h2>Client tracking without the setup drag.</h2>
              <p>Create one setup per client and get a ready-to-paste installation script in minutes.</p>
              <ul>
                <li><span><ShieldCheck size={19} /></span><div><strong>Secure setup</strong><small>Sensitive credentials never appear in installation code.</small></div></li>
                <li><span><Rocket size={19} /></span><div><strong>Ready in minutes</strong><small>Add the client, choose the event, and paste one script.</small></div></li>
                <li><span><Check size={19} /></span><div><strong>Private workspace</strong><small>Manage only the client setups owned by your account.</small></div></li>
              </ul>
            </div>
          </aside>
        </main>
        <PublicFooter navigate={navigate} />
      </div>
    );
  }

  const title = isForgot ? "Recover access" : isReset ? "Set a new password" : "Welcome back";
  const description = isForgot
    ? "Enter your account email and we will send a secure recovery link."
    : isReset
      ? "Complete the recovery flow with a new password."
      : "Log in to manage your client endpoints.";

  return (
    <div className="publicPage authPage">
      <main className="loginMain">
        <button className="brandButton authBrand" type="button" onClick={() => navigate("home")}><Brand compact /></button>
        <section className="loginCard">
          <header>
            <span className="loginIcon"><img src="/capi-tracker-mark.png" alt="" width="254" height="236" /></span>
            <h1>{title}</h1>
            <p>{description}</p>
          </header>
          <form className="authForm" onSubmit={submit}>
            {!isReset ? (
              <Field label="Email address">
                <InputShell icon={Mail}>
                  <input type="email" value={authForm.email} onChange={(event) => patchAuthForm({ email: event.target.value })} placeholder="developer@company.com" autoComplete="email" required />
                </InputShell>
              </Field>
            ) : null}

            {isLogin || isReset ? (
              <Field label={isReset ? "New password" : "Password"} className="passwordField" hint={isReset ? "Use at least 10 characters." : undefined}>
                {isLogin ? <button className="fieldAction" type="button" onClick={() => navigate("forgot")}>Forgot password?</button> : null}
                <InputShell icon={LockKeyhole} action={
                  <button className="inputAction" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }>
                  <input type={showPassword ? "text" : "password"} value={authForm.password} onChange={(event) => patchAuthForm({ password: event.target.value })} placeholder="Enter your password" autoComplete={isReset ? "new-password" : "current-password"} required />
                </InputShell>
              </Field>
            ) : null}

            {isReset ? (
              <Field label="Confirm password">
                <InputShell icon={KeyRound}>
                  <input type={showPassword ? "text" : "password"} value={authForm.confirmPassword} onChange={(event) => patchAuthForm({ confirmPassword: event.target.value })} placeholder="Repeat your password" autoComplete="new-password" required />
                </InputShell>
              </Field>
            ) : null}

            {error ? <Notice tone="error">{error}</Notice> : null}
            {message ? <Notice tone="success">{message}</Notice> : null}
            {isReset && !callbackReady ? <Notice tone="warning">Open this page from the secure recovery or invitation email link.</Notice> : null}

            <button className="button primary full" type="submit" disabled={busy || (isReset && !callbackReady)}>
              {busy ? "Working..." : isForgot ? "Send recovery link" : isReset ? "Update password" : "Log in"}
              {!busy ? <ArrowRight size={18} /> : null}
            </button>
          </form>

          {isLogin && googleLoginEnabled ? (
            <div className="loginOAuthPanel">
              <div className="authDivider"><span>or continue with</span></div>
              {googleButton}
            </div>
          ) : null}

          <div className="authFineprint">
            {isLogin ? <p>Need an account? <button type="button" onClick={() => navigate("register")}>Create one</button></p> : null}
            {isForgot || isReset ? <p><button type="button" onClick={() => navigate("login")}>Back to login</button></p> : null}
          </div>
          {canPreview && isLogin ? <button className="previewButton" type="button" onClick={onPreview}>Preview the local workspace</button> : null}
        </section>
      </main>
      <PublicFooter navigate={navigate} />
    </div>
  );
}
