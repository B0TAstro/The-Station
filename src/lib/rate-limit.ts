/**
 * Simple in-memory rate limiter
 */
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

setInterval(
    () => {
        const now = Date.now();
        for (const [key, entry] of rateLimitMap.entries()) {
            if (now > entry.resetTime) {
                rateLimitMap.delete(key);
            }
        }
    },
    5 * 60 * 1000,
);

interface RateLimitConfig {
    maxAttempts: number;
    windowMs: number;
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetMs: number;
}

export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return {
            success: true,
            remaining: config.maxAttempts - 1,
            resetMs: config.windowMs,
        };
    }

    entry.count++;

    if (entry.count > config.maxAttempts) {
        return {
            success: false,
            remaining: 0,
            resetMs: entry.resetTime - now,
        };
    }

    return {
        success: true,
        remaining: config.maxAttempts - entry.count,
        resetMs: entry.resetTime - now,
    };
}
