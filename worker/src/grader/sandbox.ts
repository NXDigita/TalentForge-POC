import Docker from 'dockerode';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const docker = new Docker();

export interface SandboxResult {
  correctness: number;
  complexity: number;
  style: number;
  total: number;
  status: 'completed' | 'timeout' | 'compile_error' | 'oom' | 'error';
  stdout?: string;
  stderr?: string;
}

export async function runCodeInSandbox(
  submissionId: string,
  language: string,
  code: string
): Promise<SandboxResult> {
  const tmpDir = path.join(os.tmpdir(), `sandbox-${submissionId}-${crypto.randomBytes(4).toString('hex')}`);
  await fs.mkdir(tmpDir, { recursive: true });

  let filename = 'solution.txt';
  let image = 'talentforge-runner-node';

  if (language === 'python') {
    filename = 'solution.py';
    image = 'talentforge-runner-python';
  } else if (language === 'javascript' || language === 'node') {
    filename = 'solution.js';
    image = 'talentforge-runner-node';
  } else if (language === 'java') {
    filename = 'Solution.java';
    image = 'talentforge-runner-java';
  }

  const filePath = path.join(tmpDir, filename);
  await fs.writeFile(filePath, code);

  let container: Docker.Container | null = null;
  
  try {
    container = await docker.createContainer({
      Image: image,
      NetworkDisabled: true,
      HostConfig: {
        NetworkMode: 'none',
        Memory: 268435456, // 256MB
        ReadonlyRootfs: true,
        Tmpfs: { '/tmp': 'rw,size=50m' },
        PidsLimit: 64,
        CpuShares: 512,
        Binds: [`${tmpDir}:/box`],
      },
    });

    await container.start();

    // 30s hard kill timer
    let isTimeout = false;
    const timer = setTimeout(async () => {
      isTimeout = true;
      if (container) {
        try {
          await container.kill();
        } catch (e) {
          // ignore kill errors (might have just finished)
        }
      }
    }, 30000);

    const stream = await container.logs({
      stdout: true,
      stderr: true,
      follow: true,
    });

    let stdout = '';
    let stderr = '';
    stream.on('data', (chunk) => {
      // Dockerode multiplexes stdout and stderr, for simplicity we merge here or use stream parsing
      stdout += chunk.toString('utf8');
    });

    const waitResult = await container.wait();
    clearTimeout(timer);

    if (isTimeout) {
      return { correctness: 0, complexity: 0, style: 0, total: 0, status: 'timeout' };
    }

    if (waitResult.StatusCode !== 0) {
      // Check for OOM
      if (waitResult.StatusCode === 137) {
        return { correctness: 0, complexity: 0, style: 0, total: 0, status: 'oom' };
      }
      return { correctness: 0, complexity: 0, style: 0, total: 0, status: 'error', stderr: stdout };
    }

    // For Day 6, we just prove execution works and return a mock successful score.
    // In actual implementation (Day 7-8), we will run through test cases and check output correctly.
    return {
      correctness: 100,
      complexity: 100,
      style: 100,
      total: 100,
      status: 'completed',
      stdout,
    };
  } catch (error: any) {
    console.error(`[Sandbox] Execution error for ${submissionId}:`, error);
    return { correctness: 0, complexity: 0, style: 0, total: 0, status: 'error', stderr: error.message };
  } finally {
    if (container) {
      try {
        await container.remove({ force: true });
      } catch (e) {}
    }
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch (e) {}
  }
}
