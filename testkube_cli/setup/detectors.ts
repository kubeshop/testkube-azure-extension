import taskLib = require("azure-pipelines-task-lib/task");
import * as os from "os";
import fetch from "node-fetch";
import { getConfig, updateConfig } from "./config";

const architectureMapping: Record<string, string> = {
  x86_64: "x86_64",
  x64: "x86_64",
  amd64: "x86_64",
  arm64: "arm64",
  aarch64: "arm64",
  i386: "i386",
};
export const detectArchitecture = () => {
  const architecture = architectureMapping[os.machine()];
  process.stdout.write(`Architecture: ${os.machine()} (${architecture || "unsupported"})\n`);
  if (!architecture) {
    throw new Error("We do not support this architecture yet.");
  }
  return architecture;
};

const systemMapping: Record<string, string> = {
  Linux: "Linux",
  Darwin: "Darwin",
  Windows: "Windows",
  Windows_NT: "Windows",
};
export const detectSystem = () => {
  const system = systemMapping[os.type()];
  process.stdout.write(`System: ${os.type()} (${system || "unsupported"})\n`);
  if (!system) {
    throw new Error("We do not support this OS yet.");
  }
  return system;
};

export const resolveVersion = async () => {
  const config = getConfig();

  let version = config.version;

  if (config.version) {
    version = config.version.replace(/^v/, "");
    process.stdout.write(`Forcing "${version} version...\n`);
  } else {
    process.stdout.write(`Detecting the latest version for minimum of "${config.channel}" channel...\n`);
    if (config.channel === "stable") {
      const releaseResponse = await fetch("https://api.github.com/repos/kubeshop/testkube/releases/latest");
      const release = (await releaseResponse.json()) as any;
      version = release?.tag_name;
    } else {
      const channels = ["stable", config.channel];
      process.stdout.write(`Detecting the latest version for minimum of "${config.channel}" channel...\n`);

      const releasesResponse = await fetch("https://api.github.com/repos/kubeshop/testkube/releases");
      const releases = (await releasesResponse.json()) as any[];
      const versions = releases.map((release) => ({
        tag: release.tag_name,
        channel: release.tag_name.match(/-([^0-9]+)/)?.[1] || "stable",
      }));
      version = versions.find(({ channel }) => channels.includes(channel))?.tag;
    }
    if (!version) {
      throw new Error("Not found any version matching criteria.");
    }
    version = version.replace(/^v/, "");
    process.stdout.write(`   Latest version: ${version}\n`);
  }

  updateConfig({ version });
  return version;
};

export const isUnknownTestkubeInstalled = () => {
  try {
    taskLib.which("testkube", true);
    return true;
  } catch {
    return false;
  }
};
