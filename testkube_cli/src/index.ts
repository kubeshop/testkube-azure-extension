import taskLib = require("azure-pipelines-task-lib/task");
import { setupCLI } from "./cli";

async function run() {
  const debug = taskLib.getInput("debug") || taskLib.getVariable("TK_DEBUG");

  try {
    console.log("Setting up Testkube CLI...");
    await setupCLI();
    console.log("Testkube CLI setup complete.");
  } catch (err) {
    if (err instanceof Error) {
      taskLib.setResult(taskLib.TaskResult.Failed, err.message);
      if (debug) {
        console.error(err.stack);
      }
    }
  }
}

run();
