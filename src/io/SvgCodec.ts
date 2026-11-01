import { DOMParser } from "@xmldom/xmldom";
import { ShapeFactory } from "../factory/ShapeFactory.js";
import { Group } from "../model/Group.js";
import { Shape } from "../model/Shape.js";

export interface SvgDocumentData {
  width: number;
  height: number;
  root: Group;
  rootAttributes: Record<string, string>;
}

/** Parses supported SVG without evaluating scripts, entities or external resources. */
export class SvgCodec {
  constructor(private readonly factory = new ShapeFactory()) {}

  decode(xml: string): SvgDocumentData & { warnings: string[] } {
    if (/<!DOCTYPE|<!ENTITY/i.test(xml))
      throw new Error("unsupported XML declaration");
    const diagnostics: string[] = [];
    const dom = new DOMParser({
      errorHandler: {
        warning: (message) => diagnostics.push(message),
        error: (message) => diagnostics.push(message),
        fatalError: (message) => diagnostics.push(message),
      },
    }).parseFromString(xml, "image/svg+xml");
    if (diagnostics.length || !dom.documentElement)
      throw new Error("invalid SVG XML");
    const svg = dom.documentElement;
    if (
      svg.tagName !== "svg" ||
      (svg.namespaceURI && svg.namespaceURI !== "http://www.w3.org/2000/svg")
    ) {
      throw new Error("expected svg root element");
    }
    for (let index = 0; index < dom.childNodes.length; index++) {
      const node = dom.childNodes.item(index)!;
      if (
        (node.nodeType === 1 && node !== svg) ||
        (node.nodeType === 3 && node.nodeValue?.trim())
      ) {
        throw new Error("invalid SVG XML");
      }
    }
    const rootAttributes = this.attributes(svg);
    this.checkUnsupported(rootAttributes);
    const width = this.dimension(rootAttributes.width ?? "800", "width");
    const height = this.dimension(rootAttributes.height ?? "600", "height");
    delete rootAttributes.width;
    delete rootAttributes.height;
    delete rootAttributes.xmlns;
    const reserved = new Set<string>();
    const elements = Array.from(svg.getElementsByTagName("*"));
    if (rootAttributes.id) reserved.add(rootAttributes.id);
    for (const element of elements) {
      const id = element.getAttribute("id");
      if (id) {
        if (reserved.has(id)) throw new Error(`id already exists: ${id}`);
        reserved.add(id);
      }
    }
    const counters = new Map<string, number>();
    const warnings: string[] = [];
    const root = new Group("__root__");
    for (const element of this.elementChildren(svg)) {
      root.add(this.readShape(element, reserved, counters, warnings));
    }
    if (this.directText(svg).trim()) throw new Error("unexpected text in svg");
    return { width, height, root, warnings, rootAttributes };
  }

  encode(document: SvgDocumentData): string {
    const attrs = {
      xmlns: "http://www.w3.org/2000/svg",
      ...document.rootAttributes,
      width: String(document.width),
      height: String(document.height),
    };
    const children = document.root
      .children()
      .map((child) => this.writeShape(child, 1));
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg${this.writeAttributes(attrs)}>\n${children.join("\n")}${children.length ? "\n" : ""}</svg>\n`;
  }

  private readShape(
    element: Element,
    reserved: Set<string>,
    counters: Map<string, number>,
    warnings: string[],
  ): Shape {
    if (
      element.namespaceURI &&
      element.namespaceURI !== "http://www.w3.org/2000/svg"
    ) {
      throw new Error(`unsupported element namespace: ${element.namespaceURI}`);
    }
    const attributes = this.attributes(element);
    this.checkUnsupported(attributes);
    let id = attributes.id;
    if (!id) {
      let counter = counters.get(element.tagName) ?? 0;
      do {
        id = `${element.tagName}${++counter}`;
      } while (reserved.has(id));
      counters.set(element.tagName, counter);
      reserved.add(id);
      warnings.push(
        `warning: assigned id ${id} to unnamed <${element.tagName}>`,
      );
    }
    delete attributes.id;
    const text = this.directText(element);
    const shape = this.factory.fromAttributes(
      element.tagName,
      id,
      attributes,
      text,
    );
    const children = this.elementChildren(element);
    if (shape instanceof Group) {
      if (text.trim()) throw new Error(`unexpected text in ${element.tagName}`);
      for (const child of children)
        shape.add(this.readShape(child, reserved, counters, warnings));
    } else {
      if (children.length)
        throw new Error(`unsupported nested content in ${element.tagName}`);
      if (text.trim() && shape.textContent() !== text)
        throw new Error(`unexpected text in ${element.tagName}`);
    }
    return shape;
  }

  private attributes(element: Element): Record<string, string> {
    const attributes: Record<string, string> = Object.create(null);
    for (let index = 0; index < element.attributes.length; index++) {
      const attribute = element.attributes.item(index)!;
      attributes[attribute.name] = attribute.value;
    }
    return attributes;
  }

  private elementChildren(element: Element): Element[] {
    const result: Element[] = [];
    for (let index = 0; index < element.childNodes.length; index++) {
      const child = element.childNodes.item(index)!;
      if (child.nodeType === 1) result.push(child as Element);
    }
    return result;
  }

  private directText(element: Element): string {
    let value = "";
    for (let index = 0; index < element.childNodes.length; index++) {
      const child = element.childNodes.item(index)!;
      if (child.nodeType === 3 || child.nodeType === 4)
        value += child.nodeValue ?? "";
    }
    return value;
  }

  private checkUnsupported(attributes: Record<string, string>): void {
    for (const name of Object.keys(attributes)) {
      if (name === "transform" || name === "style" || /^on/i.test(name)) {
        throw new Error(`unsupported SVG attribute: ${name}`);
      }
    }
  }

  private dimension(value: string, name: string): number {
    const normalized = value.replace(/px$/, "");
    if (
      !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(normalized) ||
      !Number.isFinite(Number(normalized)) ||
      Number(normalized) <= 0
    ) {
      throw new Error(`invalid canvas ${name}: ${value}`);
    }
    return Number(normalized);
  }

  private writeShape(shape: Shape, depth: number): string {
    const indent = "  ".repeat(depth);
    const opening = `${indent}<${shape.tag}${this.writeAttributes({ id: shape.id, ...shape.attrs() })}`;
    const children = shape.children();
    if (children.length)
      return `${opening}>\n${children.map((child) => this.writeShape(child, depth + 1)).join("\n")}\n${indent}</${shape.tag}>`;
    const content = shape.textContent();
    return content
      ? `${opening}>${this.escape(content)}</${shape.tag}>`
      : `${opening}/>`;
  }

  private writeAttributes(attributes: Record<string, string>): string {
    return Object.entries(attributes)
      .map(
        ([name, value]) =>
          ` ${name}="${this.escape(value).replace(/\n/g, "&#10;").replace(/\t/g, "&#9;")}"`,
      )
      .join("");
  }

  private escape(value: string): string {
    if (
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/u.test(
        value,
      )
    ) {
      throw new Error("invalid XML character");
    }
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
      .replace(/\r/g, "&#13;");
  }
}
