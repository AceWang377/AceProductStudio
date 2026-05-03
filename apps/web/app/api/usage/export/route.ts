import { requireCurrentUser } from "@/lib/auth";
import { listCreditLedger } from "@/lib/credits";
import { listProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

type CsvRow = Array<string | number | null | undefined>;

function csvCell(value: string | number | null | undefined) {
  const raw = value === null || value === undefined ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll("\"", "\"\"")}"`;
}

function toCsv(rows: CsvRow[]) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvResponse(csv: string, filename: string) {
  return new Response(`${csv}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}

function timestamp() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  await requireCurrentUser();

  const url = new URL(request.url);
  const type = url.searchParams.get("type") === "credits" ? "credits" : "jobs";
  const products = await listProducts();
  const productById = new Map(products.map((product) => [product.id, product]));

  if (type === "credits") {
    const ledger = await listCreditLedger(500);
    const rows: CsvRow[] = [
      ["entry_id", "product_id", "product_title", "amount", "reason", "stripe_payment_id", "created_at"],
      ...ledger.map((entry) => {
        const product = entry.productId ? productById.get(entry.productId) : null;
        return [
          entry.id,
          entry.productId,
          product ? product.title || product.name || "Untitled product" : "Account",
          entry.amount,
          entry.reason,
          entry.stripePaymentId,
          entry.createdAt
        ];
      })
    ];

    return csvResponse(toCsv(rows), `ai-product-studio-credits-${timestamp()}.csv`);
  }

  const jobs = products
    .flatMap((product) =>
      product.jobs.map((job) => ({
        ...job,
        productTitle: product.title || product.name || "Untitled product"
      }))
    )
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  const rows: CsvRow[] = [
    [
      "job_id",
      "product_id",
      "product_title",
      "type",
      "status",
      "progress",
      "error",
      "created_at",
      "updated_at"
    ],
    ...jobs.map((job) => [
      job.id,
      job.productId,
      job.productTitle,
      job.type,
      job.status,
      job.progress,
      job.error,
      job.createdAt,
      job.updatedAt
    ])
  ];

  return csvResponse(toCsv(rows), `ai-product-studio-jobs-${timestamp()}.csv`);
}
