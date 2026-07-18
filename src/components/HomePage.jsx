import React from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  CreditCard,
  Database,
  FileCheck2,
  KeyRound,
  LockKeyhole,
  ShieldCheck
} from "lucide-react";
import { PublicFooter, PublicHeader } from "./UI.jsx";

const beginnerGuides = [
  ["How does Meta CAPI work?", "/how-does-meta-capi-work", "A plain-English explanation of browser and server tracking."],
  ["How to set up Meta CAPI", "/how-to-set-up-meta-capi", "The full setup in a simple step-by-step checklist."],
  ["How to install Meta CAPI", "/how-to-install-meta-capi", "Where the script goes on a website or GoHighLevel page."],
  ["How to implement Meta CAPI", "/how-to-implement-meta-capi", "Plan the event, keep the data connected, and send it securely."],
  ["How to use Meta CAPI", "/how-to-use-meta-capi", "Use Lead, Schedule, Purchase, and later-stage events correctly."],
  ["How to test Meta CAPI", "/how-to-test-meta-capi", "Run a real conversion and inspect it in Meta Events Manager."],
  ["How to get a Meta CAPI access token", "/how-to-get-meta-capi-access-token", "Generate the token and keep it out of public page code."]
];

export default function HomePage({ navigate, user }) {
  return (
    <div className="publicPage">
      <PublicHeader route="home" navigate={navigate} user={user} />
      <main>
        <section className="homeHero simpleHomeHero">
          <div className="homeHeroCopy">
            <span className="eyebrow"><i /> Meta CAPI without the technical headache</span>
            <h1>Send better lead data to Meta with one simple script.</h1>
            <p>Choose what you want to track, paste the script on your form or booking page, and Simple CAPI sends the conversion securely. No complicated server build.</p>
            <div className="heroActions">
              <button className="button primary" type="button" onClick={() => navigate(user ? "setup" : "register")}>
                {user ? "Create a tracking script" : "Create my free script"}<ArrowRight size={18} />
              </button>
              <a className="button secondary" href="/how-does-meta-capi-work">See how Meta CAPI works</a>
            </div>
            <div className="heroTrust">
              <span><Check size={16} /> First eligible script is free</span>
              <span><Check size={16} /> Works with forms and bookings</span>
              <span><Check size={16} /> Your Meta token stays private</span>
            </div>
          </div>

          <div className="pipelineVisual simplePipelineVisual" aria-label="Three simple steps to Meta tracking">
            <header><i /><i /><i /><code>simplecapi / ready</code></header>
            <div className="pipelineLog">
              <p><span>1</span> Choose Lead or Schedule</p>
              <p className="active"><span>2</span> Paste one script</p>
              <p><span>3</span> Test the conversion</p>
            </div>
            <div className="pipelineNodes">
              <div><Database size={22} /><span>Choose</span></div>
              <ArrowRight size={21} />
              <div className="selected"><Code2 size={22} /><span>Paste</span></div>
              <ArrowRight size={21} />
              <div><Check size={22} /><span>Track</span></div>
            </div>
            <footer><i /> Meta event ready</footer>
          </div>
        </section>

        <section className="beginnerGuideBand" aria-labelledby="meta-capi-beginner-guides">
          <div className="beginnerGuideIntro">
            <span className="eyebrow"><BookOpen size={16} /> New to Meta CAPI?</span>
            <h2 id="meta-capi-beginner-guides">Start with the exact question you searched.</h2>
            <p>These guides explain Meta CAPI in normal language, from the first setup to testing it with GoHighLevel forms and bookings.</p>
          </div>
          <div className="beginnerGuideGrid">
            {beginnerGuides.map(([title, href, description], index) => (
              <a href={href} key={href}>
                <span>{index === 6 ? <KeyRound size={20} /> : <BookOpen size={20} />}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
                <ArrowRight size={18} />
              </a>
            ))}
          </div>
        </section>

        <section className="featureBand">
          <div className="sectionHeading">
            <span className="eyebrow">Simple by design</span>
            <h2>You choose the conversion. Simple CAPI handles the server connection.</h2>
            <p>Create a separate setup for each client, form, or booking page and keep the private Meta details off the website.</p>
          </div>
          <div className="featureGrid">
            <article>
              <span><Code2 size={22} /></span>
              <h3>Copy and paste</h3>
              <p>Get one generated script with clear instructions for the intended page.</p>
            </article>
            <article>
              <span><Activity size={22} /></span>
              <h3>Track leads or bookings</h3>
              <p>Choose Lead for a form or Schedule for a completed appointment.</p>
            </article>
            <article>
              <span><Database size={22} /></span>
              <h3>Keep clients separate</h3>
              <p>Each client uses their own Meta dataset, token, page, and event setup.</p>
            </article>
            <article>
              <span><ShieldCheck size={22} /></span>
              <h3>Keep the token private</h3>
              <p>The Meta access token stays on the server and never appears in the page script.</p>
            </article>
          </div>
        </section>

        <section className="pricingBand">
          <div>
            <span className="eyebrow">Simple pricing</span>
            <h2>$5 for Lead. $5 for Schedule.</h2>
            <p>Your first eligible script is free. After that, each one-time payment creates one Lead or Schedule script. No subscription.</p>
          </div>
          <button className="button primary" type="button" onClick={() => navigate(user ? "setup" : "register")}><CreditCard size={18} /> Create a script</button>
        </section>

        <section className="guideBand">
          <div>
            <span className="guideIcon"><FileCheck2 size={24} /></span>
            <span className="eyebrow">Included with every script</span>
            <h2>Follow a clear setup and testing guide.</h2>
            <p>The workspace shows how to connect Meta, install the script on the intended page, and confirm the event is working.</p>
          </div>
          <a className="button primary" href="/blogs">Read the free guides <ArrowRight size={18} /></a>
        </section>

        <section className="principleBand">
          <div>
            <span className="eyebrow">Built for real client work</span>
            <h2>One workspace for every client setup.</h2>
          </div>
          <ul>
            <li><Activity size={20} /><span><strong>Fast setup</strong> Add the client’s Meta details and receive the script in a few steps.</span></li>
            <li><ShieldCheck size={20} /><span><strong>Better matching data</strong> Send the useful customer and visit details available for the conversion.</span></li>
            <li><Code2 size={20} /><span><strong>Simple handoff</strong> Give the installer one script and one exact page to use it on.</span></li>
            <li><LockKeyhole size={20} /><span><strong>Private by default</strong> Keep the client’s access token off the website.</span></li>
          </ul>
        </section>
      </main>
      <PublicFooter navigate={navigate} />
    </div>
  );
}
