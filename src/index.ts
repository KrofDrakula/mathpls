import { parse, PeggySyntaxError } from "./calculator/parser.js";

const instructions = (baseUrl: string) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>Expr.run!</title>
    <meta name="viewport" content="initial-scale=1"/>
    <meta property="og:title" content="Expr.run!"/>
    <meta property="og:type" content="website"/>
    <meta property="og:url" content="https://expr.run/"/>
    <meta property="og:description" content="For when you cannot math but you can make a web request!"/>
  </head>
  <body>
    <h1>Expr.run!</h1>
    <p>For when you cannot math but you can make a web request!</p>
    <p>Lovingly shitposted by <a href="https://krofdrakula.github.io" target="_blank">KrofDrakula</a>. Source <a href="https://github.com/krofdrakula/mathpls" target="_blank">here</a>.</p>
    <h2>Usage</h2>
    <p>To calculate a math expression, simply use the following URL to receive a JSON response:</p>
    <pre><code>${baseUrl}/<em>expression</em></code></pre>
    <p>Where <code>expression</code> is a math expression that supports the following:<p>
    <ul>
      <li>+ - * / operators</li>
      <li>decimal numbers (in the form <code>-123.456e-789</code>)</li>
      <li>functions from <code>Math</code> can be invoked as expressions (like <code>atan2(1,2)</code>)</li>
      <li><code>pi</code> for 𝜋, <code>e</code> for Euler's number</li>
      <li>whitespace between tokens is ignored</li>
    </ul>
    <p>For example, to compute the Earth's circumference based on mean radius across equator, in meters:</p>
    <pre><code>${baseUrl}/6.378137e6*2*pi</code></pre>
    <p>This returns the JSON response:</p>
    <pre><code>{"result":40075016.68557849,"error":null}</code></pre>
    <p>If the result is not computable, <code>result</code> will be <code>null</code>. If there is a parsing error, the <code>error</code> property will be populated with the error message.</p>
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
    }

    const expr = decodeURIComponent(path.replace(/^\//, ""));
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
      let message: string;
      if (typeof (err as any)?.format == "function") {
        message = (err as PeggySyntaxError).format([{ text: expr }]);
      } else {
        message = err?.toString() ?? "Unknown error";
      }
      return new Response(JSON.stringify({ result: null, error: message }), {
        status: 400,
        statusText: "Bad request",
        headers: new Headers({
          ...CORS_HEADERS,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=604800",
        }),
      });
    }
  },
};
