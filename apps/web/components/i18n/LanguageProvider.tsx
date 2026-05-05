"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

export type Locale = "en" | "zh";

const STORAGE_KEY = "acestudio-language";
const textOriginals = new WeakMap<Text, string>();
const attributeOriginals = new WeakMap<Element, Record<string, string>>();
const translatableAttributes = ["title", "aria-label", "placeholder", "alt"] as const;

const dictionaries = {
  en: {
    shell: {
      subtitle: "Product content workspace",
      dashboard: "Dashboard",
      products: "Products",
      upload: "Upload",
      account: "Account",
      credits: "Credits",
      signIn: "Sign in",
      signOut: "Sign out",
      support: "Support",
      privacy: "Privacy",
      refund: "Refund",
      terms: "Terms",
      language: "Language",
      english: "EN",
      chinese: "中"
    },
    onboarding: {
      eyebrow: "First-time setup",
      title: "Connect, generate, review, then publish a Shopify draft.",
      description:
        "AceStudio keeps the first run focused on one safe workflow. Live publishing stays behind a separate confirmation.",
      progress: "complete",
      nextBestAction: "Next best action",
      nextPrefix: "Next:",
      draftSafetyTitle: "Draft-first safety",
      draftSafetyBody:
        "The normal flow creates a Shopify draft, so users can review the product inside Shopify before anything goes live.",
      step: "Step",
      connectShopify: {
        title: "Connect Shopify",
        description: "Authorize the store that will receive draft products.",
        activeAction: "View connection",
        action: "Connect store"
      },
      uploadProduct: {
        title: "Upload product",
        description: "Create the workspace from one original product photo.",
        activeAction: "View brief",
        action: "Upload photo"
      },
      generate: {
        title: "Generate images/copy",
        description: "Create the Shopify media set and SEO listing copy.",
        mediaAction: "Open media workflow",
        copyAction: "Open copy editor"
      },
      review: {
        title: "Review listing",
        description: "Check media order, title, copy, price, and inventory.",
        action: "Review product"
      },
      publish: {
        title: "Publish draft",
        description: "Create a Shopify draft for final review in Admin.",
        action: "Publish draft"
      }
    }
  },
  zh: {
    shell: {
      subtitle: "商品内容工作台",
      dashboard: "工作台",
      products: "商品",
      upload: "上传",
      account: "账户",
      credits: "积分",
      signIn: "登录",
      signOut: "退出",
      support: "支持",
      privacy: "隐私",
      refund: "退款",
      terms: "条款",
      language: "语言",
      english: "EN",
      chinese: "中"
    },
    onboarding: {
      eyebrow: "首次设置",
      title: "连接 Shopify，生成内容，检查后发布草稿。",
      description:
        "AceStudio 会把第一次使用限制在安全的主流程里。正式上线发布仍然需要单独确认。",
      progress: "已完成",
      nextBestAction: "下一步建议",
      nextPrefix: "下一步：",
      draftSafetyTitle: "默认草稿发布",
      draftSafetyBody:
        "常规流程只会创建 Shopify 草稿，用户可以先在 Shopify 后台检查商品，再决定是否正式上线。",
      step: "步骤",
      connectShopify: {
        title: "连接 Shopify",
        description: "授权接收商品草稿的店铺。",
        activeAction: "查看连接",
        action: "连接店铺"
      },
      uploadProduct: {
        title: "上传商品",
        description: "用一张原始商品图创建商品工作区。",
        activeAction: "查看简介",
        action: "上传图片"
      },
      generate: {
        title: "生成图片/文案",
        description: "生成 Shopify 商品图组和 SEO 商品文案。",
        mediaAction: "打开图片流程",
        copyAction: "打开文案编辑"
      },
      review: {
        title: "检查商品",
        description: "检查图片顺序、标题、文案、价格和库存。",
        action: "检查商品"
      },
      publish: {
        title: "发布草稿",
        description: "创建 Shopify 商品草稿，方便最后审核。",
        action: "发布草稿"
      }
    }
  }
} as const;

