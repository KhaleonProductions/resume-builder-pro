/**
 * Cloudflare Worker - Azure OpenAI API Proxy
 */

const AZURE_CONFIG = {
  endpoint: "https://sam-m9i3ejwi-eastus2.cognitiveservices.azure.com",
  apiVersion: "2024-02-15-preview",
  deployments: {
    "gpt-4o-mini": "gpt-5-mini",
    "gpt-4o": "gpt-5.2",
    "gpt-4-turbo": "gpt-5.2",
    "gpt-3.5-turbo": "gpt-5-nano",
    "default": "gpt-5.2"
  }
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Test endpoint - GET shows status
    if (request.method === "GET") {
      const hasKey = !!env.AZURE_API_KEY;
      return new Response(JSON.stringify({
        status: "Worker running",
        azure_key_configured: hasKey,
        endpoint: AZURE_CONFIG.endpoint,
        message: hasKey ? "Ready to proxy requests" : "ERROR: AZURE_API_KEY not set in Variables"
      }, null, 2), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Only allow POST
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Check API key
    const apiKey = env.AZURE_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AZURE_API_KEY not configured. Add it in Worker Settings → Variables." }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    try {
      const body = await request.json();
      const requestedModel = body.model || "default";
      const deployment = AZURE_CONFIG.deployments[requestedModel] || AZURE_CONFIG.deployments.default;

      const azureBody = { ...body };
      delete azureBody.model;

      // Azure's newer models use max_completion_tokens instead of max_tokens
      if (azureBody.max_tokens) {
        azureBody.max_completion_tokens = azureBody.max_tokens;
        delete azureBody.max_tokens;
      }

      // Some Azure models only support temperature of 1
      if (azureBody.temperature !== undefined) {
        delete azureBody.temperature;
      }

      const azureUrl = `${AZURE_CONFIG.endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${AZURE_CONFIG.apiVersion}`;

      console.log("Calling Azure:", azureUrl);

      const azureResponse = await fetch(azureUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify(azureBody),
      });

      const data = await azureResponse.json();

      // Log error responses for debugging
      if (!azureResponse.ok) {
        console.error("Azure error:", JSON.stringify(data));
      }

      return new Response(JSON.stringify(data), {
        status: azureResponse.status,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error) {
      console.error("Worker error:", error.message);
      return new Response(
        JSON.stringify({ error: error.message, details: "Check worker logs for more info" }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }
  },
};
