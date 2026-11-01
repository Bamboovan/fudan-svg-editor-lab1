import { createInterface } from "node:readline";
import { Session } from "./Session.js";
export class Main {
  run(): void {
    const session = new Session();
    const input = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: !!process.stdin.isTTY,
    });
    console.log("svg-editor 0.1 — type 'help' for commands");
    input.setPrompt("svg> ");
    input.prompt();
    input.on("line", (line) => {
      const output = session.run(line);
      if (output) console.log(output);
      input.prompt();
    });
  }
}
new Main().run();
