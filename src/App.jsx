import React, { lazy, useCallback, useEffect, useMemo, useState } from "react";
import {
  AUTH_EVENTS,
  acceptInvite,
  getUser,
  handleAuthCallback,
  login,
  logout,
  onAuthChange,
  requestPasswordRecovery,
  signup,
  updateUser
} from "@netlify/identity";
import { Brand, PublicFooter } from "./components/UI.jsx";
import { capiRequest } from "./lib/api.js";
import { friendlyAuthError } from "./lib/auth-errors.mjs";
import { clearMalformedAuthSession } from "./lib/auth-session.mjs";

const AuthScreen = lazy(() => import("./components/AuthScreen.jsx"));
const Workspace = lazy(() => import("./components/Workspace.jsx"));
const HomePage = lazy(() => import("./components/PublicPages.jsx").then((module) => ({ default: module.HomePage })));
const ComingSoonPage = lazy(() => import("./components/PublicPages.jsx").then((module) => ({ default: module.ComingSoonPage })));
const DocsPage = lazy(() => import("./components/PublicPages.jsx").then((module) => ({ default: module.DocsPage })));
const PrivacyPage = lazy(() => import("./components/PublicPages.jsx").then((module) => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import("./components/PublicPages.jsx").then((module) => ({ default: module.TermsPage })));
const StatusPage = lazy(() => import("./components/PublicPages.jsx").then((module) => ({ default: module.StatusPage })));

const PUBLIC_ROUTES = new Set(["home", "docs", "privacy", "terms", "status"]);
const AUTH_ROUTES = new Set(["login", "register", "forgot", "reset"]);
const WORKSPACE_ROUTES = new Set(["dashboard", "endpoints", "setup", "billing", "tracking", "endpoint-settings"]);
const ALL_ROUTES = new Set([...PUBLIC_ROUTES, ...AUTH_ROUTES, ...WORKSPACE_ROUTES]);
const ROUTE_PATHS = Object.freeze({
  home: "/",
  docs: "/docs",
  privacy: "/privacy",
  terms: "/terms",
  status: "/status",
  login: "/login",
  register: "/register",
  forgot: "/forgot-password",
  reset: "/reset-password"
});
const PATH_ROUTES = Object.freeze(Object.fromEntries(Object.entries(ROUTE_PATHS).map(([route, path]) => [path, route])));
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const PRODUCT_APP_AVAILABLE = LOCAL_HOSTS.has(window.location.hostname.toLowerCase());

function routeFromUrl() {
  const queryRoute = new URLSearchParams(window.location.search).get("view");
  if (ALL_ROUTES.has(queryRoute)) return queryRoute;
  const pathRoute = PATH_ROUTES[window.location.pathname.replace(/\/$/, "") || "/"];
  if (pathRoute) return pathRoute;
  return "home";
}

function hasAuthHash() {
  return /(?:confirmation|recovery|invite|access|refresh|expires_in|token_type|provider)_token=/.test(window.location.hash);
}

function pageTitle(route) {
  const labels = {
    home: "Meta Conversions API Tracking Software - Simple CAPI",
    login: "Log in - Simple CAPI",
    register: "Create account - Simple CAPI",
    forgot: "Recover access - Simple CAPI",
    reset: "Set password - Simple CAPI",
    dashboard: "Dashboard - Simple CAPI",
    endpoints: "Endpoints - Simple CAPI",
    setup: "New endpoint - Simple CAPI",
    billing: "Billing - Simple CAPI",
    tracking: "Tracking - Simple CAPI",
    "endpoint-settings": "Endpoint settings - Simple CAPI",
    docs: "Documentation - Simple CAPI",
    privacy: "Privacy Policy - Simple CAPI",
    terms: "Terms of Service - Simple CAPI",
    status: "Status - Simple CAPI"
  };
  return labels[route] || labels.home;
}

function ProductApp() {
  const [route, setRoute] = useState(routeFromUrl);
  const [authUser, setAuthUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("checking");
  const [localPreview, setLocalPreview] = useState(() => {
    const localHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    return localHost && new URLSearchParams(window.location.search).get("preview") === "1";
  });
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [callbackReady, setCallbackReady] = useState(false);
  const [inviteToken, setInviteToken] = useState("");
  const [authForm, setAuthForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [backend, setBackend] = useState({ status: "checking", ready: false, message: "Checking service availability...", userLimit: 0 });
  const [billing, setBilling] = useState({
    status: "idle",
    required: true,
    configured: false,
    exempt: false,
    provider: "lemonsqueezy",
    price_cents: 500,
    currency: "USD",
    mode: "unconfigured",
    available_credits: 0,
    available_order_id: "",
    payments: [],
    message: "",
    error: ""
  });
  const [endpoints, setEndpoints] = useState([]);
  const [endpointsState, setEndpointsState] = useState({ status: "idle", error: "" });
  const [selectedId, setSelectedId] = useState("");
  const [createState, setCreateState] = useState({ status: "idle", error: "" });
  const [verifyState, setVerifyState] = useState({ status: "idle", healthy: false, latency_ms: 0, error: "" });
  const [updateState, setUpdateState] = useState({ status: "idle", error: "", success: false });
  const [deleteState, setDeleteState] = useState({ status: "idle", id: "", error: "" });

  const effectiveUser = useMemo(() => authUser || (localPreview ? {
    id: "local-development",
    email: "local-preview@simplecapi.test",
    name: "Local Preview"
  } : null), [authUser, localPreview]);

  const selectedEndpoint = useMemo(
    () => endpoints.find((endpoint) => endpoint.id === selectedId) || null,
    [endpoints, selectedId]
  );

  const navigate = useCallback((nextRoute, options = {}) => {
    const safeRoute = ALL_ROUTES.has(nextRoute) ? nextRoute : "home";
    const url = new URL(window.location.href);
    if (ROUTE_PATHS[safeRoute]) {
      url.pathname = ROUTE_PATHS[safeRoute];
      url.searchParams.delete("view");
    } else {
      url.pathname = "/";
      url.searchParams.set("view", safeRoute);
    }
    if (!options.keepHash) url.hash = "";
    window.history[options.replace ? "replaceState" : "pushState"]({}, "", url);
    setRoute(safeRoute);
    window.scrollTo({ top: 0, behavior: "auto" });
    if (AUTH_ROUTES.has(safeRoute)) {
      setAuthError("");
      if (!options.keepMessage) setAuthMessage("");
    }
  }, []);

  const checkBackend = useCallback(async () => {
    setBackend((current) => ({ ...current, status: "checking", ready: false, message: "Checking service availability..." }));
    try {
      const data = await capiRequest("status");
      setBackend({
        status: data.ready ? "ready" : "missing",
        ready: Boolean(data.ready),
        message: data.ready ? "Service is ready." : "Service is unavailable.",
        userLimit: data.user_limit || 0,
        billing: data.billing || null
      });
      if (data.billing) {
        setBilling((current) => ({ ...current, ...data.billing }));
      }
    } catch (error) {
      setBackend({ status: "offline", ready: false, message: error.message, userLimit: 0 });
    }
  }, []);

  const loadBilling = useCallback(async ({ message = "" } = {}) => {
    setBilling((current) => ({ ...current, status: "loading", error: "", message: message || current.message }));
    try {
      const data = await capiRequest("billing");
      setBilling((current) => ({
        ...current,
        ...(data.billing || {}),
        status: "ready",
        error: "",
        message: message || current.message
      }));
      return data.billing || null;
    } catch (error) {
      setBilling((current) => ({ ...current, status: "error", error: error.message }));
      return null;
    }
  }, []);

  const loadEndpoints = useCallback(async () => {
    setEndpointsState({ status: "loading", error: "" });
    try {
      const data = await capiRequest("list");
      const items = Array.isArray(data.endpoints) ? data.endpoints : [];
      items.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
      setEndpoints(items);
      setEndpointsState({ status: "success", error: "" });
      setSelectedId((current) => current && items.some((item) => item.id === current) ? current : "");
    } catch (error) {
      setEndpointsState({ status: "error", error: error.message });
    }
  }, []);

  useEffect(() => {
    function onPopState() { setRoute(routeFromUrl()); }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.title = pageTitle(route);
    const publicPath = ROUTE_PATHS[route];
    const indexable = PUBLIC_ROUTES.has(route);
    const canonical = document.querySelector('link[rel="canonical"]');
    const robots = document.querySelector('meta[name="robots"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (canonical && publicPath) canonical.href = `${window.location.origin}${publicPath}`;
    if (ogUrl && publicPath) ogUrl.content = `${window.location.origin}${publicPath}`;
    if (robots) robots.content = indexable
      ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      : "noindex, nofollow";
  }, [route]);

  useEffect(() => {
    checkBackend();
    initializeAuth();
  }, [checkBackend]);

  useEffect(() => {
    const unsubscribe = onAuthChange((event, user) => {
      if (event === AUTH_EVENTS.RECOVERY) {
        setAuthUser(user);
        setCallbackReady(true);
        navigate("reset", { replace: true, keepMessage: true });
      } else if (event === AUTH_EVENTS.LOGOUT) {
        setAuthUser(null);
        setEndpoints([]);
        setSelectedId("");
      } else if (user) {
        setAuthUser(user);
      }
    });
    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    if (effectiveUser && endpointsState.status === "idle") loadEndpoints();
  }, [effectiveUser, endpointsState.status, loadEndpoints]);

  useEffect(() => {
    if (effectiveUser && billing.status === "idle") loadBilling();
  }, [effectiveUser, billing.status, loadBilling]);

  useEffect(() => {
    if (!effectiveUser || route !== "setup") return;
    const url = new URL(window.location.href);
    const checkout = url.searchParams.get("checkout");
    const orderId = url.searchParams.get("order_id") || "";
    if (!checkout) return;

    async function finishCheckout() {
      if (checkout === "cancelled") {
        await loadBilling({ message: "Checkout was cancelled. You were not charged." });
      } else if (checkout === "success" && orderId) {
        setBilling((current) => ({ ...current, status: "verifying", error: "", message: "Confirming your Lemon Squeezy payment..." }));
        try {
          await capiRequest("checkout-verify", { method: "POST", body: { checkoutOrderId: orderId } });
          await loadBilling({ message: "Payment confirmed. Your endpoint credit is ready." });
        } catch (error) {
          setBilling((current) => ({ ...current, status: "error", error: error.message, message: "" }));
        }
      }
      url.searchParams.delete("checkout");
      url.searchParams.delete("order_id");
      window.history.replaceState({}, "", url);
    }

    finishCheckout();
  }, [effectiveUser, route, loadBilling]);

  useEffect(() => {
    if (!effectiveUser && WORKSPACE_ROUTES.has(route) && authStatus === "ready") {
      navigate("login", { replace: true });
    }
  }, [effectiveUser, route, authStatus, navigate]);

  useEffect(() => {
    if (effectiveUser && AUTH_ROUTES.has(route) && route !== "reset" && authStatus === "ready") {
      navigate("dashboard", { replace: true });
    }
  }, [effectiveUser, route, authStatus, navigate]);

  useEffect(() => {
    if (route === "tracking" && !selectedId && endpoints.length) setSelectedId(endpoints[0].id);
  }, [route, selectedId, endpoints]);

  function patchAuthForm(patch) {
    setAuthForm((current) => ({ ...current, ...patch }));
  }

  function resetAuthFeedback() {
    setAuthError("");
    setAuthMessage("");
  }

  function validateAuthForm({ registration = false } = {}) {
    if (!/^\S+@\S+\.\S+$/.test(authForm.email.trim())) {
      setAuthError("Enter a valid email address.");
      return false;
    }
    if (registration && authForm.fullName.trim().length < 2) {
      setAuthError("Enter your full name.");
      return false;
    }
    if (authForm.password.length < 10) {
      setAuthError("Use at least 10 characters for the password.");
      return false;
    }
    if (registration && authForm.password !== authForm.confirmPassword) {
      setAuthError("Passwords do not match.");
      return false;
    }
    return true;
  }

  async function initializeAuth() {
    setAuthStatus("checking");
    try {
      clearMalformedAuthSession();
      let callback = null;
      if (hasAuthHash()) callback = await handleAuthCallback();
      if (callback?.type === "recovery") {
        setAuthUser(callback.user);
        setCallbackReady(true);
        setAuthMessage("Recovery link verified. Set a new password.");
        navigate("reset", { replace: true, keepMessage: true });
      } else if (callback?.type === "invite") {
        setInviteToken(callback.token || "");
        setCallbackReady(true);
        setAuthMessage("Invitation verified. Set your password.");
        navigate("reset", { replace: true, keepMessage: true });
      } else if (callback?.user) {
        setAuthUser(callback.user);
        setAuthMessage(callback.type === "confirmation" ? "Email confirmed." : "Signed in.");
        navigate("dashboard", { replace: true, keepMessage: true });
      }
      const user = callback?.user || await getUser();
      if (user) setAuthUser(user);
    } catch (error) {
      setAuthError(friendlyAuthError(error));
      if (hasAuthHash()) navigate("login", { replace: true, keepMessage: true });
    } finally {
      setAuthStatus("ready");
    }
  }

  async function submitLogin() {
    resetAuthFeedback();
    if (!validateAuthForm()) return;
    setAuthBusy(true);
    try {
      const user = await login(authForm.email.trim(), authForm.password);
      setAuthUser(user);
      setLocalPreview(false);
      setAuthForm((current) => ({ ...current, password: "", confirmPassword: "" }));
      setEndpointsState({ status: "idle", error: "" });
      navigate("dashboard", { replace: true });
    } catch (error) {
      setAuthError(friendlyAuthError(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function submitRegister() {
    resetAuthFeedback();
    if (!validateAuthForm({ registration: true })) return;
    setAuthBusy(true);
    try {
      const user = await signup(authForm.email.trim(), authForm.password, { full_name: authForm.fullName.trim() });
      setAuthForm((current) => ({ ...current, password: "", confirmPassword: "" }));
      if (user?.confirmedAt) {
        setAuthUser(user);
        setEndpointsState({ status: "idle", error: "" });
        navigate("dashboard", { replace: true });
      } else {
        setAuthMessage("Account created. Check your email for the secure confirmation link.");
        navigate("login", { replace: true, keepMessage: true });
      }
    } catch (error) {
      setAuthError(friendlyAuthError(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function submitForgotPassword() {
    resetAuthFeedback();
    if (!/^\S+@\S+\.\S+$/.test(authForm.email.trim())) {
      setAuthError("Enter a valid email address.");
      return;
    }
    setAuthBusy(true);
    try {
      await requestPasswordRecovery(authForm.email.trim());
      setAuthMessage("If that account exists, a secure recovery link has been sent.");
    } catch (error) {
      setAuthError(friendlyAuthError(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function submitResetPassword() {
    resetAuthFeedback();
    if (authForm.password.length < 10) {
      setAuthError("Use at least 10 characters for the password.");
      return;
    }
    if (authForm.password !== authForm.confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    setAuthBusy(true);
    try {
      const user = inviteToken
        ? await acceptInvite(inviteToken, authForm.password)
        : await updateUser({ password: authForm.password });
      setAuthUser(user || await getUser());
      setInviteToken("");
      setCallbackReady(false);
      setAuthForm((current) => ({ ...current, password: "", confirmPassword: "" }));
      setEndpointsState({ status: "idle", error: "" });
      navigate("dashboard", { replace: true });
    } catch (error) {
      setAuthError(friendlyAuthError(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function submitLogout() {
    setAuthBusy(true);
    resetAuthFeedback();
    try {
      if (authUser) await logout();
    } catch (error) {
      setAuthError(friendlyAuthError(error));
    } finally {
      setAuthUser(null);
      setLocalPreview(false);
      setEndpoints([]);
      setBilling((current) => ({ ...current, status: "idle", available_credits: 0, available_order_id: "", payments: [], message: "", error: "" }));
      setEndpointsState({ status: "idle", error: "" });
      setSelectedId("");
      setAuthBusy(false);
      navigate("login", { replace: true });
    }
  }

  async function createEndpoint(input) {
    const requiresCredit = billing.required && !billing.exempt;
    if (requiresCredit && !billing.available_order_id) {
      setCreateState({ status: "error", error: "Purchase a $5 endpoint credit before creating an endpoint." });
      return false;
    }
    setCreateState({ status: "loading", error: "" });
    try {
      const data = await capiRequest("create", {
        method: "POST",
        body: { ...input, checkoutOrderId: requiresCredit ? billing.available_order_id : undefined }
      });
      const endpoint = data.endpoint;
      setEndpoints((current) => [endpoint, ...current.filter((item) => item.id !== endpoint.id)]);
      setSelectedId(endpoint.id);
      setCreateState({ status: "success", error: "" });
      await loadBilling();
      navigate("tracking");
      return true;
    } catch (error) {
      setCreateState({ status: "error", error: error.message });
      return false;
    }
  }

  async function beginCheckout() {
    setBilling((current) => ({ ...current, status: "checkout", error: "", message: "Opening secure Lemon Squeezy Checkout..." }));
    try {
      const data = await capiRequest("checkout", { method: "POST", body: {} });
      if (!data.checkout?.url) throw new Error("Lemon Squeezy did not return a checkout link.");
      window.location.assign(data.checkout.url);
    } catch (error) {
      setBilling((current) => ({ ...current, status: "error", error: error.message, message: "" }));
    }
  }

  async function verifyEndpoint(endpoint) {
    setVerifyState({ status: "loading", healthy: false, latency_ms: 0, error: "" });
    try {
      const data = await capiRequest("verify", { method: "POST", body: { siteId: endpoint.id } });
      setVerifyState({ status: "success", healthy: Boolean(data.healthy), latency_ms: data.latency_ms || 0, error: "" });
    } catch (error) {
      setVerifyState({ status: "error", healthy: false, latency_ms: 0, error: error.message });
    }
  }

  async function updateEndpoint(endpoint, input) {
    setUpdateState({ status: "loading", error: "", success: false });
    try {
      const data = await capiRequest("update", {
        method: "PATCH",
        body: { siteId: endpoint.id, ...input }
      });
      setEndpoints((current) => current.map((item) => item.id === endpoint.id ? data.endpoint : item));
      setSelectedId(data.endpoint.id);
      setUpdateState({ status: "success", error: "", success: true });
      return true;
    } catch (error) {
      setUpdateState({ status: "error", error: error.message, success: false });
      return false;
    }
  }

  async function deleteEndpoint(endpoint) {
    setDeleteState({ status: "loading", id: endpoint.id, error: "" });
    try {
      await capiRequest("delete", { method: "DELETE", body: { siteId: endpoint.id } });
      setEndpoints((current) => current.filter((item) => item.id !== endpoint.id));
      if (selectedId === endpoint.id) setSelectedId("");
      setDeleteState({ status: "success", id: "", error: "" });
      navigate("endpoints");
      return true;
    } catch (error) {
      setDeleteState({ status: "error", id: endpoint.id, error: error.message });
      return false;
    }
  }

  function selectEndpoint(endpoint, nextRoute) {
    setSelectedId(endpoint.id);
    setVerifyState({ status: "idle", healthy: false, latency_ms: 0, error: "" });
    setUpdateState({ status: "idle", error: "", success: false });
    navigate(nextRoute);
  }

  function startNewEndpoint() {
    setCreateState({ status: "idle", error: "" });
    setBilling((current) => ({ ...current, message: "", error: "" }));
    loadBilling();
    navigate("setup");
  }

  if (authStatus === "checking") {
    return (
      <div className="bootScreen">
        <Brand />
        <span className="bootLine"><i /> Checking secure session</span>
        <PublicFooter navigate={navigate} />
      </div>
    );
  }

  if (route === "home") return <HomePage navigate={navigate} user={effectiveUser} />;
  if (route === "docs") return <DocsPage navigate={navigate} user={effectiveUser} />;
  if (route === "privacy") return <PrivacyPage navigate={navigate} user={effectiveUser} />;
  if (route === "terms") return <TermsPage navigate={navigate} user={effectiveUser} />;
  if (route === "status") return <StatusPage navigate={navigate} user={effectiveUser} backend={backend} />;

  if (!effectiveUser || AUTH_ROUTES.has(route)) {
    return (
      <AuthScreen
        mode={AUTH_ROUTES.has(route) ? route : "login"}
        navigate={navigate}
        authForm={authForm}
        patchAuthForm={patchAuthForm}
        onLogin={submitLogin}
        onRegister={submitRegister}
        onForgot={submitForgotPassword}
        onReset={submitResetPassword}
        onPreview={() => {
          setLocalPreview(true);
          setEndpointsState({ status: "idle", error: "" });
          navigate("dashboard", { replace: true });
        }}
        busy={authBusy}
        error={authError}
        message={authMessage}
        callbackReady={callbackReady}
      />
    );
  }

  return (
    <Workspace
      user={effectiveUser}
      route={WORKSPACE_ROUTES.has(route) ? route : "dashboard"}
      navigate={navigate}
      backend={backend}
      billing={billing}
      onCheckout={beginCheckout}
      refreshBilling={loadBilling}
      endpoints={endpoints}
      endpointsState={endpointsState}
      refreshEndpoints={loadEndpoints}
      onCreate={createEndpoint}
      createState={createState}
      onVerify={verifyEndpoint}
      verifyState={verifyState}
      onUpdate={updateEndpoint}
      updateState={updateState}
      onDelete={deleteEndpoint}
      deleteState={deleteState}
      onLogout={submitLogout}
      authBusy={authBusy}
      selectedEndpoint={selectedEndpoint}
      onSelectEndpoint={selectEndpoint}
      onNew={startNewEndpoint}
    />
  );
}

function LockedApp() {
  useEffect(() => {
    if (window.location.pathname !== "/" || window.location.search || window.location.hash) {
      window.history.replaceState({}, "", "/");
    }

    document.title = "Simple CAPI - Coming Soon";
    const canonical = document.querySelector('link[rel="canonical"]');
    const robots = document.querySelector('meta[name="robots"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (canonical) canonical.href = `${window.location.origin}/`;
    if (ogUrl) ogUrl.content = `${window.location.origin}/`;
    if (robots) robots.content = "noindex, nofollow";
  }, []);

  return <ComingSoonPage />;
}

export default function App() {
  return PRODUCT_APP_AVAILABLE ? <ProductApp /> : <LockedApp />;
}
