#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build sector-specific lexicons from PDF CVs under data/.

Outputs:
  - lexicons/sector_keywords.json   (top keywords per sector)
  - lexicons/action_verbs.json      (common action verbs merged TR/EN)

Heuristic approach:
  - Parse PDFs to text (reuse CVAnalyzer.parse_pdf)
  - Tokenize, lowercase, strip punctuation/numbers
  - Remove stopwords (EN+TR minimal lists)
  - Keep alphabetic tokens of length >= 2
  - Rank by frequency and TF-IDF-like weighting across sectors
  - Extract action verbs by intersecting with a seed verb list and POS-like heuristics
"""

from __future__ import annotations

import json
import os
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Dict, List

from cv_analyzer_prototype import CVAnalyzer


EN_STOP = {
    "the", "and", "to", "of", "in", "for", "on", "with", "as", "is", "at", "by",
    "from", "that", "this", "a", "an", "be", "or", "are", "was", "were", "it",
    "your", "you", "we", "our", "their", "they", "i", "me", "my",
}

TR_STOP = {
    "ve", "ile", "için", "de", "da", "bir", "bu", "şu", "o", "olarak", "gibi",
    "ile", "olan", "olan", "olan", "çok", "az", "en", "ile", "ama", "fakat",
}

SEED_ACTION_VERBS_EN = {
    "led", "managed", "developed", "designed", "implemented", "optimized", "built",
    "created", "delivered", "launched", "increased", "reduced", "improved",
    "streamlined", "automated", "migrated", "analyzed", "architected", "coordinated",
    "facilitated", "mentored", "owned", "drove", "executed", "deployed", "integrated",
}

SEED_ACTION_VERBS_TR = {
    "yönettim", "yönetti", "tasarladım", "tasarladı", "geliştirdim", "geliştirdi",
    "uyguladım", "uyguladı", "optimize ettim", "optimize etti", "kurdum", "oluşturdum",
    "yayınladım", "arttırdım", "azalttım", "iyileştirdim", "otomatikleştirdim",
    "taşıdım", "analiz ettim", "koordinasyon sağladım", "kolaylaştırdım", "mentorluk yaptım",
}


TOKEN_RE = re.compile(r"[a-zA-ZğüşöçıİĞÜŞÖÇ]+(?:\.[a-z0-9]+)?")


def tokenize(text: str) -> List[str]:
    text = text.lower()
    return TOKEN_RE.findall(text)


def build_sector_keywords(data_dir: str, per_sector_limit: int = 100) -> Dict[str, List[str]]:
    analyzer = CVAnalyzer(data_dir)
    data_path = Path(data_dir)
    sector_to_counts: Dict[str, Counter] = {}

    sectors = [p.name for p in data_path.iterdir() if p.is_dir()]
    for sector in sectors:
        sector_dir = data_path / sector
        counts: Counter = Counter()
        pdfs = list(sector_dir.glob("*.pdf"))
        for pdf in pdfs:
            txt = analyzer.parse_pdf(pdf)
            if not txt:
                continue
            tokens = [t for t in tokenize(txt) if len(t) >= 2]
            tokens = [t for t in tokens if t not in EN_STOP and t not in TR_STOP]
            counts.update(tokens)
        sector_to_counts[sector] = counts

    # IDF-like weighting: downweight terms common across many sectors
    df: Counter = Counter()
    for sector, cnt in sector_to_counts.items():
        for term in cnt:
            df[term] += 1

    sector_keywords: Dict[str, List[str]] = {}
    num_sectors = max(1, len(sector_to_counts))
    for sector, cnt in sector_to_counts.items():
        scored: List[tuple[str, float]] = []
        for term, tf in cnt.items():
            idf = 1.0 / (1 + df[term] / num_sectors)  # simple inverse freq across sectors
            score = tf * idf
            scored.append((term, score))
        scored.sort(key=lambda x: x[1], reverse=True)
        sector_keywords[sector] = [t for t, _ in scored[:per_sector_limit]]

    return sector_keywords


def build_action_verbs(sector_keywords: Dict[str, List[str]]) -> List[str]:
    # Start with seed verbs and add frequent verb-like tokens (heuristic: ends with common verb suffixes)
    verbs = set(SEED_ACTION_VERBS_EN) | set(SEED_ACTION_VERBS_TR)
    suffixes = ("ed", "ing", "ed.", "ing.", "dim", "dım", "düm", "du", "dı", "di", "ti")
    for terms in sector_keywords.values():
        for t in terms:
            if len(t) >= 4 and (t.endswith(suffixes) or t in ("manage", "lead", "design", "implement", "optimize")):
                verbs.add(t)
    # Keep a reasonable cap
    return sorted(list(verbs))[:500]


def main():
    data_dir = "data"
    out_dir = Path("lexicons")
    out_dir.mkdir(parents=True, exist_ok=True)

    print("🔧 Sektörel keyword'ler çıkarılıyor...")
    sector_kw = build_sector_keywords(data_dir)
    (out_dir / "sector_keywords.json").write_text(
        json.dumps(sector_kw, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"✅ Kaydedildi: {out_dir / 'sector_keywords.json'}")

    print("🔧 Action verbs çıkarılıyor...")
    action_verbs = build_action_verbs(sector_kw)
    (out_dir / "action_verbs.json").write_text(
        json.dumps(action_verbs, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"✅ Kaydedildi: {out_dir / 'action_verbs.json'}")


if __name__ == "__main__":
    main()


