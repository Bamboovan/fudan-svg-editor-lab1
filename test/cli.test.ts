import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { SvgCodec } from "../src/io/SvgCodec.js";
import { Tokenizer } from "../src/cli/Tokenizer.js";
test("real CLI replays teacher flowchart and saves valid eight-element SVG", () => {
  const input = readFileSync("examples/flowchart.txt", "utf8");
  const run = spawnSync(
    process.execPath,
    ["--import", "tsx", "src/cli/Main.ts"],
    { input, encoding: "utf8" },
  );
  assert.equal(run.status, 0, run.stderr);
  assert.doesNotMatch(run.stdout, /error:/);
  assert.match(run.stdout, /svg> /);
  assert.match(run.stdout, /8 elements/);
  const document = new SvgCodec().decode(
    readFileSync("/tmp/svg-lab1-flowchart.svg", "utf8"),
  );
  const flow = document.root.children()[0];
  assert.equal(flow.children().length, 3);
  assert.equal(flow.children()[1].children()[0].attrs().y, "100");
  assert.equal(flow.children()[1].children()[1].textContent(), "处理数据 v2");
});
test("tokenizer handles Unicode spaces quotes escapes empty text and full-line comments", () => {
  const t = new Tokenizer();
  assert.deepEqual(t.tokenize(" # note"), []);
  assert.deepEqual(t.tokenize('create text t 1 2 "a \\" b"'), [
    "create",
    "text",
    "t",
    "1",
    "2",
    'a " b',
  ]);
  assert.deepEqual(t.tokenize('set t text ""'), ["set", "t", "text", ""]);
  assert.deepEqual(t.tokenize("set r fill #fff"), ["set", "r", "fill", "#fff"]);
  assert.throws(() => t.tokenize('"unterminated'), /unterminated/);
});
