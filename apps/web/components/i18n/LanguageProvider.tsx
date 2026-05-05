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
  ["White background last", "白底图最后"]
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
