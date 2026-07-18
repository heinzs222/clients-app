export const META_DEFINITION_POSTS = [
  {
    path: "/what-is-meta-capi",
    category: "Beginner guide",
    eyebrow: "Meta CAPI definition",
    icon: "workflow",
    title: "What Is Meta CAPI? Meaning, Purpose, and Examples",
    description: "What is Meta CAPI? Learn what CAPI stands for, what the Meta Conversions API does, how it differs from the Meta Pixel, and what a Meta CAPI gateway means.",
    h1: "What is Meta CAPI?",
    intro: "Meta CAPI, short for Meta Conversions API, is a server-to-server method for sending website, CRM, app, or offline conversion events to Meta. It helps report actions such as leads, bookings, and purchases without relying only on browser tracking.",
    quickAnswerTitle: "What Meta CAPI is",
    quickAnswer: "Meta CAPI is the Meta Conversions API. It lets a website, CRM, app, or secure gateway send conversion events directly from a server to Meta. The Meta Pixel sends events from the visitor's browser. CAPI sends them from a server. Many businesses use both and connect matching browser and server events with the same event name and event ID.",
    readTime: "7 min read",
    keywords: [
      "what is meta capi",
      "what is meta capi gateway",
      "what does meta capi do",
      "what is capi meta ads",
      "what does meta capi stand for"
    ],
    sections: [
      {
        id: "meaning",
        title: "What does Meta CAPI stand for?",
        paragraphs: [
          "CAPI stands for Conversions API. Meta CAPI is the common name for Meta's Conversions API, which allows a business to send conversion events to Meta from a server instead of depending entirely on code running in a visitor's browser.",
          "The word conversion refers to a meaningful action such as a lead form submission, completed appointment, purchase, registration, or qualified lead. CAPI reports that the action happened and includes the accurate matching and source information available for that event."
        ],
        bullets: [
          "CAPI means Conversions API",
          "It sends conversion events from a server",
          "It can receive events from websites, CRMs, apps, and offline systems",
          "It is used for measurement, matching, attribution, and ad optimization"
        ]
      },
      {
        id: "purpose",
        title: "What does Meta CAPI do?",
        paragraphs: [
          "Meta CAPI delivers structured event information to a Meta dataset. A Lead event can include the event time, source URL, a unique event ID, and permitted customer or browser information that helps Meta connect the conversion to the correct person or ad interaction.",
          "CAPI does not create the lead, replace the CRM, or guarantee attribution. It provides a controlled server delivery path so Meta can receive the conversion and use the available signals for reporting and campaign optimization."
        ],
        bullets: [
          "Reports leads, bookings, purchases, and other real conversions",
          "Sends events to the correct Meta dataset",
          "Provides server-side delivery when browser tracking is incomplete",
          "Carries accurate matching and event-source information",
          "Supports campaign measurement and optimization"
        ]
      },
      {
        id: "pixel-difference",
        title: "Meta CAPI and the Meta Pixel are not the same thing",
        paragraphs: [
          "The Meta Pixel runs in the browser and observes actions on the website. Meta CAPI sends events from a server. Because they use different delivery paths, one can still provide useful information when the other is limited or unavailable.",
          "Using both does not mean reporting two conversions. When the Pixel and CAPI send the same action, they should use the same event name and event ID so Meta can deduplicate them into one conversion."
        ],
        bullets: [
          "Pixel: browser-side event delivery",
          "CAPI: server-side event delivery",
          "Both can report the same conversion",
          "A shared event name and event ID prevent double counting"
        ]
      },
      {
        id: "gateway",
        title: "What is a Meta CAPI gateway?",
        paragraphs: [
          "A Meta CAPI gateway is a server or managed service placed between the website or CRM and Meta. It receives the conversion, validates or prepares the event data, protects the Meta access token, and sends the final request to the Conversions API.",
          "Gateway is a general architecture term, not a promise that every service works the same way. Some gateways support several advertising and analytics platforms. A focused Meta CAPI gateway may handle only Meta events and provide a simpler installation for a specific page, form, or CRM workflow."
        ],
        bullets: [
          "Receives the event from the website or CRM",
          "Keeps the Meta access token out of public page code",
          "Normalizes and validates event information",
          "Sends the server request to Meta",
          "Returns a result that can be tested and monitored"
        ]
      },
      {
        id: "meta-ads",
        title: "What is CAPI in Meta ads?",
        paragraphs: [
          "In Meta ads, CAPI is the server-side event connection used to report conversions back to Meta. Advertisers use these events to measure campaign outcomes and give Meta additional conversion information for delivery and optimization.",
          "The setup should start with a real business event. For a service business, that may be Lead after a form submission and Schedule after a completed appointment. Sending every CRM update as a conversion creates noise rather than better tracking."
        ],
        bullets: [
          "Lead for a completed lead form",
          "Schedule for a completed appointment booking",
          "Purchase for a successful payment",
          "QualifiedLead only after genuine qualification"
        ]
      }
    ],
    checklistEyebrow: "Key points",
    checklistTitle: "Meta CAPI in one checklist",
    checklist: [
      "CAPI stands for Conversions API",
      "It sends conversion events from a server to Meta",
      "It can work alongside the Meta Pixel",
      "Matching browser and server events need the same event name and event ID",
      "A CAPI gateway protects credentials and delivers the event",
      "Accurate data matters more than sending every possible field",
      "Meta controls the final matching and attribution decision"
    ],
    faq: [
      ["What is Meta CAPI?", "Meta CAPI is Meta's Conversions API, a server-to-server method for sending conversion events such as leads, bookings, and purchases to a Meta dataset."],
      ["What does Meta CAPI stand for?", "CAPI stands for Conversions API."],
      ["What does Meta CAPI do?", "It sends structured conversion events from a server to Meta for measurement, event matching, attribution, and campaign optimization."],
      ["What is CAPI in Meta ads?", "It is the server-side connection that reports advertising conversions back to Meta instead of relying only on browser Pixel events."],
      ["What is a Meta CAPI gateway?", "It is a server or managed service that receives conversion data from a website or CRM, protects the Meta token, prepares the event, and sends it to the Conversions API."],
      ["Is Meta CAPI the same as the Meta Pixel?", "No. The Pixel sends browser events, while CAPI sends server events. They can work together when duplicate events share the same event name and event ID."],
      ["Do I need Meta CAPI?", "It is useful when Meta advertising depends on website, CRM, booking, or purchase conversions and you want a server delivery path in addition to browser tracking."]
    ],
    related: [
      "/how-does-meta-capi-work",
      "/how-to-set-up-meta-capi",
      "/gohighlevel-meta-capi",
      "/meta-capi-event-deduplication"
    ],
    sources: [
      ["Meta for Developers: Conversions API", "https://developers.facebook.com/docs/marketing-api/conversions-api/"],
      ["Meta for Developers: Conversions API parameters", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/"],
      ["Meta for Developers: Deduplicate Pixel and server events", "https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/"]
    ]
  }
];

export const META_DEFINITION_PATHS = new Set(META_DEFINITION_POSTS.map((post) => post.path));
