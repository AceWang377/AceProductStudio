const ref = process.env.VERCEL_GIT_COMMIT_REF || "";
const author =
  process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN ||
  process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME ||
  "";

const isDependabotBuild =
  ref.startsWith("dependabot/") ||
  author === "dependabot[bot]" ||
  author === "dependabot";

if (isDependabotBuild) {
  console.log(`Skipping Vercel build for automated dependency branch: ${ref || author}`);
  process.exit(0);
}

process.exit(1);
