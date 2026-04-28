const { spawn } = require("node:child_process");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const processes = [];
let isShuttingDown = false;

const spawnWorkspace = (label, args) => {
  const child = spawn(npmCommand, args, {
    cwd: process.cwd(),
    shell: process.platform === "win32",
    stdio: "inherit"
  });

  child.on("exit", (code) => {
    if (isShuttingDown) return;

    isShuttingDown = true;
    for (const processRef of processes) {
      if (processRef.pid && processRef.pid !== child.pid) {
        processRef.kill("SIGINT");
      }
    }

    process.exit(code ?? 0);
  });

  processes.push(child);
  console.log(`[dev] Started ${label}`);
};

spawnWorkspace("server", ["run", "dev", "-w", "server"]);
spawnWorkspace("client", ["run", "dev", "-w", "client"]);

const shutdown = () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  for (const child of processes) {
    if (child.pid) child.kill("SIGINT");
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
