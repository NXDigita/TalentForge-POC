import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding problems...');

  // ─── Problem 1: Two Sum (Easy) ───────────────────────────────────────────
  await prisma.problem.upsert({
    where: { slug: 'two-sum' },
    update: {},
    create: {
      title: 'Two Sum',
      slug: 'two-sum',
      tier: 'Explorer',
      domain: 'cse',
      reward: 100,
      description: `## Problem Statement

Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

## Constraints

- \`2 ≤ nums.length ≤ 10^4\`
- \`-10^9 ≤ nums[i] ≤ 10^9\`
- \`-10^9 ≤ target ≤ 10^9\`
- Only one valid answer exists.

## Examples

**Example 1:**
\`\`\`
Input:  nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
\`\`\`

**Example 2:**
\`\`\`
Input:  nums = [3, 2, 4], target = 6
Output: [1, 2]
\`\`\`

**Example 3:**
\`\`\`
Input:  nums = [3, 3], target = 6
Output: [0, 1]
\`\`\`

## Expected Complexity
- **Time:** O(n)
- **Space:** O(n)`,
      publicTestCases: [
        { stdin: '4\n2 7 11 15\n9', expectedStdout: '0 1', description: 'Basic pair at start' },
        { stdin: '3\n3 2 4\n6',       expectedStdout: '1 2', description: 'Pair in middle' },
        { stdin: '2\n3 3\n6',         expectedStdout: '0 1', description: 'Duplicate elements' },
      ],
      hiddenTestCases: [
        { stdin: '5\n1 2 3 4 5\n9',            expectedStdout: '3 4', weight: 10 },
        { stdin: '6\n-3 4 3 90 -1 100\n0',     expectedStdout: '0 2', weight: 10 },
        { stdin: '4\n0 0 0 0\n0',              expectedStdout: '0 1', weight: 10 },
        { stdin: '2\n-1000000000 1000000000\n0', expectedStdout: '0 1', weight: 15 },
        { stdin: '5\n1 5 3 7 2\n10',           expectedStdout: '1 3', weight: 10 },
        { stdin: '3\n100 200 300\n500',         expectedStdout: '1 2', weight: 10 },
        { stdin: '4\n-5 -3 -1 0\n-4',          expectedStdout: '0 2', weight: 15 },
        { stdin: '6\n2 4 6 8 10 12\n14',       expectedStdout: '2 4', weight: 10 },
        { stdin: '5\n1 3 5 7 9\n12',           expectedStdout: '2 4', weight: 10 },
        { stdin: '4\n10 20 30 40\n70',          expectedStdout: '2 3', weight: 10 },
      ],
    },
  });

  // ─── Problem 2: LRU Cache (Medium) ───────────────────────────────────────
  await prisma.problem.upsert({
    where: { slug: 'lru-cache' },
    update: {},
    create: {
      title: 'LRU Cache',
      slug: 'lru-cache',
      tier: 'Builder',
      domain: 'cse',
      reward: 250,
      description: `## Problem Statement

Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` — Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\` — Return the value of the \`key\` if it exists, otherwise return \`-1\`.
- \`void put(int key, int value)\` — Update the value of the key if it exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity, **evict the least recently used key**.

The functions \`get\` and \`put\` must each run in **O(1)** average time complexity.

## Constraints

- \`1 ≤ capacity ≤ 3000\`
- \`0 ≤ key ≤ 10^4\`
- \`0 ≤ value ≤ 10^5\`
- At most \`2 × 10^5\` calls will be made to \`get\` and \`put\`.

## Input Format

First line: capacity  
Subsequent lines: operation (get/put) followed by arguments.

## Examples

**Example 1:**
\`\`\`
Input:
2
put 1 1
put 2 2
get 1
put 3 3
get 2
put 4 4
get 1
get 3
get 4

Output: 1 -1 -1 1 3 4
\`\`\`

## Expected Complexity
- **Time:** O(1) per operation
- **Space:** O(capacity)`,
      publicTestCases: [
        {
          stdin: '2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4',
          expectedStdout: '1 -1 -1 1 3 4',
          description: 'Standard eviction sequence',
        },
        {
          stdin: '1\nput 2 1\nput 2 2\nget 2\nput 1 1\nput 4 1\nget 2',
          expectedStdout: '2 -1',
          description: 'Overwrite + eviction',
        },
      ],
      hiddenTestCases: [
        { stdin: '3\nput 1 1\nput 2 2\nput 3 3\nget 1\nput 4 4\nget 2\nget 3\nget 4', expectedStdout: '1 -1 3 4', weight: 12 },
        { stdin: '2\nput 1 10\nput 2 20\nget 1\nput 3 30\nget 2\nget 3',               expectedStdout: '10 -1 30',  weight: 10 },
        { stdin: '1\nput 1 1\nget 1\nput 2 2\nget 1\nget 2',                           expectedStdout: '1 -1 2',   weight: 10 },
        { stdin: '2\nget 2\nput 2 6\nget 1\nput 1 5\nput 1 2\nget 1\nget 2',          expectedStdout: '-1 -1 2 6', weight: 12 },
        { stdin: '2\nput 2 1\nput 1 1\nput 2 3\nput 4 1\nget 1\nget 2',               expectedStdout: '-1 3',     weight: 12 },
        { stdin: '3\nput 1 1\nput 2 2\nput 3 3\nput 4 4\nget 4\nget 3\nget 2\nget 1', expectedStdout: '4 3 2 -1', weight: 12 },
        { stdin: '2\nput 1 1\nput 2 2\nput 1 10\nget 1\nget 2',                       expectedStdout: '10 2',     weight: 10 },
        { stdin: '2\nput 3 1\nput 2 2\nget 3\nput 1 5\nget 2\nget 3',                 expectedStdout: '1 -1 -1',  weight: 12 },
      ],
    },
  });

  // ─── Problem 3: Rate Limiter (Medium) ────────────────────────────────────
  await prisma.problem.upsert({
    where: { slug: 'rate-limiter' },
    update: {},
    create: {
      title: 'Token Bucket Rate Limiter',
      slug: 'rate-limiter',
      tier: 'Builder',
      domain: 'cse',
      reward: 250,
      description: `## Problem Statement

Implement a **Token Bucket Rate Limiter**.

The token bucket algorithm works as follows:
- A bucket has a maximum capacity of \`maxTokens\` tokens.
- The bucket refills at a rate of \`refillRate\` tokens per second.
- Each incoming request consumes 1 token.
- A request is **allowed** if at least 1 token is available; otherwise it is **rejected**.

Implement the \`RateLimiter\` class:
- \`RateLimiter(int maxTokens, int refillRate)\` — Initialize the limiter.
- \`bool allowRequest(int timestamp)\` — Process a request at the given \`timestamp\` (in seconds). Return \`true\` if allowed, \`false\` if rejected.

The bucket starts full (\`tokens = maxTokens\`). Tokens are added based on elapsed time since the last request, capped at \`maxTokens\`.

## Constraints

- \`1 ≤ maxTokens ≤ 100\`
- \`1 ≤ refillRate ≤ 100\`
- \`0 ≤ timestamp ≤ 10^6\`
- At most \`10^4\` calls to \`allowRequest\`.
- Timestamps are non-decreasing.

## Input Format

First line: \`maxTokens refillRate\`  
Subsequent lines: timestamps of requests.

## Output Format

\`true\` or \`false\` per request, space-separated.

## Examples

**Example 1:**
\`\`\`
Input:
3 1
0
0
0
0
1
2

Output: true true true false true true
\`\`\`

## Expected Complexity
- **Time:** O(1) per request
- **Space:** O(1)`,
      publicTestCases: [
        {
          stdin: '3 1\n0\n0\n0\n0\n1\n2',
          expectedStdout: 'true true true false true true',
          description: 'Burst then refill',
        },
        {
          stdin: '1 1\n0\n0\n1\n1',
          expectedStdout: 'true false true false',
          description: 'Strict single token',
        },
      ],
      hiddenTestCases: [
        { stdin: '5 2\n0\n0\n0\n0\n0\n0\n1\n2',         expectedStdout: 'true true true true true false true true', weight: 12 },
        { stdin: '2 1\n0\n0\n0\n5\n5\n5',               expectedStdout: 'true true false true true false',          weight: 10 },
        { stdin: '10 5\n0\n0\n0\n0\n0\n0\n0\n0\n0\n0\n0',  expectedStdout: 'true true true true true true true true true true false', weight: 12 },
        { stdin: '1 100\n0\n0\n1\n1\n2',                expectedStdout: 'true false true false true',              weight: 10 },
        { stdin: '3 3\n0\n0\n0\n0\n1\n1\n1\n1',         expectedStdout: 'true true true false true true true false', weight: 12 },
        { stdin: '2 1\n0\n1\n2\n3\n4',                  expectedStdout: 'true true true true true',                weight: 10 },
        { stdin: '5 2\n0\n0\n0\n0\n0\n10\n10\n10\n10\n10\n10', expectedStdout: 'true true true true true true true true true true false', weight: 12 },
        { stdin: '3 1\n0\n0\n0\n0\n3\n3\n3\n3',         expectedStdout: 'true true true false true true true false', weight: 12 },
      ],
    },
  });

  console.log('✅ Seed complete — 3 problems created.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
