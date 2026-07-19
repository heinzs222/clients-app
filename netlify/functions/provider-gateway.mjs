import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

const STORE_NAME = "simple-capi-provider-configs";
const TIKTOK_EVENTS_URL = "https://business-api.tiktok.com/open_api/v1.3/event/track/";
const GOOGLE_OAUTH_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_ADS_VERSION = "v22";

function cleanString(value, max = 4000) {
  if (typeof value !== "string") return "";
  const result = value.trim().replace(/\u0000/g, "");
  if (!result || /^(null|undefined)$/i.test(result)) return "";
  return result.slice(0, max);
}

function store() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

function secretKey() {
  const secret = cleanString(process.env.CAPI_PROVIDER_SECRET) ||
    cleanString(process.env.CAPI_GATEWAY_SECRET) ||
    cleanString(process.env.NETLIFY_AUTH_TOKEN);
  if (secret.length < 20) throw new Error("Provider encryption is not configured.");
  return crypto.createHash("sha256").update(`simple-capi-provider-v1:${secret}`).digest();
}

function decrypt(value) {
  const packed = Buffer.from(cleanString(value), "base64url");
  if (packed.length < 29) throw new Error("Provider configuration is invalid.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", secretKey(), packed.subarray(0, 12));
  decipher.setAuthTag(packed.subarray(12, 28));
  const plain = Buffer.concat([decipher.update(packed.subarray(28)), decipher.final()]).toString("utf8");
  return JSON.parse(plain);
}

function configKey(route) {
  return `configs/${route}`;
}

async function readConfig(route) {
  if (!/^[A-Za-z0-9_-]{16,80}$/.test(route)) return null;
  const encrypted = await store().get(configKey(route), { type: "text", consistency: "strong" });
  if (!encrypted) return null;
  try { return decrypt(encrypted); }
  catch { return null; }
}

function canonicalPageUrl(value) {
  try {
    const url = new URL(cleanString(value, 1200));
    if (!/https?:/.test(url.protocol)) return "";
    url.hash = "";
    url.search = "";
    url.username = "";
    url.password = "";
    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname.replace(/\/{2,}/g, "/");
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return `${url.origin}${url.pathname}`;
  } catch { return ""; }
}

function response(status, body, headers = {}) {
  return new Response(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers
    }
  });
}

function json(status, body, origin = "") {
  const headers = { "Content-Type": "application/json; charset=utf-8" };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers.Vary = "Origin";
  }
  return response(status, JSON.stringify(body), headers);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeEmail(value) {
  return cleanString(value, 320).toLowerCase();
}

function normalizePhone(value, country) {
  let digits = cleanString(value, 100).replace(/\D/g, "");
  const normalizedCountry = cleanString(country, 2).toUpperCase();
  if (["US", "CA"].includes(normalizedCountry) && digits.length === 10) digits = `1${digits}`;
  return digits;
}

function sourceIp(request, input) {
  if (cleanString(input.client_ip_address, 200)) return cleanString(input.client_ip_address, 200);
  for (const name of ["x-nf-client-connection-ip", "cf-connecting-ip", "x-real-ip", "x-forwarded-for"]) {
    const value = cleanString(request.headers.get(name), 200);
    if (value) return value.split(",")[0].trim();
  }
  return "";
}

async function parseBody(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 256000) throw Object.assign(new Error("Request body is too large."), { statusCode: 413 });
  const contentType = cleanString(request.headers.get("content-type")).toLowerCase();
  const raw = await request.text();
  if (contentType.includes("application/x-www-form-urlencoded")) return Object.fromEntries(new URLSearchParams(raw));
  try { return raw ? JSON.parse(raw) : {}; }
  catch { throw Object.assign(new Error("Invalid event body."), { statusCode: 400 }); }
}

function assertPage(config, input, request) {
  const page = canonicalPageUrl(input.page_url || input.landing_page || request.headers.get("referer"));
  if (!page || page !== config.allowedPageUrl) {
    throw Object.assign(new Error("This script is locked to a different page."), { statusCode: 403 });
  }
  const origin = request.headers.get("origin") || "";
  if (origin && origin !== new URL(config.allowedPageUrl).origin) {
    throw Object.assign(new Error("Event origin does not match the locked page."), { statusCode: 403 });
  }
  if (config.eventName === "Lead" && cleanString(input.form_selector, 180) !== config.formSelector) {
    throw Object.assign(new Error("This script is locked to a different form."), { statusCode: 403 });
  }
  return page;
}

