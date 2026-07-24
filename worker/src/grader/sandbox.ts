/**
 * sandbox.ts  —  Docker Sandbox Executor
 *
 * Day 7: run every test case through the container, capture stdout, record elapsed time.
 * Day 8: run style linter inside the same container, write results to /tmp/style.txt.
 *
 * Architecture
 * ─────────────
 * 1.  Write the student's code to a temp directory on the host.
 * 2.  Write a generated runner.sh script that:
 *       a. Runs the linter → /tmp/style.txt
 *       b. (Java only) Compiles; exits with code 2 on compile error.
 *       c. Loops through each test case file (/box/cases/case_N.in),
 *          runs the program with stdin piped, writes stdout to /box/cases/case_N.out
 *          and records elapsed time (in ms) to /box/cases/case_N.time.
 * 3.  Mount the temp dir at /box inside a sandboxed container.
 * 4.  After the container exits, read the output files back from the host.
 */

import Docker from 'dockerode';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { TestCase } from './correctness';

const docker = new Docker();

// ─── Public types ─────────────────────────────────────────────────────────────

export interface SandboxResult {
  status:        'completed' | 'timeout' | 'compile_error' | 'oom' | 'error';
  actualOutputs: Map<number, string>;   // caseIndex → stdout
  elapsedTimes:  Map<number, number>;   // caseIndex → ms
  stdinSizes:    Map<number, number>;   // caseIndex → byte length of stdin
  styleRaw:      string;                // raw linter output
  stderr?:       string;                // execution error output if any
}

// ─── Language helpers ─────────────────────────────────────────────────────────

interface LangConfig {
  image:    string;
  filename: string;
  compile:  string;   // shell fragment to compile; empty string = interpreted
  run:      string;   // shell command to run the solution with stdin piped
  lint:     string;   // shell command to run linter → /tmp/style.txt
}

function getLangConfig(language: string): LangConfig {
  switch (language) {
    case 'python':
      return {
        image:    'talentforge-runner-python',
        filename: 'solution.py',
        compile:  '',
        run:      'python /box/solution.py',
        lint:     'pylint --output-format=text /box/solution.py > /tmp/style.txt 2>&1 || true',
      };

    case 'javascript':
    case 'node':
      return {
        image:    'talentforge-runner-node',
        filename: 'solution.js',
        compile:  '',
        run:      'node /box/solution.js',
        lint:     'eslint --format compact /box/solution.js > /tmp/style.txt 2>&1 || true',
      };

    case 'java':
      return {
        image:    'talentforge-runner-java',
        filename: 'Solution.java',
        compile:  'javac /box/Solution.java',
        run:      'java -cp /box Solution',
        lint:     'java -jar /opt/checkstyle.jar -c /google_checks.xml /box/Solution.java > /tmp/style.txt 2>&1 || true',
      };

    default:
      return {
        image:    'talentforge-runner-node',
        filename: 'solution.txt',
        compile:  '',
        run:      'cat /box/solution.txt',
        lint:     'echo "" > /tmp/style.txt',
      };
  }
}

// ─── runner.sh generator ─────────────────────────────────────────────────────

/**
 * Generate the shell script that will run inside the container.
 * Uses only POSIX sh constructs so it works in alpine / slim images.
 */
function buildRunnerScript(cfg: LangConfig, caseCount: number): string {
  const lines: string[] = ['#!/bin/sh', 'set -e'];

  // Step 1 — Linter (never fail the script on linter errors)
  lines.push('');
  lines.push('# ── Linting ─────────────────────────────────────────────────');
  lines.push(cfg.lint);

  // Step 2 — Compile (Java only)
  if (cfg.compile) {
    lines.push('');
    lines.push('# ── Compile ─────────────────────────────────────────────────');
    lines.push(`${cfg.compile} 2>/tmp/compile_err.txt`);
    lines.push('if [ $? -ne 0 ]; then');
    lines.push('  echo "__COMPILE_ERROR__" > /box/cases/runner_status.txt');
    lines.push('  cat /tmp/compile_err.txt');
    lines.push('  exit 2');
    lines.push('fi');
  }

  // Step 3 — Run each test case
  lines.push('');
  lines.push('# ── Test cases ───────────────────────────────────────────────');
  lines.push('echo "__OK__" > /box/cases/runner_status.txt');

  for (let i = 0; i < caseCount; i++) {
    lines.push(`START_${i}=$(date +%s%3N)`);
    lines.push(`${cfg.run} < /box/cases/case_${i}.in > /box/cases/case_${i}.out 2>/box/cases/case_${i}.err || true`);
    lines.push(`END_${i}=$(date +%s%3N)`);
    lines.push(`echo $((END_${i} - START_${i})) > /box/cases/case_${i}.time`);
  }

  lines.push('');
  return lines.join('\n');
}

// ─── Read output files from the host tmp dir ─────────────────────────────────

