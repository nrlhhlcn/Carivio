#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Deterministic ATS Scoring System

Bu modül, kural tabanlı ve deterministik bir ATS skorlama uygular:
- Bölüm varlığı (Experience, Education, Skills, Contact)
- Format ve tarih tutarlılığı
- Sektörel anahtar kelime eşleşmeleri
- Aksiyon fiilleri kullanımı
- Uzunluk ve temel iletişim bilgileri

Aynı CV için her zaman aynı skoru verir. Öneriler kural açıklarından türetilir.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple

from cv_analyzer_prototype import CVAnalyzer
from pathlib import Path
import json


# Sektör bazlı temel anahtar kelimeler (örnek, genişletilebilir)
def _load_sector_keywords() -> Dict[str, List[str]]:
    lex_path = Path("lexicons/sector_keywords.json")
    if lex_path.exists():
        try:
            return json.loads(lex_path.read_text(encoding="utf-8"))
        except Exception:
            pass
    # Fallback minimal
    return {
    "INFORMATION-TECHNOLOGY": [
        "python", "java", "javascript", "react", "node", "api", "cloud",
        "docker", "kubernetes", "sql", "microservices", "aws", "azure",
    ],
    "FINANCE": [
        "budget", "forecast", "sap", "excel", "financial analysis",
        "audit", "ifrs", "tax", "valuation", "risk",
    ],
    "ENGINEERING": [
        "cad", "autocad", "solidworks", "mechanical", "electrical",
        "embedded", "matlab", "simulation", "qa", "testing",
    ],
    "HEALTHCARE": [
        "patient", "clinical", "hospital", "emr", "ehr", "compliance",
        "diagnosis", "treatment", "pharma", "laboratory",
    ],
    "ACCOUNTANT": [
        "bookkeeping", "ledger", "reconciliation", "payable", "receivable",
        "gst", "vat", "tax", "audit", "tally",
    ],
}


def _load_action_verbs() -> List[str]:
    lex_path = Path("lexicons/action_verbs.json")
    if lex_path.exists():
        try:
            return json.loads(lex_path.read_text(encoding="utf-8"))
        except Exception:
            pass
    # Fallback minimal
    return [
        "led", "managed", "developed", "designed", "implemented", "optimized",
        "built", "created", "delivered", "launched", "increased", "reduced",
        "improved", "streamlined", "automated", "migrated", "analyzed",
        "architected", "coordinated", "facilitated", "mentored",
    ]


EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
PHONE_RE = re.compile(r"\b(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}\b")
DATE_RE = re.compile(r"\b(?:\d{1,2}[\-/]\d{1,2}[\-/]\d{2,4}|\w+\s+\d{4}|\d{4})\b", re.IGNORECASE)


@dataclass
class ScoreBreakdown:
    total: int
    sections: int
    formatting: int
    keywords: int
    actions: int
    completeness: int
    notes: List[str]


def _count_keywords(text: str, keywords: List[str]) -> int:
    text_l = text.lower()
    hits = 0
    for kw in keywords:
        if re.search(rf"\b{re.escape(kw.lower())}\b", text_l):
            hits += 1
    return hits


def _has_contact(text: str) -> bool:
    return bool(EMAIL_RE.search(text)) or bool(PHONE_RE.search(text))


def _date_consistency(text: str) -> float:
    dates = DATE_RE.findall(text)
    if not dates:
        return 0.0
    # Basit oran: metin uzunluğuna göre normalize edilmiş sinyal
    uniq = len(set(dates))
    return min(1.0, uniq / 6.0)


def _length_score(text: str) -> float:
    words = len(text.split())
    if 250 <= words <= 1200:
        return 1.0
    if 150 <= words < 250 or 1200 < words <= 2000:
        return 0.6
    return 0.3


def _action_verbs_score(text: str, action_verbs: List[str]) -> float:
    hits = _count_keywords(text, action_verbs)
    if hits >= 10:
        return 1.0
    if hits >= 5:
        return 0.7
    if hits >= 2:
        return 0.4
    return 0.0


