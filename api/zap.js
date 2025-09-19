// /api/zap.js

export default async function handler(req, res) {
  // ✅ Health-check for browser GET
  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      message: "Zapier proxy is live. Use POST with { zapType, payload } to send data.",
      availableZapTypes: [
        "OTP_GENERATION",
        "SEND_VERIFY_OTP",
        "USER_ENGAGEMENT",
        "CAMPAIGN_ANALYTICS",
        "BRAND_AUTH",
        "ADMIN_AUTH",
        "CAMPAIGN_MANAGEMENT",
        "LEGAL_COMPLIANCE",
        "PREDICTIVE_ANALYTICS",
        "BRAND_INQUIRY"
      ]
    });
  }

  // Only POST is allowed for actual requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { zapType, payload } = req.body;

    // 🔑 Map zapType to environment variables
    const ZAP_MAP = {
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

    const webhookUrl = ZAP_MAP[zapType];
    if (!webhookUrl) {
      return res.status(400).json({ error: "Invalid zapType" });
    }

    // Forward the request to Zapier webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Zapier Proxy Error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
