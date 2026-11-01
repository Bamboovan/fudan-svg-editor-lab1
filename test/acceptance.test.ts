import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Session } from "../src/cli/Session.js";

test("required no-document and exact command errors", () => {
  const s = new Session();
  assert.equal(s.run("tree"), "error: no document. use 'init' or 'read' first");
  assert.match(s.run("help"), /create/);
  s.run("init");
  assert.equal(
    s.run('create box b 1 2 3 4 "x"'),
    "error: unknown shape type: box (is the plugin loaded?)",
  );
  assert.equal(s.run("create rect r 0 0 1 2"), "rect#r created");
  assert.equal(s.run("create g r"), "error: id already exists: r");
  assert.equal(s.run("move missing 1 2"), "error: no such shape: missing");
  assert.equal(
    s.run("create g g in missing"),
    "error: no such container: missing",
  );
  assert.equal(s.run("create g g in r"), "error: not a container: r");
  assert.equal(s.run("set r id q"), "error: unknown attribute: id");
  assert.equal(s.run("scale r 0"), "error: scale factor must be positive");
  assert.match(s.run("__proto__"), /^error: unknown command/);
});
test("all geometries scale positions and dimensions with fractional values", () => {
  const s = new Session();
  s.run("init");
  const rows = [
    ["rect r 2 4 6 8", "x=1 y=2 width=3 height=4"],
    ["circle c 2 4 6", "cx=1 cy=2 r=3"],
    ["ellipse e 2 4 6 8", "cx=1 cy=2 rx=3 ry=4"],
    ["line l 2 4 6 8", "x1=1 y1=2 x2=3 y2=4"],
    ['text t 2 4 "hello world"', "x=1 y=2"],
  ];
  for (const [create, geometry] of rows) {
    assert.doesNotMatch(s.run("create " + create), /^error/);
    const id = create.split(" ")[1];
    assert.doesNotMatch(s.run(`scale ${id} .5`), /^error/);
    assert.ok(s.run("show " + id).includes(geometry));
  }
  assert.doesNotMatch(s.run('set t text "你好 & <world>"'), /^error/);
  assert.match(s.run("show t"), /你好 & <world>/);
});
test("composite movement and styling, undo redo and redo invalidation", () => {
  const s = new Session();
  [
    "init",
    "create g outer",
    "create g inner in outer",
    "create rect r 1 2 3 4 red in inner",
    'create text t 5 6 "x" in inner',
  ].forEach((x) => s.run(x));
  const before = s.run("tree");
  s.run("move outer 10 20");
  assert.match(s.run("show r"), /x=11 y=22/);
  assert.match(s.run("show t"), /x=15 y=26/);
  s.run("undo");
  assert.equal(s.run("tree"), before);
  s.run("redo");
  assert.match(s.run("show r"), /x=11 y=22/);
  s.run("undo");
  s.run("set inner fill blue");
  assert.match(s.run("show inner"), /fill=blue/);
  assert.match(s.run("show r"), /fill=red/);
  assert.equal(s.run("redo"), "error: nothing to redo");
});
test("failed commands preserve the entire document and pending redo", () => {
  const s = new Session();
  [
    "init",
    "create g g",
    "create rect r 0 0 1 2 in g",
    "move r 2 3",
    "undo",
  ].forEach((x) => s.run(x));
  const before = s.run("tree");
  for (const command of [
    "group bad g r",
    "addto g g",
    "create rect bad 1 2 -3 4",
    "set r bogus x",
    "move r NaN 0",
    "scale r -1",
    "ungroup g",
    "create circle r 1 2 3",
    "read /does-not-exist.svg",
    "save /does-not-exist/f.svg",
  ]) {
    assert.match(s.run(command), /^error:/, command);
    assert.equal(s.run("tree"), before, command);
  }
  assert.equal(s.run("redo"), "redo completed");
  assert.match(s.run("show r"), /x=2 y=3/);
});
test("nested ungroup preserves slots and one undo restores all ownership", () => {
  const s = new Session();
  [
    "init",
    "create g root",
    "create rect a 0 0 1 1 in root",
    "create g middle in root",
    "create circle c 1 1 1 in middle",
    'create text t 2 2 "x" in middle',
    "create line z 0 0 1 1 in root",
  ].forEach((x) => s.run(x));
  const before = s.run("tree");
  assert.equal(
    s.run("ungroup root"),
    "error: cannot ungroup top-level container: root",
  );
  assert.equal(s.run("ungroup middle"), "g#middle ungrouped");
  const after = s.run("tree");
  assert.ok(after.indexOf("rect#a") < after.indexOf("circle#c"));
  assert.ok(after.indexOf("circle#c") < after.indexOf("text#t"));
  assert.ok(after.indexOf("text#t") < after.indexOf("line#z"));
  assert.match(s.run("show c"), /parent=g#root/);
  s.run("undo");
  assert.equal(s.run("tree"), before);
});
test("group document-order policy, z order, addto and subtree deletion", () => {
  const s = new Session();
  [
    "init",
    "create rect a 0 0 1 1",
    "create circle b 0 0 1",
    'create text c 0 0 "x"',
    "group g c a",
  ].forEach((x) => s.run(x));
  let tree = s.run("tree");
  assert.ok(tree.indexOf("rect#a") < tree.indexOf("text#c"));
  s.run("back c");
  tree = s.run("tree g");
  assert.ok(tree.indexOf("text#c") < tree.indexOf("rect#a"));
  s.run("front c");
  tree = s.run("tree g");
  assert.ok(tree.indexOf("rect#a") < tree.indexOf("text#c"));
  s.run("addto g b");
  assert.match(s.run("show b"), /parent=g#g/);
  const before = s.run("tree");
  s.run("delete g");
  assert.equal(s.run("show a"), "error: no such shape: a");
  s.run("undo");
  assert.equal(s.run("tree"), before);
});
test("all successful document mutations lock both undo and redo; queries do not", () => {
  const dir = mkdtempSync(join(tmpdir(), "svg-history-")),
    file = join(dir, "doc.svg");
  const s = new Session();
  s.run("init");
  assert.equal(s.run("undo"), "error: undo not allowed after io command");
  assert.equal(s.run("redo"), "error: undo not allowed after io command");
  s.run("create g g");
  s.run("canvas");
  s.run("help");
  s.run("tree");
  s.run("show g");
  assert.equal(s.run("undo"), "undo completed");
  s.run("redo");
  for (const io of [
    `save "${file}"`,
    `read "${file}"`,
    "canvas 10 20",
    "init 50",
  ]) {
    assert.doesNotMatch(s.run(io), /^error:/);
    assert.equal(s.run("undo"), "error: undo not allowed after io command");
    assert.equal(s.run("redo"), "error: undo not allowed after io command");
    s.run("create g next");
    assert.equal(s.run("undo"), "undo completed");
  }
});
test("failed read and save preserve remembered path and XML text survives roundtrip", () => {
  const dir = mkdtempSync(join(tmpdir(), "svg-path-")),
    file = join(dir, "original.svg");
  const s = new Session();
  s.run("init");
  s.run('create text t 1 2 "a & <b>"');
  s.run(`save "${file}"`);
  s.run('set t text "updated"');
  assert.match(s.run("save /no-such-dir/out.svg"), /^error: cannot write file/);
  assert.match(s.run("read /no-such.svg"), /^error: cannot read file/);
  assert.match(s.run("save"), new RegExp("saved to"));
  assert.match(readFileSync(file, "utf8"), /updated/);
  s.run(`read "${file}"`);
  assert.match(s.run("show t"), /updated/);
});
test("import reserves all ids, deterministic warnings, and failure remains atomic", () => {
  const dir = mkdtempSync(join(tmpdir(), "svg-import-")),
    file = join(dir, "import.svg");
  writeFileSync(
    file,
    '<svg width="10" height="20"><rect/><rect id="rect1"/><g><circle/></g></svg>',
  );
  const s = new Session();
  const output = s.run(`read "${file}"`);
  assert.match(output, /warning: assigned id rect2 to unnamed <rect>/);
  assert.match(output, /warning: assigned id g1 to unnamed <g>/);
  assert.match(output, /warning: assigned id circle1 to unnamed <circle>/);
  const before = s.run("tree");
  writeFileSync(file, '<svg><rect id="x"/><circle id="x"/></svg>');
  assert.equal(s.run(`read "${file}"`), "error: id already exists: x");
  assert.equal(s.run("tree"), before);
});
