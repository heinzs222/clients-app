function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function htmlEscape(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function registrationDetails(event) {
  let payload = {};
  try { payload = JSON.parse(event.body || "{}"); } catch {}
  const user = payload.user || payload;
  return {
    id: clean(user.id),
    email: clean(user.email),
    name: clean(user.user_metadata?.full_name) || clean(user.user_metadata?.name) || "Not provided",
    createdAt: clean(user.created_at) || new Date().toISOString()
  };
}

async function sendNotification(details) {
  const apiKey = clean(process.env.RESEND_API_KEY);
  const to = clean(process.env.CAPI_ADMIN_EMAIL);
  const from = clean(process.env.CAPI_FROM_EMAIL);
  if (!apiKey || !to || !from) {
    console.log("Simple CAPI registration", { email: details.email, name: details.name, createdAt: details.createdAt });
    return { sent: false, reason: "notification_not_configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `New Simple CAPI registration: ${details.email || "unknown email"}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0b1c30">
          <h1 style="font-size:24px">New Simple CAPI registration</h1>
          <p><strong>Name:</strong> ${htmlEscape(details.name)}</p>
          <p><strong>Email:</strong> ${htmlEscape(details.email || "Not provided")}</p>
          <p><strong>Registered:</strong> ${htmlEscape(details.createdAt)}</p>
          <p style="color:#667085;font-size:13px">This notification was sent automatically by Simple CAPI.</p>
        </div>`
    })
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Registration notification failed: ${response.status} ${message.slice(0, 200)}`);
  }
  return { sent: true };
}

export async function handler(event) {
  const details = registrationDetails(event);
  try {
    await sendNotification(details);
  } catch (error) {
    console.error(error);
  }
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ success: true })
  };
}

export const __testing = { registrationDetails, htmlEscape };
