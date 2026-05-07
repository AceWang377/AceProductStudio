import "server-only";
import { createSupabaseAdminClient, isSupabaseStorageEnabled } from "@/lib/supabase-admin";

type UserSummary = {
  id: string;
  email: string;
  createdAt: string;
};

type ProductRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  name: string | null;
  status: string | null;
  shopify_status: string | null;
  shopify_product_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type StoreRow = {
  id: string;
  user_id: string | null;
  shop_domain: string | null;
  is_active: boolean | null;
  webhook_status: string | null;
  webhook_last_error: string | null;
  updated_at: string | null;
};

type JobRow = {
  id: string;
  user_id: string | null;
  product_id: string | null;
  type: string | null;
  status: string | null;
  error: string | null;
  progress: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type CreditAccountRow = {
  user_id: string;
  balance: number | null;
};

type CreditLedgerRow = {
  id: string;
  user_id: string | null;
  amount: number | null;
  reason: string | null;
  created_at: string | null;
};

function asDate(value?: string | null) {
  return value ?? new Date(0).toISOString();
}

function titleForProduct(product?: ProductRow) {
  return product?.title || product?.name || "Untitled product";
}

async function listUsers(): Promise<UserSummary[]> {
  const supabase = createSupabaseAdminClient();
  const users: UserSummary[] = [];
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`Could not load users: ${error.message}`);

    users.push(
      ...data.users.map((user) => ({
        id: user.id,
        email: user.email ?? "No email",
        createdAt: user.created_at
      }))
    );

    if (data.users.length < 1000) break;
    page += 1;
  }

  return users;
}

export type AdminDashboard = Awaited<ReturnType<typeof getAdminDashboard>>;

