export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method Not Allowed" });

  try {
    const { zapType, payload } = req.body;
    console.log("➡ Incoming zapType:", zapType, payload);

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
      console.error("❌ Invalid zapType or missing webhook:", zapType);
      return res.status(500).json({ success: false, error: `Webhook not set for ${zapType}` });
    }

    const zapRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await zapRes.text();
    console.log("⬅ Zapier raw response:", text);

    // Try parse JSON, fallback to plain text
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.warn("⚠ Zapier returned non-JSON, using raw text instead");
      data = { raw: text };
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("❌ Zap Proxy Error:", err);
    return res.status(500).json({ success: false, error: "Zapier proxy failed", details: err.message });
  }
}