async function readTextFile(filePath: string, defaultValue = ''): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return defaultValue;
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Execute student code against test cases inside a sandboxed Docker container.
 *
 * @param submissionId  Unique submission ID (used for tmp dir naming).
 * @param language      'python' | 'javascript' | 'java'
 * @param code          The student's source code as a string.
 * @param testCases     Combined public + hidden test cases to evaluate.
 */
export async function runCodeInSandbox(
  submissionId: string,
  language:     string,
  code:         string,
  testCases:    TestCase[],
): Promise<SandboxResult> {
  const tmpDir   = path.join(os.tmpdir(), `sandbox-${submissionId}-${crypto.randomBytes(4).toString('hex')}`);
  const casesDir = path.join(tmpDir, 'cases');

  await fs.mkdir(casesDir, { recursive: true });

  const cfg = getLangConfig(language);

  // ── Write student code ───────────────────────────────────────────────────
  await fs.writeFile(path.join(tmpDir, cfg.filename), code, 'utf8');

  // ── Write test case input files ──────────────────────────────────────────
  const stdinSizes = new Map<number, number>();
  for (let i = 0; i < testCases.length; i++) {
    const stdin = testCases[i].stdin ?? '';
    await fs.writeFile(path.join(casesDir, `case_${i}.in`), stdin, 'utf8');
    stdinSizes.set(i, Buffer.byteLength(stdin, 'utf8'));
  }

  // ── Write runner script ──────────────────────────────────────────────────
  const runnerScript = buildRunnerScript(cfg, testCases.length);
  const runnerPath   = path.join(tmpDir, 'runner.sh');
  await fs.writeFile(runnerPath, runnerScript, { encoding: 'utf8', mode: 0o755 });

  let container: Docker.Container | null = null;

  try {
    container = await docker.createContainer({
      Image: cfg.image,
      NetworkDisabled: true,
      // Override the Dockerfile ENTRYPOINT; run our generated runner.sh instead
      Entrypoint: ['sh'],
      Cmd: ['/box/runner.sh'],
      HostConfig: {
        NetworkMode: 'none',
        Memory:          268435456, // 256 MB
        ReadonlyRootfs:  false,     // writable so /tmp and /box/cases are writable
        Tmpfs:           { '/tmp': 'rw,size=50m,noexec' },
        PidsLimit:       128,
        CpuShares:       512,
        Binds:           [`${tmpDir}:/box`],
      },
    });

    await container.start();

    // ── 60-second hard-kill timer ────────────────────────────────────────
    let isTimeout = false;
    const killTimer = setTimeout(async () => {
      isTimeout = true;
      try { await container!.kill(); } catch { /* already dead */ }
    }, 60_000);

    const waitResult = await container.wait();
    clearTimeout(killTimer);

    if (isTimeout) {
      return {
        status:        'timeout',
        actualOutputs: new Map(),
        elapsedTimes:  new Map(),
        stdinSizes,
        styleRaw:      '',
      };
    }

    // ── Check runner status ──────────────────────────────────────────────
    const runnerStatus = await readTextFile(path.join(casesDir, 'runner_status.txt'));

    if (runnerStatus.trim() === '__COMPILE_ERROR__' || waitResult.StatusCode === 2) {
      const stderr = await readTextFile(path.join(tmpDir, 'compile_err.txt'), '(no compile output)');
      return {
        status:        'compile_error',
        actualOutputs: new Map(),
        elapsedTimes:  new Map(),
        stdinSizes,
        styleRaw:      '',
        stderr,
      };
    }

    if (waitResult.StatusCode === 137) {
      return {
        status:        'oom',
        actualOutputs: new Map(),
        elapsedTimes:  new Map(),
        stdinSizes,
        styleRaw:      '',
      };
    }

    // ── Read per-case outputs ────────────────────────────────────────────
    const actualOutputs = new Map<number, string>();
    const elapsedTimes  = new Map<number, number>();

    for (let i = 0; i < testCases.length; i++) {
      const stdout = await readTextFile(path.join(casesDir, `case_${i}.out`));
      actualOutputs.set(i, stdout);

      const timeStr = await readTextFile(path.join(casesDir, `case_${i}.time`), '0');
      elapsedTimes.set(i, parseInt(timeStr.trim(), 10) || 0);
    }

    // ── Read linter output ───────────────────────────────────────────────
    const styleRaw = await readTextFile(path.join(tmpDir, 'style.txt'));

    return {
      status: 'completed',
      actualOutputs,
      elapsedTimes,
      stdinSizes,
      styleRaw,
    };
  } catch (error: any) {
    console.error(`[Sandbox] Execution error for ${submissionId}:`, error);
    return {
      status:        'error',
      actualOutputs: new Map(),
      elapsedTimes:  new Map(),
      stdinSizes,
      styleRaw:      '',
      stderr:        error.message,
    };
  } finally {
    if (container) {
      try { await container.remove({ force: true }); } catch { /* ignore */ }
    }
    try { await fs.rm(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}
