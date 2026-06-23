import toolLib = require("azure-pipelines-tool-lib/tool");
import * as fs from "fs";
import { detectArchitecture, detectSystem, isUnknownTestkubeInstalled, resolveVersion } from "./detectors";
import { getConfig } from "./config";
import { execSync } from "child_process";

export const setupCLI = async () => {
  const version = await resolveVersion();

  let testkubePath: string | undefined = toolLib.findLocalTool("testkube", version);
  if (testkubePath) {
    console.log("Found Testkube CLI in cache.");
    toolLib.prependPath(testkubePath);
  }
  const isTestkubeInstalled = testkubePath?.length > 0 || isUnknownTestkubeInstalled();

  if (!isTestkubeInstalled) {
    testkubePath = await installCLI();
  }

  if (fs.existsSync(`${testkubePath}/testkube`)) {
    fs.rmSync(`${testkubePath}/testkube`);
  }
  await fs.promises.symlink(`${testkubePath}/kubectl-testkube`, `${testkubePath}/testkube`);
  console.log(`Linked CLI as ${testkubePath}/testkube.\n`);

  if (fs.existsSync(`${testkubePath}/tk`)) {
    fs.rmSync(`${testkubePath}/tk`);
  }
  await fs.promises.symlink(`${testkubePath}/kubectl-testkube`, `${testkubePath}/tk`);
  console.log(`Linked CLI as ${testkubePath}/tk.\n`);

  const config = getConfig();
  // Configure the Testkube context
  const contextArgs =
    config.mode === "kubectl"
      ? ["--kubeconfig", "--namespace", config.namespace!]
      : [
          "--api-key",
          config.token!,
          "--root-domain",
          config.url!,
          "--org-id",
          config.organization!,
          "--env-id",
          config.environment!,
        ];

  let command = `testkube set context ${contextArgs.join(" ")}`;
  execSync(command, { stdio: "inherit" });
  console.log(`\nConfigured Testkube context.\n`);
};

const installCLI = async () => {
  const config = getConfig();
  if (!config.version) {
    return;
  }
  const normalizedVersion = normalizeVersion(config.version);
  const architecture = detectArchitecture();
  const system = detectSystem();

  const encodedVersion = encodeURIComponent(normalizedVersion);
  const encodedVerSysArch = `${encodeURIComponent(normalizedVersion)}_${encodeURIComponent(system)}_${encodeURIComponent(
    architecture
  )}`;
  const releaseTagPrefix = requiresLegacyVersionPrefix(normalizedVersion) ? "v" : "";

  const artifactUrl = `https://github.com/kubeshop/testkube/releases/download/${releaseTagPrefix}${encodedVersion}/testkube_${encodedVerSysArch}.tar.gz`;

  const downloadedPath = await toolLib.downloadTool(artifactUrl);
  console.log(`Downloaded Testkube CLI from ${artifactUrl}.\n`);
  const extractedPath = await toolLib.extractTar(downloadedPath);
  console.log(`Extracted Testkube CLI to ${extractedPath}.\n`);
  const cachedPath = await toolLib.cacheDir(extractedPath, "testkube", normalizedVersion);
  console.log(`Cached Testkube CLI to ${cachedPath}.\n`);
  toolLib.prependPath(cachedPath);

  return cachedPath;
};

const normalizeVersion = (version: string) => version.trim().replace(/^v/, "");

export const requiresLegacyVersionPrefix = (version: string) => {
  const versionMatch = version.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:[-+].*)?$/);
  if (!versionMatch) {
    return false;
  }

  const major = Number.parseInt(versionMatch[1], 10);
  const minor = Number.parseInt(versionMatch[2], 10);
  const patch = Number.parseInt(versionMatch[3], 10);

  if (major < 2) {
    return true;
  }
  if (major > 2) {
    return false;
  }

  if (minor < 4) {
    return true;
  }
  if (minor > 4) {
    return false;
  }

  return patch < 0;
};
