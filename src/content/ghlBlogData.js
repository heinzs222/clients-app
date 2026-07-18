export const GHL_BLOG_POSTS = [
  {
    path: "/gohighlevel-facebook-capi-workflow-not-working",
    category: "Troubleshooting",
    icon: "workflow",
    title: "GoHighLevel Facebook CAPI Workflow Not Working: What to Check",
    description: "Fix a GoHighLevel Facebook Conversions API workflow that is not sending events. Check the trigger, dataset, event action, attribution fields, and Meta Test Events.",
    h1: "GoHighLevel Facebook CAPI workflow not working? Check these points first.",
    intro: "A workflow can run inside GoHighLevel and still fail to produce a useful Meta event. The fastest fix is to separate trigger problems, field problems, and Meta delivery problems instead of changing everything at once.",
    quickAnswer: "Submit the real form or complete the real booking, confirm the workflow entered, inspect the Meta CAPI action, and then check Meta Test Events. Do not rely on GoHighLevel's workflow test button for this test because it may not reproduce the attribution data attached to a real visitor.",
    readTime: "6 min read",
    sections: [
      {
        id: "confirm-trigger",
        title: "1. Confirm the real trigger fired",
        paragraphs: [
          "Start in the workflow execution history. Confirm that the contact entered through the exact form, calendar, survey, pipeline stage, or Facebook lead-form trigger you intended.",
          "A manual workflow test proves that actions can run. It does not prove that the original Meta click information, browser identifiers, or page context were captured on a real submission."
        ],
        bullets: [
          "Submit the live form from the published page.",
          "Use a new test contact so an old workflow state does not hide the result.",
          "Check workflow filters, re-entry settings, and stop conditions.",
          "Confirm the contact reached the Meta Conversions API action."
        ]
      },
      {
        id: "check-action",
        title: "2. Check the Meta action and dataset",
        paragraphs: [
          "Open the Meta Conversions API action and verify the connected Facebook account, dataset, event name, and any required field mappings. A workflow may be healthy while the action points to the wrong client dataset.",
          "Use one clear event name for the conversion. A form submission is usually Lead. A completed booking is usually Schedule. Do not send several event names for the same action unless each represents a real, separate stage."
        ],
        bullets: [
          "Correct Facebook connection and client dataset",
          "Correct event name",
          "Email and phone mapped from the contact",
          "FBCLID, FBC, and FBP included when available",
          "Event source URL and user agent preserved when your setup supports them"
        ]
      },
      {
        id: "meta-test-events",
        title: "3. Decide whether the failure is in GHL or Meta",
        paragraphs: [
          "Open Meta Events Manager and use Test Events. If no server event appears, inspect the GoHighLevel action and its execution log. If the event appears but attribution or match quality is weak, the delivery worked and the missing information is the real problem.",
          "That distinction matters. Rebuilding the workflow will not restore a click ID that disappeared before the contact was created."
        ],
        bullets: [
          "No event in Meta: check action execution and dataset connection.",
          "Event received with weak details: check captured fields and mappings.",
          "Duplicate event: check Pixel and CAPI event IDs.",
          "Wrong event name: check workflow branches and overlapping actions."
        ]
      }
    ],
    checklist: [
      "Run a real submission, not only a workflow test",
      "Confirm the contact entered the correct workflow",
      "Confirm the CAPI action executed successfully",
      "Verify the selected dataset and event name",
      "Inspect Meta Test Events before changing the setup"
    ],
    faq: [
      ["Why does the workflow test pass but Meta receives nothing from the live form?", "The test may bypass the real page visit, attribution fields, or trigger conditions. Test with the published page and a new contact."],
      ["Can a GoHighLevel CAPI event be received without attribution?", "Yes. Delivery only proves that Meta received an event. Attribution depends on the available click, browser, identity, and source information."],
      ["Should I reconnect Facebook immediately?", "Only after confirming the workflow action is failing because of the connection. Reconnecting does not fix missing page data or incorrect field mapping."],
      ["Where should I look first?", "Workflow execution history, then the Meta action, then Meta Test Events. That order shows where the event stopped."]
    ],
    related: ["/gohighlevel-meta-capi-test-events", "/gohighlevel-fbclid-fbc-fbp-tracking", "/meta-capi-no-attribution-data"],
    sources: [
      ["HighLevel: Facebook Conversion API workflow trigger troubleshooting", "https://help.gohighlevel.com/support/solutions/articles/48001185898-facebook-conversion-api-workflow-trigger-not-working"],
      ["HighLevel: Facebook Conversions API trigger in workflows", "https://help.gohighlevel.com/support/solutions/articles/48001185099-facebook-conversions-api-trigger-in-workflows"]
    ]
  },
  {
    path: "/gohighlevel-meta-capi-form-submission",
    category: "Forms",
    icon: "form",
    title: "How to Track GoHighLevel Form Submissions with Meta CAPI",
    description: "Track a GoHighLevel form submission as a Meta Lead event without losing attribution or double counting the browser and server conversion.",
    h1: "Track GoHighLevel form submissions with Meta CAPI without creating a mess.",
    intro: "A clean form setup needs one defined conversion, one exact form, and one event identity that can survive the move from the page to GoHighLevel and then to Meta.",
    quickAnswer: "Use the live form submission as the trigger, send one Lead event for that form, preserve the original landing-page information before submission, and use the same event name and event ID when both the Meta Pixel and CAPI report the conversion.",
    readTime: "7 min read",
    sections: [
      {
        id: "choose-form",
        title: "Choose the exact form and conversion",
        paragraphs: [
          "Do not create a generic workflow that treats every form in the account as the same conversion. Select the exact form and decide what the submission means to the business.",
          "For most quote, contact, application, or estimate forms, Lead is the clearest starting event. Later stages such as QualifiedLead or Schedule should fire only when those actions actually happen."
        ],
        bullets: [
          "Use the specific form-submitted trigger.",
          "Name the workflow after the form and event.",
          "Avoid sending Lead again from several unrelated workflows.",
          "Keep client datasets separated by sub-account."
        ]
      },
      {
        id: "capture-before-submit",
        title: "Capture attribution before the form submits",
        paragraphs: [
          "The form is the end of the visit, not the beginning. Store useful values when the visitor arrives so redirects, multi-step pages, and delayed submissions do not remove them.",
          "Useful values can include FBCLID, FBC, FBP, UTMs, landing page, referrer, user agent, and a stable event ID. Only send values you actually captured and are permitted to process."
        ],
        bullets: [
          "Original landing page",
          "Meta click and browser identifiers when available",
          "UTM campaign values",
          "Email and phone from the submitted form",
          "A unique event ID for that submission"
        ]
      },
      {
        id: "avoid-duplicates",
        title: "Keep Pixel and CAPI tied to one conversion",
        paragraphs: [
          "When the browser Pixel and server CAPI both send Lead, Meta needs to recognize that they describe the same form submission. Use the same event name and event ID on both paths.",
          "If the page script creates one ID and the workflow creates another, Meta may treat them as separate conversions. That is how a simple form starts reporting two leads for one person, because software enjoys multiplying paperwork."
        ],
        bullets: [
          "Generate the event ID once.",
          "Send it with the browser Lead event.",
          "Carry it into the form or server request.",
          "Reuse it for retries of the same submission."
        ]
      }
    ],
    checklist: [
      "Select one exact GoHighLevel form",
      "Use Lead only when the form represents a real lead",
      "Capture attribution before the submit action",
      "Share one event ID between browser and server",
      "Verify one browser event and one server event in Meta"
    ],
    faq: [
      ["Should every GoHighLevel form fire a Meta Lead event?", "No. Track forms that represent a meaningful conversion. Support requests, newsletter forms, and internal forms may need different events or no ad conversion event."],
      ["Can I use a GoHighLevel workflow only, without page code?", "Yes, but the workflow can only send information that reached the contact record. Page-level capture is often needed for stronger attribution and browser context."],
      ["What if the form is embedded on another website?", "The iframe boundary changes what the outer page can read. Use an implementation that can capture the submission inside the form context or send the event from the CRM workflow."],
      ["How do I test it?", "Submit the published form with a fresh contact while Meta Test Events is open, then compare the browser and server event details."]
    ],
    related: ["/gohighlevel-meta-capi-embedded-forms", "/gohighlevel-meta-capi-double-counting", "/gohighlevel-fbclid-fbc-fbp-tracking"],
    sources: [
      ["HighLevel: Funnel Event Pixel for Facebook Conversions API", "https://help.gohighlevel.com/support/solutions/articles/48001236281"],
      ["HighLevel: Understanding attribution traffic sources", "https://help.gohighlevel.com/support/solutions/articles/48001219997-understanding-attribution-source"]
    ]
  },
  {
    path: "/gohighlevel-meta-capi-calendar-booking",
    category: "Calendars",
    icon: "calendar",
    title: "How to Send a Meta Schedule Event from a GoHighLevel Calendar",
    description: "Send a Meta Schedule event only after a successful GoHighLevel booking. Preserve attribution, avoid early firing, and test the completed appointment event.",
    h1: "Send the Meta Schedule event after the GoHighLevel booking is complete.",
    intro: "Opening a calendar is not a scheduled appointment. The Schedule event should represent a completed booking, with the original lead and attribution data still attached.",
    quickAnswer: "Trigger Schedule from the confirmed appointment or booking-success step, not from the calendar page view. Keep the same contact identity and original campaign values from the lead visit, then test the server event after a real booking.",
    readTime: "6 min read",
    sections: [
      {
        id: "right-trigger",
        title: "Use a completed-booking trigger",
        paragraphs: [
          "A Schedule event should fire after the appointment is created. Firing when the calendar loads, when a date is selected, or when someone starts the booking process inflates results and trains Meta on incomplete actions.",
          "Use the appointment-created trigger, the confirmed booking workflow, or a dedicated confirmation page that only appears after success."
        ],
        bullets: [
          "Appointment created",
          "Booking confirmed",
          "Successful calendar submission",
          "Dedicated thank-you page after the booking"
        ]
      },
      {
        id: "carry-attribution",
        title: "Carry the original lead data into the booking",
        paragraphs: [
          "The booking may happen minutes or days after the first landing-page visit. Store the campaign and browser information early and keep it on the same contact record.",
          "If the calendar creates a second contact or loses the original identifiers, the Schedule event may arrive without the context that connected the Lead event to the ad."
        ],
        bullets: [
          "Use consistent email and phone values.",
          "Avoid duplicate contacts for the same person.",
          "Preserve FBCLID, FBC, FBP, UTMs, and source URL when available.",
          "Use a distinct Schedule event ID for the booking."
        ]
      },
      {
        id: "test-schedule",
        title: "Test the full booking path",
        paragraphs: [
          "Book a real test appointment from the published funnel. Confirm that one Schedule event appears after success and not before.",
          "Also check that rescheduling, page refreshes, and reminder workflows do not create extra Schedule events. A booking event should describe the booking once, not every administrative action afterward."
        ],
        bullets: [
          "No Schedule event on calendar view",
          "One Schedule event on completed booking",
          "No duplicate from confirmation-page refresh",
          "No second event from reminder or reschedule workflows"
        ]
      }
    ],
    checklist: [
      "Trigger after the appointment is created",
      "Keep the booking on the original contact",
      "Preserve campaign and browser information",
      "Use a new event ID for the Schedule conversion",
      "Test refresh, reschedule, and reminder behavior"
    ],
    faq: [
      ["Should Schedule fire when someone opens the calendar?", "No. It should represent a completed booking, not intent to book."],
      ["Can I send Lead and Schedule for the same person?", "Yes. They are separate funnel stages and should have separate event IDs. Send each only when that stage occurs."],
      ["What if the booking happens days after the original click?", "Store the available attribution and identity data on the contact so the later Schedule event remains connected to the original journey."],
      ["Should a reschedule fire another Schedule event?", "Usually no, because it is still the same conversion. Track a separate event only when the business has a clear reason and measurement plan."]
    ],
    related: ["/gohighlevel-meta-capi-qualified-leads", "/gohighlevel-fbclid-fbc-fbp-tracking", "/gohighlevel-meta-capi-test-events"],
    sources: [
      ["HighLevel: Adding custom forms to calendars", "https://help.gohighlevel.com/support/solutions/articles/48001076135-adding-custom-forms-to-calendars"],
      ["Meta: About Conversions API", "https://www.facebook.com/business/help/AboutConversionsAPI"]
    ]
  },
  {
    path: "/gohighlevel-fbclid-fbc-fbp-tracking",
    category: "Attribution",
    icon: "link",
    title: "FBCLID, FBC, and FBP in GoHighLevel Meta CAPI",
    description: "Understand FBCLID, FBC, and FBP in a GoHighLevel Meta CAPI setup. Learn what each value does, where it disappears, and how to preserve it.",
    h1: "FBCLID, FBC, and FBP: the GoHighLevel attribution fields people keep mixing up.",
    intro: "These values are related, but they are not interchangeable. A reliable setup captures each one at the right point and does not invent values when they are unavailable.",
    quickAnswer: "FBCLID is the click identifier commonly found in the landing URL. FBC is Meta's formatted click-cookie value. FBP is the browser identifier from the Meta Pixel cookie. Capture them on the landing page when available, store them before redirects, and pass them into the server event.",
    readTime: "8 min read",
    sections: [
      {
        id: "difference",
        title: "What each value means",
        paragraphs: [
          "FBCLID usually arrives in the URL after a Meta ad click. FBC represents click information in the format Meta expects for matching. FBP identifies the browser through the Meta Pixel cookie.",
          "Not every visitor will have all three. Organic traffic may have no FBCLID. Consent choices, browser settings, ad blockers, and redirects can also limit what is available."
        ],
        bullets: [
          "FBCLID: click value from the landing URL",
          "FBC: formatted click identifier used in Meta matching",
          "FBP: browser identifier created by the Meta Pixel",
          "UTMs: campaign labels for your reporting, not replacements for Meta identifiers"
        ]
      },
      {
        id: "where-lost",
        title: "Where GoHighLevel setups lose the values",
        paragraphs: [
          "The most common loss happens before GoHighLevel receives the form. A redirect removes the query string, a button sends the visitor to another page, or an embedded form submits without carrying the parent page values.",
          "Capture the information on the first landing page and store it in a controlled browser or contact field flow. Waiting until the workflow runs is too late if the values never reached the contact."
        ],
        bullets: [
          "Redirects that drop query parameters",
          "Forms hosted on another domain or iframe",
          "Custom fields not included in the form or webhook",
          "New contacts created without the original attribution",
          "Workflows that overwrite an existing first-touch value"
        ]
      },
      {
        id: "safe-handling",
        title: "How to handle the fields without fabricating data",
        paragraphs: [
          "Send the values when they are present and valid. Do not create fake click IDs or copy identifiers between unrelated visitors. More fields do not improve tracking when the values are wrong.",
          "Keep first-touch and latest-touch reporting separate if the business needs both. That prevents a later visit from erasing the original campaign history."
        ],
        bullets: [
          "Capture early",
          "Validate before sending",
          "Store the original value",
          "Do not overwrite with blanks",
          "Do not use UTMs as fake Meta identifiers"
        ]
      }
    ],
    checklist: [
      "Confirm FBCLID is present on a real Meta ad click",
      "Confirm FBP is created when the Pixel is allowed to run",
      "Store values before any redirect",
      "Map fields through the form and workflow",
      "Inspect the final event in Meta Test Events"
    ],
    faq: [
      ["Is FBCLID always present?", "No. It is usually associated with a Meta ad click and can be absent for organic visits or when the URL value is removed."],
      ["Can UTMs replace FBC or FBP?", "No. UTMs are useful campaign labels, but they do not replace Meta's click and browser identifiers."],
      ["Should I generate FBC from FBCLID?", "A valid implementation can format and store FBC from a real FBCLID. Do not generate it when no real click identifier exists."],
      ["Why does GoHighLevel show attribution but Meta still says no attribution data?", "GoHighLevel attribution fields and Meta matching fields are related but not identical. Inspect the exact server payload Meta received."]
    ],
    related: ["/meta-capi-no-attribution-data", "/improve-meta-event-match-quality", "/gohighlevel-meta-capi-form-submission"],
    sources: [
      ["HighLevel: Understanding attribution traffic sources", "https://help.gohighlevel.com/support/solutions/articles/48001219997-understanding-attribution-source"],
      ["Meta: About Conversions API", "https://www.facebook.com/business/help/AboutConversionsAPI"]
    ]
  },
  {
    path: "/gohighlevel-meta-capi-double-counting",
    category: "Deduplication",
    icon: "merge",
    title: "Fix GoHighLevel Meta CAPI Double Counting",
    description: "Stop GoHighLevel Meta CAPI from counting one lead twice. Align Pixel and server event names, event IDs, and overlapping integrations.",
    h1: "One GoHighLevel lead showing twice in Meta? Fix the event identity first.",
    intro: "Double counting usually means the browser and server events cannot recognize each other, or more than one tool is sending the same conversion.",
    quickAnswer: "Use the same event name and event ID for the Pixel and CAPI copy of one conversion. Then remove overlapping native, workflow, GTM, plugin, and custom events that send an additional Lead with a different ID.",
    readTime: "7 min read",
    sections: [
      {
        id: "how-dedupe-works",
        title: "How browser and server deduplication works",
        paragraphs: [
          "The Meta Pixel and Conversions API are separate delivery paths. When both report the same conversion, the event name and event ID must match so Meta can treat them as one action.",
          "The event ID must still be unique to that conversion. Reusing one ID for several different leads creates a different reporting problem."
        ],
        bullets: [
          "Same conversion: same event name and same event ID",
          "Different conversion: new event ID",
          "Retry of the same conversion: reuse the original event ID",
          "Different funnel stage: separate event and event ID"
        ]
      },
      {
        id: "overlapping-tools",
        title: "Find every tool that can send Lead",
        paragraphs: [
          "GoHighLevel can send events through native funnel tracking and workflow actions. A page may also contain GTM, a direct Pixel event, another CAPI provider, or custom code.",
          "Make a simple inventory. If three systems report Lead on the same form submit, perfect deduplication between two of them still leaves the third event."
        ],
        bullets: [
          "GoHighLevel funnel event tracking",
          "GoHighLevel Meta CAPI workflow action",
          "Meta Pixel event code",
          "Google Tag Manager",
          "Third-party CAPI provider",
          "Custom JavaScript or webhook"
        ]
      },
      {
        id: "verify-fix",
        title: "Verify the fix in Meta Events Manager",
        paragraphs: [
          "Use Test Events and inspect the browser and server copies. Confirm the event names match and the IDs are identical for one test submission.",
          "Then check Diagnostics and the event-source breakdown after production traffic arrives. Do not judge the final result from one screen refresh immediately after deployment."
        ],
        bullets: [
          "One browser event",
          "One server event",
          "Matching event name",
          "Matching event ID",
          "No extra event from another workflow or script"
        ]
      }
    ],
    checklist: [
      "List every integration that sends the conversion",
      "Keep one browser path and one server path",
      "Match the event name exactly",
      "Share one event ID for the same conversion",
      "Test retries and page refreshes"
    ],
    faq: [
      ["Does external_id deduplicate Pixel and CAPI events?", "The normal browser-and-server deduplication plan uses matching event names and event IDs. External ID is useful for matching, but it should not replace the shared event ID strategy."],
      ["Can I disable the Pixel and use only CAPI?", "Yes, but you lose browser-side signals. Many setups use both and deduplicate them correctly."],
      ["Why are Schedule events higher than Lead events?", "A Schedule workflow may be firing more than once, or the Lead and Schedule events may come from different tracking systems. Audit the triggers and event sources."],
      ["Should a retry create a new event ID?", "No. A retry of the same conversion should reuse the original ID."]
    ],
    related: ["/meta-capi-event-deduplication", "/gohighlevel-meta-capi-form-submission", "/gohighlevel-native-capi-vs-custom-capi"],
    sources: [
      ["HighLevel: Facebook Conversions API trigger in workflows", "https://help.gohighlevel.com/support/solutions/articles/48001185099-facebook-conversions-api-trigger-in-workflows"],
      ["HighLevel: Enhanced Meta Pixel tracking", "https://ideas.gohighlevel.com/changelog/enhanced-meta-pixel-tracking-for-funnel-and-website-builder"]
    ]
  },
  {
    path: "/gohighlevel-meta-capi-test-events",
    category: "Testing",
    icon: "test",
    title: "How to Test GoHighLevel Meta CAPI in Meta Test Events",
    description: "Test a GoHighLevel Meta CAPI Lead or Schedule event correctly. Use a real form or booking, inspect browser and server details, and remove test codes afterward.",
    h1: "Test GoHighLevel Meta CAPI with a real conversion, not a pretend workflow run.",
    intro: "Meta Test Events is most useful when the test follows the same path as a real visitor. That means a published page, a real form or booking, and the actual workflow action.",
    quickAnswer: "Open Meta Test Events, add the temporary test code if your integration requires it, submit the published form or complete the booking, inspect the event details, and remove the test code before normal traffic continues.",
    readTime: "6 min read",
    sections: [
      {
        id: "prepare-test",
        title: "Prepare one controlled test",
        paragraphs: [
          "Use a new email address or phone number so contact deduplication and workflow re-entry do not confuse the result. Open the workflow execution view and Meta Test Events side by side.",
          "Keep the test focused on one event. Testing Lead, Schedule, Purchase, and three pipeline stages at once turns troubleshooting into archaeology."
        ],
        bullets: [
          "One published page",
          "One fresh test contact",
          "One selected event",
          "Meta Test Events open",
          "Workflow history ready"
        ]
      },
      {
        id: "run-real-path",
        title: "Run the real visitor path",
        paragraphs: [
          "Visit the live page with the test campaign parameters you need, then submit the form or finish the booking. Confirm the workflow starts from the intended trigger.",
          "HighLevel specifically warns that the workflow test button is not the correct way to validate the Facebook CAPI workflow trigger. A real submission carries the real contact and attribution context."
        ],
        bullets: [
          "Do not use only the workflow test button.",
          "Do not reuse an old contact that cannot re-enter.",
          "Do not refresh a confirmation page repeatedly.",
          "Do not leave several test integrations enabled."
        ]
      },
      {
        id: "inspect-result",
        title: "Inspect more than the green received status",
        paragraphs: [
          "Open the event details and review event name, source, time, event ID, user data, browser identifiers, and source URL. A received event can still be incomplete or duplicated.",
          "After testing, remove the temporary test-event code. Leaving it in production can keep normal events in the test view instead of the reporting flow you expect."
        ],
        bullets: [
          "Correct event name and dataset",
          "Server source present",
          "Expected identity fields",
          "FBC and FBP when available",
          "Correct event source URL",
          "Matching event ID when Pixel also fires"
        ]
      }
    ],
    checklist: [
      "Use a new test contact",
      "Submit the published form or booking",
      "Confirm the workflow execution",
      "Inspect the full event details",
      "Remove the test code after validation"
    ],
    faq: [
      ["Why does Meta Test Events show nothing?", "Check whether the workflow action executed, whether the correct dataset is selected, and whether the test code was added in the correct place."],
      ["Why should I avoid the workflow test button?", "It may not reproduce the real trigger and visitor attribution data used by the live form or booking."],
      ["Can I test without a Meta ad click?", "Yes, but you should not expect real ad-click identifiers from a direct visit. Test delivery first, then test attribution with a controlled ad-click path."],
      ["When do I remove the test code?", "Immediately after the setup is validated and before relying on normal production reporting."]
    ],
    related: ["/gohighlevel-facebook-capi-workflow-not-working", "/gohighlevel-meta-capi-checklist", "/gohighlevel-meta-capi-double-counting"],
    sources: [
      ["HighLevel: Facebook Conversion API workflow trigger not working", "https://help.gohighlevel.com/support/solutions/articles/48001185898-facebook-conversion-api-workflow-trigger-not-working"],
      ["Meta: About Conversions API", "https://www.facebook.com/business/help/AboutConversionsAPI"]
    ]
  },
  {
    path: "/gohighlevel-meta-capi-embedded-forms",
    category: "Embedded Forms",
    icon: "embed",
    title: "GoHighLevel Embedded Forms and Meta CAPI",
    description: "Track a GoHighLevel form embedded in an iframe without losing the conversion. Understand page boundaries, attribution capture, and CRM workflow options.",
    h1: "GoHighLevel embedded form inside an iframe? The outer page cannot see everything.",
    intro: "An embedded form often runs in a different document or domain from the landing page. That boundary affects form listeners, browser cookies, attribution fields, and where the tracking code must run.",
    quickAnswer: "Do not assume a script on the outer page can read a cross-origin GoHighLevel iframe submission. Track inside the form context when possible, or use the GoHighLevel form-submitted workflow and pass attribution values into the contact before submission.",
    readTime: "7 min read",
    sections: [
      {
        id: "iframe-boundary",
        title: "Understand the iframe boundary",
        paragraphs: [
          "A script on the parent page can see the iframe element, but browser security usually prevents it from reading a cross-origin form inside that iframe. A generic submit listener on the outer page may never fire.",
          "This is normal browser behavior, not a GoHighLevel bug. The implementation must respect where the form actually runs."
        ],
        bullets: [
          "Parent-page script may not access form fields.",
          "Parent-page cookies may not be available inside the iframe.",
          "The iframe URL may not contain the original campaign query string.",
          "A thank-you redirect may occur inside the iframe only."
        ]
      },
      {
        id: "implementation-options",
        title: "Choose the tracking point that can see the conversion",
        paragraphs: [
          "The cleanest options are a tracker installed inside the form page, a controlled postMessage integration between the iframe and parent, or a server event from the GoHighLevel form-submitted workflow.",
          "For most teams, the CRM workflow is simpler. The tradeoff is that the contact record must already contain the useful landing-page information."
        ],
        bullets: [
          "Install the form tracker inside the embedded document.",
          "Use a supported message from iframe to parent.",
          "Send the event from the GHL workflow.",
          "Use a dedicated success page outside the iframe only when the redirect is reliable."
        ]
      },
      {
        id: "preserve-parent-data",
        title: "Preserve the parent-page attribution",
        paragraphs: [
          "Capture campaign values on the outer landing page before the visitor interacts with the iframe. Then pass them into hidden fields, a supported form value, or another controlled handoff that reaches GoHighLevel.",
          "Do not claim attribution fields were captured merely because they exist on the parent URL. The final contact or event payload must contain them."
        ],
        bullets: [
          "Capture first landing URL and UTMs.",
          "Preserve FBCLID, FBC, and FBP when available.",
          "Verify hidden fields actually reach the contact.",
          "Inspect the final CAPI event rather than the parent page only."
        ]
      }
    ],
    checklist: [
      "Confirm whether the form is cross-origin",
      "Choose an inside-form or workflow tracking point",
      "Capture parent-page attribution before submission",
      "Verify values reach the GoHighLevel contact",
      "Test the exact embedded version used in production"
    ],
    faq: [
      ["Why does my JavaScript submit listener not detect the GHL form?", "The form may be inside a cross-origin iframe, which prevents the parent page from reading its internal DOM events."],
      ["Can I put the tracker on the parent page anyway?", "You can capture the visit there, but the parent still needs a reliable signal that the form succeeded."],
      ["Is a GoHighLevel workflow enough?", "It can reliably see the form submission, but it only has the attribution data that reached the contact record."],
      ["Should I use a thank-you page?", "A dedicated success page can work when every successful submission reaches it and failed or abandoned submissions do not."]
    ],
    related: ["/gohighlevel-meta-capi-form-submission", "/gohighlevel-fbclid-fbc-fbp-tracking", "/meta-capi-no-attribution-data"],
    sources: [
      ["HighLevel: Understanding attribution traffic sources", "https://help.gohighlevel.com/support/solutions/articles/48001219997-understanding-attribution-source"],
      ["HighLevel: Funnel Event Pixel for Facebook Conversions API", "https://help.gohighlevel.com/support/solutions/articles/48001236281"]
    ]
  },
  {
    path: "/gohighlevel-native-capi-vs-custom-capi",
    category: "Comparison",
    icon: "compare",
    title: "GoHighLevel Native Meta CAPI vs Custom CAPI",
    description: "Compare GoHighLevel's native Meta CAPI workflow with a custom server-side setup. Choose based on page ownership, attribution needs, event control, and maintenance.",
    h1: "GoHighLevel native Meta CAPI or custom CAPI? Use the smallest setup that solves the real problem.",
    intro: "Native and custom integrations can both work. The useful question is whether the conversion happens entirely inside GoHighLevel or crosses pages, forms, calendars, CRMs, and custom business rules.",
    quickAnswer: "Use GoHighLevel's native CAPI when the funnel, trigger, contact data, and event logic already live inside GHL. Use a custom setup when you need stronger page capture, external forms, exact event IDs, custom payload control, or a consistent agency-wide implementation.",
    readTime: "8 min read",
    sections: [
      {
        id: "native-fit",
        title: "When native GoHighLevel CAPI is a good fit",
        paragraphs: [
          "Native workflow actions are practical when the form, calendar, contact, and trigger all live inside one GoHighLevel sub-account. The team can configure the event without maintaining another server service.",
          "It is also easier for non-developers to inspect the workflow and change the trigger later."
        ],
        bullets: [
          "GHL form or calendar",
          "Simple Lead or Schedule event",
          "Attribution fields already stored on the contact",
          "No external page logic",
          "Team prefers workflow-based maintenance"
        ]
      },
      {
        id: "custom-fit",
        title: "When a custom CAPI setup earns its keep",
        paragraphs: [
          "A custom setup is useful when the landing page is outside GoHighLevel, the form is embedded, the event needs custom fields, or the same agency standard must work across several platforms.",
          "It can also provide tighter control over event IDs, normalization, hashing, retries, endpoint ownership, and which page or form is allowed to use the script."
        ],
        bullets: [
          "External or custom landing pages",
          "Embedded forms and multi-step journeys",
          "Strict browser and server deduplication",
          "Custom qualified-lead or pipeline events",
          "Agency-wide endpoint management"
        ]
      },
      {
        id: "avoid-overlap",
        title: "Do not run both blindly",
        paragraphs: [
          "Using native and custom CAPI for the same Lead event can create duplicate server events. Decide which integration owns the event, or design a shared event-ID plan across browser and server paths.",
          "More integrations do not create more accuracy. They create more places to forget why an event fired."
        ],
        bullets: [
          "Choose one owner for each event.",
          "Document the trigger and destination.",
          "Disable overlapping workflow actions.",
          "Verify event-source counts after launch."
        ]
      }
    ],
    checklist: [
      "Keep native CAPI for simple GHL-owned flows",
      "Use custom CAPI for external or controlled implementations",
      "Assign one owner to each conversion event",
      "Share event IDs only for matching browser and server copies",
      "Document the setup for the next person"
    ],
    faq: [
      ["Is custom CAPI always better?", "No. It adds control and maintenance. Native GHL CAPI can be the better choice for a simple workflow that already has the required data."],
      ["Can both run at the same time?", "They can, but sending the same server event twice is usually a mistake. Use one server owner per conversion."],
      ["Which option is better for agencies?", "A controlled custom standard can reduce account-to-account variation, but only when the agency is prepared to maintain it."],
      ["Will either option guarantee attribution?", "No. Both depend on the available data and Meta's matching and attribution systems."]
    ],
    related: ["/gohighlevel-meta-capi-checklist", "/gohighlevel-meta-capi-double-counting", "/meta-capi-for-agencies"],
    sources: [
      ["HighLevel: Facebook Conversions API trigger in workflows", "https://help.gohighlevel.com/support/solutions/articles/48001185099-facebook-conversions-api-trigger-in-workflows"],
      ["Meta: About Conversions API", "https://www.facebook.com/business/help/AboutConversionsAPI"]
    ]
  },
  {
    path: "/gohighlevel-meta-capi-qualified-leads",
    category: "Lead Quality",
    icon: "quality",
    title: "Send Qualified Lead Events from GoHighLevel to Meta",
    description: "Use GoHighLevel pipeline and qualification data to send useful lower-funnel events to Meta without replacing or duplicating the original Lead event.",
    h1: "Send qualified-lead events from GoHighLevel only when the lead is actually qualified.",
    intro: "A form submit tells Meta that someone raised a hand. A qualified-lead event should tell Meta that the business confirmed the lead meets a defined standard.",
    quickAnswer: "Send Lead at the real form submission, then send a separate qualified event only when a stable GoHighLevel rule is met, such as a completed qualification form, verified score, or controlled pipeline stage. Use a separate event ID and prevent repeated stage changes from firing it again.",
    readTime: "7 min read",
    sections: [
      {
        id: "define-qualified",
        title: "Define qualification before building the workflow",
        paragraphs: [
          "Write the business rule in plain language. A qualified lead might require a service area, budget, authority, property type, employee count, or another measurable condition.",
          "Do not use a vague pipeline stage that different team members interpret differently. Meta will optimize toward whatever event you send, including inconsistent human decisions."
        ],
        bullets: [
          "Clear required fields",
          "One documented scoring rule",
          "A controlled pipeline stage or tag",
          "A timestamp showing when qualification occurred"
        ]
      },
      {
        id: "separate-stages",
        title: "Keep Lead and Qualified Lead as separate stages",
        paragraphs: [
          "The original Lead event should still fire when the visitor submits the lead form. The later qualified event represents a new milestone and needs its own event ID.",
          "Keeping both stages lets you compare lead volume with lead quality instead of replacing the top-of-funnel signal entirely."
        ],
        bullets: [
          "Lead: form submission",
          "Qualified lead: business rule passed",
          "Schedule: appointment booked",
          "Purchase: completed revenue event"
        ]
      },
      {
        id: "prevent-repeat",
        title: "Prevent repeated pipeline changes from creating extra events",
        paragraphs: [
          "A contact may move backward and forward between stages. Add a sent timestamp, tag, or custom field so the qualified event fires once for the intended milestone.",
          "If the qualification genuinely changes and the business wants to report that change, create a documented rule rather than allowing every stage edit to send another event."
        ],
        bullets: [
          "Check whether the event was already sent.",
          "Store the sent time and event ID.",
          "Block workflow re-entry for the same milestone.",
          "Audit manual stage changes."
        ]
      }
    ],
    checklist: [
      "Document the qualification rule",
      "Send Lead at the original form submission",
      "Send a separate lower-funnel event later",
      "Use a separate event ID",
      "Prevent repeated stage changes from firing duplicates"
    ],
    faq: [
      ["Should I optimize campaigns for qualified leads immediately?", "Only after the event is accurate and receives enough consistent volume for meaningful optimization."],
      ["Can I use a pipeline stage as the trigger?", "Yes, when the stage has a clear definition and the workflow prevents repeated sends."],
      ["Should the qualified event use the original Lead event ID?", "No. It is a different funnel milestone and should have its own event ID."],
      ["What information should the later event include?", "Use the same stable contact identity and available attribution context, plus the correct event time and source details."]
    ],
    related: ["/gohighlevel-meta-capi-calendar-booking", "/gohighlevel-meta-capi-checklist", "/improve-meta-event-match-quality"],
    sources: [
      ["HighLevel: Facebook Conversions API Lead Event walkthrough", "https://help.gohighlevel.com/support/solutions/articles/48001233833"],
      ["HighLevel: Meta Conversion API action for Ads Manager", "https://help.gohighlevel.com/support/solutions/articles/155000003691/"]
    ]
  },
  {
    path: "/gohighlevel-meta-capi-checklist",
    category: "Checklist",
    icon: "checklist",
    title: "GoHighLevel Meta CAPI Setup Checklist",
    description: "A practical GoHighLevel Meta CAPI checklist covering dataset ownership, form and calendar triggers, attribution capture, deduplication, testing, and monitoring.",
    h1: "The GoHighLevel Meta CAPI checklist to run before ads start spending.",
    intro: "Use this checklist to catch the ordinary setup mistakes that create missing attribution, duplicate leads, weak matching, and unexplained events later.",
    quickAnswer: "Confirm the correct dataset, choose one owner for each event, capture attribution before the conversion, share event IDs between matching browser and server events, test the real visitor path, and monitor diagnostics after launch.",
    readTime: "9 min read",
    sections: [
      {
        id: "ownership",
        title: "Account and event ownership",
        paragraphs: [
          "Each client should use the Meta dataset and access credentials they control. The workflow, script, and endpoint should clearly state which client and event they serve.",
          "Assign one system to own each server event. A second integration should not quietly send the same Lead because someone forgot the first one existed."
        ],
        bullets: [
          "Correct client dataset",
          "Correct access token or partner connection",
          "One named owner for Lead",
          "One named owner for Schedule",
          "No shared credentials in public page code"
        ]
      },
      {
        id: "capture",
        title: "Landing-page and contact capture",
        paragraphs: [
          "Capture the original page and campaign information before redirects or embedded forms can remove it. Then verify that the values reach the GoHighLevel contact and the final event.",
          "Do not confuse fields that exist in the browser with fields that actually arrived in the workflow."
        ],
        bullets: [
          "Landing page and referrer",
          "FBCLID, FBC, and FBP when available",
          "UTM source, campaign, ad set, and ad",
          "User agent and source URL",
          "Normalized email and phone"
        ]
      },
      {
        id: "events",
        title: "Event naming, timing, and deduplication",
        paragraphs: [
          "Fire each event at the action it describes. Lead belongs on the meaningful form submission. Schedule belongs after the appointment is created. Qualified events belong after a documented rule is met.",
          "When the Pixel and CAPI both report the same action, keep the event name and event ID identical."
        ],
        bullets: [
          "Correct event name",
          "Correct trigger timing",
          "Unique ID for each conversion",
          "Shared ID for matching browser and server copies",
          "Retry uses the original ID"
        ]
      },
      {
        id: "testing-monitoring",
        title: "Testing and monitoring",
        paragraphs: [
          "Test the published page with a new contact. Confirm the workflow execution and inspect the full event in Meta Test Events. After launch, review Diagnostics and event-source counts rather than assuming the first successful test settles everything forever.",
          "Remove test codes, document the final setup, and repeat the check after major funnel or workflow changes."
        ],
        bullets: [
          "Live form or booking test",
          "Workflow execution confirmed",
          "Meta event details inspected",
          "Test code removed",
          "Diagnostics reviewed after production traffic"
        ]
      }
    ],
    checklist: [
      "Client owns the correct dataset",
      "Each event has one server-side owner",
      "The exact form or calendar is selected",
      "Attribution is captured before conversion",
      "Email and phone are normalized",
      "Lead and Schedule fire at the correct moment",
      "Browser and server copies share an event ID",
      "Retries reuse the same event ID",
      "Embedded forms are tested in their real page context",
      "A new contact can enter the workflow",
      "Meta Test Events shows the expected details",
      "No overlapping integration sends an extra event",
      "Temporary test codes are removed",
      "The setup is documented",
      "Diagnostics are reviewed after launch"
    ],
    faq: [
      ["Does passing this checklist guarantee perfect attribution?", "No. It verifies that the implementation sends the available information consistently. Meta controls final matching and attribution."],
      ["How often should I repeat the checklist?", "After major funnel, domain, form, calendar, workflow, dataset, or tracking changes, and during regular account audits."],
      ["What should I check first when results suddenly change?", "Look for recent page or workflow changes, connection changes, duplicate integrations, and missing attribution fields."],
      ["Should every event have browser and server copies?", "No. Use both where they add value. CRM-only lower-funnel events may be server-only and therefore do not need browser deduplication."]
    ],
    related: ["/gohighlevel-facebook-capi-workflow-not-working", "/gohighlevel-native-capi-vs-custom-capi", "/gohighlevel-meta-capi-test-events"],
    sources: [
      ["HighLevel: Tracking and attribution resources", "https://help.gohighlevel.com/support/solutions/folders/48000672285"],
      ["Meta: About Conversions API", "https://www.facebook.com/business/help/AboutConversionsAPI"],
      ["Meta: Set up the Meta Pixel and Conversions API", "https://www.facebook.com/help/messenger-app/952192354843755/"]
    ]
  }
];

export const GHL_BLOG_PATHS = new Set(GHL_BLOG_POSTS.map((post) => post.path));

export const GHL_BLOG_SUMMARIES = GHL_BLOG_POSTS.map(({ path: href, category, title, description, icon }) => ({
  href,
  category,
  title,
  description,
  icon
}));

export function getGhlBlogPost(path) {
  return GHL_BLOG_POSTS.find((post) => post.path === path) || GHL_BLOG_POSTS[0];
}