const phrasePairs = [
  ["AceStudio", "AceStudio"],
  ["Product content workspace", "商品内容工作台"],
  ["Dashboard", "工作台"],
  ["Products", "商品"],
  ["Upload", "上传"],
  ["Account", "账户"],
  ["Credits", "积分"],
  ["Sign in", "登录"],
  ["Sign out", "退出"],
  ["Support", "支持"],
  ["Privacy", "隐私"],
  ["Refund", "退款"],
  ["Terms", "条款"],
  ["Language", "语言"],
  ["Create product draft", "创建商品草稿"],
  ["Review products", "查看商品"],
  ["View all", "查看全部"],
  ["First-time setup", "首次设置"],
  ["Connect, generate, review, then publish a Shopify draft.", "连接 Shopify，生成内容，检查后发布草稿。"],
  [
    "AceStudio keeps the first run focused on one safe workflow. Live publishing stays behind a separate confirmation.",
    "AceStudio 会把第一次使用限制在安全的主流程里。正式上线发布仍然需要单独确认。"
  ],
  ["Next best action", "下一步建议"],
  ["Draft-first safety", "默认草稿发布"],
  [
    "The normal flow creates a Shopify draft, so users can review the product inside Shopify before anything goes live.",
    "常规流程只会创建 Shopify 草稿，用户可以先在 Shopify 后台检查商品，再决定是否正式上线。"
  ],
  ["Connect Shopify", "连接 Shopify"],
  ["Upload product", "上传商品"],
  ["Generate images/copy", "生成图片/文案"],
  ["Review listing", "检查商品"],
  ["Publish draft", "发布草稿"],
  ["Connect store", "连接店铺"],
  ["View connection", "查看连接"],
  ["Upload photo", "上传图片"],
  ["View brief", "查看简介"],
  ["Open media workflow", "打开图片流程"],
  ["Open copy editor", "打开文案编辑"],
  ["Review product", "检查商品"],
  ["Publish draft", "发布草稿"],
  ["Workspace command center", "工作区指挥中心"],
  ["Shopify connected", "Shopify 已连接"],
  ["Store not connected", "店铺未连接"],
  ["Build Shopify-ready listings from product photos.", "用商品图片生成可发布到 Shopify 的商品页。"],
  [
    "Keep every draft moving through media, copy, commerce, and publish checks before it reaches Shopify.",
    "每个草稿都会经过图片、文案、价格库存和发布检查，再发送到 Shopify。"
  ],
  ["Drafts", "草稿"],
  ["Ready", "已就绪"],
  ["Failed jobs", "失败任务"],
  ["Shopify connection", "Shopify 连接"],
  ["Ready to publish", "可以发布"],
  ["Setup needed", "需要设置"],
  ["Store setup", "店铺设置"],
  ["Connect Shopify before publishing", "发布前先连接 Shopify"],
  [
    "OAuth keeps the store token saved server-side so future drafts can publish without retyping credentials.",
    "OAuth 会把店铺令牌安全保存在服务端，以后发布草稿无需重复输入凭证。"
  ],
  ["First product", "第一个商品"],
  ["Upload a product photo", "上传一张商品图片"],
  [
    "Start from one original image, then generate the media set and listing copy from the same workflow.",
    "从一张原始图片开始，在同一流程里生成商品图组和商品文案。"
  ],
  ["Retry needed", "需要重试"],
  ["Review job", "查看任务"],
  ["Ready to publish", "可以发布"],
  ["Create Shopify draft", "创建 Shopify 草稿"],
  ["Continue product", "继续编辑商品"],
  ["Workspace ready", "工作区已就绪"],
  ["Create the next Shopify-ready product", "创建下一个 Shopify 商品"],
  ["Create next draft", "创建下一个草稿"],
  ["Ready quality", "达标商品"],
  ["Published", "已发布"],
  ["In progress", "进行中"],
  ["Draft pipeline", "草稿流程"],
  ["Recent product drafts", "最近商品草稿"],
  ["No products yet. Create your first draft from an uploaded product photo.", "还没有商品。请先上传一张商品图片创建第一个草稿。"],
  ["Pipeline health", "流程状态"],
  ["Shopify readiness", "Shopify 发布准备度"],
  ["total", "总计"],
  ["Automation", "自动化"],
  ["Recent jobs", "最近任务"],
  ["Usage", "使用记录"],
  ["Jobs will appear after image or copy generation.", "生成图片或文案后，任务会显示在这里。"],
  ["Account activity", "账户活动"],
  ["Usage history", "使用历史"],
  ["Export CSV", "导出 CSV"],
  ["Credit ledger", "积分流水"],
  ["Generation jobs", "生成任务"],
  ["No usage yet", "暂无使用记录"],
  ["Billing", "账单"],
  ["Billing and credits", "账单与积分"],
  ["Credit balance", "积分余额"],
  ["Current balance", "当前余额"],
  ["Unlimited", "无限"],
  ["Buy credits", "购买积分"],
  ["Account controls", "账户管理"],
  ["Workspace settings, billing, diagnostics, and support live here so the main nav can stay focused on product creation.", "工作区设置、账单、诊断和支持都放在这里，让顶部导航专注于商品创建。"],
  ["Shopify connection", "Shopify 连接"],
  ["Connect or replace the Shopify store used for product publishing.", "连接或更换用于商品发布的 Shopify 店铺。"],
  ["Open Shopify", "打开 Shopify"],
  ["Open billing", "打开账单"],
  ["Data exports", "数据导出"],
  ["Download account usage and job history for record keeping.", "下载账户使用记录和任务历史，方便归档。"],
  ["Download export", "下载导出"],
  ["Launch readiness", "上线检查"],
  ["Open launch", "打开上线检查"],
  ["Admin QA dashboard", "管理员 QA 面板"],
  ["Open admin", "打开管理员面板"],
  ["Support", "支持"],
  ["Contact support", "联系支持"],
  ["Products", "商品"],
  ["Product drafts", "商品草稿"],
  ["Create product", "创建商品"],
  ["Upload first product", "上传第一个商品"],
  ["Create your first Shopify-ready listing from a product photo.", "用一张商品图片创建第一个可发布到 Shopify 的商品页。"],
  [
    "The workflow keeps the original image separate, generates a publish media set, prepares SEO copy, and saves everything for review before Shopify publishing.",
    "流程会保留原图，生成可发布图组，准备 SEO 文案，并在发布到 Shopify 前保存以供检查。"
  ],
  ["Connect Shopify when ready", "准备好后连接 Shopify"],
  [
    "You can create drafts before connecting a store. Connect Shopify before publishing so drafts can be sent in one step.",
    "你可以先创建草稿，再连接店铺。发布前连接 Shopify 后即可一键发送草稿。"
  ],
  ["Search products", "搜索商品"],
  ["Sort products", "商品排序"],
  ["All quality", "全部质量"],
  ["Highest quality", "质量最高"],
  ["Needs work", "需要完善"],
  ["Almost ready", "接近完成"],
  ["Ready listings", "已达标商品"],
  ["Average quality", "平均质量"],
  ["No products match these filters", "没有符合条件的商品"],
  ["Clear selected products", "清除已选商品"],
  ["Create drafts", "创建草稿"],
  ["Working...", "处理中..."],
  ["Duplicate", "复制"],
  ["Delete", "删除"],
  ["Product brief", "商品简介"],
  ["Media", "图片"],
  ["Copy", "文案"],
  ["Commerce", "价格库存"],
  ["Publish", "发布"],
  ["Listing quality", "商品质量"],
  ["Generate images", "生成图片"],
  ["Generate copy", "生成文案"],
  ["Set price, SKU, and inventory before publishing.", "发布前设置价格、SKU 和库存。"],
  ["Create a draft for final Shopify review, or publish live when the checklist is complete.", "先创建 Shopify 草稿做最终检查，清单完成后再正式上线。"],
  ["Create draft", "创建草稿"],
  ["Publish live", "正式发布"],
  ["Shopify preview", "Shopify 预览"],
  ["Recent draft and publish attempts for this product.", "该商品最近的草稿和发布尝试。"],
  ["No Shopify publish attempts yet.", "还没有 Shopify 发布记录。"],
  ["Upload product image", "上传商品图片"],
  ["Drop product image", "拖放商品图片"],
  ["Upload preview", "上传预览"],
  ["Replace image", "替换图片"],
  ["Create product draft", "创建商品草稿"],
  ["Shopify publishing setup", "Shopify 发布设置"],
  ["Connect each user workspace to its own Shopify store. Products are sent as drafts by default so the store owner can review media, copy, price, and inventory before going live.", "为每个用户工作区连接自己的 Shopify 店铺。商品默认以草稿发送，店主可以先检查图片、文案、价格和库存，再正式上线。"],
  ["Draft publishing", "草稿发布"],
  ["Create Shopify drafts from the app without surprise live publishing.", "在应用内创建 Shopify 草稿，不会意外正式上线。"],
  ["Image publishing", "图片发布"],
  ["Webhook status", "Webhook 状态"],
  ["Connect Shopify before publishing products.", "发布商品前请先连接 Shopify。"],
  ["Shopify draft publishing can run from product pages.", "可以从商品页面发布 Shopify 草稿。"],
  ["Launch readiness", "上线检查"],
  ["Open dashboard", "打开工作台"],
  ["Supabase schema", "Supabase 数据库结构"],
  ["Shopify publishing", "Shopify 发布"],
  ["Storage", "存储"],
  ["Payment", "支付"],
  ["Ready", "就绪"],
  ["Missing", "缺失"],
  ["Optional", "可选"],
  ["No action needed", "无需操作"],
  ["Open env settings", "打开环境变量设置"],
  ["Terms & Conditions", "服务条款"],
  ["Privacy Policy", "隐私政策"],
  ["Refund policy", "退款政策"],
  ["Account and Store Access", "账户与店铺访问"],
  ["Contact", "联系"],
  ["Before publishing live", "正式上线前"],
  ["Publish as draft first and review the product in Shopify Admin.", "请先发布为草稿，并在 Shopify 后台检查商品。"],
  ["Account safety", "账户安全"],
  ["Start your first product", "开始第一个商品"],
  ["Draft-first", "默认草稿"],
  ["Persistent storage", "持久化存储"],
  ["Upload one product and publish the first draft.", "上传一个商品并发布第一个草稿。"],
  ["Lifestyle first", "场景图优先"],
  ["White background last", "白底图最后"],
  ["Before and after", "前后对比"],
  ["Turn a raw product photo into a Shopify draft your team can inspect.", "把一张原始商品图变成团队可检查的 Shopify 草稿。"],
  [
    "Merchants do not need another image generator tab. AceStudio keeps the media, copy, pricing, inventory, and publish history together so every listing has a clear review path.",
    "商家不需要再多开一个图片生成工具。AceStudio 会把图片、文案、价格、库存和发布历史放在一起，让每个商品都有清晰的审核路径。"
  ],
  ["Before", "之前"],
  ["After", "之后"],
  ["Manual product setup", "手动商品配置"],
  ["AceStudio workflow", "AceStudio 工作流"],
  ["Separate image tools", "分散的图片工具"],
  ["Copy pasted into Shopify", "手动复制文案到 Shopify"],
  ["No publish retry history", "没有发布重试历史"],
  ["4+ ordered generated images", "4 张以上有顺序的生成图"],
  ["SEO copy, price, and inventory in one review", "SEO 文案、价格和库存统一检查"],
  ["Draft-first Shopify publish with logs", "默认草稿发布并保留日志"],
  ["Pricing built for credits", "为积分体系准备的价格结构"],
  [
    "Payment can be switched on later without redesigning the app. Admin accounts can run freely now, while normal users already see credit balances and usage history.",
    "后续可以接入支付而不用重新设计应用。管理员账号现在可无限使用，普通用户已经能看到积分余额和使用历史。"
  ],
  ["Trial", "试用"],
  ["Free starter credits for the first product workflow.", "第一个商品流程可赠送初始试用积分。"],
  ["Pay as you go", "按需购买"],
  ["Credit packs for image generation when Stripe is enabled.", "启用 Stripe 后可购买图片生成积分包。"],
  ["Monthly", "月度套餐"],
  ["Included credits and history for repeat merchants.", "为长期商家提供月度积分和历史记录。"],
  ["Privacy promise", "隐私承诺"],
  [
    "Store access is OAuth-based, publishing defaults to draft, and sensitive Shopify tokens are handled server-side.",
    "店铺访问基于 OAuth，发布默认创建草稿，敏感 Shopify token 由服务端处理。"
  ],
  ["FAQ", "常见问题"],
  ["Does it publish live by default?", "默认会直接上线发布吗？"],
  ["No. The safe path creates a Shopify draft first, with live publishing behind a separate confirmation.", "不会。安全流程会先创建 Shopify 草稿，正式上线发布需要单独确认。"],
  ["Can each user connect their own store?", "每个用户都可以连接自己的店铺吗？"],
  ["Yes. Shopify OAuth saves the connected store for that user workspace, so they do not need to paste admin tokens.", "可以。Shopify OAuth 会为该用户工作区保存连接的店铺，无需粘贴后台 token。"],
  ["What happens when generation fails?", "生成失败时会怎样？"],
  ["The failed job is saved with the error, retry path, product link, and CSV export for support.", "失败任务会保存错误、重试入口、商品链接，并支持导出 CSV 供排查。"],
  ["Error monitoring summary", "错误监控摘要"],
  ["Failed image, copy, and Shopify jobs are saved here with retry links and exportable logs.", "失败的图片、文案和 Shopify 任务会保存在这里，并提供重试链接和可导出的日志。"],
  ["Needs review", "需要检查"],
  ["Healthy", "状态正常"],
  ["Active jobs", "进行中任务"],
  ["Last failure", "最近失败"],
  ["None", "无"],
  [
    "Sentry or Vercel Observability can be connected later for server exceptions. The product workflow already records user-visible generation and publish failures.",
    "之后可以接入 Sentry 或 Vercel Observability 捕获服务端异常。目前商品流程已经记录用户可见的生成和发布失败。"
  ],
  ["Published Shopify drafts", "已发布的 Shopify 草稿"],
  ["The newest successful Shopify draft links are kept here for quick review.", "最新成功创建的 Shopify 草稿链接会保存在这里，方便快速查看。"],
  ["Successful Shopify drafts will appear after the first publish.", "首次发布成功后，Shopify 草稿会显示在这里。"],
  ["Shopify drafts", "Shopify 草稿"],
  ["Open retry tab", "打开重试页面"],
  ["Your first Shopify draft is ready.", "你的第一个 Shopify 草稿已准备好。"],
  ["Your first Shopify draft is ready", "你的第一个 Shopify 草稿已准备好"],
  ["Your Shopify product is live", "你的 Shopify 商品已上线"],
  [
    "Open Shopify Admin to review media order, SEO copy, price, inventory, and sales channel settings before your next product.",
    "打开 Shopify 后台检查图片顺序、SEO 文案、价格、库存和销售渠道设置，然后继续创建下一个商品。"
  ],
  ["Open Shopify draft", "打开 Shopify 草稿"],
  ["Create next product", "创建下一个商品"],
  ["Product listing generator", "商品页生成器"],
  ["Image generator", "图片生成"],
  ["SEO copy", "SEO 文案"],
  ["Draft publisher", "草稿发布"],
  ["Resources", "资源"],
  ["Shopify AI product listing generator", "Shopify AI 商品页生成器"],
  ["Shopify AI product listing generator for draft-ready products", "用于草稿商品的 Shopify AI 商品页生成器"],
  [
    "AceStudio helps Shopify merchants turn one product photo into generated product images, SEO copy, price and inventory fields, and a reviewable Shopify draft.",
    "AceStudio 帮助 Shopify 商家把一张商品图变成生成商品图、SEO 文案、价格库存字段和可审核的 Shopify 草稿。"
  ],
  ["Generate a Shopify product listing", "生成 Shopify 商品页"],
  ["One workflow for the full Shopify listing", "一个流程完成完整 Shopify 商品页"],
  ["Built around merchant review", "围绕商家审核设计"],
  ["Ready for credit-based generation", "已为积分生成模式准备"],
  ["Shopify AI guides", "Shopify AI 指南"],
  ["Learn the workflow before connecting a store.", "连接店铺前先了解完整流程。"],
  ["View all resources", "查看所有资源"],
  ["AI product image generator for Shopify", "Shopify AI 商品图片生成器"],
  ["Shopify product image generator for draft-ready listings", "用于 Shopify 草稿商品的商品图片生成器"],
  [
    "AceStudio helps Shopify merchants turn one product photo into an ordered product media set with lifestyle, detail, intro, and white-background images ready for draft publishing.",
    "AceStudio 帮助 Shopify 商家把一张商品图生成有顺序的商品图组，包括场景图、细节图、介绍图和白底图，用于草稿发布。"
  ],
  ["Generate Shopify product images", "生成 Shopify 商品图片"],
  ["What AceStudio helps with", "AceStudio 可以帮你做什么"],
  ["From one photo to a full media set", "从一张图片到完整商品图组"],
  ["Built for product review", "为商品审核而设计"],
  ["Connected to the rest of the listing", "和商品页其他内容联动"],
  ["Frequently asked questions", "常见问题"],
  ["Ready to build the first draft?", "准备创建第一个草稿了吗？"],
  ["Create Shopify-ready product content from one photo.", "用一张图片创建 Shopify 可用的商品内容。"],
  ["Open AceStudio", "打开 AceStudio"],
  ["AI Shopify SEO copy generator", "AI Shopify SEO 文案生成器"],
  ["Shopify SEO product description generator for merchant-ready drafts", "面向商家草稿的 Shopify SEO 商品描述生成器"],
  ["Generate Shopify SEO copy", "生成 Shopify SEO 文案"],
  ["Copy that fits Shopify workflows", "适合 Shopify 流程的文案"],
  ["Quality controls before generation", "生成前的质量控制"],
  ["Review before publishing", "发布前检查"],
  ["AI Shopify draft publisher", "AI Shopify 草稿发布工具"],
  ["AI Shopify draft publisher with media, copy, price, and inventory review", "支持图片、文案、价格和库存检查的 AI Shopify 草稿发布工具"],
  ["Create a Shopify draft", "创建 Shopify 草稿"],
  ["Draft-first by design", "设计上默认草稿优先"],
  ["OAuth store connection", "OAuth 店铺连接"],
  ["Publish logs merchants can trust", "商家可信的发布日志"],
  ["Shopify AI resources", "Shopify AI 资源"],
  ["Recommended guides for this workflow", "该流程的推荐指南"],
  ["Related Shopify AI guides", "相关 Shopify AI 指南"],
  ["Guides for AI product images, Shopify SEO copy, and draft publishing.", "AI 商品图片、Shopify SEO 文案和草稿发布指南。"],
  ["Practical tutorials for merchants who want to use AI inside a controlled Shopify product workflow.", "给希望在可控 Shopify 商品流程中使用 AI 的商家准备的实用教程。"],
  ["Read guide", "阅读指南"],
  ["How to write Shopify product descriptions with AI", "如何用 AI 编写 Shopify 商品描述"],
  ["AI product photography for Shopify: a draft-first workflow", "Shopify AI 商品摄影：默认草稿优先的流程"],
  ["Shopify product draft workflow for AI-generated listings", "AI 生成商品页的 Shopify 草稿流程"],
  ["Shopify AI product listing checklist before publishing", "发布前 Shopify AI 商品页检查清单"],
  ["Best AI product photo workflow for Shopify stores", "Shopify 店铺最佳 AI 商品图片流程"],
  ["Shopify AI publishing mistakes to avoid", "需要避免的 Shopify AI 发布错误"],
  ["See related workflow", "查看相关流程"],
  ["All resources", "所有资源"],
  ["Updated 2026-05-05", "更新于 2026-05-05"],
  ["Practical checklist", "实用清单"],
  ["Turn this into a repeatable workflow", "把它变成可重复的流程"],
  [
    "Use AceStudio to generate product media, copy, and Shopify drafts from one place.",
    "使用 AceStudio 在一个地方生成商品图片、文案和 Shopify 草稿。"
  ]
] as const;

