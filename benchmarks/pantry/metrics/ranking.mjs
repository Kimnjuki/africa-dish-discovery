/** Precision@K and NDCG@K for graded relevance (0–3). */

export function precisionAtK(rankedIds, relevance, k, relevantMin = 2) {
  const top = rankedIds.slice(0, k);
  if (!top.length) return { precision: 0, returned: 0, relevantHits: 0 };
  const hits = top.filter((id) => (relevance[id] ?? 0) >= relevantMin).length;
  return { precision: hits / top.length, returned: top.length, relevantHits: hits };
}

function dcg(gains) {
  let s = 0;
  for (let i = 0; i < gains.length; i++) {
    s += (Math.pow(2, gains[i]) - 1) / Math.log2(i + 2);
  }
  return s;
}

export function ndcgAtK(rankedIds, relevance, k) {
  const gains = rankedIds.slice(0, k).map((id) => relevance[id] ?? 0);
  const ideal = Object.values(relevance)
    .map(Number)
    .sort((a, b) => b - a)
    .slice(0, k);
  const idealDcg = dcg(ideal);
  if (idealDcg === 0) return { ndcg: null, note: "no positive judgments in pool" };
  return { ndcg: dcg(gains) / idealDcg };
}

export function mean(values) {
  const xs = values.filter((v) => v != null && Number.isFinite(v));
  if (!xs.length) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
