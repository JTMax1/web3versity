/**
 * Rate Limiter for Gemini API
 *
 * Implements token bucket algorithm to respect Gemini Free Tier limits:
 * - 15 requests per minute (RPM)
 * - 1,500 requests per day
 *
 * This prevents quota exhaustion and ensures fair distribution of AI resources
 * across all users during peak usage.
 *
 * Token Bucket Algorithm:
 * - Start with 15 tokens (requests)
 * - Each API call consumes 1 token
 * - Tokens refill at rate of 1 per 4 seconds (15/minute)
 * - If no tokens available, request waits in queue for next token
 */

interface RateLimitQueueItem {
  resolve: () => void;
  timestamp: number;
}

class RateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // milliseconds per token
  private readonly dailyLimit: number;
  private requestsToday: number;
  private lastResetDate: string;
  private queue: RateLimitQueueItem[] = [];
  private refillInterval: NodeJS.Timeout | null = null;

  constructor(
    maxRequestsPerMinute: number = 15,
    dailyLimit: number = 1500
  ) {
    this.maxTokens = maxRequestsPerMinute;
    this.tokens = maxRequestsPerMinute;
    this.refillRate = 60000 / maxRequestsPerMinute; // Convert RPM to milliseconds per token
    this.dailyLimit = dailyLimit;
    this.requestsToday = 0;
    this.lastResetDate = new Date().toDateString();

    this.startRefill();
  }

  /**
   * Wait for a token to become available
   *
   * @returns Promise that resolves when a token is available
   * @throws Error if daily limit exceeded
   */
  async waitForToken(): Promise<void> {
    // Check daily limit
    this.checkDailyReset();
    if (this.requestsToday >= this.dailyLimit) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const hoursUntilReset = Math.ceil((tomorrow.getTime() - Date.now()) / (1000 * 60 * 60));

      throw new Error(
        `Daily API limit of ${this.dailyLimit} requests exceeded. ` +
        `Limit resets in ${hoursUntilReset} hours.`
      );
    }

    // If token available, consume it immediately
    if (this.tokens > 0) {
      this.tokens--;
      this.requestsToday++;
      return Promise.resolve();
    }

    // No tokens available - add to queue
    return new Promise<void>((resolve) => {
      this.queue.push({
        resolve,
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Start the token refill interval
   * Adds 1 token every refillRate milliseconds
   */
  private startRefill(): void {
    if (this.refillInterval) {
      clearInterval(this.refillInterval);
    }

    this.refillInterval = setInterval(() => {
      // Add token if not at max
      if (this.tokens < this.maxTokens) {
        this.tokens++;
      }

      // Process queue if tokens available
      if (this.tokens > 0 && this.queue.length > 0) {
        const item = this.queue.shift();
        if (item) {
          this.tokens--;
          this.requestsToday++;
          item.resolve();
        }
      }
    }, this.refillRate);
  }

  /**
   * Stop the refill interval (for cleanup)
   */
  stop(): void {
    if (this.refillInterval) {
      clearInterval(this.refillInterval);
      this.refillInterval = null;
    }
  }

  /**
   * Check if daily limit needs to be reset
   */
  private checkDailyReset(): void {
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.requestsToday = 0;
      this.lastResetDate = today;
    }
  }

  /**
   * Get current rate limit status
   */
  getStatus(): {
    availableTokens: number;
    maxTokens: number;
    queueLength: number;
    requestsToday: number;
    dailyLimit: number;
  } {
    this.checkDailyReset();
    return {
      availableTokens: this.tokens,
      maxTokens: this.maxTokens,
      queueLength: this.queue.length,
      requestsToday: this.requestsToday,
      dailyLimit: this.dailyLimit,
    };
  }

  /**
   * Get estimated wait time in milliseconds
   */
  getEstimatedWaitTime(): number {
    if (this.tokens > 0) {
      return 0;
    }

    // Position in queue * refill rate
    return this.queue.length * this.refillRate;
  }
}

/**
 * Singleton rate limiter instance
 * Shared across all AI service calls
 */
export const rateLimiter = new RateLimiter(15, 1500);

/**
 * Cleanup function for graceful shutdown
 */
export function stopRateLimiter(): void {
  rateLimiter.stop();
}

/**
 * Get current rate limit status
 * Useful for displaying quota information to users
 */
export function getRateLimitStatus() {
  return rateLimiter.getStatus();
}
