"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
async function run() {
  try {
    const inputString = tl.getInput("test_input", true);
    if (inputString == "bad") {
      tl.setResult(tl.TaskResult.Failed, "Bad input was given");
      return;
    }
    console.log("Hello", inputString);
  } catch (err) {
    if (err instanceof Error) {
      tl.setResult(tl.TaskResult.Failed, err.message);
    }
  }
}
run();
