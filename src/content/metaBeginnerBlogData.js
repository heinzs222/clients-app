export const META_BEGINNER_POSTS = [
  {
    path: "/how-does-meta-capi-work",
    category: "Beginner guide",
    eyebrow: "Meta CAPI explained simply",
    icon: "workflow",
    title: "How Does Meta CAPI Work? A Simple Explanation",
    description: "Learn how Meta CAPI works in plain English, what information it sends, how it differs from the Meta Pixel, and how it can connect to GoHighLevel forms and bookings.",
    h1: "How does Meta CAPI work?",
    intro: "Meta CAPI sends conversion information from a secure server to Meta after someone completes an important action, such as submitting a form or booking an appointment. It gives Meta another reliable way to receive the event when browser tracking is incomplete.",
    quickAnswer: "A visitor completes an action on your website, the conversion details are sent to a protected server, and that server sends the event to Meta. The Meta Pixel works in the visitor's browser. Meta CAPI works from the server. They can be used together when both events share the same event name and event ID.",
    readTime: "6 min read",
    keywords: ["how does meta capi work", "how meta capi works", "Meta CAPI", "GoHighLevel Meta CAPI"],
    sections: [
      {
        id: "simple-flow",
        title: "The simple Meta CAPI flow",
        paragraphs: [
          "Think of Meta CAPI as a secure delivery path between your website or CRM and Meta. It does not create the lead. It reports that the lead, booking, purchase, or other conversion happened.",
          "For a GoHighLevel form, the flow can be: visitor opens the page, submits the form, GoHighLevel creates or updates the contact, and a server event is sent to the client's Meta dataset."
        ],
        bullets: [
          "Someone visits the page",
          "They submit a form or complete a booking",
          "The conversion is connected to the original visit",
          "A secure server sends the event to Meta",
          "Meta uses the available information for matching and reporting"
        ]
      },
      {
        id: "pixel-vs-capi",
        title: "Meta Pixel and Meta CAPI are different delivery paths",
        paragraphs: [
          "The Meta Pixel sends browser events. Meta CAPI sends server events. Using both can give Meta more useful context, but the two events must describe the same conversion correctly.",
          "When both paths send the same Lead or Schedule event, use the same event name and event ID so Meta can recognize one conversion instead of counting two."
        ],
        bullets: [
          "Pixel: runs in the visitor's browser",
          "CAPI: sends from a server",
          "Both can report the same conversion",
          "Deduplication prevents double counting"
        ]
      },
      {
        id: "what-data",
        title: "What information does Meta CAPI send?",
        paragraphs: [
          "A useful event includes the event name, time, source page, and matching information that was genuinely collected. Matching information can include normalized and hashed email or phone values, browser identifiers, click identifiers, and user agent data.",
          "More fields are not automatically better. Accurate information connected to the real conversion is more useful than a large event filled with missing or invented values."
        ],
        bullets: [
          "Event name, such as Lead or Schedule",
          "Unique event ID",
          "Event time and source URL",
          "Email or phone when collected",
          "FBP, FBC, and user agent when available"
        ]
      }
    ],
    checklist: [
      "Choose the real conversion you want to report",
      "Capture useful visit information before the conversion",
      "Send the event from a protected server",
      "Use one event ID across Pixel and CAPI when both are used",
      "Check the result in Meta Events Manager"
    ],
    checklistTitle: "How Meta CAPI works",
    faq: [
      ["How does Meta CAPI work in simple terms?", "It reports website or CRM conversions to Meta from a server instead of relying only on the visitor's browser."],
      ["How Meta CAPI works with GoHighLevel?", "A GoHighLevel form, calendar, or workflow can trigger a server event after the real conversion. The setup should preserve the original visit and contact information before sending the event."],
      ["Does Meta CAPI replace the Pixel?", "Not always. Many setups use both. The Pixel provides browser signals, while CAPI provides server delivery. When both report the same conversion, configure deduplication."],
      ["Does Meta CAPI guarantee attribution?", "No. It helps send the available signals correctly, but Meta controls final event matching and attribution."]
    ],
    related: ["/how-to-set-up-meta-capi", "/how-to-use-meta-capi", "/gohighlevel-meta-capi", "/meta-capi-event-deduplication"],
    sources: [
      ["Meta for Developers: Conversions API", "https://developers.facebook.com/docs/marketing-api/conversions-api/"],
      ["Meta for Developers: Deduplicate Pixel and server events", "https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/"],
      ["HighLevel: Facebook Conversions API trigger in workflows", "https://help.gohighlevel.com/support/solutions/articles/48001185099-facebook-conversions-api-trigger-in-workflows"]
    ]
  },
  {
    path: "/how-to-set-up-meta-capi",
    category: "Setup",
    eyebrow: "Meta CAPI beginner setup",
    icon: "checklist",
    title: "How to Set Up Meta CAPI: A Beginner Checklist",
    description: "Learn how to set up Meta CAPI step by step. Choose the conversion, connect a Meta dataset, create an access token, install the event, and test it before launch.",
    h1: "How to set up Meta CAPI without getting lost",
    intro: "A clean setup starts by choosing one real conversion and one place where it happens. Then connect the correct Meta dataset, create a secure server event, and test the event before relying on campaign reports.",
    quickAnswer: "To set up Meta CAPI, choose the event you want to track, confirm the correct Meta dataset, create an access token, connect the website or CRM to a secure server endpoint, send the event with accurate data, and verify it in Meta Test Events. For GoHighLevel, use the exact form, calendar, or workflow that represents the conversion.",
    readTime: "8 min read",
    keywords: ["how to setup meta capi", "how to set up meta capi", "Meta CAPI setup", "GoHighLevel CAPI setup"],
    sections: [
      {
        id: "choose-event",
        title: "1. Choose one conversion first",
        paragraphs: [
          "Do not begin with code. Begin with the business action. Decide whether the setup should report a Lead, Schedule, Purchase, QualifiedLead, or another event.",
          "For GoHighLevel, select the exact form or calendar. A generic workflow that fires for every form makes testing and reporting harder."
        ],
        bullets: [
          "Contact or estimate form: usually Lead",
          "Completed appointment booking: usually Schedule",
          "Paid checkout: usually Purchase",
          "Qualified pipeline stage: QualifiedLead when it truly happens"
        ]
      },
      {
        id: "connect-meta",
        title: "2. Connect the correct Meta dataset",
        paragraphs: [
          "Open Meta Events Manager and confirm the dataset belongs to the correct business and ad account. Copy the dataset ID and create an access token for the server connection.",
          "Keep the access token outside the public page code. The browser should send the event to your protected endpoint, and the endpoint should communicate with Meta."
        ],
        bullets: [
          "Correct business portfolio",
          "Correct dataset ID",
          "Access token stored as a secret",
          "Correct event name and source website"
        ]
      },
      {
        id: "install-test",
        title: "3. Install the event and test a real conversion",
        paragraphs: [
          "Install the generated script on the exact page or form where the conversion happens. Then complete the real form or booking while Meta Test Events is open.",
          "A test should confirm delivery, event name, source URL, matching fields, and deduplication. A successful API response alone does not prove the event contains useful information."
        ],
        bullets: [
          "Publish the page after installing the script",
          "Use a fresh test contact",
          "Complete the real conversion",
          "Inspect the server event in Test Events",
          "Check Diagnostics after production traffic begins"
        ]
      }
    ],
    checklist: [
      "Define one real conversion",
      "Confirm the Meta dataset ID",
      "Create and protect the access token",
      "Install the event on the exact page or form",
      "Test a real submission or booking",
      "Confirm deduplication when the Pixel also sends the event"
    ],
    checklistTitle: "Meta CAPI setup checklist",
    faq: [
      ["How to setup Meta CAPI?", "Choose the conversion, connect the correct dataset, create a protected server connection, install the event, and test a real conversion in Meta Events Manager."],
      ["Do I need a developer to set up Meta CAPI?", "A custom server build usually needs technical work. A managed tool can reduce the task to entering the Meta details and installing one generated script."],
      ["Can I set up Meta CAPI with GoHighLevel?", "Yes. Use the exact GoHighLevel form, calendar, or workflow that represents the conversion and keep the original visit data connected to the contact."],
      ["What should I set up first, Lead or Schedule?", "Start with the earliest meaningful conversion used for campaign optimization. Add Schedule separately when a completed booking is important to the business."]
    ],
    related: ["/how-to-install-meta-capi", "/how-to-get-meta-capi-access-token", "/how-to-test-meta-capi", "/gohighlevel-meta-capi-checklist"],
    sources: [
      ["Meta for Developers: Get started with Conversions API", "https://developers.facebook.com/docs/marketing-api/conversions-api/get-started/"],
      ["Meta for Developers: Conversions API parameters", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/"],
      ["HighLevel: Facebook Conversions API trigger in workflows", "https://help.gohighlevel.com/support/solutions/articles/48001185099-facebook-conversions-api-trigger-in-workflows"]
    ]
  },
  {
    path: "/how-to-install-meta-capi",
    category: "Installation",
    eyebrow: "Meta CAPI installation",
    icon: "form",
    title: "How to Install Meta CAPI on a Website or GoHighLevel Page",
    description: "Learn how to install Meta CAPI on one website page, GoHighLevel form, or booking page. Understand where the script belongs and what to test after publishing.",
    h1: "How to install Meta CAPI on the right page",
    intro: "Installing Meta CAPI does not mean pasting the same script everywhere. The safest setup connects one event to the exact page and form where that conversion happens.",
    quickAnswer: "Create the server event first, copy the generated installation script, place it in the custom code area for the exact landing page or form, publish the page, and complete a real conversion. For GoHighLevel, use the page or funnel custom code area and a unique selector for the intended form when the setup requires one.",
    readTime: "7 min read",
    keywords: ["how to install meta capi", "install Meta CAPI", "GoHighLevel Meta CAPI installation"],
    sections: [
      {
        id: "right-location",
        title: "Install the script where the conversion happens",
        paragraphs: [
          "A Lead event belongs on the page containing the intended lead form. A Schedule event belongs in the booking flow or success step that confirms the appointment.",
          "Avoid adding one unrestricted event script to every page. That can attach listeners to the wrong forms and make it difficult to prove which page created the conversion."
        ],
        bullets: [
          "Lead script: exact lead form page",
          "Schedule script: completed booking flow",
          "Purchase script: successful checkout confirmation",
          "Do not reuse one event script across unrelated pages"
        ]
      },
      {
        id: "ghl-install",
        title: "Install Meta CAPI on a GoHighLevel page",
        paragraphs: [
          "Open the intended funnel or website page in GoHighLevel and use the page's custom code or tracking-code area. Paste the script once and save the page.",
          "When the script targets a form, use a unique form selector rather than a broad selector that could match several forms. Publish the page before testing the live version."
        ],
        bullets: [
          "Open the exact GHL page",
          "Paste the script in the recommended custom code area",
          "Confirm the unique form selector",
          "Save and publish",
          "Test the public URL, not only the editor preview"
        ]
      },
      {
        id: "after-install",
        title: "What to check after installation",
        paragraphs: [
          "Open the browser console for obvious script errors, then complete the real conversion while Meta Test Events is open. Confirm the event appears once and comes from the expected source page.",
          "If no event appears, check whether the script loaded, whether the form selector matches, whether the request reached the server, and whether the server used the correct dataset."
        ],
        bullets: [
          "Script loads on the published page",
          "Correct form or booking action triggers it",
          "One event appears in Meta",
          "Event source URL matches the intended page",
          "Pixel and server events deduplicate when both are used"
        ]
      }
    ],
    checklist: [
      "Use one exact page",
      "Use one exact conversion",
      "Confirm the intended form selector",
      "Publish the page",
      "Run a real conversion test",
      "Check the event in Meta Events Manager"
    ],
    checklistTitle: "Meta CAPI installation check",
    faq: [
      ["How to install Meta CAPI?", "Create the protected server event, paste the provided installation script on the exact conversion page, publish it, and test a real conversion in Meta Events Manager."],
      ["Where do I paste Meta CAPI code in GoHighLevel?", "Use the custom code or tracking-code area for the exact website or funnel page. Follow the placement instructions provided with the generated script."],
      ["Can I use the same Meta CAPI script on several forms?", "A restricted event script should be tied to one intended page and form. Create a separate setup for a different conversion location."],
      ["Why does the script work in preview but not on the live page?", "The published page may have different code, caching, form markup, or domain behavior. Always test the final public URL."]
    ],
    related: ["/how-to-set-up-meta-capi", "/gohighlevel-meta-capi-form-submission", "/gohighlevel-meta-capi-embedded-forms", "/how-to-test-meta-capi"],
    sources: [
      ["Meta for Developers: Conversions API get started", "https://developers.facebook.com/docs/marketing-api/conversions-api/get-started/"],
      ["HighLevel: Funnel Event Pixel for Facebook Conversions API", "https://help.gohighlevel.com/support/solutions/articles/48001236281"],
      ["HighLevel: Custom JavaScript and CSS", "https://help.gohighlevel.com/support/solutions/articles/155000002051-custom-javascript-and-css"]
    ]
  },
  {
    path: "/how-to-implement-meta-capi",
    category: "Implementation",
    eyebrow: "Meta CAPI implementation plan",
    icon: "compare",
    title: "How to Implement Meta CAPI Correctly",
    description: "Learn how to implement Meta CAPI from data capture to server delivery. Plan the event, preserve attribution, protect credentials, deduplicate, and validate the result.",
    h1: "How to implement Meta CAPI correctly from start to finish",
    intro: "A reliable implementation is more than sending a request to Meta. It keeps the original visit connected to the final conversion, protects the access token, and gives the browser and server events one shared identity.",
    quickAnswer: "Implement Meta CAPI in five parts: define the conversion, capture visit and contact information, send the event through a protected server, deduplicate it with the Pixel when needed, and validate the final event in Meta Events Manager. In GoHighLevel, map the same values through the form, contact, workflow, and server request.",
    readTime: "9 min read",
    keywords: ["how to implement meta capi", "Meta CAPI implementation", "GoHighLevel Meta CAPI implementation"],
    sections: [
      {
        id: "event-plan",
        title: "Plan the conversion before building",
        paragraphs: [
          "Write down the event name, trigger, page, form, dataset, and success condition. This prevents several tools from reporting the same action with different names.",
          "For GoHighLevel, decide whether the trigger is a form submission, appointment creation, payment, or pipeline milestone. The event should fire only when that action is complete."
        ],
        bullets: [
          "Event name",
          "Exact trigger",
          "Exact page and form",
          "Meta dataset",
          "Browser Pixel behavior",
          "Test and success criteria"
        ]
      },
      {
        id: "data-path",
        title: "Keep the data connected through every handoff",
        paragraphs: [
          "Capture click, browser, source, and campaign information when the visitor first arrives. Store the values before redirects or delayed form submissions can remove them.",
          "Carry the values into the contact record or server request. A later workflow cannot recover information that never reached GoHighLevel or the server."
        ],
        bullets: [
          "Landing page and referrer",
          "FBCLID, FBC, and FBP when available",
          "UTM values for your reporting",
          "Email and phone from the conversion",
          "Stable event ID"
        ]
      },
      {
        id: "secure-validate",
        title: "Protect the server connection and validate the final event",
        paragraphs: [
          "The access token should stay in server-side environment variables or another protected secret store. Do not place it in public JavaScript.",
          "Test the exact event Meta receives. Check its name, source URL, user data fields, event ID, and browser/server connection. Then monitor Diagnostics after launch."
        ],
        bullets: [
          "Token stored outside the page",
          "Request restricted to the intended page and event",
          "Duplicate requests reuse the same event ID",
          "Test Events confirms delivery",
          "Diagnostics confirms production health"
        ]
      }
    ],
    checklist: [
      "Define the event and trigger",
      "Capture visit information early",
      "Map contact and attribution fields",
      "Store the access token securely",
      "Send one structured server event",
      "Deduplicate with the Pixel",
      "Validate in Test Events and Diagnostics"
    ],
    checklistTitle: "Meta CAPI implementation check",
    faq: [
      ["How to implement Meta CAPI?", "Plan one conversion, capture the required data, send it through a protected server, deduplicate it with browser tracking, and test the exact event Meta receives."],
      ["What is the hardest part of Meta CAPI implementation?", "Usually preserving the original visit and event identity through forms, redirects, CRM records, workflows, and the server request."],
      ["Can GoHighLevel implement Meta CAPI natively?", "GoHighLevel offers Meta CAPI workflow features. A custom or managed implementation may be useful when you need stronger control over page-level data, restrictions, or event construction."],
      ["Should I send every available field?", "No. Send accurate, permitted values that are connected to the real conversion. Do not invent values to make the event look more complete."]
    ],
    related: ["/how-does-meta-capi-work", "/how-to-set-up-meta-capi", "/gohighlevel-native-capi-vs-custom-capi", "/improve-meta-event-match-quality"],
    sources: [
      ["Meta for Developers: Conversions API parameters", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/"],
      ["Meta for Developers: Deduplicate Pixel and server events", "https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/"],
      ["HighLevel: Understanding attribution sources", "https://help.gohighlevel.com/support/solutions/articles/48001219997-understanding-attribution-source"]
    ]
  },
  {
    path: "/how-to-use-meta-capi",
    category: "Usage",
    eyebrow: "Using Meta CAPI",
    icon: "quality",
    title: "How to Use Meta CAPI for Leads and Bookings",
    description: "Learn how to use Meta CAPI after setup. Track real leads and bookings, keep event names consistent, monitor quality, and avoid sending meaningless CRM activity.",
    h1: "How to use Meta CAPI for real leads and bookings",
    intro: "Meta CAPI is most useful when it reports a small number of meaningful actions consistently. Use it to send real conversions, not every click, contact update, or workflow step in the CRM.",
    quickAnswer: "Use Meta CAPI by connecting each meaningful conversion to one server event. Send Lead after a real lead form, Schedule after a completed appointment, and Purchase after a successful payment. Keep the event data accurate, monitor Meta Events Manager, and add later-stage events only when they represent a real business outcome.",
    readTime: "7 min read",
    keywords: ["how to use meta capi", "use Meta CAPI", "Meta CAPI leads", "Meta CAPI bookings"],
    sections: [
      {
        id: "meaningful-events",
        title: "Use Meta CAPI for meaningful events",
        paragraphs: [
          "Start with the actions used to measure or optimize campaigns. A contact form, quote request, appointment booking, or paid checkout is clearer than a vague internal automation step.",
          "In GoHighLevel, a tag added or pipeline card moved does not always mean a new conversion. Send the event only when the underlying customer action really occurred."
        ],
        bullets: [
          "Lead after a real lead submission",
          "Schedule after a completed booking",
          "Purchase after payment succeeds",
          "QualifiedLead after the lead is genuinely qualified"
        ]
      },
      {
        id: "consistent-use",
        title: "Keep names and triggers consistent",
        paragraphs: [
          "Use one agreed event name for each conversion across the Pixel, CAPI, reports, and documentation. Changing between Lead, CompleteRegistration, and custom names for the same form creates confusion.",
          "Keep one trigger responsible for the server event. Several workflows or plugins sending the same event can create duplicates."
        ],
        bullets: [
          "One event name",
          "One trigger",
          "One stable event ID",
          "One client dataset",
          "One documented owner"
        ]
      },
      {
        id: "monitor",
        title: "Monitor events after launch",
        paragraphs: [
          "Review Meta Events Manager after real traffic begins. Look for delivery problems, duplicate events, missing fields, or unexpected event volume.",
          "Use your CRM and website records to compare the number of real conversions with the events Meta received. The numbers may not match perfectly, but large differences need investigation."
        ],
        bullets: [
          "Test Events during setup",
          "Diagnostics after launch",
          "Event volume compared with the CRM",
          "Event Match Quality trends",
          "Unexpected duplicates or missing events"
        ]
      }
    ],
    checklist: [
      "Track only meaningful conversions",
      "Use consistent event names",
      "Avoid overlapping workflows and plugins",
      "Keep the event tied to the correct client dataset",
      "Review Events Manager regularly",
      "Compare event volume with real CRM outcomes"
    ],
    checklistTitle: "Using Meta CAPI well",
    faq: [
      ["How to use Meta CAPI?", "Connect each real conversion to one protected server event, send accurate matching information, and monitor the event in Meta Events Manager."],
      ["What events should I use first?", "Lead and Schedule are common starting points for service businesses. Use Purchase for successful payments and later-stage events only when they represent real outcomes."],
      ["Can I use Meta CAPI without ads running?", "Yes. You can install and test the event before campaigns launch. Meta attribution and optimization become relevant when ad traffic is present."],
      ["How often should I check Meta CAPI?", "Check after launch, after page or workflow changes, and whenever event volume, diagnostics, or campaign reporting looks unusual."]
    ],
    related: ["/how-does-meta-capi-work", "/how-to-test-meta-capi", "/gohighlevel-meta-capi-form-submission", "/gohighlevel-meta-capi-calendar-booking"],
    sources: [
      ["Meta for Developers: Conversions API", "https://developers.facebook.com/docs/marketing-api/conversions-api/"],
      ["Meta for Developers: Conversions API parameters", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/"],
      ["HighLevel: Facebook Conversions API trigger in workflows", "https://help.gohighlevel.com/support/solutions/articles/48001185099-facebook-conversions-api-trigger-in-workflows"]
    ]
  },
  {
    path: "/how-to-test-meta-capi",
    category: "Testing",
    eyebrow: "Meta CAPI testing",
    icon: "test",
    title: "How to Test Meta CAPI in Meta Events Manager",
    description: "Learn how to test Meta CAPI with a real form submission or booking. Use Test Events, inspect the server event, check deduplication, and troubleshoot missing events.",
    h1: "How to test Meta CAPI before launch",
    intro: "A good test follows the same path a real customer uses. Open the published page, complete the form or booking, and inspect the server event inside Meta Events Manager.",
    quickAnswer: "Open Meta Events Manager and its Test Events view, then complete the real conversion on the published website. Confirm the server event appears with the correct name, time, source URL, event ID, and matching fields. When the Pixel also sends the event, confirm the browser and server events are connected rather than counted twice.",
    readTime: "7 min read",
    keywords: ["how to test meta capi", "Meta CAPI Test Events", "test Meta CAPI", "GoHighLevel CAPI test"],
    sections: [
      {
        id: "real-test",
        title: "Run a real conversion test",
        paragraphs: [
          "Use the public page, a fresh contact, and the real form or calendar. Workflow test buttons and editor previews may skip the attribution values attached to a normal visitor.",
          "For GoHighLevel, confirm the contact entered the intended workflow and that the CAPI action or server request ran after the conversion."
        ],
        bullets: [
          "Use the published URL",
          "Open a clean browser session",
          "Use a new email or phone",
          "Complete the real form or booking",
          "Check the workflow execution"
        ]
      },
      {
        id: "inspect-event",
        title: "Inspect the event Meta received",
        paragraphs: [
          "Confirm the event name and source. Then inspect event time, event ID, source URL, action source, and the matching information that was available.",
          "An event appearing in Test Events proves delivery. It does not automatically prove good attribution, strong matching, or correct deduplication."
        ],
        bullets: [
          "Correct dataset",
          "Correct event name",
          "Server event received",
          "Correct source URL",
          "Expected matching fields",
          "Shared event ID when the Pixel also fires"
        ]
      },
      {
        id: "troubleshoot",
        title: "Troubleshoot based on where the event stopped",
        paragraphs: [
          "If the website did not send a request, inspect the installation and form selector. If the server received the request but Meta did not, inspect the access token, dataset ID, event payload, and API response.",
          "If Meta received the event but reporting is weak, inspect click identifiers, browser identifiers, identity data, event source, and whether the event occurred inside the attribution window."
        ],
        bullets: [
          "No browser request: installation problem",
          "Server error: endpoint or authentication problem",
          "No event in Meta: dataset, token, or payload problem",
          "Event received with weak data: capture or mapping problem",
          "Two conversions: deduplication problem"
        ]
      }
    ],
    checklist: [
      "Open Meta Test Events",
      "Use the published conversion page",
      "Complete a real form or booking",
      "Confirm the server event appears",
      "Inspect event name, source, ID, and matching fields",
      "Confirm browser and server deduplication",
      "Check Diagnostics after launch"
    ],
    checklistTitle: "Meta CAPI test checklist",
    faq: [
      ["How to test Meta CAPI?", "Complete a real conversion on the published website while Meta Test Events is open, then inspect the server event and its details."],
      ["Why does my workflow test not show a useful Meta event?", "A workflow test may bypass the real website visit, form attribution, browser identifiers, or normal trigger path."],
      ["What does a successful Meta CAPI test prove?", "It proves that Meta received the server event. You must still check event quality, source data, deduplication, and production diagnostics."],
      ["Why do I see two Lead events?", "The Pixel and server event may be using different event IDs, or several tools may be reporting the same conversion."]
    ],
    related: ["/gohighlevel-meta-capi-test-events", "/meta-capi-no-attribution-data", "/meta-capi-event-deduplication", "/how-to-install-meta-capi"],
    sources: [
      ["Meta for Developers: Test events with Conversions API", "https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api/#testEvents"],
      ["Meta for Developers: Troubleshoot Conversions API", "https://developers.facebook.com/docs/marketing-api/conversions-api/guides/troubleshooting"],
      ["HighLevel: Facebook Conversion API workflow trigger troubleshooting", "https://help.gohighlevel.com/support/solutions/articles/48001185898-facebook-conversion-api-workflow-trigger-not-working"]
    ]
  },
  {
    path: "/how-to-get-meta-capi-access-token",
    category: "Access token",
    eyebrow: "Meta CAPI credentials",
    icon: "link",
    title: "How to Get a Meta CAPI Access Token",
    description: "Learn how to get a Meta CAPI access token from Events Manager, where to store it, which dataset it belongs to, and why it must never be placed in public page code.",
    h1: "How to get a Meta CAPI access token safely",
    intro: "The access token allows a server to send events to a specific Meta dataset. Generate it from the correct dataset and keep it in a protected server environment, not inside the script installed on the website.",
    quickAnswer: "Open Meta Events Manager, select the correct dataset, open Settings, find the Conversions API section, and generate an access token. Copy it once, store it in a secure server-side environment variable, and confirm the dataset ID and token belong to the same client setup.",
    readTime: "6 min read",
    keywords: ["how to get meta capi access token", "Meta CAPI access token", "Conversions API access token"],
    sections: [
      {
        id: "generate-token",
        title: "Generate the token from the correct dataset",
        paragraphs: [
          "Start in the client's Meta business and open Events Manager. Select the dataset used by the website and ad account, then open its Settings area.",
          "The Conversions API section provides the option to generate an access token when your account has the required permissions. Copy the token when Meta shows it."
        ],
        bullets: [
          "Open the correct Meta business",
          "Select the correct dataset",
          "Open dataset Settings",
          "Find Conversions API",
          "Generate and copy the access token"
        ]
      },
      {
        id: "protect-token",
        title: "Keep the access token out of public code",
        paragraphs: [
          "An access token is a secret. Anyone who can read public page JavaScript can copy a token placed there. Store it in server environment variables or a protected secret manager.",
          "The website script should call your controlled endpoint. The endpoint should read the token privately and send the event to Meta."
        ],
        bullets: [
          "Do not paste it into page HTML",
          "Do not commit it to GitHub",
          "Do not expose it in browser responses",
          "Use environment variables",
          "Replace it if it was exposed"
        ]
      },
      {
        id: "token-problems",
        title: "Common access-token problems",
        paragraphs: [
          "A token may fail because it belongs to the wrong dataset, the account lost access, the token was copied incorrectly, or the server is using an old secret.",
          "When troubleshooting, check the API response and confirm the exact dataset ID used by the request. Do not solve token errors by moving the secret into the browser."
        ],
        bullets: [
          "Wrong dataset ID",
          "Wrong business or client account",
          "Insufficient permission",
          "Expired, replaced, or revoked token",
          "Environment variable not redeployed"
        ]
      }
    ],
    checklist: [
      "Select the correct client dataset",
      "Generate the access token in Events Manager",
      "Copy it immediately",
      "Store it as a server-side secret",
      "Confirm the server uses the matching dataset ID",
      "Redeploy after changing environment variables",
      "Replace the token if it was exposed"
    ],
    checklistTitle: "Meta access-token check",
    faq: [
      ["How to get Meta CAPI access token?", "Open the dataset in Meta Events Manager, go to Settings, find the Conversions API section, and generate the access token."],
      ["Can I put the Meta CAPI access token in JavaScript?", "No. Public JavaScript can be viewed by website visitors. Keep the token in a protected server environment."],
      ["Is the access token connected to the Pixel ID or dataset ID?", "Use the dataset selected in Events Manager and ensure the server request sends events to that matching dataset ID."],
      ["What should I do if I exposed the token?", "Generate or rotate the token, update the protected server secret, redeploy the service, and remove the exposed value from code and history where possible."]
    ],
    related: ["/how-to-set-up-meta-capi", "/how-to-implement-meta-capi", "/how-to-test-meta-capi", "/gohighlevel-meta-capi"],
    sources: [
      ["Meta for Developers: Conversions API access token", "https://developers.facebook.com/docs/marketing-api/conversions-api/get-started/#access-token"],
      ["Meta for Developers: Conversions API get started", "https://developers.facebook.com/docs/marketing-api/conversions-api/get-started/"],
      ["Meta for Developers: Marketing API security", "https://developers.facebook.com/docs/marketing-api/overview/authorization/"]
    ]
  }
];

export const META_BEGINNER_PATHS = new Set(META_BEGINNER_POSTS.map((post) => post.path));

export const META_BEGINNER_SUMMARIES = META_BEGINNER_POSTS.map(({ path, category, title, description, icon }) => ({
  href: path,
  category,
  title,
  description,
  icon
}));

export function getMetaBeginnerPost(path) {
  return META_BEGINNER_POSTS.find((post) => post.path === path) || META_BEGINNER_POSTS[0];
}
