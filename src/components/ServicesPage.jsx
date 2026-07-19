import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, CheckCircle2, Layers3, LoaderCircle, ShieldCheck, Wrench } from "lucide-react";
import { Notice, PublicFooter, PublicHeader } from "./UI.jsx";

const plans = [
  {
    id: "self_serve",
    title: "Self-serve scripts",
    price: "First eligible script free",
    note: "$5 for each additional Lead or Schedule script.",
    Icon: Wrench,
    features: ["Protected Meta credentials", "Lead or Schedule tracking", "Installation and testing guide"],
    href: "/register",
    action: "Create a script"
  },
  {
    id: "done_for_you",
    title: "Done-for-you setup",
    price: "$249 one time",
    note: "For one GoHighLevel funnel and its booking flow.",
    Icon: ShieldCheck,
    featured: true,
    features: ["Lead and Schedule setup", "Pixel and CAPI deduplication", "Meta Test Events verification", "Event Match Quality review", "Seven-day correction window"],
    action: "Request my setup"
  },
  {
    id: "agency_rollout",
    title: "Agency rollout",
    price: "From $499",
    note: "Scoped by client count and tracking flows.",
    Icon: Layers3,
    features: ["Multi-client rollout plan", "Reusable naming and handoff system", "Source and attribution capture", "Priority troubleshooting", "Optional ongoing support"],
    action: "Plan an agency rollout"
  }
];

function selectedOffer() {
  const value = new URLSearchParams(window.location.search).get("offer");
  return ["done_for_you", "agency_rollout", "monitoring"].includes(value) ? value : "done_for_you";
}

function trackingData() {
  const params = new URLSearchParams(window.location.search);
  return {
    page_url: window.location.href,
    referrer: document.referrer,
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || ""
  };
}

export default function ServicesPage() {
  const [form, setForm] = useState({ full_name: "", email: "", company: "", website: "", offer: selectedOffer(), message: "", website_url: "" });
  const [state, setState] = useState({ status: "idle", error: "" });
  const tracking = useMemo(trackingData, []);

  useEffect(() => {
    const title = "Meta CAPI Setup Service for GoHighLevel | Simple CAPI";
    const description = "Get Meta CAPI installed and tested for a GoHighLevel form and booking flow, or roll out a repeatable setup across agency clients.";
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = "https://simplecapi.com/meta-capi-setup-service";
  }, []);

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function choose(offer) {
    update("offer", offer);
    requestAnimationFrame(() => document.getElementById("request")?.scrollIntoView({ behavior: "smooth" }));
  }

  async function submit(event) {
    event.preventDefault();
    if (state.status === "submitting") return;
    setState({ status: "submitting", error: "" });
    try {
      const result = await fetch("/api/service-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...tracking })
      });
      const data = await result.json().catch(() => ({}));
      if (!result.ok || !data.success) throw new Error(data.error || "Could not submit your request.");
      setState({ status: "success", error: "" });
      setForm((current) => ({ ...current, message: "", website_url: "" }));
      window.dataLayer?.push({ event: "service_lead_submit", service_offer: form.offer });
    } catch (error) {
      setState({ status: "error", error: error.message || "Could not submit your request." });
    }
  }

  return (
    <div className="publicPage servicePage">
      <PublicHeader route="services" />
      <main>
        <section className="serviceHero">
          <div>
            <span className="eyebrow"><i /> GoHighLevel Meta CAPI implementation</span>
            <h1>Get the tracking fixed without becoming the tracking expert.</h1>
            <p>Use the self-serve script, have the full setup handled, or create a repeatable rollout across agency clients.</p>
            <div className="serviceHeroActions">
              <button className="button primary" type="button" onClick={() => choose("done_for_you")}>Request done-for-you setup <ArrowRight size={18} /></button>
              <a className="button secondary" href="/register">Create a self-serve script</a>
            </div>
            <div className="serviceTrust"><span><Check size={16} /> GHL forms and calendars</span><span><Check size={16} /> Lead and Schedule events</span><span><Check size={16} /> Direct implementation</span></div>
          </div>
          <aside className="serviceOutcomeCard">
            <CheckCircle2 size={30} />
            <h2>A setup you can verify</h2>
            <ol><li><strong>Install</strong><span>Connect the right form, booking flow and dataset.</span></li><li><strong>Test</strong><span>Confirm browser and server events in Meta.</span></li><li><strong>Handoff</strong><span>Receive the working setup and checks used.</span></li></ol>
          </aside>
        </section>

        <section className="servicePricing">
          <header><span className="eyebrow">Choose the level of help</span><h2>Start cheap. Pay more only when you want the work handled.</h2><p>The self-serve product stays inexpensive. Implementation and agency work are priced like professional work.</p></header>
          <div className="servicePlanGrid">
            {plans.map(({ Icon, ...plan }) => (
              <article className={plan.featured ? "featured" : ""} key={plan.id}>
                {plan.featured ? <span className="popularLabel">Most practical</span> : null}
                <span className="planIcon"><Icon size={23} /></span><h3>{plan.title}</h3><strong className="planPrice">{plan.price}</strong><p>{plan.note}</p>
                <ul>{plan.features.map((feature) => <li key={feature}><Check size={16} />{feature}</li>)}</ul>
                {plan.href ? <a className="button secondary full" href={plan.href}>{plan.action}</a> : <button className="button primary full" type="button" onClick={() => choose(plan.id)}>{plan.action}</button>}
              </article>
            ))}
          </div>
        </section>

        <section className="serviceRequest" id="request">
          <div><span className="eyebrow">Request a setup</span><h2>Tell me what is broken or what needs to be installed.</h2><p>The request is stored and sent directly to Simple CAPI. Do not include credentials or private customer data.</p></div>
          <form className="serviceLeadForm" onSubmit={submit}>
            {state.status === "success" ? <Notice tone="success" title="Request received">Check your email for confirmation.</Notice> : null}
            {state.status === "error" ? <Notice tone="error" title="Could not send the request">{state.error}</Notice> : null}
            <div className="serviceFormGrid">
              <label><span>Name</span><input required autoComplete="name" value={form.full_name} onChange={(event) => update("full_name", event.target.value)} /></label>
              <label><span>Email</span><input required type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
              <label><span>Company or agency</span><input value={form.company} onChange={(event) => update("company", event.target.value)} /></label>
              <label><span>Website or funnel URL</span><input type="url" placeholder="https://" value={form.website} onChange={(event) => update("website", event.target.value)} /></label>
            </div>
            <label><span>What do you need?</span><select value={form.offer} onChange={(event) => update("offer", event.target.value)}><option value="done_for_you">Done-for-you setup — $249</option><option value="agency_rollout">Agency rollout — from $499</option><option value="monitoring">Ongoing tracking support</option></select></label>
            <label><span>Describe the current setup or problem</span><textarea required rows="6" placeholder="Example: the GHL form should send Lead, the calendar should send Schedule, and Meta is double-counting." value={form.message} onChange={(event) => update("message", event.target.value)} /></label>
            <label className="serviceHoneypot" aria-hidden="true">Website URL<input tabIndex="-1" autoComplete="off" value={form.website_url} onChange={(event) => update("website_url", event.target.value)} /></label>
            <button className="button primary full serviceSubmit" type="submit" disabled={state.status === "submitting"}>{state.status === "submitting" ? <><LoaderCircle className="spin" size={18} /> Sending request</> : <>Send setup request <ArrowRight size={18} /></>}</button>
            <small>By submitting, you agree that Simple CAPI may contact you about this request.</small>
          </form>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
