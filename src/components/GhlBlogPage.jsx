import React, { useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileInput,
  GitMerge,
  Link2,
  ListChecks,
  MessageSquareWarning,
  Network,
  ShieldCheck,
  TestTube2,
  Workflow
} from "lucide-react";
import { Brand } from "./UI.jsx";
import { GHL_BLOG_POSTS, getGhlBlogPost } from "../content/ghlBlogData.js";

const ROOT = "https://simplecapi.com";
const PUBLISHED = "2026-07-18";

const iconMap = {
  workflow: Workflow,
  form: FileInput,
  calendar: CalendarCheck2,
  link: Link2,
  merge: GitMerge,
  test: TestTube2,
  embed: Network,
  compare: MessageSquareWarning,
  quality: CheckCircle2,
  checklist: ClipboardCheck
};

const fallbackRelated = {
  "/gohighlevel-meta-capi": "GoHighLevel Meta CAPI guide",
  "/meta-capi-no-attribution-data": "Fix no attribution data",
  "/meta-capi-event-deduplication": "Meta event deduplication",
  "/improve-meta-event-match-quality": "Improve Event Match Quality",
  "/meta-capi-for-agencies": "Meta CAPI for agencies"
};

function relatedTitle(path) {
  return GHL_BLOG_POSTS.find((post) => post.path === path)?.title || fallbackRelated[path] || "Meta CAPI guide";
}

function setMeta(selector, attribute, key, value) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
}

function useArticleMetadata(post) {
  useEffect(() => {
    const url = `${ROOT}${post.path}`;
    document.title = `${post.title} | Simple CAPI`;

    setMeta('meta[name="description"]', "name", "description", post.description);
    setMeta('meta[name="robots"]', "name", "robots", "index, follow, max-image-preview:large, max-snippet:-1");
    setMeta('meta[property="og:type"]', "property", "og:type", "article");
    setMeta('meta[property="og:title"]', "property", "og:title", post.title);
    setMeta('meta[property="og:description"]', "property", "og:description", post.description);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", post.title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", post.description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    const schemaId = "simplecapi-ghl-blog-schema";
    let schema = document.getElementById(schemaId);
    if (!schema) {
      schema = document.createElement("script");
      schema.id = schemaId;
      schema.type = "application/ld+json";
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          url,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
          author: { "@type": "Organization", name: "Simple CAPI", url: ROOT },
          publisher: { "@type": "Organization", name: "Simple CAPI", url: ROOT },
          mainEntityOfPage: url,
          keywords: ["GoHighLevel", "GHL", "Meta CAPI", "Facebook Conversions API", post.category]
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: ROOT },
            { "@type": "ListItem", position: 2, name: "Blogs", item: `${ROOT}/blogs` },
            { "@type": "ListItem", position: 3, name: post.title, item: url }
          ]
        },
        {
          "@type": "FAQPage",
          mainEntity: post.faq.map(([question, answer]) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer }
          }))
        }
      ]
    });
  }, [post]);
}

function ArticleHeader() {
  return (
    <header className="blogHeader">
      <div className="blogHeaderInner">
        <a className="brandButton" href="/" aria-label="Simple CAPI home"><Brand compact /></a>
        <nav aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/docs">How it works</a>
          <a className="active" href="/blogs">Blogs</a>
          <a href="/status">Status</a>
        </nav>
        <div className="blogHeaderActions">
          <a className="button ghost small" href="/login">Log in</a>
          <a className="button primary small" href="/register">Start free</a>
        </div>
      </div>
    </header>
  );
}

function ArticleFooter() {
  return (
    <footer className="blogFooter">
      <div><Brand compact /><p>Clear Meta Conversions API guides for GoHighLevel forms, calendars, workflows, and client accounts.</p></div>
      <nav aria-label="Footer navigation">
        <a href="/blogs">Blogs</a>
        <a href="/gohighlevel-meta-capi">GHL Meta CAPI</a>
        <a href="/docs">How it works</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
    </footer>
  );
}

