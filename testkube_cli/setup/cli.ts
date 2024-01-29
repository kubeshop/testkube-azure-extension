import taskLib = require("azure-pipelines-task-lib/task");
import toolLib = require("azure-pipelines-tool-lib/tool");
import * as fs from "fs";
import { detectArchitecture, detectSystem, isUnknownTestkubeInstalled, resolveVersion } from "./detectors";
import { getConfig } from "./config";
import { execSync } from "child_process";

const setupCLI = async () => {
  const version = await resolveVersion();

  let testkubePath: string | undefined = toolLib.findLocalTool("testkube", version);
  const isTestkubeInstalled = testkubePath.length > 0 || isUnknownTestkubeInstalled();

  if (!isTestkubeInstalled) {
    testkubePath = await installCLI();
  }

  // TODO: make symlinks for testkube and tk

  const config = getConfig();
  // Configure the Testkube context
  const contextArgs =
    config.mode === "kubectl"
      ? ["--kubeconfig", "--namespace", config.namespace!]
      : [
          "--api-key",
          config.token!,
          "--cloud-root-domain",
          config.url!,
          "--org",
          config.organization!,
          "--env",
          config.environment!,
        ];

  let command = `testkube set context ${contextArgs.join(" ")}`;
  let result = execSync(command, { stdio: "inherit" });
};

const installCLI = async () => {
  const config = getConfig();
  if (!config.version) {
    return;
  }
  const architecture = detectArchitecture();
  const system = detectSystem();

  const encodedVersion = encodeURIComponent(config.version);
  const encodedVerSysArch = `${encodeURIComponent(config.version)}_${encodeURIComponent(system)}_${encodeURIComponent(
    architecture
  )}`;

  const artifactUrl = `https://github.com/kubeshop/testkube/releases/download/v${encodedVersion}/testkube_${encodedVerSysArch}.tar.gz`;

  const downloadedPath = await toolLib.downloadTool(artifactUrl);
  const extractedPath = await toolLib.extractTar(downloadedPath);
  const cachedPath = await toolLib.cacheDir(extractedPath, "testkube", config.version);
  toolLib.prependPath(cachedPath);

  return extractedPath;
};