const zhPhraseMap = new Map<string, string>(phrasePairs);
const enPhraseMap = new Map<string, string>(phrasePairs.map(([en, zh]) => [zh, en]));

type WidenStrings<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : WidenStrings<T[K]>;
};

type Dictionary = WidenStrings<(typeof dictionaries)["en"]>;

const LanguageContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
} | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "zh" ? "zh" : "en";
}

function splitTextPadding(value: string) {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const core = value.slice(leading.length, value.length - trailing.length);
  return { leading, core, trailing };
}

function translatePhrase(value: string, locale: Locale) {
  if (!value.trim()) return value;
  const { leading, core, trailing } = splitTextPadding(value);
  const translated = locale === "zh" ? zhPhraseMap.get(core) : enPhraseMap.get(core);
  return translated ? `${leading}${translated}${trailing}` : value;
}

function restoreOriginalText(node: Text) {
  const storedOriginal = textOriginals.get(node);
  if (storedOriginal) return storedOriginal;
  const value = node.nodeValue ?? "";
  const { core } = splitTextPadding(value);
  const original = enPhraseMap.get(core) ? translatePhrase(value, "en") : value;
  textOriginals.set(node, original);
  return original;
}

function translateTextNode(node: Text, locale: Locale) {
  const original = restoreOriginalText(node);
  const nextValue = locale === "zh" ? translatePhrase(original, "zh") : original;
  if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
}

