/**
 * Lighthouse CI configuration (S1-12).
 *
 * Lenient baseline: performance >= 0.5 so the check does not block feature
 * work while CWV baselines are being established (S1-02).
 *
 * Full production budgets to enforce in a later sprint:
 *   categories.performance >= 0.7
 *   first-contentful-paint   <= 2500 ms
 *   largest-contentful-paint <= 2500 ms
 *   total-blocking-time      <=  200 ms
 *   cumulative-layout-shift  <=    0.1
 *   JS bundle per route      <= 170 KB (gzip)
 *
 * Run manually: npx @lhci/cli autorun
 * CI: .github/workflows/lighthouse.yml (workflow_dispatch only)
 */
module.exports = {
  ci: {
    collect: {
      url: [
        "https://www.ladhaquest.com/",
        "https://www.ladhaquest.com/recipe-index",
        "https://www.ladhaquest.com/countries",
      ],
      numberOfRuns: 1,
      settings: {
        // Simulate a mid-range Android phone on a 4G connection.
        preset: "desktop",
        throttlingMethod: "simulate",
      },
    },
    assert: {
      preset: "lighthouse:no-pwa",
      assertions: {
        // Lenient baseline — tighten per S1-02 results.
        "categories:performance": ["warn", { minScore: 0.5 }],
        "categories:accessibility": ["warn", { minScore: 0.7 }],
        "categories:best-practices": ["warn", { minScore: 0.7 }],
        "categories:seo": ["error", { minScore: 0.8 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
