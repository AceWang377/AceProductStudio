export type Locale = "en" | "zh";

type WidenStrings<T> = T extends string
  ? string
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<WidenStrings<U>>
    : {
        readonly [K in keyof T]: WidenStrings<T[K]>;
      };

function defineDictionaries<const T extends Record<string, unknown>>(value: {
  readonly en: T;
  readonly zh: WidenStrings<T>;
}) {
  return value;
}

export const dictionaries = defineDictionaries({
  en: {
    shell: {
      subtitle: "Product content workspace",
      dashboard: "Dashboard",
      products: "Products",
      upload: "Upload",
      account: "Account",
      productStudio: "Product Studio",
      growthStudio: "Growth Studio",
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
    footer: {
      product: "Product",
      growth: "Growth",
      resources: "Resources",
      company: "Company",
      productStudio: "Product Studio",
      draftPublisher: "Draft publisher",
      seoGeoOptimizer: "SEO/GEO optimizer",
      seoCopy: "SEO copy",
      imageSeo: "Image SEO",
      guides: "Guides",
      shopifyAiChecklist: "Shopify AI checklist"
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
    },
    auth: {
      login: {
        secureAccess: "Secure workspace access",
        titlePrefix: "Sign in to",
        description:
          "Access your product drafts, connected Shopify store, generated media, job history, and credit balance from one account.",
        steps: [
          {
            title: "Create product drafts",
            detail: "Upload one product photo, then build a complete listing workflow from it."
          },
          {
            title: "Connect your Shopify store",
            detail:
              "OAuth keeps the connection saved to your account without exposing store tokens in the browser."
          },
          {
            title: "Publish as draft",
            detail:
              "Review media, copy, price, inventory, and checklist status before sending to Shopify."
          }
        ],
        safety: {
          title: "Account safety",
          body:
            "Google and password sign-in reduce email delivery pressure. Magic links stay available as a backup for account recovery.",
          support: "Support",
          privacy: "Privacy policy"
        },
        form: {
          title: "Sign in",
          description: "Continue with Google, email and password, or a backup magic link.",
          google: "Continue with Google",
          openingGoogle: "Opening Google...",
          emailAccount: "Email account",
          signIn: "Sign in",
          createAccount: "Create account",
          emailAddress: "Email address",
          password: "Password",
          emailPlaceholder: "you@example.com",
          passwordPlaceholder: "At least 8 characters",
          creatingAccount: "Creating account...",
          signingIn: "Signing in...",
          signInWithPassword: "Sign in with password",
          backupMagicLink: "Backup magic link",
          backupMagicLinkHelp: "Use this if you forgot your password or cannot use Google.",
          sendingLink: "Sending link...",
          sendMagicLink: "Send magic link",
          accountCreated:
            "Account created. Confirm your email if Supabase asks for verification, then sign in.",
          signedIn: "Signed in. Redirecting...",
          signInLinkSent: "Sign-in link sent. Open the email on this device to continue."
        }
      }
    },
    landing: {
      hero: {
        badge: "Shopify AI product and growth workspace",
        productName: "AceStudio",
        headline: "Create Shopify product pages that are ready to publish and easier to find.",
        body:
          "Turn one product photo into draft-ready media, SEO copy, pricing fields, and inventory details, then use Growth Studio to improve the live pages that can actually rank.",
        primaryCta: "Start with Product Studio",
        secondaryCta: "Explore Growth Studio"
      },
      proof: [
        {
          value: "2",
          label: "Core workflows",
          detail: "Product Studio and Growth Studio."
        },
        {
          value: "4+",
          label: "Media outputs",
          detail: "Lifestyle, detail, intro, and white background."
        },
        {
          value: "OAuth",
          label: "Store connection",
          detail: "Users connect their own Shopify store."
        },
        {
          value: "Draft",
          label: "Default publish mode",
          detail: "Review before anything goes live."
        }
      ],
      workspaces: {
        eyebrow: "Platform",
        title: "Two focused studios, one review-first Shopify loop.",
        product: {
          title: "Product Studio",
          detail:
            "Upload a product image, generate media and listing copy, review price and inventory, then publish a Shopify draft.",
          action: "View product workflow",
          items: ["Image generation", "SEO copy editor", "Media ordering", "Draft publishing"]
        },
        growth: {
          title: "Growth Studio",
          detail:
            "Audit connected Shopify products, score SEO/GEO quality, preview fixes, and write improvements only after confirmation.",
          action: "View growth workflow",
          items: ["SEO scoring", "GEO scoring", "Suggested fixes", "Confirm-to-apply"]
        }
      },
      growth: {
        eyebrow: "SEO and GEO",
        title: "Score the signals that decide whether product pages can be found, understood, and trusted.",
        intro:
          "Growth Studio audits the parts that similar Shopify SEO tools focus on, then adds AI-answer readiness and a review-before-write workflow.",
        signals: [
          {
            title: "Search basics",
            detail:
              "Meta title, meta description, tags, and buyer-intent wording for product search snippets."
          },
          {
            title: "Answer-ready content",
            detail:
              "Product facts, use cases, comparisons, and FAQ blocks that AI search can summarize clearly."
          },
          {
            title: "Media and trust context",
            detail:
              "Image context, product details, shipping or support signals, and reviewable claims before publishing."
          },
          {
            title: "Confirm-to-write",
            detail: "Suggestions stay in preview until the merchant approves selected Shopify updates."
          }
        ],
        scorePanel: {
          eyebrow: "Connected store audit",
          title: "Lowest scoring products first",
          scoreLabel: "score",
          rows: [
            {
              title: "Black Training Shoe",
              score: "62",
              issue: "Missing buyer Q&A and image context"
            },
            {
              title: "Daily Crossbody Bag",
              score: "74",
              issue: "Meta description needs search intent"
            },
            {
              title: "Minimal Desk Lamp",
              score: "81",
              issue: "Comparison context can be stronger"
            }
          ]
        }
      },
      trust: {
        eyebrow: "Trust model",
        title: "Safe changes, owned by the merchant.",
        lines: [
          {
            title: "Draft-first",
            detail: "Product publishing creates Shopify drafts first."
          },
          {
            title: "Per-store OAuth",
            detail: "Each user connects their own Shopify store."
          },
          {
            title: "Review before write",
            detail: "SEO/GEO fixes require explicit confirmation."
          }
        ]
      },
      control: {
        eyebrow: "Product control surface",
        title: "One clean review surface before Shopify receives changes.",
        intro:
          "Generated media, SEO copy, commerce fields, publish history, and quality checks stay together so users can inspect the full product before committing.",
        sidebarItems: ["Product Studio", "Growth Studio", "Account"],
        recordLabel: "Product record",
        recordTitle: "Generated listing review",
        ready: "Ready",
        fields: [
          {
            label: "SEO title",
            value: "Minimal Black Running Shoe for Daily Training"
          },
          {
            label: "Commerce",
            value: "$79.00 · SKU ready · 42 in stock"
          },
          {
            label: "Tags",
            value: "running shoe, black trainer, daily wear"
          },
          {
            label: "Publish mode",
            value: "Shopify draft first"
          }
        ],
        auditTitle: "Growth audit",
        scores: {
          seo: "SEO score",
          geo: "GEO score",
          readiness: "Readiness"
        }
      },
      terminal: {
        workspace: "AceStudio live workspace",
        title: "Draft product operating system",
        connected: "Connected",
        mediaLabels: ["Lifestyle", "Detail", "Intro", "White BG"],
        draftLabel: "Shopify draft",
        draftTitle: "Premium product listing",
        draftBody:
          "Media, SEO copy, price, inventory, and publish status are ready for review.",
        metrics: {
          media: "Media",
          images: "4 images",
          seo: "SEO",
          geo: "GEO",
          status: "Status",
          draft: "Draft"
        },
        checks: ["Lifestyle first", "Copy checked", "Price set", "Inventory set"]
      },
      workflow: {
        eyebrow: "Workflow",
        title: "A safer loop from raw photo to optimized Shopify page.",
        steps: [
          {
            number: "01",
            title: "Upload",
            detail: "Start with one original product photo and a short product brief."
          },
          {
            number: "02",
            title: "Generate",
            detail: "Create ordered product media and Shopify SEO copy in one workspace."
          },
          {
            number: "03",
            title: "Review",
            detail: "Edit copy, tags, FAQ, price, inventory, and media ordering."
          },
          {
            number: "04",
            title: "Publish",
            detail: "Create a Shopify draft or confirm selected Growth Studio updates."
          }
        ]
      },
      resources: {
        eyebrow: "Resources",
        title: "Guides that support search trust.",
        readGuide: "Read guide",
        cards: [
          {
            href: "/resources/how-to-write-shopify-product-descriptions-with-ai",
            category: "SEO copy",
            title: "How to write Shopify product descriptions with AI",
            excerpt:
              "A controlled workflow for product descriptions that improve buyer clarity before publishing."
          },
          {
            href: "/resources/ai-product-photography-for-shopify",
            category: "Image SEO",
            title: "AI product photography for Shopify: a draft-first workflow",
            excerpt:
              "How to organize generated product images so merchants can review the full media set."
          },
          {
            href: "/resources/shopify-ai-product-listing-checklist",
            category: "Checklist",
            title: "Shopify AI product listing checklist before publishing",
            excerpt:
              "Review media order, SEO copy, price, inventory, and Shopify draft status before launch."
          }
        ]
      },
      faq: {
        eyebrow: "FAQ",
        title: "What merchants usually ask first.",
        items: [
          {
            question: "Does it publish live by default?",
            answer:
              "No. The safe path creates a Shopify draft first. Growth changes also require explicit confirmation."
          },
          {
            question: "Can each user connect their own store?",
            answer: "Yes. Shopify OAuth is built around per-user store connections."
          },
          {
            question: "Is Growth Studio automatic?",
            answer:
              "No. It audits and suggests first, then writes selected SEO/GEO improvements only after confirmation."
          }
        ]
      },
      finalCta: {
        eyebrow: "Ready to try the flow?",
        title:
          "Build the first Shopify-ready product, then measure what needs to improve.",
        action: "Open AceStudio"
      }
    },
    growthPage: {
      optimizationSignals: {
        title: "Optimization signals",
        search: "Search: title, meta description, tags, and content depth.",
        geo: "GEO: buyer Q&A, use cases, facts, comparisons, and trust context.",
        media: "Media: image count, alt text readiness, and product image context."
      }
    },
    seo: {
      landing: {
        talkToSupport: "Talk to support",
        helpsWith: "What AceStudio helps with",
        resourcesEyebrow: "Shopify AI resources",
        resourcesTitle: "Recommended guides for this workflow",
        viewAllResources: "View all resources",
        readGuide: "Read guide",
        faqTitle: "Frequently asked questions",
        finalEyebrow: "Ready to build the first draft?",
        finalTitle: "Create Shopify-ready product content from one photo.",
        finalCta: "Open AceStudio",
        optimizationEyebrow: "Optimization coverage",
        optimizationTitle: "What the SEO/GEO audit should improve",
        optimizationIntro:
          "The strongest Shopify optimization tools combine search basics, media context, technical signals, and answer-ready page copy."
      },
      shopifySeoGeoOptimizer: {
        eyebrow: "Shopify SEO and GEO optimizer",
        title: "Shopify SEO and GEO optimizer for AI-ready product pages",
        description:
          "AceStudio audits Shopify product pages for search basics, AI-answer clarity, media context, and trust signals, then lets merchants approve selected improvements before writing back.",
        primaryCta: "Optimize a Shopify product",
        benefits: [
          "Score product title, SEO title, meta description, tags, and description depth.",
          "Find missing buyer Q&A, use cases, product facts, comparison context, and trust signals.",
          "Review generated fixes for SEO copy, FAQ blocks, tags, and answer-friendly product details.",
          "Write approved improvements back to Shopify only after merchant confirmation."
        ],
        optimizationAreas: [
          {
            title: "Search snippet quality",
            body: "Traditional Shopify SEO still starts with fields Google can show in search results.",
            checks: [
              "SEO title length and clarity",
              "Meta description usefulness",
              "Product tags and buyer keywords"
            ]
          },
          {
            title: "Product page depth",
            body: "Thin product pages are hard for shoppers, Google, and AI assistants to understand.",
            checks: [
              "Description depth and product facts",
              "Materials, fit, compatibility, or care details",
              "Comparison and use-case context"
            ]
          },
          {
            title: "Answer-ready content",
            body: "GEO needs direct blocks that answer common shopper questions clearly.",
            checks: [
              "Buyer Q&A and FAQ sections",
              "Audience and purchase intent",
              "Trust signals such as shipping, returns, and support"
            ]
          },
          {
            title: "Media and technical signals",
            body: "Shopify SEO tools commonly improve images, structured data, and crawlability.",
            checks: [
              "Image alt text and media labels",
              "Structured data readiness",
              "Future checks for broken links and sitemap/indexing health"
            ]
          }
        ]
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
      productStudio: "产品工作台",
      growthStudio: "增长工作台",
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
    footer: {
      product: "产品",
      growth: "增长",
      resources: "资源",
      company: "公司",
      productStudio: "产品工作台",
      draftPublisher: "草稿发布",
      seoGeoOptimizer: "SEO/GEO 优化器",
      seoCopy: "SEO 文案",
      imageSeo: "图片 SEO",
      guides: "指南",
      shopifyAiChecklist: "Shopify AI 检查清单"
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
    },
    auth: {
      login: {
        secureAccess: "安全工作区访问",
        titlePrefix: "登录",
        description: "用一个账户访问商品草稿、已连接的 Shopify 店铺、生成图片、任务历史和积分余额。",
        steps: [
          {
            title: "创建商品草稿",
            detail: "上传一张商品图，然后从它构建完整商品页流程。"
          },
          {
            title: "连接你的 Shopify 店铺",
            detail: "OAuth 会把连接保存到你的账户，不会在浏览器暴露店铺 token。"
          },
          {
            title: "发布为草稿",
            detail: "发送到 Shopify 前，先检查图片、文案、价格、库存和清单状态。"
          }
        ],
        safety: {
          title: "账户安全",
          body:
            "Google 和密码登录可以减少邮件发送压力。魔法链接仍作为账户恢复备用方式。",
          support: "支持",
          privacy: "隐私政策"
        },
        form: {
          title: "登录",
          description: "可使用 Google、邮箱密码或备用魔法链接登录。",
          google: "使用 Google 继续",
          openingGoogle: "正在打开 Google...",
          emailAccount: "邮箱账户",
          signIn: "登录",
          createAccount: "创建账户",
          emailAddress: "邮箱地址",
          password: "密码",
          emailPlaceholder: "you@example.com",
          passwordPlaceholder: "至少 8 个字符",
          creatingAccount: "正在创建账户...",
          signingIn: "正在登录...",
          signInWithPassword: "使用密码登录",
          backupMagicLink: "备用魔法链接",
          backupMagicLinkHelp: "如果忘记密码或无法使用 Google，可以用这个方式。",
          sendingLink: "正在发送链接...",
          sendMagicLink: "发送魔法链接",
          accountCreated: "账户已创建。如果 Supabase 要求邮箱验证，请先确认邮件，然后登录。",
          signedIn: "已登录，正在跳转...",
          signInLinkSent: "登录链接已发送。请在这台设备上打开邮件继续。"
        }
      }
    },
    landing: {
      hero: {
        badge: "Shopify AI 商品与增长工作台",
        productName: "AceStudio",
        headline: "创建可发布、也更容易被搜索到的 Shopify 商品页。",
        body:
          "从一张商品图生成草稿级图片、SEO 文案、价格字段和库存信息，再用增长工作台优化真正能参与排名的在线页面。",
        primaryCta: "从产品工作台开始",
        secondaryCta: "了解增长工作台"
      },
      proof: [
        {
          value: "2",
          label: "核心流程",
          detail: "产品工作台和增长工作台。"
        },
        {
          value: "4+",
          label: "图片产出",
          detail: "场景图、细节图、介绍图和白底图。"
        },
        {
          value: "OAuth",
          label: "店铺连接",
          detail: "用户连接自己的 Shopify 店铺。"
        },
        {
          value: "草稿",
          label: "默认发布模式",
          detail: "正式上线前先审核。"
        }
      ],
      workspaces: {
        eyebrow: "平台",
        title: "两个聚焦工作台，一个先审核再写入的 Shopify 闭环。",
        product: {
          title: "产品工作台",
          detail: "上传商品图片，生成图片和商品文案，检查价格与库存，然后发布 Shopify 草稿。",
          action: "查看商品流程",
          items: ["图片生成", "SEO 文案编辑器", "图片排序", "草稿发布"]
        },
        growth: {
          title: "增长工作台",
          detail: "审核已连接的 Shopify 商品，评分 SEO/GEO 质量，预览优化，并且只在确认后写入改动。",
          action: "查看增长流程",
          items: ["SEO 评分", "GEO 评分", "建议优化", "确认后应用"]
        }
      },
      growth: {
        eyebrow: "SEO 和 GEO",
        title: "评分决定商品页能否被发现、理解和信任的关键信号。",
        intro:
          "Growth Studio 会审核同类 Shopify SEO 工具关注的核心部分，并加入 AI 答案准备度和写入前审核流程。",
        signals: [
          {
            title: "搜索基础",
            detail: "用于商品搜索摘要的 Meta 标题、Meta 描述、标签和买家意图表达。"
          },
          {
            title: "答案友好内容",
            detail: "商品事实、使用场景、对比和 FAQ 区块，让 AI 搜索能够清晰总结。"
          },
          {
            title: "图片与信任语境",
            detail: "图片语义、商品详情、配送或支持信号，以及发布前可审核的商品声明。"
          },
          {
            title: "确认后写入",
            detail: "建议会保留在预览中，直到商家批准选中的 Shopify 更新。"
          }
        ],
        scorePanel: {
          eyebrow: "已连接店铺审核",
          title: "低分商品优先",
          scoreLabel: "评分",
          rows: [
            {
              title: "黑色训练鞋",
              score: "62",
              issue: "缺少买家问答和图片语义"
            },
            {
              title: "日常斜挎包",
              score: "74",
              issue: "Meta 描述需要更贴合买家搜索意图"
            },
            {
              title: "简约桌灯",
              score: "81",
              issue: "对比语境还可以更强"
            }
          ]
        }
      },
      trust: {
        eyebrow: "信任模型",
        title: "安全改动，由商家掌控。",
        lines: [
          {
            title: "草稿优先",
            detail: "商品发布会先创建 Shopify 草稿。"
          },
          {
            title: "每店铺 OAuth",
            detail: "每个用户连接自己的 Shopify 店铺。"
          },
          {
            title: "写入前审核",
            detail: "SEO/GEO 优化需要明确确认。"
          }
        ]
      },
      control: {
        eyebrow: "商品控制台",
        title: "在 Shopify 接收改动前，先进入一个清晰的审核界面。",
        intro:
          "生成图片、SEO 文案、价格库存、发布历史和质量检查会放在一起，用户提交前可以完整检查商品。",
        sidebarItems: ["产品工作台", "增长工作台", "账户"],
        recordLabel: "商品记录",
        recordTitle: "生成商品页审核",
        ready: "已就绪",
        fields: [
          {
            label: "SEO 标题",
            value: "日常训练用简约黑色跑鞋"
          },
          {
            label: "价格库存",
            value: "$79.00 · SKU 已就绪 · 库存 42"
          },
          {
            label: "标签",
            value: "跑鞋、黑色训练鞋、日常穿搭"
          },
          {
            label: "发布模式",
            value: "优先创建 Shopify 草稿"
          }
        ],
        auditTitle: "增长审核",
        scores: {
          seo: "SEO 评分",
          geo: "GEO 评分",
          readiness: "准备度"
        }
      },
      terminal: {
        workspace: "AceStudio 实时工作区",
        title: "商品草稿操作系统",
        connected: "已连接",
        mediaLabels: ["场景图", "细节图", "介绍图", "白底图"],
        draftLabel: "Shopify 草稿",
        draftTitle: "优质商品页",
        draftBody: "图片、SEO 文案、价格、库存和发布状态已准备好审核。",
        metrics: {
          media: "图片",
          images: "4 张图片",
          seo: "SEO",
          geo: "GEO",
          status: "状态",
          draft: "草稿"
        },
        checks: ["场景图优先", "文案已检查", "价格已设置", "库存已设置"]
      },
      workflow: {
        eyebrow: "流程",
        title: "从原始图片到优化商品页的安全流程。",
        steps: [
          {
            number: "01",
            title: "上传",
            detail: "从一张原始商品图和简短商品简介开始。"
          },
          {
            number: "02",
            title: "生成",
            detail: "在一个工作区生成有顺序的商品图片和 Shopify SEO 文案。"
          },
          {
            number: "03",
            title: "审核",
            detail: "编辑文案、标签、FAQ、价格、库存和图片顺序。"
          },
          {
            number: "04",
            title: "发布",
            detail: "创建 Shopify 草稿，或确认应用增长工作台的选中优化。"
          }
        ]
      },
      resources: {
        eyebrow: "资源",
        title: "支持搜索信任的指南。",
        readGuide: "阅读指南",
        cards: [
          {
            href: "/resources/how-to-write-shopify-product-descriptions-with-ai",
            category: "SEO 文案",
            title: "如何用 AI 编写 Shopify 商品描述",
            excerpt: "用可控流程生成商品描述，在发布前提升买家理解度。"
          },
          {
            href: "/resources/ai-product-photography-for-shopify",
            category: "图片 SEO",
            title: "Shopify AI 商品摄影：默认草稿优先的流程",
            excerpt: "如何整理生成商品图，让商家可以检查完整图片组。"
          },
          {
            href: "/resources/shopify-ai-product-listing-checklist",
            category: "检查清单",
            title: "发布前 Shopify AI 商品页检查清单",
            excerpt: "上线前检查图片顺序、SEO 文案、价格、库存和 Shopify 草稿状态。"
          }
        ]
      },
      faq: {
        eyebrow: "常见问题",
        title: "商家最先关心的问题。",
        items: [
          {
            question: "默认会直接上线发布吗？",
            answer: "不会。安全流程会先创建 Shopify 草稿，Growth 优化也需要明确确认。"
          },
          {
            question: "每个用户都可以连接自己的店铺吗？",
            answer: "可以。Shopify OAuth 基于每个用户自己的店铺连接。"
          },
          {
            question: "Growth Studio 会自动改店铺内容吗？",
            answer: "不会。它会先审核和建议，然后只在确认后写入选中的 SEO/GEO 优化。"
          }
        ]
      },
      finalCta: {
        eyebrow: "准备试用这个流程了吗？",
        title: "先创建第一个 Shopify 商品，再衡量哪里需要优化。",
        action: "打开 AceStudio"
      }
    },
    growthPage: {
      optimizationSignals: {
        title: "优化信号",
        search: "搜索：标题、Meta 描述、标签和内容深度。",
        geo: "GEO：买家问答、使用场景、事实、对比和信任语境。",
        media: "图片：图片数量、alt 文本准备度和商品图片语义。"
      }
    },
    seo: {
      landing: {
        talkToSupport: "联系支持",
        helpsWith: "AceStudio 可以帮你做什么",
        resourcesEyebrow: "Shopify AI 资源",
        resourcesTitle: "该流程的推荐指南",
        viewAllResources: "查看所有资源",
        readGuide: "阅读指南",
        faqTitle: "常见问题",
        finalEyebrow: "准备创建第一个草稿了吗？",
        finalTitle: "用一张图片创建 Shopify 可用的商品内容。",
        finalCta: "打开 AceStudio",
        optimizationEyebrow: "优化覆盖范围",
        optimizationTitle: "SEO/GEO 审核应优化的内容",
        optimizationIntro:
          "更成熟的 Shopify 优化工具通常会结合搜索基础、图片语义、技术信号和答案友好的页面文案。"
      },
      shopifySeoGeoOptimizer: {
        eyebrow: "Shopify SEO 和 GEO 优化器",
        title: "面向 AI 可理解商品页的 Shopify SEO 和 GEO 优化器",
        description:
          "AceStudio 会审核 Shopify 商品页的搜索基础、AI 答案清晰度、图片语义和信任信号，并让商家在写回前批准选中的优化。",
        primaryCta: "优化 Shopify 商品",
        benefits: [
          "评分商品标题、SEO 标题、Meta 描述、标签和描述深度。",
          "找出缺失的买家问答、使用场景、商品事实、对比语境和信任信号。",
          "审核生成的 SEO 文案、FAQ 区块、标签和答案友好的商品详情。",
          "仅在商家确认后，将批准的优化写回 Shopify。"
        ],
        optimizationAreas: [
          {
            title: "搜索摘要质量",
            body: "传统 Shopify SEO 仍然从 Google 可能展示在搜索结果里的字段开始。",
            checks: ["SEO 标题长度和清晰度", "Meta 描述有效性", "商品标签和买家关键词"]
          },
          {
            title: "商品页深度",
            body: "内容薄弱的商品页很难被买家、Google 和 AI 助手理解。",
            checks: ["描述深度和商品事实", "材质、适配/版型、兼容性或护理细节", "对比和使用场景语境"]
          },
          {
            title: "答案友好内容",
            body: "GEO 需要能直接回答常见买家问题的清晰内容区块。",
            checks: ["买家问答和 FAQ 区块", "受众和购买意图", "配送、退货和支持等信任信号"]
          },
          {
            title: "图片和技术信号",
            body: "Shopify SEO 工具通常会优化图片、结构化数据和可抓取性。",
            checks: ["图片 alt 文本和图片标签", "结构化数据准备度", "后续可检查坏链、sitemap 和索引健康度"]
          }
        ]
      }
    }
  }
} as const);

export type Dictionary = WidenStrings<(typeof dictionaries)["en"]>;
