import { Document } from "./Document.js";
import { SvgCodec } from "../io/SvgCodec.js";
import { FileStore } from "../io/FileStore.js";
export class Editor {
  private current: Document | null = null;
  private filePath: string | undefined;
  private past: Document[] = [];
  private future: Document[] = [];
  private locked = true;
  constructor(
    private readonly codec = new SvgCodec(),
    private readonly files = new FileStore(),
  ) {}
  document(): Document {
    if (!this.current)
      throw new Error("no document. use 'init' or 'read' first");
    return this.current;
  }
  edit(operation: () => string): string {
    const before = this.document().clone();
    try {
      const output = operation();
      this.past.push(before);
      this.future = [];
      this.locked = false;
      return output;
    } catch (e) {
      this.current = before;
      throw e;
    }
  }
  private barrier(): void {
    this.past = [];
    this.future = [];
    this.locked = true;
  }
  init(w: number, h: number): string {
    this.current = new Document(w, h);
    this.filePath = undefined;
    this.barrier();
    return `canvas ${w}x${h} created`;
  }
  read(path: string): string {
    const result = this.codec.decode(this.files.read(path));
    this.current = new Document(
      result.width,
      result.height,
      result.root,
      result.rootAttributes,
    );
    this.filePath = path;
    this.barrier();
    return [
      ...result.warnings,
      `read ${path} (${this.document().all().length} elements)`,
    ].join("\n");
  }
  save(path?: string): string {
    const d = this.document();
    const target = path ?? this.filePath;
    if (!target) throw new Error("no file path. use save <file.svg>");
    this.files.write(target, this.codec.encode(d));
    this.filePath = target;
    this.barrier();
    return `saved to ${target} (${d.all().length} elements)`;
  }
  canvas(w?: number, h?: number): string {
    const d = this.document();
    if (w !== undefined && h !== undefined) {
      d.resize(w, h);
      this.barrier();
    }
    return `canvas ${d.width}x${d.height}`;
  }
  undo(): string {
    this.document();
    if (this.locked) throw new Error("undo not allowed after io command");
    const previous = this.past.pop();
    if (!previous) throw new Error("nothing to undo");
    this.future.push(this.document().clone());
    this.current = previous;
    return "undo completed";
  }
  redo(): string {
    this.document();
    if (this.locked) throw new Error("undo not allowed after io command");
    const next = this.future.pop();
    if (!next) throw new Error("nothing to redo");
    this.past.push(this.document().clone());
    this.current = next;
    return "redo completed";
  }
}
