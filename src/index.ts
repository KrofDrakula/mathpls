import { parse, PeggySyntaxError } from "./calculator/parser.js";

const instructions = (baseUrl: string) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="initial-scale=1"/>
    <title>Mathpls!</title>
  </head>
  <body>
    <h1>Mathpls!</h1>
    <p>For when you cannot math but you can make a web request!</p>
    <h2>Usage</h2>
    <p>To calculate a math expression, simply use the following URL to receive a JSON response:</p>
    <pre><code>${baseUrl}/calc/<em>expression</em></code></pre>
    <p>Where <code>expression</code> is a math expression that supports the following:<p>
    <ul>
      <li>+ - * / operators</li>
      <li>decimal numbers (in the form <code>-123.456e-789</code>)</li>
      <li>functions from <code>Math</code> can be invoked as expressions (like <code>atan2(1,2)</code>)</li>
      <li><code>pi</code> for 𝜋, <code>e</code> for Euler's number</li>
      <li>whitespace between tokens is ignored</li>
    </ul>
    <p>For example, to compute the Earth's circumference based on mean radius across equator, in meters:</p>
    <pre><code>${baseUrl}/calc/6.378137e6*2*pi</code></pre>
    <p>This returns the JSON response:</p>
    <pre><code>{"result":40075016.68557849,"error":null}</code></pre>
    <p>If the result is not computable, <code>result</code> will be null. If there is a parsing error, the <code>error</code> property will be populated with the error message.</p>
    <h2>cURL example</h2>
    <pre><code>curl ${baseUrl}/calc/6.378137e6*2*pi</code></pre>
  </body>
</html>
`;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
};

async function handleOptions(request: Request) {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS preflight requests.
    return new Response(null, {
      headers: new Headers({
        ...CORS_HEADERS,
        "Access-Control-Allow-Headers": request.headers.get(
          "Access-Control-Request-Headers"
        )!,
      }),
    });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS",
      },
    });
  }
}

export default {
  async fetch(request: Request) {
    if (request.method == "OPTIONS") {
      return handleOptions(request);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path == "/") {
      return new Response(instructions(url.origin), {
        headers: { "Content-Type": "text/html" },
      });
    } else if (path.startsWith("/calc/")) {
      const expr = decodeURIComponent(path.replace(/^\/calc\//, ""));
      try {
        return new Response(
          JSON.stringify({ result: parse(expr), error: null }),
          {
            headers: new Headers({
              ...CORS_HEADERS,
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=604800",
            }),
          }
        );
      } catch (err) {
        if (typeof (err as any)?.format == "function") {
          const formatted = (err as PeggySyntaxError).format([{ text: expr }]);
          return new Response(
            JSON.stringify({ result: null, error: formatted }),
            {
              status: 400,
              statusText: "Bad request",
              headers: new Headers({
                ...CORS_HEADERS,
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=604800",
              }),
            }
          );
        } else {
          return new Response(
            JSON.stringify({ result: null, error: err!.toString() }),
            {
              status: 400,
              statusText: "Bad request",
              headers: new Headers({
                ...CORS_HEADERS,
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=604800",
              }),
            }
          );
        }
      }
    } else if (path == "/stats") {
      return new Response("Stats not available yet");
    }
    return new Response(`Resource not found (${path})`, {
      status: 404,
      statusText: "Not found",
    });
  },
};
