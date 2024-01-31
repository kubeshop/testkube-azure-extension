import taskLib = require("azure-pipelines-task-lib/task");

interface Config {
  mode?: "kubectl" | "cloud";
  channel: string;
  url: string;
  version?: string;
  namespace?: string;
  organization?: string;
  environment?: string;
  token?: string;
}

let config: Config;

export function getConfig(): Config {
  if (!config) {
    config = {
      channel: taskLib.getInput("channel") || "stable",
      url: taskLib.getInput("url") || "testkube.io",
      namespace: taskLib.getInput("namespace") || "testkube",
      version: taskLib.getInput("version"),
      organization: taskLib.getInput("organization"),
      environment: taskLib.getInput("environment"),
      token: taskLib.getInput("token"),
    };

    const mode = config.organization || config.environment || config.token ? "cloud" : "kubectl";
    config.mode = mode;

    if (mode === "cloud") {
      console.log(`Detected mode: cloud connection.\n`);
    } else {
      console.log(
        `Detected mode: kubectl connection. To use Cloud connection instead, provide your 'organization', 'environment' and 'token'.\n`
      );
    }

    // Check params
    if (mode === "cloud") {
      if (!config.organization || !config.environment || !config.token) {
        throw new Error("You need to pass `organization`, `environment` and `token` for Cloud connection.");
      }
    }

    // Detect if there is kubectl installed
    if (mode === "kubectl") {
      const hasKubectl = isKubectlInstalled();
      console.log(`kubectl: ${hasKubectl ? "detected" : "not available"}.\n`);
      if (!hasKubectl) {
        throw new Error(
          "You do not have kubectl installed. Most likely you need to configure your workflow to initialize connection with Kubernetes cluster."
        );
      }
    } else {
      console.log("kubectl: ignored for Cloud integration\n");
    }
  }

  return config;
}

export const updateConfig = (newConfig: Partial<Config>) => {
  config = { ...config, ...newConfig };
};

const isKubectlInstalled = () => {
  try {
    taskLib.which("kubectl", true);
    return true;
  } catch {
    return false;
  }
};
