/**
 * Cloudflare Worker - OpenAI API Proxy
 *
 * This worker proxies requests to OpenAI's API, adding your API key server-side.
 * This solves CORS issues and keeps your API key secure.
 *
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to https://dash.cloudflare.com/
 * 2. Click "Workers & Pages" in the left sidebar
 * 3. Click "Create application" → "Create Worker"
 * 4. Name it "openai-proxy" and click "Deploy"
 * 5. Click "Edit code" and replace everything with this file's contents
 * 6. Click "Save and deploy"
 * 7. Go to Settings → Variables → Add variable:
 *    - Name: OPENAI_API_KEY
 *    - Value: your OpenAI API key (sk-...)
 *    - Click "Encrypt" to hide it
 * 8. Your endpoint will be: https://openai-proxy.<your-subdomain>.workers.dev/v1/chat/completions
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
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

    // Only allow POST requests
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Check if API key is configured
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured in worker" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    try {
      // Get the request body
      const body = await request.json();

      // Forward request to OpenAI
      const openaiResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
        }
      );

      // Get response data
      const data = await openaiResponse.json();

      // Return response with CORS headers
      return new Response(JSON.stringify(data), {
        status: openaiResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message || "Internal server error" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