export default function GhlBlogPage({ path }) {
  const post = getGhlBlogPost(path);
  const Icon = iconMap[post.icon] || BookOpen;
  useArticleMetadata(post);

  return (
    <div className="ghlArticlePage">
      <ArticleHeader />
      <main>
        <section className="ghlArticleHero">
          <div className="ghlArticleGrid" aria-hidden="true" />
          <div className="ghlArticleHeroInner">
            <nav className="ghlBreadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a><span>/</span><a href="/blogs">Blogs</a><span>/</span><strong>{post.category}</strong>
            </nav>
            <span className="ghlArticleEyebrow"><Icon /> GoHighLevel + Meta CAPI</span>
            <h1>{post.h1}</h1>
            <p>{post.intro}</p>
            <div className="ghlArticleMeta"><span>Updated July 2026</span><i /> <span>{post.readTime}</span><i /> <span>Practical setup guide</span></div>
          </div>
        </section>

        <div className="ghlArticleLayout">
          <article className="ghlArticleContent">
            <section className="ghlQuickAnswer" aria-labelledby="quick-answer">
              <span><CheckCircle2 /></span>
              <div><small>Quick answer</small><h2 id="quick-answer">What to do</h2><p>{post.quickAnswer}</p></div>
            </section>

            {post.sections.map((section) => (
              <section className="ghlArticleSection" id={section.id} key={section.id}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets?.length ? (
                  <ul>{section.bullets.map((item) => <li key={item}><Check /> <span>{item}</span></li>)}</ul>
                ) : null}
              </section>
            ))}

            <section className="ghlChecklist" id="checklist">
              <header><ListChecks /><div><small>Before you publish</small><h2>GoHighLevel Meta CAPI check</h2></div></header>
              <div>{post.checklist.map((item, index) => <p key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</p>)}</div>
            </section>

            <section className="ghlFaq" id="faq">
              <span className="ghlSectionLabel">Frequently asked questions</span>
              <h2>Common questions about this setup</h2>
              {post.faq.map(([question, answer], index) => (
                <details key={question} open={index === 0}><summary>{question}<i>+</i></summary><p>{answer}</p></details>
              ))}
            </section>

            <section className="ghlSources" id="sources">
              <h2>Official references</h2>
              <p>Platform screens and behavior change. These references are useful when checking the current GoHighLevel and Meta setup.</p>
              <div>{post.sources.map(([label, href]) => <a href={href} target="_blank" rel="noreferrer" key={href}>{label}<ExternalLink /></a>)}</div>
            </section>
          </article>

          <aside className="ghlArticleSidebar">
            <div className="ghlToc">
              <strong>On this page</strong>
              <a href="#quick-answer">Quick answer</a>
              {post.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title.replace(/^\d+\.\s*/, "")}</a>)}
              <a href="#checklist">Checklist</a>
              <a href="#faq">Questions</a>
              <a href="#sources">References</a>
            </div>
            <div className="ghlSidebarCta">
              <ShieldCheck />
              <strong>Need a controlled endpoint?</strong>
              <p>Create a protected Lead or Schedule setup for one exact page and form.</p>
              <a className="button primary" href="/register">Start free <ArrowRight /></a>
            </div>
          </aside>
        </div>

        <section className="ghlRelated">
          <div><span className="ghlSectionLabel">Keep troubleshooting</span><h2>Related GoHighLevel Meta CAPI guides</h2></div>
          <div className="ghlRelatedGrid">
            {post.related.map((href) => <a href={href} key={href}><span><BookOpen /></span><strong>{relatedTitle(href)}</strong><small>Read guide</small><ArrowRight /></a>)}
          </div>
        </section>

        <section className="blogCta ghlArticleCta">
          <div><span>Simple CAPI workspace</span><h2>Turn the answer into one traceable event.</h2><p>Build a client-specific Lead or Schedule endpoint, install it on the intended page, and verify what Meta receives.</p></div>
          <a className="button primary" href="/register">Create your endpoint <ArrowRight /></a>
        </section>
      </main>
      <ArticleFooter />
    </div>
  );
}
