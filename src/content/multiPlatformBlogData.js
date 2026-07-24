export const MULTI_PLATFORM_POSTS = [
  {
    path: "/what-is-tiktok-events-api",
    platform: "TikTok",
    category: "TikTok basics",
    eyebrow: "TikTok Events API explained",
    icon: "tiktok",
    tags: ["TikTok Events API", "TikTok Pixel", "Server tracking"],
    title: "What Is TikTok Events API? A Simple Explanation",
    description: "What is TikTok Events API? Learn how it sends website and CRM conversions to TikTok, how it works with the Pixel, and which events service businesses should track.",
    h1: "What is TikTok Events API?",
    intro: "TikTok Events API is a server connection that sends marketing events such as leads, bookings, registrations, and purchases directly to TikTok. It works alongside the TikTok Pixel to create a clearer conversion signal for reporting and campaign optimization.",
    quickAnswerTitle: "TikTok Events API in plain English",
    quickAnswer: "TikTok Events API sends conversion data from a protected server to TikTok. The TikTok Pixel sends events from the browser. When both report the same conversion with the same event ID, TikTok can recognize them as one event and use the available browser and server information together.",
    readTime: "6 min read",
    keywords: ["what is TikTok Events API", "TikTok Events API", "TikTok server side tracking", "TikTok Pixel and Events API"],
    sections: [
      {
        id: "purpose",
        title: "What does TikTok Events API do?",
        paragraphs: [
          "Events API gives your website, CRM, or booking system a direct path for reporting completed actions to TikTok. It is useful when the browser alone does not carry every conversion signal.",
          "For a service business, the event may be Lead after a form submission or Schedule after a completed appointment booking. The event should describe a real completed action, not a page visit that only looks similar."
        ],
        bullets: [
          "Reports website, CRM, app, and offline events",
          "Connects useful customer and campaign data to the conversion",
          "Supports measurement, optimization, and audience building",
          "Works with the TikTok Pixel through event deduplication"
        ]
      },
      {
        id: "pixel",
        title: "TikTok Pixel and Events API work together",
        paragraphs: [
          "The Pixel runs in the visitor's browser. Events API sends from a server. Using both gives TikTok two connected views of the same conversion.",
          "The browser and server copies should use the same standard event and event ID. This keeps one lead from appearing as two separate conversions."
        ],
        bullets: [
          "Pixel: browser conversion signal",
          "Events API: server conversion signal",
          "Same event name: the action matches",
          "Same event ID: TikTok can deduplicate the pair"
        ]
      },
      {
        id: "events",
        title: "Which TikTok events should a lead funnel use?",
        paragraphs: [
          "Choose the event that matches the business outcome. A Lead event belongs on the completed lead form. Schedule belongs after an appointment is successfully booked.",
          "Simple CAPI locks each script to one exact page, event, and form so the conversion fires at the intended moment."
        ],
        bullets: ["Lead for a completed inquiry or estimate form", "Schedule for a completed booking", "CompleteRegistration for a real registration", "Purchase for a completed payment"]
      }
    ],
    checklistTitle: "TikTok Events API essentials",
    checklist: [
      "Create or identify the correct TikTok Pixel",
      "Choose one real conversion",
      "Connect Pixel and Events API",
      "Use one event ID for matching browser and server events",
      "Test the exact form or confirmation page",
      "Review the event in TikTok Events Manager"
    ],
    faq: [
      ["What is TikTok Events API?", "It is TikTok's server connection for receiving website, CRM, app, and offline marketing events."],
      ["Does TikTok Events API replace the Pixel?", "The recommended website setup uses Events API with the existing Pixel so both delivery paths can work together."],
      ["What is TikTok server-side tracking?", "It is the process of sending TikTok conversion events from a server instead of relying only on browser code."],
      ["Can TikTok Events API track leads?", "Yes. Use the standard Lead event after the intended lead form is successfully submitted."],
      ["How much is a TikTok Lead script in Simple CAPI?", "Each event-specific script is a one-time $5 purchase after the first eligible free script."]
    ],
    related: ["/how-does-tiktok-events-api-work", "/how-to-set-up-tiktok-events-api", "/what-are-google-ads-enhanced-conversions"],
    sources: [
      ["TikTok Business Help Center: About Events API", "https://ads.tiktok.com/help/article/events-api?lang=en"],
      ["TikTok Business Help Center: Get started with Events API", "https://ads.tiktok.com/help/article/getting-started-events-api?lang=en"],
      ["TikTok Business Help Center: Standard events and parameters", "https://ads.tiktok.com/help/article/standard-events-parameters?lang=en"]
    ]
  },
  {
    path: "/how-does-tiktok-events-api-work",
    platform: "TikTok",
    category: "TikTok guide",
    eyebrow: "TikTok conversion flow",
    icon: "tiktok",
    tags: ["How TikTok Events API works", "Event ID", "Deduplication"],
    title: "How Does TikTok Events API Work?",
    description: "Learn how TikTok Events API works from ad click to Lead or Schedule event, including Pixel pairing, event IDs, click data, customer matching, and testing.",
    h1: "How does TikTok Events API work?",
    intro: "TikTok Events API keeps the ad visit connected to the final conversion, sends the completed event through a protected server, and pairs it with the browser Pixel event using the same event ID.",
    quickAnswer: "A visitor arrives from TikTok, the page keeps the available click and browser details, and the conversion script waits for the exact form or confirmation page. When the conversion happens, the Pixel and server send matching events to TikTok with one event ID.",
    readTime: "7 min read",
    keywords: ["how does TikTok Events API work", "how TikTok Events API works", "TikTok event deduplication", "TikTok Lead tracking"],
    sections: [
      {
        id: "flow",
        title: "The TikTok Events API flow",
        paragraphs: [
          "The useful work starts when the visitor lands on the page. TikTok click information, campaign parameters, and the TikTok browser cookie can help connect the later conversion to the original visit.",
          "The script then waits for the exact Lead form submission or Schedule confirmation. It creates one event ID, fires the browser Pixel event, and sends the server copy through the protected connection."
        ],
        bullets: ["Ad click reaches the landing page", "Visit details stay connected", "The real conversion happens", "Pixel and server events share one ID", "TikTok receives one connected conversion"]
      },
      {
        id: "matching",
        title: "What TikTok uses for matching",
        paragraphs: [
          "The event can include permitted customer information, the TikTok click ID, the TikTok browser cookie, source URL, user agent, event time, value, and currency.",
          "Simple CAPI prepares the supported matching information and sends it with the conversion while keeping the Events API token outside the website script."
        ],
        bullets: ["TTCLID when available", "_ttp browser value", "Email and phone when collected", "Event source URL and user agent", "Event ID, time, value, and currency"]
      },
      {
        id: "dedupe",
        title: "How TikTok event deduplication works",
        paragraphs: [
          "The browser Pixel and Events API are separate requests. The shared event ID tells TikTok that both requests describe the same lead or booking.",
          "A stable event ID also keeps a retry from looking like a second conversion."
        ],
        bullets: ["Use the same standard event", "Use the same event ID", "Generate the ID once", "Reuse it for a retry", "Test both sources in Events Manager"]
      }
    ],
    checklistTitle: "How TikTok conversion tracking connects",
    checklist: ["Preserve the TikTok visit", "Wait for the exact conversion", "Create one event ID", "Fire the matching Pixel event", "Send the Events API copy", "Verify one connected event"],
    faq: [
      ["How does TikTok Events API work with the Pixel?", "The Pixel sends the browser copy and Events API sends the server copy. A shared event name and event ID connect them."],
      ["What is TTCLID?", "TTCLID is a TikTok click identifier that can appear on the landing URL after a TikTok ad click."],
      ["What is _ttp?", "_ttp is a TikTok browser cookie value that can help connect website activity to the browser session."],
      ["How does TikTok prevent duplicate conversions?", "Matching browser and server events use the same standard event and event ID."],
      ["Can one script track both Lead and Schedule?", "Lead and Schedule are separate conversion moments, so each uses its own event-specific script."]
    ],
    related: ["/what-is-tiktok-events-api", "/how-to-set-up-tiktok-events-api", "/meta-capi-event-deduplication"],
    sources: [
      ["TikTok Business Help Center: About Events API", "https://ads.tiktok.com/help/article/events-api?lang=en"],
      ["TikTok Business Help Center: Add or edit events", "https://ads.tiktok.com/help/article/how-to-add-or-edit-events-event-builder-and-custom-code"],
      ["TikTok Business Help Center: Standard events and parameters", "https://ads.tiktok.com/help/article/standard-events-parameters?lang=en"]
    ]
  },
  {
    path: "/how-to-set-up-tiktok-events-api",
    platform: "TikTok",
    category: "TikTok setup",
    eyebrow: "Easy TikTok Events API setup",
    icon: "tiktok",
    tags: ["TikTok Events API setup", "TikTok Pixel setup", "Easy tracking"],
    title: "How to Set Up TikTok Events API Easily",
    description: "How to set up TikTok Events API with the Pixel, access token, Lead or Schedule event, exact conversion page, matching form, and a real Events Manager test.",
    h1: "How to set up TikTok Events API without a complicated build",
    intro: "A clean TikTok Events API setup needs the correct Pixel code, access token, conversion event, exact page, and exact form or confirmation step. Simple CAPI turns those details into one protected installation script.",
    quickAnswer: "Choose Lead or Schedule, copy the TikTok Pixel code and Events API access token from the correct account, enter the exact conversion page and form selector, create the script, paste it once, and complete a real conversion while TikTok Events Manager is open.",
    readTime: "8 min read",
    keywords: ["how to set up TikTok Events API", "TikTok Events API setup", "easy TikTok tracking setup", "TikTok Pixel server side setup"],
    sections: [
      {
        id: "prepare",
        title: "1. Prepare the TikTok connection",
        paragraphs: [
          "Open the correct TikTok Events Manager account and confirm the Pixel belongs to the business and ad account you want to track.",
          "Copy the Pixel code and create the Events API access token. Keep the access token in the protected setup, never in public page code."
        ],
        bullets: ["Correct TikTok Ads account", "Correct Pixel code", "Events API access token", "Permission to edit and test the data connection"]
      },
      {
        id: "create",
        title: "2. Create the exact conversion",
        paragraphs: [
          "Select Lead for a completed inquiry form or Schedule for a completed appointment. Enter the exact public page URL and a unique form selector for Lead.",
          "Simple CAPI rejects broad form selectors because a generic listener can fire on the wrong form."
        ],
        bullets: ["One platform", "One standard event", "One exact page", "One exact form or confirmation page", "One value and currency"]
      },
      {
        id: "test",
        title: "3. Install and test the TikTok event",
        paragraphs: [
          "Paste the generated script on the saved conversion page and publish it. Complete the real form or booking while TikTok Events Manager is open.",
          "Confirm the event name, page, source, browser and server delivery, matching event ID, and any campaign details available in the session."
        ],
        bullets: ["Publish the live page", "Use a fresh test lead", "Complete the real conversion", "Confirm Pixel and Events API delivery", "Remove temporary test settings before launch"]
      }
    ],
    checklistTitle: "Easy TikTok Events API setup",
    checklist: ["Confirm the Pixel", "Create the access token", "Choose Lead or Schedule", "Save the exact page", "Save the exact form", "Paste one script", "Run one real conversion test"],
    faq: [
      ["How do I set up TikTok Events API?", "Connect the correct Pixel and access token, define the conversion, install the script on the exact page, and test the real action in Events Manager."],
      ["Where do I find the TikTok Pixel code?", "Open TikTok Events Manager, select the website data connection, and use the Pixel code shown for that connection."],
      ["Where does the Events API token go?", "It belongs in the protected server configuration and should not appear in the script pasted on the website."],
      ["Should I keep the TikTok Pixel?", "Yes. TikTok recommends using the Pixel and Events API together for website events."],
      ["Can I use Simple CAPI for a TikTok booking page?", "Yes. Choose Schedule and lock the script to the successful booking confirmation page."]
    ],
    related: ["/what-is-tiktok-events-api", "/how-does-tiktok-events-api-work", "/how-to-set-up-google-ads-enhanced-conversions"],
    sources: [
      ["TikTok Business Help Center: Get started with Events API", "https://ads.tiktok.com/help/article/getting-started-events-api?lang=en"],
      ["TikTok Business Help Center: About Events API", "https://ads.tiktok.com/help/article/events-api?lang=en"],
      ["TikTok Business Help Center: Add or edit events", "https://ads.tiktok.com/help/article/how-to-add-or-edit-events-event-builder-and-custom-code"]
    ]
  },
  {
    path: "/what-are-google-ads-enhanced-conversions",
    platform: "Google Ads",
    category: "Google Ads basics",
    eyebrow: "Google enhanced conversions explained",
    icon: "google",
    tags: ["Google Ads", "Enhanced conversions", "Lead tracking"],
    title: "What Are Google Ads Enhanced Conversions?",
    description: "What are Google Ads enhanced conversions? Learn how first-party customer data improves conversion measurement and how the Google tag connects leads to ad interactions.",
    h1: "What are Google Ads enhanced conversions?",
    intro: "Google Ads enhanced conversions use first-party customer data collected during a conversion to improve conversion measurement. The supported customer information is prepared and sent with the Google conversion so it can be matched to signed-in Google accounts.",
    quickAnswerTitle: "Enhanced conversions in plain English",
    quickAnswer: "When someone submits a form or completes another conversion, the Google tag can send the conversion plus customer-provided information such as email, phone, name, or address. Google uses the prepared data to improve measurement and connect more conversions to the ads that generated them.",
    readTime: "6 min read",
    keywords: ["what are Google Ads enhanced conversions", "what is enhanced conversions", "Google enhanced conversions for leads", "Google Ads lead tracking"],
    sections: [
      {
        id: "purpose",
        title: "What do enhanced conversions do?",
        paragraphs: [
          "Enhanced conversions add customer-provided matching information to the normal Google Ads conversion. This gives Google another way to recognize the conversion when browser-only measurement is incomplete.",
          "The conversion still needs the correct action, time, page, value, and currency. Enhanced data strengthens the conversion; it does not replace the conversion action."
        ],
        bullets: ["Improves conversion measurement", "Uses first-party customer data", "Supports reporting and bidding", "Works with the Google tag and supported data connections"]
      },
      {
        id: "data",
        title: "What customer data can Google use?",
        paragraphs: [
          "Supported information can include email, phone, name, and address fields collected directly from the customer. The values are normalized and hashed before Google uses them for matching.",
          "Simple CAPI reads the fields available on the intended conversion form and sends them with the exact Google conversion action."
        ],
        bullets: ["Email address", "Phone number", "First and last name", "Street, city, region, postal code, and country", "GCLID, WBRAID, or GBRAID when available"]
      },
      {
        id: "lead",
        title: "Enhanced conversions for website leads",
        paragraphs: [
          "A lead funnel can send the customer-provided information at the time the form is completed. The conversion action should represent the real Lead or Schedule outcome you want Google Ads to optimize.",
          "Each Simple CAPI script is locked to the exact conversion page and event so unrelated forms do not trigger the same conversion."
        ],
        bullets: ["Lead form submission", "Appointment booking", "Registration", "Purchase or paid deposit"]
      }
    ],
    checklistTitle: "Google enhanced conversion essentials",
    checklist: ["Choose the conversion action", "Enable enhanced conversions", "Collect customer data on the intended form", "Install the exact conversion", "Preserve Google click details", "Run a real test"],
    faq: [
      ["What are enhanced conversions in Google Ads?", "They add prepared first-party customer information to Google Ads conversions to improve measurement."],
      ["What data is used for enhanced conversions?", "Supported customer-provided data can include email, phone, name, and address information."],
      ["Is customer data sent as plain text?", "Supported values are normalized and hashed before matching."],
      ["Do enhanced conversions work for leads?", "Yes. Google supports enhanced conversion measurement for lead-generation workflows."],
      ["Can Simple CAPI set up Google enhanced conversions?", "Yes. It creates an event-specific script for the exact conversion page and Google conversion action."]
    ],
    related: ["/how-do-google-ads-enhanced-conversions-work", "/how-to-set-up-google-ads-enhanced-conversions", "/what-is-tiktok-events-api"],
    sources: [
      ["Google Ads Help: About enhanced conversions for web", "https://support.google.com/google-ads/answer/15712870?hl=en"],
      ["Google Ads Help: Enhanced conversions best practices", "https://support.google.com/google-ads/answer/14795081?hl=en"],
      ["Google Ads Help: Enhanced conversions at the account level", "https://support.google.com/google-ads/answer/14664077?hl=en"]
    ]
  },
  {
    path: "/how-do-google-ads-enhanced-conversions-work",
    platform: "Google Ads",
    category: "Google Ads guide",
    eyebrow: "Google conversion flow",
    icon: "google",
    tags: ["How enhanced conversions work", "Google tag", "First-party data"],
    title: "How Do Google Ads Enhanced Conversions Work?",
    description: "Learn how Google Ads enhanced conversions work from ad click to form submission, including the Google tag, customer-provided data, click IDs, and transaction IDs.",
    h1: "How do Google Ads enhanced conversions work?",
    intro: "Enhanced conversions connect the completed website action to Google Ads using the normal conversion tag plus the first-party customer information and click details available at the conversion.",
    quickAnswer: "A visitor arrives from Google Ads, the page keeps the available GCLID, WBRAID, or GBRAID, and the exact conversion script waits for the intended form or confirmation page. When the action completes, the Google tag sends the conversion value and prepared customer data to the correct conversion action.",
    readTime: "7 min read",
    keywords: ["how do Google enhanced conversions work", "how Google Ads enhanced conversions work", "Google tag user data", "Google Ads conversion matching"],
    sections: [
      {
        id: "flow",
        title: "The Google enhanced conversion flow",
        paragraphs: [
          "The ad click reaches the landing page with Google campaign information. The page keeps the click details available in the visitor's session until the real conversion happens.",
          "At conversion time, the Google tag receives the conversion action, value, currency, transaction ID, and customer-provided data collected from the intended form."
        ],
        bullets: ["Google ad click", "Landing-page attribution", "Completed form or booking", "Google conversion action", "Customer-provided matching data"]
      },
      {
        id: "matching",
        title: "How customer data is matched",
        paragraphs: [
          "Email, phone, name, and address fields are cleaned into the required format and hashed before matching. Google compares the prepared values with signed-in account information.",
          "The conversion also carries its own transaction ID so the same action can be recognized if the browser retries delivery."
        ],
        bullets: ["Normalize email and phone", "Prepare name and address", "Hash supported identifiers", "Include value and currency", "Use a stable transaction ID"]
      },
      {
        id: "results",
        title: "Why enhanced conversions improve measurement",
        paragraphs: [
          "Browser limitations can make some conversions harder to observe. Customer-provided data gives Google another accurate signal connected to the completed action.",
          "Google describes enhanced conversions as a way to improve conversion measurement and support automated bidding with more observable conversion data."
        ],
        bullets: ["More complete conversion measurement", "Better connection to ad interactions", "Support for modeled conversions", "Stronger bidding inputs"]
      }
    ],
    checklistTitle: "How Google enhanced conversions connect",
    checklist: ["Preserve the ad click", "Collect first-party data", "Wait for the real conversion", "Send the correct conversion action", "Use one transaction ID", "Verify the tag result"],
    faq: [
      ["How do enhanced conversions work?", "They send prepared first-party customer data with the normal Google Ads conversion so Google can improve conversion matching."],
      ["What are GCLID, WBRAID, and GBRAID?", "They are Google click or campaign identifiers that can help connect a website conversion to an ad interaction."],
      ["Why use a transaction ID?", "A stable transaction ID helps Google recognize repeated delivery of the same conversion."],
      ["Does the Google tag send email and phone?", "It can send supported customer-provided data in the enhanced conversions format when the setup and consent permit it."],
      ["Can enhanced conversions track bookings?", "Yes. Use the Google conversion action that represents the completed booking and fire it on the successful confirmation step."]
    ],
    related: ["/what-are-google-ads-enhanced-conversions", "/how-to-set-up-google-ads-enhanced-conversions", "/how-does-tiktok-events-api-work"],
    sources: [
      ["Google Ads Help: About enhanced conversions for web", "https://support.google.com/google-ads/answer/15712870?hl=en"],
      ["Google Ads Help: Enhanced conversions best practices", "https://support.google.com/google-ads/answer/14795081?hl=en"],
      ["Google Ads API: Upload enhanced conversions for leads", "https://developers.google.com/google-ads/api/samples/upload-enhanced-conversions-for-leads"]
    ]
  },
  {
    path: "/how-to-set-up-google-ads-enhanced-conversions",
    platform: "Google Ads",
    category: "Google Ads setup",
    eyebrow: "Easy Google Ads conversion setup",
    icon: "google",
    tags: ["Google enhanced conversions setup", "Google tag", "Easy tracking"],
    title: "How to Set Up Google Ads Enhanced Conversions Easily",
    description: "How to set up Google Ads enhanced conversions with the conversion ID, label, exact page, form selector, customer data, Google click IDs, and a real conversion test.",
    h1: "How to set up Google Ads enhanced conversions",
    intro: "A clean setup connects the correct Google Ads conversion action to the exact page and form where the conversion happens. Simple CAPI turns the conversion ID, label, and page details into one focused installation script.",
    quickAnswer: "Create or select the Google Ads conversion action, enable enhanced conversions, copy its conversion ID and label, choose Lead or Schedule, enter the exact public page and form, generate the script, publish it once, and complete a real conversion while checking the Google tag result.",
    readTime: "8 min read",
    keywords: ["how to set up Google Ads enhanced conversions", "Google enhanced conversions setup", "easy Google Ads conversion tracking", "Google tag lead form setup"],
    sections: [
      {
        id: "prepare",
        title: "1. Prepare the Google Ads conversion",
        paragraphs: [
          "Open Google Ads Goals and select the conversion action that represents the business outcome. Enable enhanced conversions for the account or the supported conversion setup.",
          "Copy the conversion ID and conversion label. Confirm the action, value, currency, and counting settings match the lead or booking you want to measure."
        ],
        bullets: ["Correct Google Ads account", "Correct conversion action", "Conversion ID", "Conversion label", "Enhanced conversions enabled"]
      },
      {
        id: "create",
        title: "2. Create the exact tracking script",
        paragraphs: [
          "Choose Lead for the intended form submission or Schedule for a completed appointment. Enter the exact conversion page URL and a unique form selector for Lead.",
          "Select the country, currency, value, and source label. Simple CAPI uses the available Google click details and customer-provided form values at conversion time."
        ],
        bullets: ["One conversion action", "One exact page", "One exact form or confirmation page", "Correct value and currency", "Customer-provided data fields"]
      },
      {
        id: "test",
        title: "3. Publish and test the Google conversion",
        paragraphs: [
          "Paste the generated script on the exact page, publish it, and complete a real form or booking. Use browser tag tools and Google Ads conversion diagnostics to confirm delivery.",
          "Check the conversion action, page, value, currency, transaction ID, and customer data configuration before sending campaign traffic."
        ],
        bullets: ["Test the live public page", "Use a fresh contact", "Complete the real action", "Confirm the correct conversion action", "Review diagnostics after launch"]
      }
    ],
    checklistTitle: "Easy Google enhanced conversions setup",
    checklist: ["Select the conversion action", "Enable enhanced conversions", "Copy the ID and label", "Lock the exact page", "Lock the exact form", "Paste one script", "Complete one real test"],
    faq: [
      ["How do I set up Google Ads enhanced conversions?", "Enable enhanced conversions, connect the correct conversion action, install the tag on the exact conversion page, and complete a real test."],
      ["Where do I find the conversion ID and label?", "Open the Google Ads conversion action and its tag setup details. The event snippet contains the conversion ID and label."],
      ["Should I use a generic form selector?", "Use a unique selector for the intended form so another form on the page cannot fire the conversion."],
      ["Can I track both Lead and Schedule?", "Yes. They are separate conversion moments and use separate event-specific scripts."],
      ["Does Simple CAPI support advanced Google Ads connections?", "Yes. Accounts with an existing supported Google Ads API connection can add the advanced server upload details inside the protected workspace."]
    ],
    related: ["/what-are-google-ads-enhanced-conversions", "/how-do-google-ads-enhanced-conversions-work", "/how-to-set-up-tiktok-events-api"],
    sources: [
      ["Google Ads Help: Configure the Google tag for enhanced conversions for leads", "https://support.google.com/google-ads/answer/11021502?hl=en"],
      ["Google Ads Help: Enhanced conversions at the account level", "https://support.google.com/google-ads/answer/14664077?hl=en"],
      ["Google Ads Help: Enhanced conversions best practices", "https://support.google.com/google-ads/answer/14795081?hl=en"]
    ]
  }
];

export const MULTI_PLATFORM_PATHS = new Set(MULTI_PLATFORM_POSTS.map((post) => post.path));
