import { umamiConfig } from "@/config";

/**
 * Umami 公开统计模块。
 *
 * 仅使用 Umami 官方公开的 Share 数据能力（Share ID + Share Token），
 * 不使用管理员账号、密码或后台 API Token。
 *
 * 流程：浏览器 → localStorage 缓存 → GET /api/share/{shareId} 获取公开 token
 *      → GET /api/websites/{websiteId}/stats → 写入缓存 → 更新 UI
 * 所有逻辑仅在客户端执行，SSR / SSG 构建时直接返回 null，不影响静态生成。
 */

export type UmamiMetricValue = number | { value: number } | null | undefined;

export type UmamiStats = Record<string, number>;

export type UmamiShareContext = {
	token: string;
	websiteId: string;
};

type CacheEntry<T> = {
	timestamp: number;
	data: T;
};

const SHARE_CONTEXT_CACHE_KEY = "umami-share-context";
const STATS_CACHE_PREFIX = "umami-stats:";

function getApiBase(): string {
	return umamiConfig.baseUrl.replace(/\/+$/, "");
}

function isClient(): boolean {
	return typeof window !== "undefined";
}

function readCache<T>(key: string): T | null {
	if (!isClient()) return null;
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return null;
		const entry = JSON.parse(raw) as CacheEntry<T>;
		if (!entry || typeof entry.timestamp !== "number") return null;
		if (Date.now() - entry.timestamp >= umamiConfig.cacheTtl) return null;
		return entry.data ?? null;
	} catch {
		// localStorage 不可用或缓存数据损坏时静默降级
		return null;
	}
}

function writeCache<T>(key: string, data: T): void {
	if (!isClient()) return;
	try {
		const entry: CacheEntry<T> = { timestamp: Date.now(), data };
		window.localStorage.setItem(key, JSON.stringify(entry));
	} catch {
		// localStorage 写入失败（隐私模式等）不影响功能
	}
}

/** 兼容不同 Umami 版本的返回结构：直接返回数字或 { value: number } */
export function getMetricValue(value: UmamiMetricValue): number | null {
	if (typeof value === "number") return value;
	if (value && typeof value.value === "number") return value.value;
	return null;
}

let shareContextPromise: Promise<UmamiShareContext | null> | null = null;

/**
 * 获取 Umami 公开分享访问凭据（Share Token）。
 * 优先使用 Share API 返回的 websiteId，否则回退到本地配置中的 websiteId。
 */
export function getUmamiShareContext(): Promise<UmamiShareContext | null> {
	if (!umamiConfig.enable || !isClient()) {
		return Promise.resolve(null);
	}
	if (shareContextPromise) return shareContextPromise;

	shareContextPromise = (async () => {
		const cached = readCache<UmamiShareContext>(SHARE_CONTEXT_CACHE_KEY);
		if (cached?.token) return cached;

		try {
			if (!umamiConfig.shareId) {
				throw new Error("shareId is missing");
			}
			const res = await fetch(`${getApiBase()}/api/share/${umamiConfig.shareId}`);
			if (!res.ok) {
				throw new Error(`Share API responded with ${res.status}`);
			}
			const data = await res.json();
			const context: UmamiShareContext = {
				token: data?.token ?? "",
				websiteId: data?.websiteId || umamiConfig.websiteId,
			};
			if (!context.token || !context.websiteId) {
				throw new Error("Invalid share context response");
			}
			writeCache(SHARE_CONTEXT_CACHE_KEY, context);
			return context;
		} catch (e) {
			console.warn("[umami] Failed to get share context:", e);
			// 请求失败时不缓存失败的 Promise，允许后续调用重试
			shareContextPromise = null;
			return null;
		}
	})();

	return shareContextPromise;
}

// 同一次页面会话内按缓存 key 去重，避免多个组件重复请求
const statsPromises = new Map<string, Promise<UmamiStats | null>>();

function getStatsCacheKey(path?: string): string {
	return STATS_CACHE_PREFIX + (path ?? "global");
}

/**
 * 获取统计数据。不传 path 时为全站统计，传入 path 时为该页面统计。
 * path 必须与 Umami 实际统计到的 pathname 一致（含尾部斜杠、base path 等）。
 */
export function getUmamiStats(options: { path?: string } = {}): Promise<UmamiStats | null> {
	if (!umamiConfig.enable || !isClient()) {
		return Promise.resolve(null);
	}
	const cacheKey = getStatsCacheKey(options.path);
	if (!statsPromises.has(cacheKey)) {
		statsPromises.set(cacheKey, loadStats(options, cacheKey));
	}
	return statsPromises.get(cacheKey)!;
}

async function loadStats(options: { path?: string }, cacheKey: string): Promise<UmamiStats | null> {
	const cached = readCache<UmamiStats>(cacheKey);
	if (cached) return cached;

	try {
		const context = await getUmamiShareContext();
		if (!context) return null;

		const params = new URLSearchParams({
			startAt: "0",
			endAt: String(Date.now()),
		});
		if (options.path) {
			params.set("path", options.path);
		}
		const res = await fetch(`${getApiBase()}/api/websites/${context.websiteId}/stats?${params}`, {
			headers: {
				"x-umami-share-context": "1",
				"x-umami-share-token": context.token,
			},
		});
		if (!res.ok) {
			throw new Error(`Stats API responded with ${res.status}`);
		}
		const data = (await res.json()) as Record<string, UmamiMetricValue>;

		const stats: UmamiStats = {};
		for (const [key, value] of Object.entries(data ?? {})) {
			const num = getMetricValue(value);
			if (num !== null) stats[key] = num;
		}
		if (Object.keys(stats).length === 0) {
			throw new Error("Unexpected stats response structure");
		}

		writeCache(cacheKey, stats);
		return stats;
	} catch (e) {
		console.warn("[umami] Failed to load stats:", e);
		// 失败时移除内存缓存，允许组件后续重试；已成功的缓存不受影响
		statsPromises.delete(cacheKey);
		return null;
	}
}

/** 获取单个统计指标，例如 "pageviews"、"visitors"（以及 visits、bounces、totaltime 等） */
export async function getUmamiMetric(
	metric: string,
	options: { path?: string } = {},
): Promise<number | null> {
	const stats = await getUmamiStats(options);
	if (!stats) return null;
	const value = stats[metric];
	return typeof value === "number" ? value : null;
}