def score_cv_text(cv_text: str, sector: str, analyzer: CVAnalyzer | None = None) -> ScoreBreakdown:
    """Deterministik ATS skoru ve kırılımları hesapla."""
    if analyzer is None:
        analyzer = CVAnalyzer("data")

    sections = analyzer.detect_sections(cv_text)

    notes: List[str] = []
    score_sections = 0
    # Zorunlu bölümler: experience(10), education(8), skills(7), contact(5)
    if "experience" in sections:
        score_sections += 10
    else:
        notes.append("Experience bölümü eksik")

    if "education" in sections:
        score_sections += 8
    else:
        notes.append("Education bölümü eksik")

    if "skills" in sections:
        score_sections += 7
    else:
        notes.append("Skills bölümü eksik")

    if _has_contact(cv_text):
        score_sections += 5
    else:
        notes.append("İletişim bilgisi (email/telefon) tespit edilemedi")

    # Format & tarih (20 puan)
    length_component = _length_score(cv_text)  # 10 puan
    date_component = _date_consistency(cv_text)  # 6 puan
    bullets_component = 1.0 if any(b in cv_text for b in ["•", "- ", "* "]) else 0.0  # 4 puan
    score_formatting = round(length_component * 10 + date_component * 6 + bullets_component * 4)
    if length_component < 1.0:
        notes.append("CV uzunluğu ideal aralığın dışında")
    if date_component == 0.0:
        notes.append("Tarih desenleri yetersiz veya tutarsız")
    if bullets_component == 0.0:
        notes.append("Madde işaretleri az; okunabilirlik düşebilir")

    # Sektör anahtar kelimeleri (30 puan)
    sector_kw_map = _load_sector_keywords()
    sector_kw = sector_kw_map.get(sector, [])
    kw_hits = _count_keywords(cv_text, sector_kw)
    # 0..30 doğrusal ölçek (>=15 hit -> 30)
    score_keywords = min(30, int((kw_hits / 15.0) * 30))
    if score_keywords < 18:
        notes.append("Sektörüne özgü anahtar kelime yoğunluğu düşük")

    # Aksiyon fiilleri (20 puan)
    action_verbs = _load_action_verbs()
    actions_component = _action_verbs_score(cv_text, action_verbs)
    score_actions = int(actions_component * 20)
    if score_actions < 10:
        notes.append("Güçlü aksiyon fiilleri kullanımını artırın (led, built, delivered, optimized)")

    # Tamamlayıcılık (10 puan)
    completeness = 0
    if EMAIL_RE.search(cv_text):
        completeness += 3
    if PHONE_RE.search(cv_text):
        completeness += 3
    # Basit linkedin/url sinyali
    if re.search(r"\b(linkedin\.com|github\.com|portfolio|behance|kaggle)\b", cv_text, re.IGNORECASE):
        completeness += 4
    if completeness < 6:
        notes.append("İletişim/link bilgilerini zenginleştirin (LinkedIn/GitHub vs.)")

    total = min(100, score_sections + score_formatting + score_keywords + score_actions + completeness)

    return ScoreBreakdown(
        total=total,
        sections=score_sections,
        formatting=score_formatting,
        keywords=score_keywords,
        actions=score_actions,
        completeness=completeness,
        notes=notes,
    )


def generate_recommendations(breakdown: ScoreBreakdown, sector: str) -> List[str]:
    """Kural tabanlı öneriler (deterministik)."""
    recs: List[str] = []
    recs.extend(breakdown.notes)

    if breakdown.sections < 30:
        recs.append("Bölüm başlıklarını standardize edin (Experience, Education, Skills)")

    if breakdown.formatting < 14:
        recs.append("Tarih formatlarını tek tipe çekin (MMM YYYY – MMM YYYY) ve madde işareti kullanın")

    if breakdown.keywords < 24:
        sector_kw_map = _load_sector_keywords()
        top_kw = ", ".join(sector_kw_map.get(sector, [])[:8])
        recs.append(f"Sektör anahtar kelimelerini artırın (örn: {top_kw})")

    if breakdown.actions < 12:
        recs.append("Aksiyon fiilleriyle sayısallaştırılmış sonuçlar ekleyin (Increased X by Y%)")

    if breakdown.completeness < 8:
        recs.append("E-posta, telefon ve LinkedIn/GitHub gibi bağlantıları ekleyin")

    # Yinelenenleri kaldır, kısa tut
    seen = set()
    final = []
    for r in recs:
        if r not in seen:
            seen.add(r)
            final.append(r)
    return final[:10]


def score_pdf_file(pdf_path: Path, sector: str, analyzer: CVAnalyzer) -> Dict:
    text = analyzer.parse_pdf(pdf_path)
    if not text or len(text.strip()) == 0:
        return {
            "file": str(pdf_path),
            "sector": sector,
            "error": "Empty or unreadable text (possibly scanned PDF)",
        }
    breakdown = score_cv_text(text, sector, analyzer)
    return {
        "file": str(pdf_path),
        "sector": sector,
        "score": breakdown.total,
        "breakdown": {
            "sections": breakdown.sections,
            "formatting": breakdown.formatting,
            "keywords": breakdown.keywords,
            "actions": breakdown.actions,
            "completeness": breakdown.completeness,
        },
        "recommendations": generate_recommendations(breakdown, sector),
    }


def main():
    # data/ veya data/data/ altındaki TÜM sektör klasörlerini otomatik tara ve her birinden ilk 10 PDF'i skorla
    base = Path("data")
    data_root = base / "data" if (base / "data").exists() else base
    sector_dirs = [p for p in data_root.iterdir() if p.is_dir()]
    sectors = [p.name for p in sector_dirs]

    results: List[Dict] = []
    analyzer = CVAnalyzer(str(data_root))
    for sector in sectors:
        sector_dir = data_root / sector
        pdfs = list(sector_dir.glob("*.pdf"))[:10]
        if not pdfs:
            continue
        for f in pdfs:
            print(f"Scoring: {sector} -> {f.name}")
            try:
                results.append(score_pdf_file(f, sector, analyzer))
            except Exception as e:
                results.append({"file": str(f), "sector": sector, "error": str(e)})

    out_path = Path("ats_scores.json")
    with out_path.open("w", encoding="utf-8") as fp:
        json.dump({"results": results}, fp, indent=2, ensure_ascii=False)
    print(f"\nKaydedildi: {out_path}")


if __name__ == "__main__":
    main()


