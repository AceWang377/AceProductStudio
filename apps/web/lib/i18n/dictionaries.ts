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
      howItWorks: "How it works",
      pricing: "Pricing",
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
      chineseShopifyTool: "Chinese Shopify AI tool",
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
        primaryCta: "Start free",
        secondaryCta: "Get a free Shopify page audit"
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
      sitelinkPaths: {
        eyebrow: "Start here",
        title: "The main AceStudio paths, named clearly for merchants and search engines.",
        intro:
          "These public pages match the product's core workflows so Google can more easily understand which pages deserve sitelinks.",
        action: "Open page",
        items: [
          {
            href: "/shopify-ai-product-listing-generator",
            title: "Product Studio",
            detail:
              "Generate Shopify product images, SEO copy, price, inventory, and draft-ready product listings."
          },
          {
            href: "/shopify-seo-geo-optimizer",
            title: "Growth Studio",
            detail:
              "Audit live Shopify SEO/GEO quality, preview fixes, and approve selected write-back updates."
          },
          {
            href: "/how-it-works",
            title: "How it works",
            detail:
              "See the review-first workflow from Shopify connection to draft publishing and live page optimization."
          },
          {
            href: "/pricing",
            title: "Pricing",
            detail:
              "Review credit packs for image generation, SEO copy, Growth Studio audits, and Shopify updates."
          }
        ]
      },
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
      searchEntity: {
        eyebrow: "AI search clarity",
        title: "Make AceStudio easy for search engines and AI answers to understand.",
        intro:
          "The homepage now states the entity, audience, workflow, and write-back boundary in plain product language so crawlers and answer engines can summarize it consistently.",
        cards: [
          {
            title: "Clear entity",
            detail:
              "AceStudio is a Shopify product content and growth workspace, not a generic image generator or agency landing page."
          },
          {
            title: "Merchant use case",
            detail:
              "The product helps Shopify merchants create listing assets and improve live product pages that are eligible to rank."
          },
          {
            title: "Safe write-back",
            detail:
              "SEO/GEO suggestions stay editable and only write to Shopify after the merchant confirms the selected update."
          },
          {
            title: "Measurement loop",
            detail:
              "Growth Studio can connect technical checks and Search Console data so improvements are prioritized from real page signals."
          }
        ]
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
      hero: {
        eyebrow: "Growth Studio",
        liveOnly: "Live Online Store pages only",
        connectAudit: "Connect Shopify for live audit",
        title: "Score Shopify products and collections for SEO and GEO before you approve updates.",
        body:
          "Read live pages from the connected Shopify store, find weak titles, thin descriptions, missing image context, internal-link gaps, and AI-answer gaps, then write selected fixes only after user confirmation.",
        openProductWorkflow: "Open product workflow",
        connectShopify: "Connect Shopify",
        guide: "SEO/GEO guide",
        metricLabels: {
          seoScore: "SEO score",
          geoScore: "GEO score",
          schema: "Schema",
          technical: "Technical",
          auditSource: "Audit source",
          excludedNonLive: "Excluded non-live",
          liveShopifyProducts: "Live Shopify products",
          aceStudioWorkspace: "AceStudio workspace"
        }
      },
      error: {
        liveAuditTitle: "Live Shopify audit could not run",
        fallbackSuffix:
          "The page is showing AceStudio workspace products instead, so users still get a useful preview."
      },
      commandCenter: {
        eyebrow: "Structured growth command center",
        title: "One operating system for Shopify SEO and GEO",
        body:
          "Mature SEO products do not stop at a score. AceStudio separates the work into audit, prioritization, approved write-back, and measurement so merchants always know what to do next.",
        liveOnlyNote:
          "Only Shopify products with ACTIVE status, a published date, and a public Online Store URL are included. Draft, archived, hidden, and unlisted products are excluded because they cannot rank in search.",
        highPriority: "High priority",
        writeBackReady: "Write-back ready"
      },
      workflow: {
        stages: [
          {
            title: "Audit",
            detail:
              "Read only live Online Store products and collections, then score content, media, schema, technical, and AI-answer readiness.",
            metricLabel: "Live products"
          },
          {
            title: "Prioritize",
            detail:
              "Turn weak scores into a ranked queue with severity, effort, expected impact, and update scope.",
            metricLabel: "Tasks"
          },
          {
            title: "Apply",
            detail:
              "Write back SEO title, meta description, tags, and answer-ready copy only after merchant confirmation.",
            metricLabel: "Write-back"
          },
          {
            title: "Monitor",
            detail:
              "Use Search Console, crawler, sitemap, redirect, page-speed, competitor-gap, and AI visibility checks to decide the next move.",
            metricLabel: "Runs"
          }
        ]
      },
      nextBestAction: {
        title: "Next best action",
        body:
          "The page should guide the merchant to one clear move instead of making them interpret every score.",
        recommendedNow: "Recommended now",
        monitoringCosts: "Monitoring costs",
        credit: "credit",
        credits: "credits",
        confirmedWriteBackCosts: "Confirmed Shopify write-back costs",
        trialUsersStartWith: "Trial users start with"
      },
      optimizationWriter: {
        eyebrow: "Optimization writer",
        title: "Do the SEO/GEO work, not just score it",
        body:
          "The commercial version behaves like an approved optimization assistant: generate better fields, show an editable before/after diff, preview credit cost, then write selected improvements back to Shopify.",
        safetyNote:
          "Public product display titles are protected by default because they affect merchandising, brand naming, and ads. AceStudio focuses on SEO titles, meta descriptions, tags, image alt text, internal links, and answer-ready copy unless the merchant explicitly approves a public product-name rewrite.",
        readyTitle: "Ready for approved write-back",
        readyBody:
          "These live Shopify products and collections have the weakest scores and can be improved now with a reviewed Shopify update.",
        noCandidates:
          "No live Shopify products need write-back right now. Draft, archived, hidden, and unlisted products stay out of this queue.",
        fallbackIssue: "SEO/GEO improvements available",
        fields: ["SEO title", "Meta", "Tags", "Q&A", "Image alt", "Internal links"],
        collectionFields: ["Collection SEO title", "Meta", "Buying guide"],
        capabilities: [
          {
            title: "Search snippet fields",
            detail:
              "Improve SEO title and meta description without changing the merchant-facing product name by default."
          },
          {
            title: "Keyword tags",
            detail:
              "Normalize product tags around category, intent, material, use case, and buyer search language."
          },
          {
            title: "AI answer content",
            detail:
          "Append answer-ready buyer Q&A, product facts, and collection buying-guide context so the page is easier for search and AI systems to understand."
          }
        ]
      },
      skillCoverage: {
        eyebrow: "SEO/GEO skill coverage",
        title: "The core skill map this feature should own",
        body:
          "The strongest commercial version covers the same pillars merchants expect from SEO suites and newer GEO tools: content, answer readiness, images, indexability, rich snippets, internal links, and growth intelligence.",
        pillars: "pillars",
        score: "Score",
        items: [
          {
            title: "On-page SEO",
            detail:
              "SEO titles, meta descriptions, product titles, descriptions, tags, snippet previews, and CTR-ready rewrites.",
            skills: ["Title/meta scoring", "Description depth", "Keyword tags", "SERP preview"]
          },
          {
            title: "GEO answer readiness",
            detail:
              "Buyer questions, product facts, use cases, comparison context, trust copy, and AI-answer-friendly blocks.",
            skills: ["FAQ blocks", "Use cases", "Comparison copy", "Trust context"]
          },
          {
            title: "Collection SEO",
            detail:
              "Collection/category pages are scored as ranking assets with title, meta, buying-guide copy, FAQs, image context, and public URL checks.",
            skills: ["Category keywords", "Buying guides", "Collection FAQs", "Collection snippets"]
          },
          {
            title: "Image SEO",
            detail:
              "Alt text, filename quality, image count, dimensions, compression readiness, and media ordering.",
            skills: ["Alt text", "Filename guidance", "Image size", "Media order"]
          },
          {
            title: "Technical indexability",
            detail:
              "Live-product filtering, product handles, canonical domain, sitemap health, broken links, redirects, and page-speed/Core Web Vitals readiness.",
            skills: ["Live-only audit", "Sitemap", "Broken links", "Page speed"]
          },
          {
            title: "Structured data",
            detail:
              "Product schema readiness, FAQ readiness, review/rating prerequisites, offer fields, collection context, and rich-result gaps.",
            skills: ["Product schema", "FAQ readiness", "Review readiness", "Offer context"]
          },
          {
            title: "Internal linking",
            detail:
              "Suggests contextual links between products, collections, and future blog/buying-guide pages so authority flows into revenue pages.",
            skills: ["Product links", "Collection links", "Blog anchors", "Comparison paths"]
          },
          {
            title: "Growth intelligence",
            detail:
              "Search Console queries, low-CTR pages, competitor keyword gaps, AI visibility checks, and history.",
            skills: ["GSC queries", "CTR gaps", "Competitor gaps", "AI visibility"]
          }
        ]
      },
      collectionSeo: {
        eyebrow: "Collection SEO scoring",
        title: "Score category pages, not only product pages",
        body:
          "Collection pages can rank for broader category keywords and should act like buying-guide landing pages. AceStudio audits live public collections for snippets, category copy, FAQs, images, and crawlable URLs.",
        scoreLabel: "Collection score",
        empty:
          "No public Shopify collections were returned yet. Publish collections to Online Store, then run Growth Studio again to score category pages.",
        badge: "Collection",
        serpPreview: "Collection SERP preview",
        openCollection: "Open collection"
      },
      internalLinks: {
        title: "Internal linking suggestions",
        body:
          "Use these as human-reviewed recommendations first. Later, you can add a Shopify write-back confirmation to insert links into product, collection, or blog content.",
        link: "Link",
        to: "to",
        empty: "Add live collections or related live products to generate internal linking ideas.",
        openTarget: "Open target"
      },
      optimizationQueue: {
        eyebrow: "Optimization queue",
        title: "Ranked fixes merchants can actually execute",
        body:
          "Prioritized by issue severity, page score, and commercial category. This mirrors the useful part of paid SEO suites: a clear queue with impact, effort, and update scope.",
        tasks: "tasks",
        empty: "No optimization tasks yet. Connect Shopify or add product drafts to build the queue.",
        priorityScore: "Priority score",
        confirmScope: "Confirm-to-apply scope",
        manualOnly: "Manual or monitor-only",
        manualBody: "Review before changing Shopify theme, schema, or crawl settings.",
        openTarget: "Open target"
      },
      storePlaybooks: {
        title: "Store-level playbooks",
        body:
          "These are the repeatable growth motions that make the feature feel like a product, not a one-off checker.",
        benchmark: "Commercial benchmark"
      },
      commercialSeo: {
        eyebrow: "Commercial SEO engine",
        title: "Turn monitoring into prioritized optimization tasks",
        body:
          "AceStudio converts Search Console queries, crawler results, and AI visibility gaps into a ranked action plan that merchants can review before writing changes back to Shopify.",
        readiness: "Readiness",
        empty:
          "Run the live monitor to generate a prioritized action plan. Without Search Console credentials, the plan will focus on setup, technical SEO, and AI visibility readiness.",
        recommendedAction: "Recommended action",
        rewriteDraft: "Search Console rewrite draft",
        openTargetPage: "Open target page"
      },
      keywordOpportunities: {
        title: "Keyword opportunities",
        body:
          "The strongest commercial signal is not just the average score. It is which query is already getting visibility and what update can convert it into clicks.",
        impressions: "Impr.",
        rewriteDraft: "Rewrite draft",
        legacyRun:
          "This saved monitoring result was created before rewrite drafts were added. Run monitoring again to generate a Shopify write-back draft.",
        writeBackUnavailable:
          "Write-back is available when this query is matched to a live Shopify product page.",
        competitorGaps: "Competitor keyword gaps",
        setup: "setup",
        competitorSetup:
          "Add a comma-separated GROWTH_COMPETITOR_DOMAINS env var to compare your Search Console queries against chosen competitor stores. No paid API required for this MVP layer.",
        compare: "Compare:"
      },
      dataSources: {
        eyebrow: "Data source setup",
        title: "Keep the MVP useful before every optional API is connected",
        body:
          "The product audit, technical crawler, and daily cron can already run on the current stack. Google APIs unlock stronger query and visibility intelligence, but they are not required for the first customer demos.",
        ready: "Ready",
        setup: "Setup",
        items: [
          {
            label: "Shopify product audit",
            cost: "Included",
            detail:
              "Uses the connected Shopify Admin API to read products and prepare user-approved write-back.",
            readyAction: "Connected",
            setupAction: "Connect Shopify OAuth"
          },
          {
            label: "Technical crawler",
            cost: "No paid API",
            detail:
              "Runs inside your app to check sitemap.xml, robots.txt, broken internal links, and redirect chains.",
            readyAction: "Available now",
            setupAction: "Available now"
          },
          {
            label: "Vercel daily cron",
            cost: "Hobby daily",
            detail:
              "Vercel Cron Jobs are available on Hobby for once-per-day schedules, which fits the current MVP.",
            readyAction: "Protected",
            setupAction: "Add CRON_SECRET"
          },
          {
            label: "Competitor keyword gap",
            cost: "Free with manual competitor list",
            detail:
              "Uses your Search Console queries and a manually configured competitor-domain list. Paid Ahrefs/Semrush-style keyword APIs can be added later.",
            readyAction: "Competitors configured",
            setupAction: "Optional env later"
          },
          {
            label: "Page speed / Core Web Vitals",
            cost: "Free basic crawler",
            detail:
              "The current crawler measures response time. PageSpeed Insights can be connected later for full Core Web Vitals field/lab data.",
            readyAction: "Crawler data ready",
            setupAction: "Run monitor"
          },
          {
            label: "Review schema data",
            cost: "Likely paid app/API later",
            detail:
              "Judge.me, Loox, or another review source is needed for real rating/review data. MVP only checks readiness and never fabricates reviews.",
            readyAction: "Review source connected",
            setupAction: "Defer until review app"
          },
          {
            label: "Google Search Console",
            cost: "Free quota",
            detail:
              "Reads clicks, impressions, CTR, position, queries, and sitemaps from verified properties.",
            readyAction: "Connected",
            setupAction: "Optional but high value"
          },
          {
            label: "AI visibility proxy",
            cost: "100/day free",
            detail:
              "Uses Google Custom Search JSON API as a lightweight proxy for brand and product visibility checks.",
            readyAction: "Connected",
            setupAction: "Optional"
          }
        ]
      },
      noApiQueue: {
        title: "No-API optimization queue",
        body:
          "These fixes are generated from product content and Shopify data, so merchants can improve pages even before Search Console is connected.",
        empty: "No urgent no-API fixes are available right now. Create or connect products to populate this queue."
      },
      liveMonitor: {
        eyebrow: "Live monitor",
        title: "Search Console, crawler, and AI visibility tracking",
        body:
          "Run a real check for clicks, impressions, query data, sitemap health, product-page response speed, broken internal links, redirect chains, competitor gaps, and visibility across Google search results as an AI visibility proxy.",
        empty:
          "No live monitor run yet. Run it once after adding the Growth monitoring Supabase migration and the optional Google credentials.",
        unlocksTitle: "What this unlocks",
        unlocks: [
          "Search Console: find high-impression queries with weak CTR and rewrite titles around them.",
          "Technical crawler: catch 404s, redirect chains, sitemap gaps, and canonical host issues.",
          "Page speed: flag slow Shopify pages now, then connect PageSpeed Insights later only if you need full Core Web Vitals field data.",
          "Competitor gaps: use your own competitor list plus Search Console queries before paying for keyword databases.",
          "AI visibility: track whether brand and product queries surface your pages in answer-engine-style search results."
        ]
      },
      productScores: {
        eyebrow: "Product scores",
        title: "Lowest scoring products first",
        openProducts: "Open products",
        empty:
          "No live Online Store products are available for audit yet. Growth Studio ignores draft, archived, hidden, and unlisted Shopify products because those pages cannot rank until they are actively published to Online Store.",
        sourceShopify: "Shopify",
        sourceWorkspace: "Workspace",
        fallbackStrong: "This product has enough SEO/GEO context for the first MVP audit.",
        writeBackDraft: "Write-back draft",
        serpPreview: "SERP preview",
        aiAnswerReadiness: "AI answer readiness",
        schemaWriter: "Schema writer",
        missing: "Missing:",
        openInShopify: "Open in Shopify",
        openDraft: "Open draft"
      },
      recommendations: {
        title: "Top recommendations",
        strongEnough: "Products look strong enough for the first MVP audit. Keep monitoring after new products are added."
      },
      common: {
        statusReady: "ready",
        statusPartial: "partial",
        statusSetup: "setup",
        statusNeedsSetup: "needs setup",
        high: "high",
        medium: "medium",
        low: "low",
        effort: "effort",
        change: "Change",
        same: "Same",
        before: "Before",
        after: "After",
        applying: "Applying",
        cancel: "Cancel",
        apply: "Apply"
      },
      monitorButton: {
        run: "Run live monitor",
        runningMessage: "Running live technical SEO, Search Console, and AI visibility checks...",
        failed: "Growth monitoring failed.",
        completed: "Growth monitor completed.",
        adminNotCharged: "Admin account was not charged.",
        spent: "Spent",
        balance: "Balance"
      },
      writeBackPreview: {
        previewTitle: "Shopify write-back preview",
        selectedProduct: "Selected product",
        selectedCollection: "Selected collection",
        alreadyApplied: "The suggested SEO/GEO fixes are already applied to Shopify.",
        safety:
          "Nothing is changed until you approve. Edit the After fields if needed, then write selected SEO title, meta description, product tags, and answer-ready content back to Shopify.",
        fieldsSelected: "fields selected for write-back.",
        of: "of",
        applying: "Applying",
        apply: "Apply",
        cancel: "Cancel",
        buildingPreview: "Building preview",
        applied: "Applied",
        previewShopifyWriteBack: "Preview Shopify write-back",
        previewCollectionWriteBack: "Preview collection write-back",
        reviewHelp: "Review exact field changes before updating Shopify.",
        tryAgain: "Try preview again",
        viewLiveProduct: "View live product",
        viewLiveCollection: "View live collection",
        before: "Before",
        after: "After",
        errorPreview: "Could not preview the Shopify write-back.",
        errorApply: "Could not apply the selected SEO/GEO fixes.",
        updated: "Updated",
        fixesWritten: "SEO/GEO fixes were written to Shopify.",
        adminNotCharged: "Admin account was not charged.",
        spent: "Spent",
        balance: "Balance",
        selectedFields: {
          seoTitle: "SEO title",
          seoDescription: "Meta description",
          tags: "Product tags / keywords",
          descriptionHtml: "Answer-ready content"
        },
        rewrite: {
          diffTitle: "Before / after diff",
          willUpdate: "will be updated.",
          noChanges: "No changes detected for this rewrite.",
          editHelp: "You can edit the After fields before confirming.",
          unlimited: "Unlimited",
          credits: "credits",
          confirm: "Confirm write-back",
          previewing: "Previewing...",
          appliedToShopify: "Applied to Shopify",
          preview: "Preview write-back",
          errorPreview: "Could not preview the Shopify write-back.",
          errorApply: "Could not write the Search Console rewrite to Shopify.",
          written: "Rewrite written to Shopify."
        },
        imageAlt: {
          title: "Image alt text write-back",
          preview: "Preview image alt write-back",
          previewing: "Previewing alt text...",
          confirm: "Confirm alt text write-back",
          noChanges: "Image alt text is already strong enough.",
          errorPreview: "Could not preview image alt text updates.",
          errorApply: "Could not write image alt text to Shopify.",
          applied: "Image alt text written to Shopify.",
          help: "Adds descriptive alt text to weak Shopify product images for image search and accessibility."
        },
        internalLink: {
          title: "Internal link write-back",
          preview: "Preview internal link",
          previewing: "Previewing link...",
          confirm: "Confirm internal link write-back",
          noChanges: "This internal link already exists.",
          errorPreview: "Could not preview the internal link update.",
          errorApply: "Could not write the internal link to Shopify.",
          applied: "Internal link written to Shopify.",
          help: "Adds one contextual link to the source product or collection description.",
          manualOnly: "Blog-to-product links are manual suggestions until blog write-back is connected.",
          anchorLabel: "Anchor text"
        }
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
          "The strongest Shopify optimization tools combine search basics, media context, technical signals, and answer-ready page copy.",
        sampleDiff: "Sample reviewed result",
        before: "Before",
        after: "After draft",
        openRichResultsTest: "Open Google Rich Results Test"
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
        proof: {
          eyebrow: "Proof-driven workflow",
          title: "See the audit, preview the fix, then approve the Shopify write-back.",
          body:
            "The page is built around the same review flow merchants use in Growth Studio: live product audit, editable before/after drafts, image SEO checks, internal link suggestions, and rich-result readiness.",
          metrics: [
            { label: "SEO/GEO fields checked", value: "20+" },
            { label: "Write-back modes", value: "4" },
            { label: "Default publish mode", value: "Draft" }
          ],
          media: [
            {
              src: "/marketing/growth-lifestyle-media.png",
              alt: "Generated lifestyle product image used in an AceStudio Shopify optimization workflow",
              label: "Lifestyle media"
            },
            {
              src: "/marketing/growth-detail-media.png",
              alt: "Generated product detail image for Shopify image SEO review",
              label: "Detail media"
            },
            {
              src: "/marketing/growth-clean-product-media.png",
              alt: "Generated white background product image for Shopify product media order",
              label: "Clean product media"
            }
          ],
          resultCards: [
            {
              title: "Before",
              detail: "Thin title, missing meta description, weak image alt text, no buyer FAQ, and no internal product context."
            },
            {
              title: "After draft",
              detail: "Editable SEO title, meta description, buyer questions, alt text, and internal links ready for merchant approval."
            }
          ]
        },
        richResults: {
          eyebrow: "Structured data validation",
          title: "Rich-result checks stay grounded in real Shopify data.",
          body:
            "AceStudio separates readiness from automation: it checks Product, Offer, Breadcrumb, FAQ, and Review prerequisites, then asks the merchant to validate live pages after deployment.",
          checks: [
            "Product schema has name, description, images, URL, brand/category context.",
            "Offer readiness uses real Shopify price, currency, availability, and product URL.",
            "FAQ and Review readiness are marked partial until visible FAQs and real customer review data exist.",
            "Google Rich Results Test should be run after deployment on the canonical page URL."
          ]
        },
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
      howItWorks: "如何运作",
      pricing: "价格",
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
      chineseShopifyTool: "中文 Shopify AI 工具",
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
        primaryCta: "免费开始",
        secondaryCta: "免费检查一个 Shopify 商品页"
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
      sitelinkPaths: {
        eyebrow: "从这里开始",
        title: "AceStudio 的核心路径，对商家和搜索引擎都更清晰。",
        intro:
          "这些公开页面对应产品的主要工作流，让 Google 更容易判断哪些页面适合作为站点链接展示。",
        action: "打开页面",
        items: [
          {
            href: "/shopify-ai-product-listing-generator",
            title: "产品工作台",
            detail: "生成 Shopify 商品图片、SEO 文案、价格、库存和可发布草稿。"
          },
          {
            href: "/shopify-seo-geo-optimizer",
            title: "增长工作台",
            detail: "审核在线 Shopify 页面的 SEO/GEO 质量，预览优化，并确认后写回。"
          },
          {
            href: "/how-it-works",
            title: "如何运作",
            detail: "了解从连接 Shopify 到草稿发布、在线页面优化的先审核流程。"
          },
          {
            href: "/pricing",
            title: "价格",
            detail: "查看图片生成、SEO 文案、增长审核和 Shopify 更新所需的积分包。"
          }
        ]
      },
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
      searchEntity: {
        eyebrow: "AI 搜索清晰度",
        title: "让搜索引擎和 AI 答案更容易理解 AceStudio。",
        intro:
          "首页会用清晰的产品语言说明实体、受众、流程和写回边界，让爬虫和答案引擎可以稳定总结这个产品。",
        cards: [
          {
            title: "清晰实体",
            detail: "AceStudio 是 Shopify 商品内容与增长工作台，不是普通图片生成器或代理服务页面。"
          },
          {
            title: "商家场景",
            detail: "产品帮助 Shopify 商家创建商品素材，并优化真正可以参与排名的在线商品页。"
          },
          {
            title: "安全写回",
            detail: "SEO/GEO 建议保持可编辑，只有商家确认选中的更新后才会写入 Shopify。"
          },
          {
            title: "监控闭环",
            detail: "Growth Studio 可以连接技术检查和 Search Console 数据，用真实页面信号排序优化优先级。"
          }
        ]
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
      hero: {
        eyebrow: "增长工作台",
        liveOnly: "仅审核在线店铺的公开页面",
        connectAudit: "连接 Shopify 后进行实时审核",
        title: "在确认写入前，为 Shopify 商品和分类页评分 SEO 与 GEO。",
        body:
          "读取已连接 Shopify 店铺的公开页面，找出标题薄弱、描述过短、图片语义缺失、内链缺口和 AI 答案缺口，并且只在用户确认后写入选中的优化。",
        openProductWorkflow: "打开商品流程",
        connectShopify: "连接 Shopify",
        guide: "SEO/GEO 指南",
        metricLabels: {
          seoScore: "SEO 评分",
          geoScore: "GEO 评分",
          schema: "结构化数据",
          technical: "技术项",
          auditSource: "审核来源",
          excludedNonLive: "已排除非公开商品",
          liveShopifyProducts: "Shopify 公开商品",
          aceStudioWorkspace: "AceStudio 工作区"
        }
      },
      error: {
        liveAuditTitle: "实时 Shopify 审核未能运行",
        fallbackSuffix: "页面正在显示 AceStudio 工作区商品，因此用户仍然可以看到有效预览。"
      },
      commandCenter: {
        eyebrow: "结构化增长指挥台",
        title: "一个用于 Shopify SEO 与 GEO 的操作系统",
        body:
          "成熟的 SEO 产品不能只停留在评分。AceStudio 将工作拆分为审核、优先级排序、确认后写入和结果监控，让商家始终知道下一步该做什么。",
        liveOnlyNote:
          "这里只包含 ACTIVE 状态、有发布时间、并且拥有公开 Online Store URL 的 Shopify 商品。草稿、归档、隐藏和未上架商品会被排除，因为它们无法参与搜索排名。",
        highPriority: "高优先级",
        writeBackReady: "可写回"
      },
      workflow: {
        stages: [
          {
            title: "审核",
            detail: "只读取在线店铺的公开商品和分类页，然后评分内容、图片、结构化数据、技术项和 AI 答案准备度。",
            metricLabel: "公开商品"
          },
          {
            title: "排序",
            detail: "把低分项转成带有严重程度、执行成本、预期影响和更新范围的优先级队列。",
            metricLabel: "任务"
          },
          {
            title: "应用",
            detail: "仅在商家确认后写回 SEO 标题、Meta 描述、标签和答案友好内容。",
            metricLabel: "写回"
          },
          {
            title: "监控",
            detail: "通过 Search Console、爬虫、sitemap、重定向、速度、竞品差距和 AI 可见性决定下一步动作。",
            metricLabel: "运行记录"
          }
        ]
      },
      nextBestAction: {
        title: "下一步最佳动作",
        body: "页面应该把商家引导到一个明确动作，而不是让他们自己解读所有评分。",
        recommendedNow: "当前建议",
        monitoringCosts: "监控消耗",
        credit: "积分",
        credits: "积分",
        confirmedWriteBackCosts: "确认写回 Shopify 消耗",
        trialUsersStartWith: "试用用户初始拥有"
      },
      optimizationWriter: {
        eyebrow: "优化写入助手",
        title: "真正执行 SEO/GEO 优化，而不只是给出评分",
        body:
          "商业化版本需要像一个可审核的优化助手：生成更好的字段，展示可编辑 before/after 差异，预览积分成本，然后把选中的改动写回 Shopify。",
        safetyNote:
          "目前不会自动覆盖商品展示标题。这个字段会影响商品陈列、品牌命名和广告。后续可以作为单独勾选项加入，只有商家明确希望 AceStudio 改写公开商品名称时才启用。",
        readyTitle: "可确认写回的商品和分类页",
        readyBody: "这些公开 Shopify 商品和分类页评分较弱，可以通过审核后的 Shopify 更新立即优化。",
        noCandidates: "目前没有需要写回优化的公开 Shopify 商品或分类页。草稿、归档、隐藏和未上架内容不会进入此队列。",
        fallbackIssue: "可进行 SEO/GEO 优化",
        fields: ["SEO 标题", "Meta", "标签", "问答", "图片 Alt", "内链"],
        collectionFields: ["分类 SEO 标题", "Meta", "购买指南"],
        capabilities: [
          {
            title: "搜索摘要字段",
            detail: "默认不修改买家可见商品名，只优化 SEO 标题和 Meta 描述。"
          },
          {
            title: "关键词标签",
            detail: "围绕分类、意图、材质、使用场景和买家搜索语言规范商品标签。"
          },
          {
            title: "AI 答案内容",
            detail: "追加适合 AI 理解的买家问答、商品事实和分类页购买指南，让页面更容易被搜索和 AI 系统理解。"
          }
        ]
      },
      skillCoverage: {
        eyebrow: "SEO/GEO 技能覆盖",
        title: "这个功能应该覆盖的核心能力地图",
        body:
          "最强的商业化版本应覆盖商家期待的 SEO 套件和新 GEO 工具能力：内容、答案准备度、图片、可索引性、富摘要、内链和增长情报。",
        pillars: "项能力",
        score: "评分",
        items: [
          {
            title: "页面 SEO",
            detail: "SEO 标题、Meta 描述、商品标题、描述、标签、SERP 预览和提升 CTR 的改写草稿。",
            skills: ["标题/Meta 评分", "描述深度", "关键词标签", "SERP 预览"]
          },
          {
            title: "GEO 答案准备度",
            detail: "买家问题、商品事实、使用场景、对比语境、信任文案和 AI 答案友好区块。",
            skills: ["FAQ 区块", "使用场景", "对比文案", "信任语境"]
          },
          {
            title: "分类页 SEO",
            detail: "把分类页作为排名资产评分，包括标题、Meta、购买指南、FAQ、图片语义和公开 URL。",
            skills: ["分类关键词", "购买指南", "分类 FAQ", "分类摘要"]
          },
          {
            title: "图片 SEO",
            detail: "Alt 文本、文件名质量、图片数量、尺寸、压缩准备度和图片排序。",
            skills: ["Alt 文本", "文件名建议", "图片尺寸", "图片顺序"]
          },
          {
            title: "技术可索引性",
            detail: "公开商品过滤、商品 handle、主域名、sitemap 健康、坏链、重定向和页面速度/Core Web Vitals 准备度。",
            skills: ["仅审核公开商品", "Sitemap", "坏链", "页面速度"]
          },
          {
            title: "结构化数据",
            detail: "Product schema 准备度、FAQ 准备度、评价/评分前置条件、Offer 字段、分类语境和富结果缺口。",
            skills: ["Product schema", "FAQ 准备度", "评价准备度", "Offer 语境"]
          },
          {
            title: "内部链接",
            detail: "建议商品、分类和未来博客/购买指南之间的上下文链接，让权重流向收入页面。",
            skills: ["商品链接", "分类链接", "博客锚文本", "对比路径"]
          },
          {
            title: "增长情报",
            detail: "Search Console 查询、低 CTR 页面、竞品关键词差距、AI 可见性检查和历史记录。",
            skills: ["GSC 查询", "CTR 差距", "竞品差距", "AI 可见性"]
          }
        ]
      },
      collectionSeo: {
        eyebrow: "分类页 SEO 评分",
        title: "不仅评分商品页，也评分分类页",
        body:
          "分类页可以覆盖更广的类目关键词，也应该像购买指南 landing page 一样工作。AceStudio 会审核公开分类页的摘要、分类文案、FAQ、图片和可抓取 URL。",
        scoreLabel: "分类评分",
        empty: "暂时没有返回公开 Shopify 分类页。请将分类发布到 Online Store，然后再次运行 Growth Studio。",
        badge: "分类",
        serpPreview: "分类 SERP 预览",
        openCollection: "打开分类"
      },
      internalLinks: {
        title: "内部链接建议",
        body: "这些建议先作为人工审核项。后续可以加入 Shopify 写回确认，把链接插入商品、分类或博客内容。",
        link: "将",
        to: "链接到",
        empty: "添加公开分类或相关公开商品后，即可生成内部链接建议。",
        openTarget: "打开目标"
      },
      optimizationQueue: {
        eyebrow: "优化队列",
        title: "商家可以真正执行的排序修复项",
        body:
          "按问题严重程度、页面评分和商业分类排序。这是付费 SEO 工具最有用的部分：清晰的队列、影响、执行成本和更新范围。",
        tasks: "个任务",
        empty: "暂无优化任务。连接 Shopify 或添加商品草稿后即可建立队列。",
        priorityScore: "优先级分数",
        confirmScope: "确认应用范围",
        manualOnly: "手动或仅监控",
        manualBody: "修改 Shopify 主题、结构化数据或抓取设置前请先审核。",
        openTarget: "打开目标"
      },
      storePlaybooks: {
        title: "店铺级增长策略",
        body: "这些是可重复执行的增长动作，让这个功能像产品，而不是一次性检测器。",
        benchmark: "商业化基准"
      },
      commercialSeo: {
        eyebrow: "商业化 SEO 引擎",
        title: "把监控转成优先级优化任务",
        body:
          "AceStudio 会把 Search Console 查询、爬虫结果和 AI 可见性缺口转成排序行动计划，商家审核后再写回 Shopify。",
        readiness: "准备度",
        empty: "运行实时监控后即可生成优先级行动计划。没有 Search Console 凭证时，计划会聚焦设置、技术 SEO 和 AI 可见性准备度。",
        recommendedAction: "建议动作",
        rewriteDraft: "Search Console 改写草稿",
        openTargetPage: "打开目标页面"
      },
      keywordOpportunities: {
        title: "关键词机会",
        body: "最强的商业信号不只是平均分，而是哪个查询已经有曝光，以及什么更新能把曝光转成点击。",
        impressions: "曝光",
        rewriteDraft: "改写草稿",
        legacyRun: "这条监控结果创建于改写草稿功能之前。请重新运行监控以生成 Shopify 写回草稿。",
        writeBackUnavailable: "当该查询匹配到公开 Shopify 商品页时，才可以写回。",
        competitorGaps: "竞品关键词差距",
        setup: "待设置",
        competitorSetup:
          "添加逗号分隔的 GROWTH_COMPETITOR_DOMAINS 环境变量，即可用 Search Console 查询与指定竞品店铺对比。MVP 阶段不需要付费 API。",
        compare: "对比："
      },
      dataSources: {
        eyebrow: "数据源设置",
        title: "即使可选 API 尚未连接，也让 MVP 保持可用",
        body:
          "商品审核、技术爬虫和每日 cron 已经可以在当前架构运行。Google API 会增强查询和可见性情报，但第一批客户演示并不依赖它们。",
        ready: "已就绪",
        setup: "待设置",
        items: [
          {
            label: "Shopify 商品审核",
            cost: "已包含",
            detail: "使用已连接的 Shopify Admin API 读取商品，并准备用户确认后的写回。",
            readyAction: "已连接",
            setupAction: "连接 Shopify OAuth"
          },
          {
            label: "技术爬虫",
            cost: "无需付费 API",
            detail: "在你的应用内检查 sitemap.xml、robots.txt、内部坏链和重定向链。",
            readyAction: "当前可用",
            setupAction: "当前可用"
          },
          {
            label: "Vercel 每日 Cron",
            cost: "Hobby 每日",
            detail: "Vercel Cron Jobs 在 Hobby 计划可用于每日一次任务，适合当前 MVP。",
            readyAction: "已保护",
            setupAction: "添加 CRON_SECRET"
          },
          {
            label: "竞品关键词差距",
            cost: "手动竞品列表免费",
            detail: "使用你的 Search Console 查询和手动配置的竞品域名列表。Ahrefs/Semrush 类付费关键词 API 可后续接入。",
            readyAction: "竞品已配置",
            setupAction: "后续可选环境变量"
          },
          {
            label: "页面速度 / Core Web Vitals",
            cost: "基础爬虫免费",
            detail: "当前爬虫会测响应时间。后续需要完整 Core Web Vitals 实验/字段数据时再接 PageSpeed Insights。",
            readyAction: "爬虫数据可用",
            setupAction: "运行监控"
          },
          {
            label: "评价 schema 数据",
            cost: "后续可能需要付费应用/API",
            detail: "真实评分/评价需要 Judge.me、Loox 或其他评价来源。MVP 只检查准备度，不会伪造评价。",
            readyAction: "评价来源已连接",
            setupAction: "等接入评价应用"
          },
          {
            label: "Google Search Console",
            cost: "免费额度",
            detail: "读取已验证站点的点击、曝光、CTR、排名、查询和 sitemap。",
            readyAction: "已连接",
            setupAction: "可选但价值很高"
          },
          {
            label: "AI 可见性代理",
            cost: "每日 100 次免费",
            detail: "使用 Google Custom Search JSON API 作为轻量代理，检查品牌和商品可见性。",
            readyAction: "已连接",
            setupAction: "可选"
          }
        ]
      },
      noApiQueue: {
        title: "无需 API 的优化队列",
        body: "这些修复来自商品内容和 Shopify 数据，因此商家即使尚未连接 Search Console，也可以先优化页面。",
        empty: "当前没有紧急的无 API 修复项。创建或连接商品后即可填充队列。"
      },
      liveMonitor: {
        eyebrow: "实时监控",
        title: "Search Console、爬虫和 AI 可见性追踪",
        body:
          "运行真实检查：点击、曝光、查询数据、sitemap 健康、商品页响应速度、内部坏链、重定向链、竞品差距，以及 Google 搜索结果中的 AI 可见性代理。",
        empty: "尚未运行实时监控。添加 Growth monitoring Supabase migration 和可选 Google 凭证后运行一次。",
        unlocksTitle: "这会解锁什么",
        unlocks: [
          "Search Console：找出高曝光低 CTR 查询，并围绕它们改写标题。",
          "技术爬虫：发现 404、重定向链、sitemap 缺口和主域名 canonical 问题。",
          "页面速度：先标记较慢的 Shopify 页面；只有需要完整 Core Web Vitals 字段数据时再接 PageSpeed Insights。",
          "竞品差距：在购买关键词数据库前，先用自己的竞品列表和 Search Console 查询。",
          "AI 可见性：追踪品牌和商品查询是否在答案型搜索结果中出现你的页面。"
        ]
      },
      productScores: {
        eyebrow: "商品评分",
        title: "低分公开商品优先",
        openProducts: "打开商品",
        empty: "暂时没有可审核的公开 Online Store 商品。Growth Studio 会忽略草稿、归档、隐藏和未上架商品，因为它们正式发布前无法参与排名。",
        sourceShopify: "Shopify",
        sourceWorkspace: "工作区",
        fallbackStrong: "这个商品已经具备当前 MVP 审核所需的 SEO/GEO 语境。",
        writeBackDraft: "写回草稿",
        serpPreview: "SERP 预览",
        aiAnswerReadiness: "AI 答案准备度",
        schemaWriter: "Schema 写入建议",
        missing: "缺失：",
        openInShopify: "在 Shopify 中打开",
        openDraft: "打开草稿"
      },
      recommendations: {
        title: "优先建议",
        strongEnough: "商品对于第一次 MVP 审核已经足够强。添加新商品后继续监控即可。"
      },
      common: {
        statusReady: "已就绪",
        statusPartial: "部分就绪",
        statusSetup: "待设置",
        statusNeedsSetup: "需要设置",
        high: "高",
        medium: "中",
        low: "低",
        effort: "执行成本",
        change: "变化",
        same: "相同",
        before: "优化前",
        after: "优化后",
        applying: "正在应用",
        cancel: "取消",
        apply: "应用"
      },
      monitorButton: {
        run: "运行实时监控",
        runningMessage: "正在运行技术 SEO、Search Console 和 AI 可见性检查...",
        failed: "增长监控失败。",
        completed: "增长监控已完成。",
        adminNotCharged: "管理员账户未扣费。",
        spent: "已消耗",
        balance: "余额"
      },
      writeBackPreview: {
        previewTitle: "Shopify 写回预览",
        selectedProduct: "选中商品",
        selectedCollection: "选中集合页",
        alreadyApplied: "建议的 SEO/GEO 优化已经应用到 Shopify。",
        safety:
          "确认前不会改动任何内容。需要时可以先编辑 After 字段，然后把选中的 SEO 标题、Meta 描述、商品标签和答案友好内容写回 Shopify。",
        fieldsSelected: "个字段已选择写回。",
        of: "/",
        applying: "正在应用",
        apply: "应用",
        cancel: "取消",
        buildingPreview: "正在生成预览",
        applied: "已应用",
        previewShopifyWriteBack: "预览 Shopify 写回",
        previewCollectionWriteBack: "预览集合页写回",
        reviewHelp: "更新 Shopify 前，先审核具体字段变化。",
        tryAgain: "重新预览",
        viewLiveProduct: "查看在线商品",
        viewLiveCollection: "查看在线集合页",
        before: "优化前",
        after: "优化后",
        errorPreview: "无法预览 Shopify 写回。",
        errorApply: "无法应用选中的 SEO/GEO 优化。",
        updated: "已更新",
        fixesWritten: "SEO/GEO 优化已写入 Shopify。",
        adminNotCharged: "管理员账户未扣费。",
        spent: "已消耗",
        balance: "余额",
        selectedFields: {
          seoTitle: "SEO 标题",
          seoDescription: "Meta 描述",
          tags: "商品标签 / 关键词",
          descriptionHtml: "答案友好内容"
        },
        rewrite: {
          diffTitle: "Before / after 差异",
          willUpdate: "将被更新。",
          noChanges: "该改写没有检测到变化。",
          editHelp: "确认前可以编辑 After 字段。",
          unlimited: "无限",
          credits: "积分",
          confirm: "确认写回",
          previewing: "正在预览...",
          appliedToShopify: "已应用到 Shopify",
          preview: "预览写回",
          errorPreview: "无法预览 Shopify 写回。",
          errorApply: "无法将 Search Console 改写写入 Shopify。",
          written: "改写已写入 Shopify。"
        },
        imageAlt: {
          title: "图片 Alt 文本写回",
          preview: "预览图片 Alt 写回",
          previewing: "正在预览 Alt 文本...",
          confirm: "确认写回 Alt 文本",
          noChanges: "该商品图片 Alt 文本已经足够完整。",
          errorPreview: "无法预览图片 Alt 文本更新。",
          errorApply: "无法将图片 Alt 文本写入 Shopify。",
          applied: "图片 Alt 文本已写入 Shopify。",
          help: "为较弱或缺失的 Shopify 商品图片补充描述性 Alt 文本，帮助图片搜索和无障碍访问。"
        },
        internalLink: {
          title: "内链写回",
          preview: "预览内链写回",
          previewing: "正在预览内链...",
          confirm: "确认写回内链",
          noChanges: "该内链已经存在。",
          errorPreview: "无法预览内链更新。",
          errorApply: "无法将内链写入 Shopify。",
          applied: "内链已写入 Shopify。",
          help: "向来源商品页或集合页描述中添加一条上下文相关的内链。",
          manualOnly: "博客到商品的内链目前先作为手动建议，等博客写回接入后可自动写入。",
          anchorLabel: "锚文本"
        }
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
          "更成熟的 Shopify 优化工具通常会结合搜索基础、图片语义、技术信号和答案友好的页面文案。",
        sampleDiff: "示例审核结果",
        before: "优化前",
        after: "优化草稿",
        openRichResultsTest: "打开 Google 富结果测试"
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
        proof: {
          eyebrow: "结果驱动流程",
          title: "先查看审核，再预览修复，最后确认 Shopify 写回。",
          body:
            "这个页面围绕 Growth Studio 的真实审核流程设计：在线商品审核、可编辑 before/after 草稿、图片 SEO 检查、内链建议和富结果准备度。",
          metrics: [
            { label: "SEO/GEO 检查字段", value: "20+" },
            { label: "写回模式", value: "4" },
            { label: "默认发布方式", value: "草稿" }
          ],
          media: [
            {
              src: "/marketing/growth-lifestyle-media.png",
              alt: "AceStudio Shopify 优化流程中生成的生活方式商品图",
              label: "场景图"
            },
            {
              src: "/marketing/growth-detail-media.png",
              alt: "用于 Shopify 图片 SEO 审核的商品细节图",
              label: "细节图"
            },
            {
              src: "/marketing/growth-clean-product-media.png",
              alt: "用于 Shopify 商品媒体排序的白底商品图",
              label: "白底商品图"
            }
          ],
          resultCards: [
            {
              title: "优化前",
              detail: "标题较薄、缺少 Meta 描述、图片 alt 弱、没有买家 FAQ，也缺少内部商品语境。"
            },
            {
              title: "优化草稿",
              detail: "可编辑 SEO 标题、Meta 描述、买家问题、alt 文本和内链，等待商家确认。"
            }
          ]
        },
        richResults: {
          eyebrow: "结构化数据验证",
          title: "富结果检查必须基于真实 Shopify 数据。",
          body:
            "AceStudio 会区分准备度和自动化：检查 Product、Offer、Breadcrumb、FAQ 和 Review 的前置条件，并提示商家在部署后验证真实页面。",
          checks: [
            "Product schema 包含名称、描述、图片、URL、品牌/分类语境。",
            "Offer 准备度使用真实 Shopify 价格、货币、库存可售状态和商品 URL。",
            "FAQ 与 Review 在页面可见 FAQ 和真实客户评价数据存在前保持 partial。",
            "部署后应使用 Google 富结果测试检查规范页面 URL。"
          ]
        },
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
