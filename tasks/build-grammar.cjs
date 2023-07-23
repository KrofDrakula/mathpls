const peggy = require("peggy");
const tspegjs = require("ts-pegjs");
const { readFile, writeFile } = require("node:fs/promises");
const { resolve } = require("node:path");

const srcDir = resolve(__dirname, "../src/");
const source = resolve(srcDir, "calculator/grammar.pegjs");
const target = resolve(srcDir, "calculator/parser.ts");

readFile(source, "utf8")
  .then((file) =>
    peggy.generate(file, {
      plugins: [tspegjs],
      output: "source",
      format: "es",
    })
  )
  .then((parser) => writeFile(target, parser));
