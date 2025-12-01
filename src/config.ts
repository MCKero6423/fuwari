import type {
	ExpressiveCodeConfig,
	CommentConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
	UmamiConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "MC_Kero blog",
	subtitle: "MC_Kero的博客,有时候会写点文章",
	lang: "zh_CN",
	themeColor: {
		hue: 355,
		fixed: false,
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png",
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	toc: {
		enable: true,
		depth: 2,
	},
	favicon: [],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.Series,
		LinkPreset.Friends,
		LinkPreset.Expenses,
		LinkPreset.About,
		{
			name: "状态",
			url: "https://status.mckero.com",
			external: true,
		},
		{
			name: "统计",
			url: "https://umami.mckero.com/share/v4wXkxwCYns2ypLN/blog.mckero.com",
			external: true,
		},
		{
			name: "开往",
			url: "https://www.travellings.cn/go.html",
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/demo-avatar.png",
	name: "MC_Kero",
	bio: "依稀当年泪目干！",
	links: [
		{
			name: "Github",
			icon: "fa6-brands:github",
			url: "https://github.com/MCKero6423",
		},
		{
			name: "BiliBili",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/3493260722964658",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const umamiConfig: UmamiConfig = {
	enable: true,
	baseUrl: "https://umami.mckero.com",  // 自部署版本，不需要加 /analytics/us
	shareId: "v4wXkxwCYns2ypLN",
	timezone: "Asia/Shanghai",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};

export const commentConfig: CommentConfig = {
	twikoo: {
		envId: 'https://twikoo.mckero.com/.netlify/functions/twikoo',
	},
}
