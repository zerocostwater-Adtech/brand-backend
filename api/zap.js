// /api/zap.js

export default async function handler(req, res) {
  // === CORS HEADERS ===
  res.setHeader("Access-Control-Allow-Origin", "https://zerocostwater.lovable.app"); // your frontend domain
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
      CAMPAIGN_MANAGEMENT: process.env.ZAP_CAMPAIGN_MANAGEMENT,
      LEGAL_COMPLIANCE: process.env.ZAP_LEGAL_COMPLIANCE,
      PREDICTIVE_ANALYTICS: process.env.ZAP_PREDICTIVE_ANALYTICS,
      BRAND_INQUIRY: process.env.ZAP_BRAND_INQUIRY,
    };

    const webhookUrl = WEBHOOKS[zapType];
    if (!webhookUrl) {
      return res.status(400).json({ error: "Invalid zapType" });
    }

    // Forward request to Zapier
    const zapRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Parse Zapier response (empty fallback)
    const data = await zapRes.json().catch(() => ({}));

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Zap Proxy Error:", err);
    return res.status(500).json({ error: "Zapier proxy failed" });
  }
}
