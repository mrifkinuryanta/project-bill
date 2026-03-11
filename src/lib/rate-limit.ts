export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

export class RateLimiter {
    private cache: Map<string, { count: number; resetAt: number }>;
    private limit: number;
    private windowMs: number;

    constructor(options: { limit: number; windowMs: number }) {
        this.cache = new Map();
        this.limit = options.limit;
        this.windowMs = options.windowMs;
    }

    public check(identifier: string): RateLimitResult {
        const now = Date.now();
        const record = this.cache.get(identifier);

        // If no record or window expired, reset
        if (!record || now > record.resetAt) {
            this.cache.set(identifier, {
                count: 1,
                resetAt: now + this.windowMs,
            });

            // Occasional cleanup of expired entries to prevent memory leaks in long-running processes
            if (this.cache.size > 1000) {
                this.cleanup(now);
            }

            return {
                success: true,
                limit: this.limit,
                remaining: this.limit - 1,
                reset: now + this.windowMs,
            };
        }

        // Limit exceeded
        if (record.count >= this.limit) {
            return {
                success: false,
                limit: this.limit,
                remaining: 0,
                reset: record.resetAt,
            };
        }

        // Increment count
        record.count++;
        return {
            success: true,
            limit: this.limit,
            remaining: this.limit - record.count,
            reset: record.resetAt,
        };
    }

    private cleanup(now: number) {
        for (const [key, value] of this.cache.entries()) {
            if (now > value.resetAt) {
                this.cache.delete(key);
            }
        }
    }
}
