const GITHUB_DISPATCH_URL =
  "https://api.github.com/repos/1257070086-hash/company-watch/actions/workflows/rss-sync.yml/dispatches";

async function dispatchSync(env) {
  if (!env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is not configured");
  const response = await fetch(GITHUB_DISPATCH_URL, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "company-watch-scheduler",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ ref: "main" }),
  });
  if (response.status !== 204) {
    const detail = await response.text();
    throw new Error(`GitHub dispatch failed (${response.status}): ${detail.slice(0, 300)}`);
  }
}

export default {
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(dispatchSync(env));
  },

  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({
        ok: true,
        schedule: "08:12-23:12 Asia/Shanghai, hourly",
        target: "company-watch / Cloud RSS sync",
      });
    }
    return new Response("Not found", { status: 404 });
  },
};
