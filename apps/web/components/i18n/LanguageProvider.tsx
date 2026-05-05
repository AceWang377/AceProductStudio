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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(getInitialLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    window.localStorage.setItem(STORAGE_KEY, locale);
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