function removeEmpty(value) {
  if (Array.isArray(value)) {
    const result = value.map(removeEmpty).filter((item) => item !== undefined);
    return result.length ? result : undefined;
  }
  if (value && typeof value === "object") {
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      const cleaned = removeEmpty(item);
      if (cleaned !== undefined) result[key] = cleaned;
    }
    return Object.keys(result).length ? result : undefined;
  }
  return value === "" || value === null || value === undefined ? undefined : value;
}

function tiktokPayload(config, input, request, pageUrl) {
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone, input.country);
  const external = cleanString(input.external_id, 500).toLowerCase() || email || phone;
  const eventId = cleanString(input.event_id, 200) || crypto.randomUUID();
  return {
    eventId,
    body: removeEmpty({
      event_source: "web",
      event_source_id: config.tiktok.pixelCode,
      test_event_code: config.tiktok.testEventCode,
      data: [{
        event: config.tiktok.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        user: {
          ttclid: cleanString(input.ttclid, 500),
          ttp: cleanString(input.ttp, 500),
          ip: sourceIp(request, input),
          user_agent: cleanString(input.client_user_agent, 1000) || cleanString(request.headers.get("user-agent"), 1000),
          email: email ? [sha256(email)] : undefined,
          phone: phone ? [sha256(phone)] : undefined,
          external_id: external ? [sha256(external)] : undefined
        },
        page: {
          url: pageUrl,
          referrer: cleanString(input.referrer, 1200)
        },
        properties: {
          value: Number.isFinite(Number(input.value)) ? Number(input.value) : config.value,
          currency: cleanString(input.currency, 3).toUpperCase() || config.currency,
          description: cleanString(input.source, 250) || config.source,
          content_type: "product",
          content_ids: [config.id]
        }
      }]
    })
  };
}

async function sendTikTok(config, input, request, pageUrl) {
  const built = tiktokPayload(config, input, request, pageUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const result = await fetch(TIKTOK_EVENTS_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Access-Token": config.tiktok.accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(built.body)
    });
    const data = await result.json().catch(() => ({}));
    const accepted = result.ok && Number(data?.code || 0) === 0;
    if (!accepted) {
      throw Object.assign(new Error(cleanString(data?.message, 500) || "TikTok rejected the event."), { statusCode: 502, provider: data });
    }
    return { event_id: built.eventId, provider_response: data };
  } catch (error) {
    if (error?.name === "AbortError") throw Object.assign(new Error("TikTok request timed out."), { statusCode: 504 });
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function googleAccessToken(config) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const result = await fetch(GOOGLE_OAUTH_URL, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        refresh_token: config.google.refreshToken,
        grant_type: "refresh_token"
      })
    });
    const data = await result.json().catch(() => ({}));
    if (!result.ok || !cleanString(data.access_token)) {
      throw Object.assign(new Error(cleanString(data.error_description, 500) || "Google OAuth refresh failed."), { statusCode: 502 });
    }
    return data.access_token;
  } catch (error) {
    if (error?.name === "AbortError") throw Object.assign(new Error("Google OAuth timed out."), { statusCode: 504 });
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function googleDateTime(value) {
  const date = value ? new Date(value) : new Date();
  const safe = Number.isNaN(date.getTime()) ? new Date() : date;
  return safe.toISOString().replace("T", " ").replace("Z", "+00:00");
}

function consentValue(value) {
  const normalized = cleanString(value, 20).toUpperCase();
  return ["GRANTED", "DENIED"].includes(normalized) ? normalized : "";
}

function googleConversion(config, input) {
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone, input.country);
  const identifiers = [];
  if (email) identifiers.push({ hashedEmail: sha256(email), userIdentifierSource: "FIRST_PARTY" });
  if (phone) identifiers.push({ hashedPhoneNumber: sha256(phone), userIdentifierSource: "FIRST_PARTY" });
  const conversion = {
    conversionAction: config.google.conversionAction,
    conversionDateTime: googleDateTime(input.submitted_at),
    conversionValue: Number.isFinite(Number(input.value)) ? Number(input.value) : config.value,
    currencyCode: cleanString(input.currency, 3).toUpperCase() || config.currency,
    orderId: cleanString(input.event_id, 200) || crypto.randomUUID()
  };
  if (identifiers.length) conversion.userIdentifiers = identifiers;

  const adUserData = consentValue(input.ad_user_data);
  const adPersonalization = consentValue(input.ad_personalization);
  if (adUserData || adPersonalization) {
    conversion.consent = removeEmpty({ adUserData, adPersonalization });
  }

  const gclid = cleanString(input.gclid, 500);
  const wbraid = cleanString(input.wbraid, 500);
  const gbraid = cleanString(input.gbraid, 500);
  if (gclid) conversion.gclid = gclid;
  else if (wbraid) conversion.wbraid = wbraid;
  else if (gbraid) conversion.gbraid = gbraid;
  return conversion;
}

