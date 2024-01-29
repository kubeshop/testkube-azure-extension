import * as os from "os";

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
