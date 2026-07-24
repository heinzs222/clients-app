import React, { useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  Braces,
  Building2,
  CalendarCheck2,
  ClipboardCheck,
  FileInput,
  Fingerprint,
  GitCompareArrows,
  GitMerge,
  Link2,
  Music2,
  Network,
  Radar,
  Search,
  TestTube2,
  UserCheck,
  Workflow
} from "lucide-react";
import { ALL_BLOG_SUMMARIES } from "../content/blogPosts.js";
import { PublicFooter, PublicHeader } from "./UI.jsx";

const ROOT = "https://simplecapi.com";

const iconMap = {
  workflow: Workflow,
  form: FileInput,
  calendar: CalendarCheck2,
  link: Link2,
  merge: GitMerge,
  test: TestTube2,
  embed: Network,
  compare: GitCompareArrows,
  quality: UserCheck,
  checklist: ClipboardCheck,
  tiktok: Music2,
  google: Search
};

const foundationalArticles = [
  {
    href: "/gohighlevel-meta-capi",
    category: "GoHighLevel",
    title: "Reliable Meta CAPI tracking for GoHighLevel",
    description: "Connect forms, bookings, and workflow events to structured server-side Meta conversions.",
    icon: Workflow
  },
  {
    href: "/meta-capi-no-attribution-data",
    category: "Troubleshooting",
    title: "How to fix Meta CAPI ‘No Attribution Data’",
    description: "Trace missing click IDs, browser identifiers, source URLs, and campaign context.",
    icon: Radar
  },
  {
    href: "/meta-capi-event-deduplication",
    category: "Implementation",
    title: "Meta CAPI event deduplication explained",
    description: "Connect browser and server events with one matching event name and event ID.",
    icon: GitMerge
  },
  {
    href: "/improve-meta-event-match-quality",
    category: "Event Match Quality",
    title: "Improve Meta Event Match Quality",
    description: "Send accurate identity, browser, click, and event context without adding useless noise.",
    icon: Fingerprint
  },
  {
    href: "/stape-alternative",
    category: "Comparison",
    title: "A focused Stape alternative for Meta CAPI",
    description: "Compare direct Meta event delivery with a broader server-side GTM architecture.",
    icon: Braces
  },
  {
    href: "/meta-capi-for-agencies",
    category: "Agencies",
    title: "Meta CAPI workflows for agencies",
    description: "Standardize client endpoints, event data, testing, credentials, and implementation handoffs.",
    icon: Building2
  }
];

const practicalArticles = ALL_BLOG_SUMMARIES.map((article) => ({
  ...article,
  icon: iconMap[article.icon] || Workflow
}));

const articles = [...practicalArticles, ...foundationalArticles];

function useMetadata() {
  useEffect(() => {
    const title = "Meta CAPI, TikTok and Google Ads Tracking Guides | Simple CAPI";
    const description = "Easy Meta CAPI setup, TikTok Events API, and Google Ads enhanced conversion guides covering what each tool is, how it works, and how to set it up.";
    const url = `${ROOT}/blogs`;

    document.title = title;

    const setMeta = (selector, attribute, key, value) => {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", value);
    };

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[name="robots"]', "name", "robots", "index, follow, max-image-preview:large, max-snippet:-1");
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    let schema = document.getElementById("simplecapi-blog-index-schema");
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "simplecapi-blog-index-schema";
      schema.type = "application/ld+json";
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url,
      hasPart: articles.map((article) => ({
        "@type": "Article",
        headline: article.title,
        url: `${ROOT}${article.href}`
      }))
    });
  }, []);
}

export default function BlogIndex() {
  useMetadata();

  return (
    <div className="blogIndexPage publicPage">
      <PublicHeader route="blogs" />

      <main>
        <section className="blogHero">
          <div className="blogHeroGlow" aria-hidden="true" />
          <div className="blogHeroInner">
            <span className="blogEyebrow"><BookOpen /> Meta, TikTok and Google Ads guides</span>
            <h1>Understand conversion tracking and set it up without a wall of jargon.</h1>
            <p>Choose Meta CAPI, TikTok Events API, or Google enhanced conversions. Start with what it is, see how it works, and follow the setup guide.</p>
          </div>
        </section>

        <section className="blogGridSection" aria-labelledby="latest-guides">
          <div className="blogSectionHeading">
            <div>
              <span>{articles.length} practical guides</span>
              <h2 id="latest-guides">Choose the exact question you need answered.</h2>
            </div>
            <p>Each guide gives a direct answer first, followed by the checks, common mistakes, and current platform references.</p>
          </div>

          <div className="blogCardGrid">
            {articles.map(({ href, category, title, description, tags = [], icon: Icon }) => (
              <article className="blogCard" key={href}>
                <div className="blogCardTop">
                  <span><Icon /></span>
                  <small>{category}</small>
                </div>
                <h2><a href={href}>{title}</a></h2>
                <p>{description}</p>
                {tags.length ? <div className="blogTags" aria-label="Topics">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
                <a className="blogReadLink" href={href}>Read guide <ArrowRight /></a>
              </article>
            ))}
          </div>
        </section>

        <section className="blogCta">
          <div>
            <span>Simple CAPI workspace</span>
            <h2>Turn the guide into a working conversion.</h2>
            <p>Choose Meta, TikTok, or Google Ads, create Lead or Schedule, and paste one protected script on the intended page.</p>
          </div>
          <a className="button primary" href="/register">Create your script <ArrowRight /></a>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