export async function getAdminDashboard(input?: { search?: string }) {
  const search = input?.search?.trim().toLowerCase() ?? "";

  if (!isSupabaseStorageEnabled()) {
    return {
      configured: false,
      users: [],
      metrics: {
        users: 0,
        products: 0,
        connectedStores: 0,
        failedJobs: 0,
        activeJobs: 0,
        generatedCreditsUsed: 0,
        totalCreditBalance: 0,
        publishedDrafts: 0
      },
      recentUsers: [],
      stores: [],
      failedJobs: [],
      recentJobs: [],
      recentProducts: []
    };
  }

  const supabase = createSupabaseAdminClient();
  const [users, productsResult, storesResult, jobsResult, creditAccountsResult, creditLedgerResult] =
    await Promise.all([
      listUsers(),
      supabase
        .from("products")
        .select("id,user_id,title,name,status,shopify_status,shopify_product_id,created_at,updated_at")
        .order("updated_at", { ascending: false })
        .limit(80),
      supabase
        .from("stores")
        .select("id,user_id,shop_domain,is_active,webhook_status,webhook_last_error,updated_at")
        .order("updated_at", { ascending: false })
        .limit(80),
      supabase
        .from("jobs")
        .select("id,user_id,product_id,type,status,error,progress,created_at,updated_at")
        .order("updated_at", { ascending: false })
        .limit(120),
      supabase.from("credit_accounts").select("user_id,balance").limit(1000),
      supabase
        .from("credit_ledger")
        .select("id,user_id,amount,reason,created_at")
        .order("created_at", { ascending: false })
        .limit(120)
    ]);

  for (const result of [productsResult, storesResult, jobsResult, creditAccountsResult, creditLedgerResult]) {
    if (result.error) throw new Error(result.error.message);
  }

  const userById = new Map(users.map((user) => [user.id, user]));
  const products = (productsResult.data ?? []) as ProductRow[];
  const productById = new Map(products.map((product) => [product.id, product]));
  const stores = (storesResult.data ?? []) as StoreRow[];
  const jobs = (jobsResult.data ?? []) as JobRow[];
  const creditAccounts = (creditAccountsResult.data ?? []) as CreditAccountRow[];
  const creditLedger = (creditLedgerResult.data ?? []) as CreditLedgerRow[];
  const userEmail = (userId?: string | null) => (userId ? userById.get(userId)?.email ?? "" : "");
  const includesSearch = (...values: Array<string | null | undefined>) =>
    !search || values.some((value) => value?.toLowerCase().includes(search));
  const visibleProducts = products.filter((product) =>
    includesSearch(
      product.id,
      product.title,
      product.name,
      product.status,
      product.shopify_status,
      product.shopify_product_id,
      userEmail(product.user_id)
    )
  );
  const visibleStores = stores.filter((store) =>
    includesSearch(
      store.id,
      store.shop_domain,
      store.webhook_status,
      store.webhook_last_error,
      userEmail(store.user_id)
    )
  );
  const visibleJobs = jobs.filter((job) => {
    const product = job.product_id ? productById.get(job.product_id) : undefined;
    return includesSearch(
      job.id,
      job.type,
      job.status,
      job.error,
      job.product_id,
      titleForProduct(product),
      userEmail(job.user_id)
    );
  });
  const visibleUsers = users.filter((user) => includesSearch(user.id, user.email));

  const failedJobs = visibleJobs
    .filter((job) => job.status === "FAILED")
    .slice(0, 12)
    .map((job) => {
      const product = job.product_id ? productById.get(job.product_id) : undefined;
      const user = job.user_id ? userById.get(job.user_id) : undefined;
      return {
        id: job.id,
        type: job.type ?? "JOB",
        error: job.error || "No error recorded.",
        productId: job.product_id,
        productTitle: titleForProduct(product),
        userEmail: user?.email ?? "Unknown user",
        updatedAt: asDate(job.updated_at ?? job.created_at)
      };
    });

  const recentJobs = visibleJobs.slice(0, 12).map((job) => {
    const product = job.product_id ? productById.get(job.product_id) : undefined;
    const user = job.user_id ? userById.get(job.user_id) : undefined;
    return {
      id: job.id,
      type: job.type ?? "JOB",
      status: job.status ?? "UNKNOWN",
      progress: Number(job.progress ?? 0),
      productTitle: titleForProduct(product),
      userEmail: user?.email ?? "Unknown user",
      updatedAt: asDate(job.updated_at ?? job.created_at)
    };
  });

  const recentProducts = visibleProducts.slice(0, 12).map((product) => {
    const user = product.user_id ? userById.get(product.user_id) : undefined;
    return {
      id: product.id,
      title: titleForProduct(product),
      status: product.status ?? "DRAFT",
      shopifyStatus: product.shopify_status ?? "NOT_CONNECTED",
      shopifyProductId: product.shopify_product_id,
      userEmail: user?.email ?? "Unknown user",
      updatedAt: asDate(product.updated_at ?? product.created_at)
    };
  });

  const storeSummaries = visibleStores.slice(0, 12).map((store) => {
    const user = store.user_id ? userById.get(store.user_id) : undefined;
    return {
      id: store.id,
      shopDomain: store.shop_domain ?? "Unknown store",
      isActive: Boolean(store.is_active),
      webhookStatus: store.webhook_status ?? "not_configured",
      webhookLastError: store.webhook_last_error,
      userEmail: user?.email ?? "Unknown user",
      updatedAt: asDate(store.updated_at)
    };
  });

  const generatedCreditsUsed = creditLedger
    .filter((entry) => Number(entry.amount ?? 0) < 0)
    .reduce((total, entry) => total + Math.abs(Number(entry.amount ?? 0)), 0);
  const totalCreditBalance = creditAccounts.reduce(
    (total, account) => total + Number(account.balance ?? 0),
    0
  );

  return {
    configured: true,
    search,
    users,
    metrics: {
      users: visibleUsers.length,
      products: visibleProducts.length,
      connectedStores: visibleStores.filter((store) => store.is_active).length,
      failedJobs: visibleJobs.filter((job) => job.status === "FAILED").length,
      activeJobs: visibleJobs.filter((job) => job.status === "QUEUED" || job.status === "PROCESSING").length,
      generatedCreditsUsed,
      totalCreditBalance,
      publishedDrafts: visibleProducts.filter((product) =>
        ["PUBLISHED_AS_DRAFT", "PUBLISHED_LIVE"].includes(product.shopify_status ?? "")
      ).length
    },
    recentUsers: visibleUsers
      .slice()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 8),
    stores: storeSummaries,
    failedJobs,
    recentJobs,
    recentProducts
  };
}
