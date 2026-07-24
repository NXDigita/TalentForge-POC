import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Auto refresh on 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ignore if not a 401, or if it was a login/register request
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register')
    ) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh')) {
      // The refresh request itself failed -> logout user
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login?expired=true';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      window.location.href = '/login';
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);

      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      processQueue(null, accessToken);
      isRefreshing = false;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login?expired=true';
      isRefreshing = false;
      return Promise.reject(refreshError);
    }
  }
);

export default api;

// ─── Interfaces ─────────────────────────────────────────────────────────────
export interface TestCase {
  stdin: string;
  expectedStdout: string;
  description?: string;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  tier: 'Explorer' | 'Apprentice' | 'Builder' | 'Master';
  domain: 'cse' | 'ece';
  reward: number;
  publicTestCases: TestCase[] | null;
  createdAt: string;
  _count?: {
    submissions: number;
  };
}

export interface Submission {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  score?: number;
  createdAt: string;
  problem: {
    id: string;
    title: string;
    slug: string;
    tier: string;
  };
}

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: 'mock-p1',
    title: 'Two Sum',
    slug: 'two-sum',
    tier: 'Explorer',
    domain: 'cse',
    reward: 100,
    description: `## Problem Statement

Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

## Constraints
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`

## Examples

**Example 1:**
\`\`\`
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3, 2, 4], target = 6
Output: [1, 2]
\`\`\``,
    publicTestCases: [
      { stdin: '4\n2 7 11 15\n9', expectedStdout: '0 1', description: 'Basic pair at start' },
      { stdin: '3\n3 2 4\n6', expectedStdout: '1 2', description: 'Pair in middle' },
      { stdin: '2\n3 3\n6', expectedStdout: '0 1', description: 'Duplicate elements' },
    ],
    createdAt: new Date().toISOString(),
    _count: { submissions: 42 },
  },
  {
    id: 'mock-p2',
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
- \`void put(int key, int value)\` — Update or insert key-value pair. Evict the least recently used key if capacity is exceeded.

## Constraints
- \`1 <= capacity <= 3000\``,
    publicTestCases: [
      {
        stdin: '2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4',
        expectedStdout: '1 -1 -1 1 3 4',
        description: 'Standard eviction sequence',
      },
    ],
    createdAt: new Date().toISOString(),
    _count: { submissions: 18 },
  },
  {
    id: 'mock-p3',
    title: 'Token Bucket Rate Limiter',
    slug: 'rate-limiter',
    tier: 'Builder',
    domain: 'cse',
    reward: 250,
    description: `## Problem Statement

Implement a **Token Bucket Rate Limiter**.

- A bucket has a maximum capacity of \`maxTokens\` tokens.
- The bucket refills at a rate of \`refillRate\` tokens per second.
- Each incoming request consumes 1 token.

## Constraints
- \`1 <= maxTokens <= 100\``,
    publicTestCases: [
      {
        stdin: '3 1\n0\n0\n0\n0\n1\n2',
        expectedStdout: 'true true true false true true',
        description: 'Burst then refill',
      },
    ],
    createdAt: new Date().toISOString(),
    _count: { submissions: 15 },
  },
];

// ─── API Methods ─────────────────────────────────────────────────────────────
export async function getProblems(params?: { tier?: string; domain?: string }): Promise<Problem[]> {
  try {
    const response = await api.get('/students/problems', { params });
    return response.data;
  } catch (err) {
    console.warn('Backend unavailable, using mock problem list fallback');
    let list = MOCK_PROBLEMS;
    if (params?.domain && params.domain !== 'all') {
      list = list.filter((p) => p.domain === params.domain);
    }
    if (params?.tier && params.tier !== 'all') {
      list = list.filter((p) => p.tier === params.tier);
    }
    return list;
  }
}

export async function getProblemBySlug(slug: string): Promise<Problem> {
  try {
    const response = await api.get(`/students/problems/${slug}`);
    return response.data;
  } catch (err) {
    console.warn(`Backend unavailable, using mock problem details fallback for slug: ${slug}`);
    const found = MOCK_PROBLEMS.find((p) => p.slug === slug);
    if (found) return found;
    return MOCK_PROBLEMS[0];
  }
}

export async function getPresignedUrl(problemId: string, language: string): Promise<{ uploadUrl: string; s3Key: string }> {
  try {
    const response = await api.get(`/students/problems/${problemId}/presigned`, {
      params: { language },
    });
    return response.data;
  } catch (err) {
    console.warn('MinIO/S3 API unavailable, using mock upload URL');
    return {
      uploadUrl: 'http://localhost:9000/submissions/mock-upload-url',
      s3Key: `submissions/mock-user/${problemId}/${Date.now()}.${language === 'python' ? 'py' : 'js'}`,
    };
  }
}

export async function uploadCodeToMinio(uploadUrl: string, code: string): Promise<void> {
  try {
    await axios.put(uploadUrl, code, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (err) {
    console.warn('Direct S3 upload failed or running in mock mode, simulating successful upload.');
  }
}

export async function submitSolution(problemId: string, s3Key: string, language: string): Promise<{ submissionId: string; status: string }> {
  try {
    const response = await api.post(`/students/problems/${problemId}/submit`, {
      s3Key,
      language,
    });
    return response.data;
  } catch (err) {
    console.warn('Backend submit endpoint unavailable, using mock submission response');
    return {
      submissionId: 'mock-sub-' + Date.now(),
      status: 'queued',
    };
  }
}

export async function getSubmissions(): Promise<{ data: Submission[]; meta: any }> {
  try {
    const response = await api.get('/students/submissions');
    return response.data;
  } catch (err) {
    return {
      data: [
        {
          id: 'sub-mock-1',
          status: 'completed',
          score: 100,
          createdAt: new Date().toISOString(),
          problem: {
            id: 'mock-p1',
            title: 'Two Sum',
            slug: 'two-sum',
            tier: 'Explorer',
          },
        },
      ],
      meta: { total: 1, page: 1, limit: 20, pages: 1 },
    };
  }
}