async function sendGoogle(config, input) {
  const conversion = googleConversion(config, input);
  if (!config.google.apiEnabled) {
    return { event_id: conversion.orderId, browser_only: true, reason: "Google Ads API credentials are not configured." };
  }
  if (!conversion.gclid && !conversion.wbraid && !conversion.gbraid && !conversion.userIdentifiers?.length) {
    return { event_id: conversion.orderId, browser_only: true, reason: "No Google click ID or enhanced-conversion identifier was available." };
  }
  const accessToken = await googleAccessToken(config);
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": config.google.developerToken,
    "Content-Type": "application/json"
  };
  if (config.google.loginCustomerId) headers["login-customer-id"] = config.google.loginCustomerId;
  const url = `https://googleads.googleapis.com/${GOOGLE_ADS_VERSION}/customers/${encodeURIComponent(config.google.customerId)}:uploadClickConversions`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const result = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers,
      body: JSON.stringify({ conversions: [conversion], partialFailure: true, validateOnly: false })
    });
    const data = await result.json().catch(() => ({}));
    if (!result.ok || data.partialFailureError) {
      const message = cleanString(data?.error?.message, 800) || cleanString(data?.partialFailureError?.message, 800) || "Google Ads rejected the conversion.";
      throw Object.assign(new Error(message), { statusCode: 502, provider: data });
    }
    return { event_id: conversion.orderId, provider_response: data };
  } catch (error) {
    if (error?.name === "AbortError") throw Object.assign(new Error("Google Ads request timed out."), { statusCode: 504 });
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function trackerSource(config) {
  const publicConfig = {
    route: config.route,
    provider: config.provider,
    eventName: config.eventName,
    providerEventName: config.provider === "tiktok" ? config.tiktok.eventName : "conversion",
    allowedPageUrl: config.allowedPageUrl,
    formSelector: config.formSelector,
    trigger: config.eventName === "Schedule" ? "page-load" : "form",
    currency: config.currency,
    value: config.value,
    source: config.source,
    onlyPaidTraffic: config.onlyPaidTraffic,
    pixelCode: config.provider === "tiktok" ? config.tiktok.pixelCode : "",
    conversionId: config.provider === "google" ? config.google.conversionId : "",
    conversionLabel: config.provider === "google" ? config.google.conversionLabel : ""
  };

  return `(function(w,d){"use strict";var C=${JSON.stringify(publicConfig)};w.__SIMPLE_CAPI_PROVIDER_ROUTES__=w.__SIMPLE_CAPI_PROVIDER_ROUTES__||{};if(w.__SIMPLE_CAPI_PROVIDER_ROUTES__[C.route])return;w.__SIMPLE_CAPI_PROVIDER_ROUTES__[C.route]=true;var s=d.currentScript,nativeSubmit=w.HTMLFormElement&&w.HTMLFormElement.prototype?w.HTMLFormElement.prototype.submit:null;function clean(v){return v==null?"":String(v).trim()}function canon(v){try{var u=new URL(v,w.location.href);u.hash="";u.search="";u.username="";u.password="";u.hostname=u.hostname.toLowerCase();u.pathname=u.pathname.replace(/\\/{2,}/g,"/");if(u.pathname.length>1)u.pathname=u.pathname.replace(/\\/+$/,"");return u.origin+u.pathname}catch(e){return""}}if(canon(w.location.href)!==C.allowedPageUrl)return;var AKEY="simple-capi:attribution:v1",IKEY="simple-capi:identity:v1";function read(k){try{return JSON.parse(w.sessionStorage.getItem(k)||"{}")||{}}catch(e){return{}}}function write(k,v){try{w.sessionStorage.setItem(k,JSON.stringify(v))}catch(e){}}var attr=read(AKEY),qs=new URLSearchParams(w.location.search),names=["fbclid","ttclid","gclid","wbraid","gbraid","utm_source","utm_medium","utm_campaign","utm_content","utm_term","utm_adset","utm_ad"];names.forEach(function(n){var v=clean(qs.get(n));if(v)attr[n]=v});if(!attr.landing_page)attr.landing_page=w.location.href;if(!attr.referrer)attr.referrer=d.referrer;write(AKEY,attr);function cookie(n){var p=(d.cookie||"").split("; ");for(var i=0;i<p.length;i++)if(p[i].indexOf(n+"=")===0)try{return decodeURIComponent(p[i].slice(n.length+1))}catch(e){return p[i].slice(n.length+1)}return""}function param(n){return clean(qs.get(n))||clean(attr[n])}function paid(){if(C.provider==="tiktok")return!!(param("ttclid")||cookie("_ttp")||/tiktok/i.test(param("utm_source")));return!!(param("gclid")||param("wbraid")||param("gbraid")||/google|adwords/i.test(param("utm_source")))}function controls(f){return Array.prototype.slice.call((f||d).querySelectorAll("input,textarea,select"))}function val(x){var t=(x.type||"").toLowerCase();if(x.disabled||/^(button|submit|reset|file|password)$/i.test(t))return"";if(t==="checkbox")return x.checked?clean(x.value||"true"):"";if(t==="radio")return x.checked?clean(x.value):"";return clean(x.value)}function desc(x){return clean([x.name,x.id,x.type,x.getAttribute("autocomplete"),x.getAttribute("aria-label"),x.getAttribute("placeholder")].join(" ")).toLowerCase().replace(/[^a-z0-9]+/g,"_")}function field(f,terms){var list=controls(f);for(var i=0;i<list.length;i++){var q=desc(list[i]),v=val(list[i]);if(!v)continue;for(var j=0;j<terms.length;j++)if(q.indexOf(terms[j])!==-1)return v}return""}function split(n){var p=clean(n).split(/\\s+/);return{first:p[0]||"",last:p.slice(1).join(" ")}}function id(){return(C.provider==="tiktok"?"tt_":"g_")+(w.crypto&&w.crypto.randomUUID?w.crypto.randomUUID():Date.now()+"_"+Math.random().toString(36).slice(2))}function consent(n){var c=w.SimpleCAPIConsent||{};var v=clean(c[n]).toUpperCase();return v==="GRANTED"||v==="DENIED"?v:""}function payload(f){var prior=read(IKEY),full=field(f,["full_name","fullname","contact_name","your_name","name"]),first=field(f,["first_name","firstname","given_name"]),last=field(f,["last_name","lastname","family_name","surname"]),sp=split(full);var out={event_id:id(),event_name:C.eventName,form_selector:C.formSelector,page_url:w.location.href,landing_page:attr.landing_page||w.location.href,referrer:attr.referrer||d.referrer,full_name:full,first_name:first||sp.first,last_name:last||sp.last,email:field(f,["email","e_mail"]),phone:field(f,["phone","mobile","cell","telephone","tel"]),country:field(f,["country"])||"US",client_user_agent:w.navigator.userAgent,ttclid:param("ttclid"),ttp:cookie("_ttp"),gclid:param("gclid"),wbraid:param("wbraid"),gbraid:param("gbraid"),utm_source:param("utm_source"),utm_medium:param("utm_medium"),utm_campaign:param("utm_campaign"),utm_content:param("utm_content"),utm_term:param("utm_term"),utm_adset:param("utm_adset"),utm_ad:param("utm_ad"),currency:C.currency,value:C.value,source:C.source,ad_user_data:consent("ad_user_data"),ad_personalization:consent("ad_personalization"),submitted_at:new Date().toISOString()};["full_name","first_name","last_name","email","phone","country"].forEach(function(k){if(out[k])prior[k]=out[k];else if(prior[k])out[k]=prior[k]});write(IKEY,prior);return out}function post(p){var u=new URL(s&&s.src?s.src:w.location.href);var endpoint=u.origin+"/p/"+C.route+"/events";var q=new URLSearchParams();Object.keys(p).forEach(function(k){if(p[k]!==""&&p[k]!=null)q.append(k,String(p[k]))});if(navigator.sendBeacon)try{if(navigator.sendBeacon(endpoint,q))return}catch(e){}fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body:q.toString(),keepalive:true,credentials:"omit"}).catch(function(){})}function loadTikTok(){if(w.ttq&&w.ttq.track)return;var ttq=w.ttq=w.ttq||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat([].slice.call(arguments)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e){var n="https://analytics.tiktok.com/i18n/pixel/events.js",a=d.createElement("script");a.async=true;a.src=n+"?sdkid="+e+"&lib=ttq";(d.head||d.documentElement).appendChild(a)};ttq.load(C.pixelCode);ttq.page()}function fireTikTok(p){loadTikTok();try{w.ttq.track(C.providerEventName,{value:C.value,currency:C.currency,description:C.source,content_type:"product",content_ids:[C.route]},{event_id:p.event_id})}catch(e){}}function loadGoogle(){w.dataLayer=w.dataLayer||[];if(typeof w.gtag!=="function")w.gtag=function(){w.dataLayer.push(arguments)};var existing=d.querySelector('script[src*="googletagmanager.com/gtag/js?id="]');if(!existing){var x=d.createElement("script");x.async=true;x.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(C.conversionId);x.setAttribute("data-simple-capi-google",C.conversionId);(d.head||d.documentElement).appendChild(x);w.gtag("js",new Date())}w.gtag("config",C.conversionId)}function fireGoogle(p){loadGoogle();var ud={email:p.email,phone_number:p.phone,address:{first_name:p.first_name,last_name:p.last_name,country:p.country}};w.gtag("set","user_data",ud);w.gtag("event","conversion",{send_to:C.conversionId+"/"+C.conversionLabel,value:C.value,currency:C.currency,transaction_id:p.event_id})}function fire(f){if(C.onlyPaidTraffic&&!paid())return;var p=payload(f||d);if(C.provider==="tiktok")fireTikTok(p);else fireGoogle(p);post(p);try{w.dispatchEvent(new CustomEvent("simple-capi:provider-event",{detail:{provider:C.provider,event_name:C.eventName,event_id:p.event_id}}))}catch(e){}}var last=0;function once(f){var now=Date.now();if(now-last<2000)return;last=now;fire(f)}function pageOnce(){var key="simple-capi:page-event:"+C.route+":"+w.location.pathname;try{var prior=JSON.parse(w.sessionStorage.getItem(key)||"{}");if(prior.time&&Date.now()-prior.time<300000)return;w.sessionStorage.setItem(key,JSON.stringify({time:Date.now()}))}catch(e){}once(d)}if(C.trigger==="page-load"){if(d.readyState==="complete")setTimeout(pageOnce,0);else w.addEventListener("load",pageOnce,{once:true})}else{d.addEventListener("submit",function(e){var f=e.target&&e.target.closest?e.target.closest("form"):null;if(f&&f.matches(C.formSelector))once(f)},true);if(nativeSubmit)w.HTMLFormElement.prototype.submit=function(){if(this.matches&&this.matches(C.formSelector))once(this);return nativeSubmit.apply(this,arguments)}}w.SimpleCAPI=w.SimpleCAPI||{};w.SimpleCAPI.trackProvider=function(target){var f=typeof target==="string"?d.querySelector(target):target;once(f||d)}})(window,document);`;
}

async function logEvent(config, input, result) {
  const key = `events/${config.ownerKey}/${config.id}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const record = {
    provider: config.provider,
    endpoint_id: config.id,
    event_name: config.eventName,
    event_id: result.event_id,
    success: true,
    page_url: canonicalPageUrl(input.page_url || input.landing_page),
    has_email: Boolean(cleanString(input.email)),
    has_phone: Boolean(cleanString(input.phone)),
    click_id: cleanString(input.ttclid) || cleanString(input.gclid) || cleanString(input.wbraid) || cleanString(input.gbraid),
    created_at: new Date().toISOString()
  };
  await store().setJSON(key, record).catch(() => {});
}

export default async function handler(request) {
  const url = new URL(request.url);
  const route = cleanString(url.searchParams.get("route"), 100);
  const asset = cleanString(url.searchParams.get("asset"), 40);
  const config = await readConfig(route);
  if (!config) return json(404, { success: false, error: "Provider endpoint not found." });
  const allowedOrigin = new URL(config.allowedPageUrl).origin;

  if (request.method === "OPTIONS") return json(204, null, allowedOrigin);
  if (request.method === "GET" && asset === "tracker") {
    return response(200, trackerSource(config), {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, must-revalidate",
      "Access-Control-Allow-Origin": "*"
    });
  }
  if (request.method !== "POST") return json(405, { success: false, error: "Method not allowed." }, allowedOrigin);

  try {
    const input = await parseBody(request);
    const pageUrl = assertPage(config, input, request);
    const result = config.provider === "tiktok"
      ? await sendTikTok(config, input, request, pageUrl)
      : await sendGoogle(config, input);
    await logEvent(config, input, result);
    return json(200, { success: true, provider: config.provider, event_name: config.eventName, ...result }, allowedOrigin);
  } catch (error) {
    return json(error?.statusCode || 500, {
      success: false,
      provider: config.provider,
      error: error?.message || "Provider event failed."
    }, allowedOrigin);
  }
}

export const config = {
  path: "/.netlify/functions/provider-gateway",
  rateLimit: {
    windowLimit: 180,
    windowSize: 60,
    aggregateBy: ["ip", "domain"]
  }
};
