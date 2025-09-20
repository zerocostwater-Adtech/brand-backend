// backend/api/zap.js

export default async function handler(req, res) {
  // === CORS HEADERS ===
  res.setHeader("Access-Control-Allow-Origin", "*"); // temporarily allow all for debugging
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { zapType, payload } = req.body;

    // === Zapier Webhook URLs ===
    const WEBHOOKS = {
      OTP_GENERATION: process.env.ZAP_OTP_GENERATION,
      SEND_VERIFY_OTP: process.env.ZAP_SEND_VERIFY_OTP,
      USER_ENGAGEMENT: process.env.ZAP_USER_ENGAGEMENT,
      CAMPAIGN_ANALYTICS: process.env.ZAP_CAMPAIGN_ANALYTICS,
      BRAND_AUTH: process.env.ZAP_BRAND_AUTH,
      ADMIN_AUTH: process.env.ZAP_ADMIN_AUTH,
      BRAND_INQUIRY: process.env.ZAP_BRAND_INQUIRY,
    };

    const webhookUrl = WEBHOOKS[zapType];
    if (!webhookUrl) {
      console.error("❌ Invalid zapType:", zapType);
      return res.status(400).json({ success: false, error: "Invalid zapType" });
    }

    console.log("➡️ Forwarding to Zapier:", zapType, webhookUrl, payload);

    // Forward request to Zapier
    const zapRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await zapRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Zapier returned invalid JSON:", text);
      return res.status(500).json({ success: false, error: "Invalid JSON from Zapier", raw: text });
    }

    console.log("✅ Zapier response:", data);

    return res.status(200).json({ success: true, ...data });
  } catch (err) {
    console.error("❌ Zap Proxy Error:", err);
    return res.status(500).json({ success: false, error: "Zapier proxy failed" });
  }
}
