import { Shape } from '../model/Shape.js';
import { Rect } from '../model/Rect.js';
import { Circle } from '../model/Circle.js';
import { Ellipse } from '../model/Ellipse.js';
import { Line } from '../model/Line.js';
import { Text } from '../model/Text.js';
import { Group } from '../model/Group.js';

type Descriptor = { ctor: new (id: string, attrs: Record<string, string>, text?: string) => Shape; geometry: readonly string[]; optional?: string; content?: boolean };
/** The ONLY shape-name dispatch boundary; future provider registration is deferred. */
export class ShapeFactory {
  private readonly types: ReadonlyMap<string, Descriptor> = new Map([
    ['rect', { ctor: Rect, geometry: ['x', 'y', 'width', 'height'], optional: 'fill' }],
    ['circle', { ctor: Circle, geometry: ['cx', 'cy', 'r'], optional: 'fill' }],
    ['ellipse', { ctor: Ellipse, geometry: ['cx', 'cy', 'rx', 'ry'], optional: 'fill' }],
    ['line', { ctor: Line, geometry: ['x1', 'y1', 'x2', 'y2'], optional: 'stroke' }],
    ['text', { ctor: Text, geometry: ['x', 'y'], content: true }],
    ['g', { ctor: Group, geometry: [] }],
  ] as [string, Descriptor][]);
  private descriptor(type: string): Descriptor {
    const descriptor = this.types.get(type);
    if (!descriptor) throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    return descriptor;
  }
  create(type: string, id: string, params: string[]): Shape {
    const d = this.descriptor(type);
    const count = d.geometry.length + (d.content ? 1 : 0);
    if (params.length < count || params.length > count + (d.optional ? 1 : 0)) throw new Error(`invalid parameters for ${type}`);
    const attrs: Record<string, string> = {};
    d.geometry.forEach((name, index) => { attrs[name] = params[index]!; });
    if (d.optional && params.length > count) attrs[d.optional] = params[count]!;
    return new d.ctor(id, attrs, d.content ? params[d.geometry.length] : '');
  }
  fromAttributes(type: string, id: string, attrs: Record<string, string>, text = ''): Shape {
    const d = this.descriptor(type);
    const supported = new Set([...d.geometry, 'id', 'fill', 'stroke', 'stroke-width', 'font-size', 'font-family', 'font-weight', 'text-anchor', 'dominant-baseline', 'opacity', 'fill-opacity', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'visibility', 'class', 'data-kind']);
    for (const key of Object.keys(attrs)) {
      if (!supported.has(key)) throw new Error(`unsupported SVG attribute: ${key}`);
    }
    if (attrs['stroke-width'] !== undefined) Shape.number(attrs['stroke-width'], 'stroke-width', true);
    return new d.ctor(id, attrs, text);
  }
}
