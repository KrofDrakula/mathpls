# Mathpls

A silly Cloudflare Worker serverless function that takes an algebraic expression and calculates the result, returning it in JSON format.

Supported operations:

- `+-*/` operators
- `()` expression grouping
- functions from `Math.*`
- constants `pi` (𝜋) and `e` (Euler's number)

The following URLs are supported:

- `/`: shows a quick description of the service in HTML format
- `/calc/...`: parses the expression given in the subpath

## Examples

- Circumference of the Earth along equator, in meters:
  https://expr.run/calc/2\*pi\*6.378137e6 ($d=2 \pi r$)
- Approximate period of a 3m pendulum, in seconds:
  https://expr.run/calc/2\*pi\*sqrt(3/9.81) ($T=2\pi \sqrt{L \over g} $)
