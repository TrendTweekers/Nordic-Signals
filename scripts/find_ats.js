#!/usr/bin/env node
/**
 * Usage:  node scripts/find_ats.js "Klarna" [klarna]
 *
 * Probes a company's career page across all the patterns the scraper supports
 * plus a few common custom URLs, then prints which ones returned a live page.
 *
 * Slug defaults to lowercased name without spaces/non-alpha. Pass a second
 * argument to override (e.g. "H2 Green Steel" → h2greensteel).
 */
const NAME = process.argv[2];
const SLUG_OVERRIDE = process.argv[3];

if (!NAME) {
  console.error("usage: node scripts/find_ats.js <name> [slug]");
  process.exit(1);
}

const slug = (SLUG_OVERRIDE || NAME).toLowerCase().replace(/[^a-z0-9]/g, "");
const domain = slug; // best-guess domain; user may override mentally

const probes = [
  ["greenhouse",      `https://job-boards.greenhouse.io/${slug}`],
  ["greenhouse-old",  `https://boards.greenhouse.io/${slug}`],
  ["lever",           `https://jobs.lever.co/${slug}`],
  ["ashby",           `https://jobs.ashbyhq.com/${slug}`],
  ["teamtailor_sub",  `https://${slug}.teamtailor.com/jobs`],
  ["teamtailor",      `https://career.${slug}.com/jobs`],
  ["teamtailor-careers", `https://careers.${slug}.com/jobs`],
  ["workable",        `https://apply.workable.com/${slug}/`],
  ["custom-jobs",     `https://jobs.${slug}.com`],
  ["custom-careers",  `https://careers.${slug}.com`],
  ["custom-careers-eng", `https://${slug}.com/careers`],
];

async function probe([label, url]) {
  try {
    const r = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    const text = await r.text();
    const live = r.status === 200 && text.length > 20000;
    const has404 = /not found|page doesn't exist|"404"/i.test(text.slice(0, 5000));
    return { label, url, status: r.status, len: text.length, live, has404, finalUrl: r.url };
  } catch (e) {
    return { label, url, status: "ERR", len: 0, live: false, err: e.message.slice(0, 80) };
  }
}

(async () => {
  console.log(`\nProbing "${NAME}" (slug: ${slug})\n`);
  const results = await Promise.all(probes.map(probe));
  results.forEach((r) => {
    const tag = r.live ? "✓ LIVE " : "  dead ";
    const status = r.status.toString().padEnd(3);
    const len = (r.len || 0).toString().padStart(7);
    const redirect = r.finalUrl && r.finalUrl !== r.url ? `→ ${r.finalUrl}` : "";
    console.log(`${tag} ${r.label.padEnd(22)} ${status} ${len}  ${r.url}  ${redirect}`);
  });
  console.log();
  const winners = results.filter((r) => r.live);
  if (winners.length === 0) {
    console.log("No live ATS found. Try a different slug, or this company uses a custom system.");
  } else {
    console.log(`Found ${winners.length} live URL${winners.length > 1 ? "s" : ""}. Pick the one matching a supported ATS:`);
    winners
      .filter((w) => ["greenhouse", "lever", "ashby", "teamtailor_sub", "teamtailor", "workable"].includes(w.label))
      .forEach((w) =>
        console.log(`  { "name": "${NAME}", "ats": "${w.label}", "slug": "${slug}", "country": "SE", "tier": "growth" },`)
      );
  }
})();
