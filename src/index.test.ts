import { unstable_dev, UnstableDevWorker } from "wrangler";
import { test, beforeAll, afterAll } from "vitest";

let worker: UnstableDevWorker;

beforeAll(async () => {
  worker = await unstable_dev(
    new URL("../dist/index.js", import.meta.url).pathname,
    {
      experimental: { disableExperimentalWarning: true },
    }
  );
});

afterAll(() => worker.stop());

test("should respond with html instructions", async (t) => {
  const response = await worker.fetch();
  t.expect(response.headers.get("Content-type")).toEqual("text/html");
});

test("should respond with a calculation result", async (t) => {
  const { result, error } = (await worker
    .fetch("/2+3")
    .then((r) => r.json())) as { result: number; error: null };
  t.expect(result).toEqual(5);
  t.expect(error).toEqual(null);
});

test("should respond with a syntax error", async (t) => {
  const { result, error } = (await worker
    .fetch("/2^3")
    .then((r) => r.json())) as { result: null; error: string };
  t.expect(result).toEqual(null);
  t.expect(error)
    .toEqual(`Error: Expected \"*\", \"+\", \"-\", \"/\", end of input, or whitespace but \"^\" found.
 --> undefined:1:2
  |
1 | 2^3
  |  ^`);
});
