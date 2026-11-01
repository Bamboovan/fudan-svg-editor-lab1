import test from 'node:test';
import assert from 'node:assert/strict';
import { ShapeFactory } from '../src/factory/ShapeFactory.js';
import { Group } from '../src/model/Group.js';

const factory = new ShapeFactory();
test('all six built-in types construct and clone without implicit styling', () => {
  const cases: [string, string[]][] = [['rect', ['1','2','3','4']], ['circle', ['1','2','3']], ['ellipse', ['1','2','3','4']], ['line', ['1','2','3','4']], ['text', ['1','2','hello world']], ['g', []]];
  for (const [type, args] of cases) {
    const shape = factory.create(type, 'a', args);
    assert.equal(shape.tag, type);
    assert.equal(shape.attrs().fill, undefined);
    assert.equal(shape.attrs().stroke, undefined);
    assert.equal(shape.clone().summary(), shape.summary());
  }
});
test('leaf geometry scales position and dimensions; group moves all descendants', () => {
  const root = new Group('root'); const inner = new Group('inner');
  const rect = factory.create('rect','r',['1','2','3','4']);
  root.add(inner); inner.add(rect); root.scale(2); root.move(3,4);
  assert.deepEqual(rect.attrs(), {x:'5',y:'8',width:'6',height:'8'});
  assert.equal(rect.parent, inner);
  root.set('fill','red'); assert.equal(rect.attrs().fill, undefined);
  assert.equal(root.attrs().fill,'red');
});
test('group ownership, copies and cycles are guarded', () => {
  const root = new Group('root'); const inner = new Group('inner'); root.add(inner);
  assert.throws(() => inner.add(root), /cannot group a container into its own descendant: root/);
  assert.equal(root.parent, null); assert.equal(inner.parent, root);
  const copy = root.clone(); assert.notEqual(copy.children()[0], inner);
  assert.equal(copy.children()[0]!.parent, copy);
  (root.children() as unknown as Group[]).pop(); assert.equal(root.children().length,1);
  root.remove(inner); assert.equal(inner.parent,null);
});
test('invalid model edits never partially mutate a leaf or group', () => {
  const root = new Group('root');
  const small = factory.create('circle','small',['1','2','3']);
  const huge = factory.create('circle','huge',['1e308','2','3']); root.add(small); root.add(huge);
  assert.throws(() => root.scale(10), /invalid number/);
  assert.equal(small.attrs().cx,'1'); assert.equal(huge.attrs().cx,'1e+308');
  assert.throws(() => small.set('r','-1'), /invalid number/);
  assert.equal(small.attrs().r,'3');
  for (const invalid of ['NaN','Infinity','', '0xff','1px']) assert.throws(() => small.set('cx',invalid));
  assert.throws(() => small.scale(0), /scale factor must be positive/);
  assert.throws(() => small.set('text','no'), /unknown attribute: text/);
});
test('factory arity, unknown type, import validation and text are explicit', () => {
  assert.throws(() => factory.create('box','b',[]), /unknown shape type: box \(is the plugin loaded\?\)/);
  assert.throws(() => factory.create('g','g',['extra']), /invalid parameters/);
  assert.throws(() => factory.create('rect','r',['1','2']), /invalid parameters/);
  const text = factory.fromAttributes('text','t',{'font-size':'16',fill:'red'},'开始 & end');
  assert.equal(text.textContent(),'开始 & end'); assert.equal(text.attrs().x,'0');
  text.set('text','changed'); assert.equal(text.clone().textContent(),'changed');
  assert.throws(() => factory.fromAttributes('g','g',{transform:'translate(1,2)'}),/unsupported SVG attribute/);
  assert.throws(() => factory.fromAttributes('g','g',{style:'fill:red'}),/unsupported SVG attribute/);
});
