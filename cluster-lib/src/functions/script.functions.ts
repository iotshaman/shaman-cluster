import { spawn } from 'child_process';

export function spawnScript(script: string, args: any[]): Promise<{stdout: string, stderr: string}> {
  return new Promise(res => {
    this.logger.write(`Spawning process "${script}".`);
    let proc = spawn(script, args, { shell: true });

    let stdout = "";
    proc.stdout.on("data", (data) => stdout += data.toString());

    let stderr = "";
    proc.stderr.on("data", (data) => stderr += data.toString());

    proc.on("close", () => {
      if (!!stderr) this.logger.write(stderr, "error");
      if (!!stdout) this.logger.write(stdout);
      res({stdout, stderr});
    });
  });
}