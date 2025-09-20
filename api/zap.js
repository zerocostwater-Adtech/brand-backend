// /api/zap.js

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { zapType, payload } = req.body;

    // Map Zap Types → Zapier Webhook URLs (from .env in Vercel)
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

    // Handle response safely (Zapier may return text, empty body, or JSON)
    const text = await zapRes.text();
    let data;
    try {
      data = JSON.parse(text); // try parsing as JSON
    } catch {
      data = { raw: text }; // fallback if response isn’t JSON
    }

    // Always return valid JSON to frontend
    return res.status(200).json({
      success: true,
      zapType,
      zapierStatus: zapRes.status,
      data,
    });
  } catch (err) {
    console.error("Zap Proxy Error:", err);
    return res.status(500).json({ error: "Zapier proxy failed" });
  }
}
