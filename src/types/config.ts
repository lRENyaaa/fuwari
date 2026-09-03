import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";

export type SiteConfig = {
	title: string;
	subtitle: string;

	lang:
		| "zh_CN"
		| "en"
		| "zh_TW"
		| "ja"
		| "ko"
		| "es"
		| "th"
		| "vi"
		| "tr"
		| "id";

	themeColor: {
		hue: number;
		fixed: boolean;
	};
	banner: {
		enable: boolean;
		src: string;
		position?: "top" | "center" | "bottom";
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
	};
	toc: {
		enable: boolean;
		depth: 1 | 2 | 3;
	};

	favicon: Favicon[];
};

export type Favicon = {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
};

export enum LinkPreset {
	Home = 0,
	Archive = 1,
	About = 2,
}

export type NavBarLink = {
	name: string;
	url: string;
	external?: boolean;
};

export type NavBarConfig = {
	links: (NavBarLink | LinkPreset)[];
};

export type ProfileConfig = {
	avatar?: string;
	name: string;
	copyrightName: string;
	bio?: string;
	links: {
		name: string;
		url: string;
		icon: string;
	}[];
};

export type LicenseConfig = {
	enable: boolean;
	name: string;
	url: string;
};

export type LIGHT_DARK_MODE =
	| typeof LIGHT_MODE
	| typeof DARK_MODE
	| typeof AUTO_MODE;

export type BlogPostData = {
	body: string;
	title: string;
	published: Date;
	description: string;
	tags: string[];
	draft?: boolean;
	image?: string;
	category?: string;
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
};

export type ExpressiveCodeConfig = {
	theme: string;
};

export type UmamiConfig = {
	enable: boolean;
	// Umami 实例地址，例如 "https://umami.example.com/"
	baseUrl: string;
	websiteId: string;
	// Umami 公开分享 ID（站点设置中的 Share URL 末段），用于公开读取统计数据
	shareId: string;
	// 统计数据本地缓存有效期（毫秒）
	cacheTtl: number;
};
