import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { SvgCodec } from '../src/io/SvgCodec.js';
import { FileStore } from '../src/io/FileStore.js';

const codec = new SvgCodec();
test('XML round trip preserves nested order, geometry, presentation and escaped text', () => {
  const document = codec.decode('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><g id="g" fill="red"><rect id="r" x="2.5" width="20" height="10"/><text id="t" x="4" y="5" font-size="14">A &amp; B &lt; C "你好"</text></g></svg>');
  const output = codec.encode(document);
  const second = codec.decode(output);
  assert.equal(codec.encode(second), output);
  assert.equal(second.root.children()[0].children()[1].textContent(), 'A & B < C "你好"');
  assert.equal(second.rootAttributes.viewBox, '0 0 400 300');
});
test('auto IDs reserve later explicit IDs and remain deterministic', () => {
  const xml = '<svg><rect/><g><rect id="rect1"/><rect/></g></svg>';
  const first = codec.decode(xml);
  assert.deepEqual(first.warnings, [
    'warning: assigned id rect2 to unnamed <rect>',
    'warning: assigned id g1 to unnamed <g>',
    'warning: assigned id rect3 to unnamed <rect>',
  ]);
  assert.equal(codec.encode(first), codec.encode(codec.decode(xml)));
});
test('duplicate IDs including root ID are rejected', () => {
  assert.throws(() => codec.decode('<svg><rect id="x"/><circle id="x"/></svg>'), /id already exists: x/);
  assert.throws(() => codec.decode('<svg id="x"><rect id="x"/></svg>'), /id already exists: x/);
});
test('malformed, unsupported or dangerous XML is not silently changed', () => {
  for (const xml of [
    '<svg><rect></svg>', '<svg/><svg/>', '<svg><rect id="r" transform="translate(1)"/></svg>',
    '<svg><rect style="fill:red"/></svg>', '<svg><path d="M0 0"/></svg>',
    '<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg/>',
    '<svg><text><tspan>x</tspan></text></svg>', '<svg><rect>lost text</rect></svg>',
    '<svg width="50%"/>', '<svg onload="alert(1)"/>',
  ]) assert.throws(() => codec.decode(xml), undefined, xml);
});
test('FileStore succeeds atomically and translates failures', () => {
  const dir = mkdtempSync(join(tmpdir(), 'svg-codec-'));
  const file = join(dir, 'document.svg');
  const store = new FileStore();
  try {
    store.write(file, 'first');
    store.write(file, 'second');
    assert.equal(store.read(file), 'second');
    assert.deepEqual(readdirSync(dir), ['document.svg']);
    assert.throws(() => store.read(join(dir, 'missing.svg')), /cannot read file:/);
    assert.throws(() => store.write(dir, 'must fail'), /cannot write file:/);
    assert.equal(readFileSync(file, 'utf8'), 'second');
    assert.deepEqual(readdirSync(dir), ['document.svg']);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
