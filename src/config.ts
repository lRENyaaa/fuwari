import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "任渊的博客",
	subtitle: "一个神秘的博客",
	lang: "zh_CN", // 语言代码，例如 'en'、'zh_CN'、'ja' 等。
	themeColor: {
		hue: 250, // 主题颜色的默认色相，范围为 0 到 360。例如：红色：0，蓝绿色：200，青色：250，粉色：345
		fixed: false, // 对访客隐藏主题颜色选择器
	},
	banner: {
		enable: true,
		src: "https://rba.kanostar.top/adapt", // 相对于 /src 目录。如果以 '/' 开头，则相对于 /public 目录
		position: "center", // 等同于 object-position，仅支持 'top'、'center'、'bottom'。默认值为 'center'
		credit: {
			enable: false, // 显示横幅图片的署名文字
			text: "", // 要显示的署名文字
			url: "", // （可选）原始作品或艺术家页面的 URL 链接
		},
	},
	toc: {
		enable: true, // 在文章右侧显示目录
		depth: 2, // 目录中显示的最大标题层级，范围为 1 到 3
	},
	favicon: [
		// 将此数组留空以使用默认 favicon
		{
		  src: '/favicon.ico',    // favicon 的路径，相对于 /public 目录
		  theme: 'light',              // （可选）'light' 或 'dark'，仅当浅色和深色模式使用不同 favicon 时设置
		  sizes: '',              // （可选）favicon 的尺寸，仅当你有不同尺寸的 favicon 时设置
		}
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "GitHub",
			url: "https://github.com/lRENyaaa", // 内部链接不应包含基础路径，因为系统会自动添加
			external: true, // 显示外部链接图标，并在新标签页中打开
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.jpg", // 相对于 /src 目录。如果以 '/' 开头，则相对于 /public 目录
	name: "李任渊",
	copyrightName: "lRENyaaa",
	bio: "真·啥也不会",
	links: [
		{
			name: "Bilibili",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/457639058",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/lRENyaaa",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// 注意：某些样式（例如背景颜色）已被覆盖，详见 astro.config.mjs 文件。
	// 请选择深色主题，因为当前博客主题仅支持深色背景
	theme: "github-dark",
};