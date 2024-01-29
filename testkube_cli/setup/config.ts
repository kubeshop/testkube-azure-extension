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
      version: taskLib.getInput("version") || taskLib.getVariable("TK_VERSION"),
      channel: taskLib.getInput("channel") || taskLib.getVariable("TK_CHANNEL") || "stable",
      namespace: taskLib.getInput("namespace") || taskLib.getVariable("TK_NAMESPACE") || "testkube",
      url: taskLib.getInput("url") || taskLib.getVariable("TK_URL") || "testkube.io",
      organization: taskLib.getInput("organization") || taskLib.getVariable("TK_ORG"),
      environment: taskLib.getInput("environment") || taskLib.getVariable("TK_ENV"),
      token: taskLib.getInput("token") || taskLib.getVariable("TK_API_TOKEN"),
    };

    const mode = config.organization || config.environment || config.token ? "cloud" : "kubectl";
    config.mode = mode;

    if (mode === "cloud") {
      process.stdout.write(`Detected mode: cloud connection.\n`);
    } else {
      process.stdout.write(
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
      process.stdout.write(`kubectl: ${hasKubectl ? "detected" : "not available"}.\n`);
      if (!hasKubectl) {
        throw new Error(
          "You do not have kubectl installed. Most likely you need to configure your workflow to initialize connection with Kubernetes cluster."
        );
      }
    } else {
      process.stdout.write("kubectl: ignored for Cloud integration\n");
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