function shouldSkipElement(element: Element) {
  const tagName = element.tagName.toLowerCase();
  return ["script", "style", "textarea", "code", "pre"].includes(tagName);
}

function getOriginalAttribute(element: Element, attribute: string) {
  const current = element.getAttribute(attribute);
  if (!current) return null;

  const stored = attributeOriginals.get(element) ?? {};
  if (stored[attribute]) return stored[attribute];

  const original = enPhraseMap.has(current) ? enPhraseMap.get(current)! : current;
  attributeOriginals.set(element, { ...stored, [attribute]: original });
  return original;
}

function translateElementAttributes(element: Element, locale: Locale) {
  translatableAttributes.forEach((attribute) => {
    const original = getOriginalAttribute(element, attribute);
    if (!original) return;
    const nextValue = locale === "zh" ? translatePhrase(original, "zh") : original;
    if (element.getAttribute(attribute) !== nextValue) {
      element.setAttribute(attribute, nextValue);
    }
  });
}

function translateNode(root: Node, locale: Locale) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as Text, locale);
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

  const element = root.nodeType === Node.ELEMENT_NODE ? (root as Element) : null;
  if (element) {
    if (shouldSkipElement(element)) return;
    translateElementAttributes(element, locale);
  }

  root.childNodes.forEach((child) => translateNode(child, locale));
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(getInitialLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    const body = document.body;
    translateNode(body, locale);

    const observer = new MutationObserver((mutations) => {
      observer.disconnect();
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") {
          translateNode(mutation.target, locale);
          return;
        }

        if (mutation.type === "attributes") {
          translateNode(mutation.target, locale);
          return;
        }

        mutation.addedNodes.forEach((node) => translateNode(node, locale));
      });
      observer.observe(body, {
        attributes: true,
        attributeFilter: [...translatableAttributes],
        characterData: true,
        childList: true,
        subtree: true
      });
    });

    observer.observe(body, {
      attributes: true,
      attributeFilter: [...translatableAttributes],
      characterData: true,
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: dictionaries[locale]
    }),
    [locale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
