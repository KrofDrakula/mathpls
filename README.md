# Mathpls

A silly Cloudflare Worker serverless function that takes an algebraic expression and calculates the result, returning it in JSON format.

Supported operations:

- `+-*/` operators
- `()` expression grouping
- functions from `Math.*`
- constants `pi` (𝜋) and `e` (Euler's number)

Simply add your algebraic expression in the URL path and the service will reply with the result in JSON format.

The JSON returned conforms to the following TS type:

```ts
type Result = { result: number; error: null } | { result: null; error: string };
```

## Examples

- Circumference of the Earth along equator, in meters:
  [`https://expr.run/2*pi*6.378137e6`](https://expr.run/2*pi*6.378137e6) ($d = 2 \pi r$)
- Approximate period of a 3m pendulum at sea level, in seconds:
  [`https://expr.run/2*pi*sqrt(3/9.81)`](<https://expr.run/2*pi*sqrt(3/9.81)>) ($T = 2 \pi \sqrt{L \over g} $)
