import taskLib = require("azure-pipelines-task-lib/task");
import toolLib = require("azure-pipelines-tool-lib/tool");

import { getConfig } from "./config";
import { detectArchitecture, detectSystem } from "./detectors";

const setupCLI = () => {
  const config = getConfig();

  const architecture = detectArchitecture();
  const system = detectSystem();
};
