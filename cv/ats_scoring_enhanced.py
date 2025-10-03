#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Enhanced ATS Scoring System with Consistency, Auto-Detection, and Explanatory Recommendations

Features:
- Cache-based consistency (same CV = same score)
- Automatic sector detection with user override
- Explanatory recommendations with impact estimates
- OCR fallback for scanned PDFs
- Configurable scoring weights per sector
"""

from __future__ import annotations

import json
import re
import hashlib
import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from collections import Counter
from ats.rules_extras import (
    header_footer_contact_penalty,
    hyphenation_penalty,
    non_ascii_penalty,
    keyword_stuffing_penalty,
    skills_block_penalty,
    language_mismatch_penalty,
    acronym_full_form_note,
    tense_inconsistency_penalty,
    link_validity_penalty,
    spelling_grammar_penalty,
    normalize_tokens,
    ROLE_PRESETS,
    infer_role_from_jd,
    tense_inconsistency_by_experience,
    online_link_penalty_and_notes,
)
from ats.rules_extras import (
    header_footer_contact_penalty,
    hyphenation_penalty,
    non_ascii_penalty,
    keyword_stuffing_penalty,
    skills_block_penalty,
    language_mismatch_penalty,
    acronym_full_form_note,
)

from cv_analyzer_prototype import CVAnalyzer
from semantic_enhancer import EnhancedKeywordMatcher

# OCR fallback
try:
    import pytesseract
    from PIL import Image
    import fitz  # PyMuPDF
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    print("Warning: OCR dependencies not available. Install: pip install pytesseract pillow PyMuPDF")

# Email, phone, date patterns
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
    impact_estimates: Dict[str, int]  # Estimated points for each recommendation

@dataclass
class SectorDetection:
    detected_sector: str
    confidence: float
    alternatives: List[Tuple[str, float]]

class ATSConfig:
    def __init__(self, config_path: str = "config.json"):
        self.config_path = Path(config_path)
        self.config = self._load_config()
    
    def _load_config(self) -> Dict:
        if self.config_path.exists():
            try:
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Config load error: {e}")
        
        # Default config
        return {
            "version": "1.0.0",
            "rules_version": "1.0.0",
            "lexicon_version": "1.0.0",
            "scoring_weights": {
                "sections": 30, "formatting": 20, "keywords": 30, 
                "actions": 20, "completeness": 10
            },
            "cache_enabled": True,
            "ocr_enabled": True,
            "auto_sector_detection": True
        }
    
    def get_weight(self, component: str, sector: str = None) -> int:
        """Get scoring weight for component, with sector override if available"""
        base_weight = self.config["scoring_weights"].get(component, 0)
        
        if sector and "sector_weights" in self.config:
            sector_override = self.config["sector_weights"].get(sector, {}).get(component)
            if sector_override is not None:
                return sector_override
        
        return base_weight

class CacheManager:
    def __init__(self, cache_dir: str = "cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
    
    def _get_cache_key(self, cv_text: str, sector: str, config_version: str) -> str:
        """Generate cache key from CV content, sector, and config version"""
        content = f"{cv_text}|{sector}|{config_version}"
        return hashlib.md5(content.encode('utf-8')).hexdigest()
    
    def get_cached_score(self, cv_text: str, sector: str, config_version: str) -> Optional[Dict]:
        """Get cached score if available"""
        cache_key = self._get_cache_key(cv_text, sector, config_version)
        cache_file = self.cache_dir / f"{cache_key}.json"
        
        if cache_file.exists():
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                pass
        return None
    
    def cache_score(self, cv_text: str, sector: str, config_version: str, result: Dict):
        """Cache scoring result"""
        cache_key = self._get_cache_key(cv_text, sector, config_version)
        cache_file = self.cache_dir / f"{cache_key}.json"
        
        try:
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Cache write error: {e}")

class SectorDetector:
    def __init__(self, config: ATSConfig):
        self.config = config
        self.sector_keywords = self._load_sector_keywords()
    
    def _load_sector_keywords(self) -> Dict[str, List[str]]:
        """Load sector keywords from lexicon"""
        lex_path = Path("lexicons/sector_keywords.json")
        if lex_path.exists():
            try:
                return json.loads(lex_path.read_text(encoding="utf-8"))
            except Exception:
                pass
        
        # Fallback minimal keywords
        return {
            "INFORMATION-TECHNOLOGY": [
                "python", "java", "javascript", "react", "node", "api", "cloud",
                "docker", "kubernetes", "sql", "microservices", "aws", "azure"
            ],
            "FINANCE": [
                "budget", "forecast", "sap", "excel", "financial analysis",
                "audit", "ifrs", "tax", "valuation", "risk"
            ],
            "ENGINEERING": [
                "cad", "autocad", "solidworks", "mechanical", "electrical",
                "embedded", "matlab", "simulation", "qa", "testing"
            ],
            "HEALTHCARE": [
                "patient", "clinical", "hospital", "emr", "ehr", "compliance",
                "diagnosis", "treatment", "pharma", "laboratory"
            ],
            "ACCOUNTANT": [
                "bookkeeping", "ledger", "reconciliation", "payable", "receivable",
                "gst", "vat", "tax", "audit", "tally"
            ]
        }
    
    def detect_sector(self, cv_text: str) -> SectorDetection:
        """Detect most likely sector from CV content"""
        text_lower = cv_text.lower()
        sector_scores = {}
        
        for sector, keywords in self.sector_keywords.items():
            hits = 0
            for keyword in keywords:
                if re.search(rf'\b{re.escape(keyword.lower())}\b', text_lower):
                    hits += 1
            
            # Normalize by keyword count
            score = hits / len(keywords) if keywords else 0
            sector_scores[sector] = score
        
        # Sort by score
        sorted_sectors = sorted(sector_scores.items(), key=lambda x: x[1], reverse=True)
        
        if not sorted_sectors:
            return SectorDetection("INFORMATION-TECHNOLOGY", 0.0, [])
        
        best_sector, best_score = sorted_sectors[0]
        alternatives = sorted_sectors[1:3]  # Top 2 alternatives
        
        return SectorDetection(best_sector, best_score, alternatives)

class EnhancedATSScorer:
    def __init__(self, config_path: str = "config.json"):
        self.config = ATSConfig(config_path)
        self.cache = CacheManager()
        self.sector_detector = SectorDetector(self.config)
        self.analyzer = None
        
        # Load action verbs
        self.action_verbs = self._load_action_verbs()
        
        # Initialize semantic enhancer
        self.semantic_enhancer = EnhancedKeywordMatcher()
        
        # Runtime context (filename, page count, etc.)
        self._ctx: Dict[str, Optional[str]] = {"filename": None, "page_count": None}
        
        # Minimal stopwords for JD token filtering (keep deterministic, no extra deps)
        self._stopwords = set([
            "the","and","for","with","from","this","that","your","you","our","their",
            "a","an","to","of","in","on","at","as","by","is","are","be","or","we",
            "using","use","used","will","can","ability","experience","skills","skill",
            "responsibilities","responsibility","requirements","requirement","preferred","must",
            "include","including","such","etc","about","more","minimum","years","year"
        ])

    # ===== Additional formatting/content heuristics from checklist =====
    def _header_footer_contact_penalty(self, text: str) -> int:
        """If email/phone appear only in first/last 2 lines, penalize (likely header/footer)."""
        lines = [l for l in text.splitlines() if l.strip()]
        if not lines:
            return 0
        first = "\n".join(lines[:2])
        last = "\n".join(lines[-2:])
        mid = "\n".join(lines[2:-2]) if len(lines) > 4 else ""
        header_hit = (EMAIL_RE.search(first) or PHONE_RE.search(first)) and not (EMAIL_RE.search(mid) or PHONE_RE.search(mid))
        footer_hit = (EMAIL_RE.search(last) or PHONE_RE.search(last)) and not (EMAIL_RE.search(mid) or PHONE_RE.search(mid))
        return 2 if (header_hit or footer_hit) else 0

    def _hyphenation_penalty(self, text: str) -> int:
        """Detect word hyphenation across line breaks: exam-\nple."""
        if re.search(r"[A-Za-z]{3,}-\s*\n\s*[A-Za-z]{2,}", text):
            return 2
        return 0

    def _non_ascii_penalty(self, text: str) -> int:
        """Penalty for high ratio of non-ASCII letters (ATS robustness)."""
        letters = re.findall(r"\S", text)
        if not letters:
            return 0
        non_ascii = sum(1 for ch in letters if ord(ch) > 127)
        ratio = non_ascii / max(1, len(letters))
        if ratio > 0.10:
            return 2
        if ratio > 0.05:
            return 1
        return 0

    def _keyword_stuffing_penalty(self, text: str, sector: str) -> int:
        """Penalty for dense keyword lists separated by commas/slashes without sentence context."""
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        bad = 0
        for l in lines:
            # many commas and few verbs/punct = likely stuffed list
            commas = l.count(",")
            if commas >= 6 and not re.search(r"\b(and|with|for|built|led|developed|implemented)\b", l, re.IGNORECASE):
                bad += 1
            if re.search(r"\b(?:python|java|sql|react|aws|docker)(?:\s*,\s*(?:python|java|sql|react|aws|docker)){6,}\b", l, re.IGNORECASE):
                bad += 1
        if bad >= 3:
            return 4
        if bad >= 1:
            return 2
        return 0

    def _acronym_full_form_note(self, text: str, notes: List[str]):
        """Add note if common acronyms appear without their full forms."""
        pairs = {
            "SEO": "search engine optimization",
            "NLP": "natural language processing",
            "KPI": "key performance indicator",
            "ETL": "extract transform load",
            "CI/CD": "continuous integration",
            "API": "application programming interface"
        }
        tl = text.lower()
        for acro, full in pairs.items():
            if re.search(rf"\b{re.escape(acro)}\b", text) and full not in tl:
                notes.append(f"Consider writing '{acro} ({full})' at least once for ATS")

    def _skills_block_penalty(self, text: str) -> int:
        """Penalty if skills is a single overlong comma-separated block (poor parsing)."""
        # Find lines containing 'skills' and a very long comma list afterwards
        for m in re.finditer(r"skills\s*:?\s*(.+)", text, flags=re.IGNORECASE):
            tail = m.group(1)
            if tail.count(",") >= 12 and len(tail) > 200:
                return 2
        return 0

    def _language_mismatch_penalty(self, text: str) -> int:
        """Heuristic mix of TR/EN: both many Turkish diacritics and many English tech terms."""
        tr_chars = len(re.findall(r"[çğıöşüÇĞİÖŞÜ]", text))
        en_tech = len(re.findall(r"\b(python|java|react|cloud|aws|api|docker|kubernetes|machine learning)\b", text, flags=re.IGNORECASE))
        if tr_chars >= 20 and en_tech >= 10:
            return 2
        return 0

    def _to_tr(self, note: str) -> str:
        """Best-effort Turkish localization for recommendation notes."""
        mappings = [
            ("Missing experience section", "Deneyim (Experience) bölümü eksik"),
            ("Missing education section", "Eğitim (Education) bölümü eksik"),
            ("Missing skills section", "Beceri (Skills) bölümü eksik"),
            ("Missing contact section", "İletişim (Contact) bölümü eksik"),
            ("CV length outside ideal range (250-1200 words)", "CV uzunluğu ideal aralıkta değil (250–1200 kelime)"),
            ("Inconsistent or missing date formats", "Tarih formatları tutarsız veya eksik"),
            ("Limited use of bullet points", "Madde işareti kullanımı yetersiz"),
            ("Two-column/table-like layout detected; ATS parsing risk", "İki sütun/tablo benzeri düzen tespit edildi; ATS okuma riski"),
            ("Paragraphs too long; break into concise bullets", "Paragraflar çok uzun; kısa maddelere bölün"),
            ("Overly long or multi-line bullet points", "Çok uzun veya çok satırlı madde kullanımı"),
            ("Dates not in reverse chronological order", "Tarihler ters kronolojik sırada değil"),
            ("Too few distinct experience entries", "Yeterli sayıda ayrı deneyim girdisi yok"),
            ("Summary/objective section too long", "Özet/amaç bölümü çok uzun"),
            ("Low rate of quantified results in bullets (<30%)", "Maddelerde ölçülebilir sonuç oranı düşük (<%30)"),
            ("Few bullets start with strong action verbs (<50%)", "Maddelerin azı güçlü eylem fiiliyle başlıyor (<%50)"),
            ("Vague buzzwords detected; replace with concrete outcomes", "Belirsiz buzzword’ler tespit edildi; somut çıktılarla değiştirin"),
            ("Avoid first-person pronouns in resume body", "CV metninde birinci tekil şahıs zamirlerinden kaçının"),
            ("Excessive ALL CAPS usage; use standard capitalization", "Aşırı BÜYÜK HARF kullanımı; standart yazım kullanın"),
            ("Education section lacks clear degree notation (e.g., BSc, MSc, PhD)", "Eğitim bölümünde derece ifadesi net değil (örn. BSc, MSc, PhD)"),
            ("Provide full LinkedIn profile URL (e.g., linkedin.com/in/username)", "Tam LinkedIn profil URL’si verin (örn. linkedin.com/in/kullanici)"),
            ("Balance bullets per experience entry (2–6 recommended)", "Deneyim girdisi başına madde dengesini sağlayın (öneri 2–6)"),
            ("Low ", "")  # handled separately for sector density
        ]
        # Sector-specific density message
        m = re.match(r"Low (.+) keyword density", note)
        if m:
            return f"{m.group(1)} anahtar kelime yoğunluğu düşük"
        m2 = re.match(r"Found (\d+) semantic skill matches", note)
        if m2:
            return f"{m2.group(1)} adet semantik beceri eşleşmesi bulundu"
        for en, tr in mappings:
            if en and en in note:
                # Preserve dynamic parts if any (basic)
                return note.replace(en, tr)
        return note
    
    def _load_action_verbs(self) -> List[str]:
        """Load action verbs from lexicon"""
        base_verbs: List[str] = []
        candidates = [
            Path("lexicons/action_verbs_extended.json"),
            Path("lexicons/action_verbs.json"),
        ]
        for p in candidates:
            if p.exists():
                try:
                    data = json.loads(p.read_text(encoding="utf-8"))
                    if isinstance(data, list):
                        base_verbs.extend([str(x).strip() for x in data if str(x).strip()])
                except Exception:
                    continue
        if not base_verbs:
            # Fallback
            base_verbs = [
                "led", "managed", "developed", "designed", "implemented", "optimized",
                "built", "created", "delivered", "launched", "increased", "reduced",
                "improved", "streamlined", "automated", "migrated", "analyzed",
                "architected", "coordinated", "facilitated", "mentored"
            ]
        # Deduplicate and normalize lowercase
        dedup = sorted(set(v.lower() for v in base_verbs))
        return dedup
    
    def _get_analyzer(self, data_root: str) -> CVAnalyzer:
        """Get analyzer instance"""
        if self.analyzer is None:
            self.analyzer = CVAnalyzer(data_root)
        return self.analyzer
    
    def _extract_text_with_ocr_fallback(self, pdf_path: Path) -> str:
        """Extract text from PDF with OCR fallback"""
        analyzer = self._get_analyzer(self.config.config.get("data_root", "data"))
        
        # Try normal parsing first
        text = analyzer.parse_pdf(pdf_path)
        if text and len(text.strip()) > 100:
            return text
        
        # OCR fallback if enabled and available
        if self.config.config.get("ocr_enabled", True) and OCR_AVAILABLE:
            try:
                print(f"Trying OCR for {pdf_path.name}...")
                doc = fitz.open(pdf_path)
                text = ""
                
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    pix = page.get_pixmap()
                    img_data = pix.tobytes("png")
                    
                    # Convert to PIL Image
                    import io
                    img = Image.open(io.BytesIO(img_data))
                    
                    # OCR
                    page_text = pytesseract.image_to_string(img)
                    text += page_text + "\n"
                
                doc.close()
                return text.strip()
                
            except Exception as e:
                print(f"OCR failed for {pdf_path.name}: {e}")
        
        return text or ""

    def _page_count(self, pdf_path: Path) -> int:
        """Best-effort page count (PyMuPDF if available)."""
        try:
            import fitz  # type: ignore
            with fitz.open(pdf_path) as doc:
                return int(doc.page_count)
        except Exception:
            return 0
    
    def _count_keywords(self, text: str, keywords: List[str]) -> int:
        """Count keyword matches in text"""
        text_lower = text.lower()
        hits = 0
        for kw in keywords:
            if re.search(rf'\b{re.escape(kw.lower())}\b', text_lower):
                hits += 1
        return hits
    
    def _has_contact(self, text: str) -> bool:
        """Check if text contains contact information"""
        return bool(EMAIL_RE.search(text)) or bool(PHONE_RE.search(text))

    def _word_stats(self, text: str) -> Tuple[float, float]:
        """Return (top_word_ratio, unique_ratio) over tokenized words"""
        tokens = [w for w in re.findall(r"[A-Za-z]+", text.lower()) if len(w) > 1]
        if not tokens:
            return 0.0, 0.0
        total = len(tokens)
        counts = Counter(tokens)
        top_ratio = counts.most_common(1)[0][1] / total
        unique_ratio = len(counts) / total
        return top_ratio, unique_ratio

    def _passive_voice_ratio(self, text: str) -> float:
        """Heuristic passive voice ratio (was/were/be + by)"""
        text_l = text.lower()
        matches = re.findall(r"\b(was|were|been|being|be)\b[^\n\r]{0,40}\bby\b", text_l)
        sentences = max(1, len(re.split(r"[\.!?]", text_l)))
        return min(1.0, len(matches) / sentences)

    def _long_paragraphs_ratio(self, text: str) -> float:
        """Ratio of paragraphs exceeding 4 lines or 600 chars"""
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
        if not paragraphs:
            return 0.0
        long_count = 0
        for p in paragraphs:
            lines = [l for l in p.splitlines() if l.strip()]
            if len(lines) > 4 or len(p) > 600:
                long_count += 1
        return long_count / len(paragraphs)

    def _columns_or_tables_signal(self, text: str) -> float:
        """Heuristic for two-column/table usage based on excessive spacing/box chars"""
        lines = [l for l in text.splitlines() if l.strip()]
        if not lines:
            return 0.0
        wide_space_lines = sum(1 for l in lines if re.search(r"\s{4,}", l))
        box_char_lines = sum(1 for l in lines if re.search(r"[│┆┇┃]|\|\s+\|", l))
        ratio = (wide_space_lines + box_char_lines) / len(lines)
        return min(1.0, ratio)

    def _date_gap_months(self, text: str) -> int:
        """Roughly estimate the largest employment gap in months from detected years/months"""
        # Extract YYYY or Mon YYYY
        years = []
        for m in re.findall(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*(\d{4})", text, flags=re.IGNORECASE):
            mon = m[0]
            yr = int(m[1])
            month = {
                'jan':1,'feb':2,'mar':3,'apr':4,'may':5,'jun':6,
                'jul':7,'aug':8,'sep':9,'oct':10,'nov':11,'dec':12
            }.get(mon.lower(), 6) if mon else 6
            years.append(yr * 12 + month)
        for y in re.findall(r"\b(19\d{2}|20\d{2})\b", text):
            years.append(int(y) * 12 + 6)
        if len(years) < 2:
            return 0
        years = sorted(set(years))
        gaps = [years[i+1] - years[i] for i in range(len(years)-1)]
        # Convert to months; ignore negative (shouldn't happen)
        max_gap = max([g for g in gaps if g > 0] or [0])
        # A continuous set of dates doesn't necessarily indicate employment, but as a heuristic
        return max_gap

    def _date_overlap_penalty(self, text: str) -> int:
        """Heuristic overlap detection on date ranges (Month Year - Month Year)."""
        ranges = []
        for m in re.finditer(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\s*[–-]\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})", text, flags=re.IGNORECASE):
            def m2i(mon: str) -> int:
                d = {'jan':1,'feb':2,'mar':3,'apr':4,'may':5,'jun':6,'jul':7,'aug':8,'sep':9,'oct':10,'nov':11,'dec':12}
                return d.get(mon.lower(), 6)
            s = int(m.group(2)) * 12 + m2i(m.group(1))
            e = int(m.group(4)) * 12 + m2i(m.group(3))
            if e < s:
                s, e = e, s
            ranges.append((s, e))
        if len(ranges) < 2:
            return 0
        overlaps = 0
        ranges.sort()
        prev_s, prev_e = ranges[0]
        for s, e in ranges[1:]:
            if s <= prev_e:  # overlap
                overlaps += 1
                prev_e = max(prev_e, e)
            else:
                prev_s, prev_e = s, e
        if overlaps >= 2:
            return 3
        if overlaps == 1:
            return 2
        return 0

    def _bullet_quality_penalty(self, text: str) -> int:
        """Penalize overly long bullets (>2 lines or >180 chars)"""
        lines = text.splitlines()
        bullets = [l for l in lines if re.match(r"^\s*([-*•])\s+", l)]
        if not bullets:
            return 0
        bad = 0
        for b in bullets:
            if len(b) > 180:
                bad += 1
        # crude multiline bullet check: bullet followed by indented line
        for i, l in enumerate(lines[:-1]):
            if re.match(r"^\s*([-*•])\s+", l) and re.match(r"^\s{4,}\S", lines[i+1]):
                bad += 1
        ratio = bad / max(1, len(bullets))
        if ratio >= 0.5:
            return 6
        if ratio >= 0.25:
            return 3
        return 0

    def _reverse_chronology_penalty(self, text: str) -> int:
        """Penalty if dates are not mostly in reverse chronological order."""
        # Extract year tokens in order of appearance
        years = [int(y) for y in re.findall(r"\b(19\d{2}|20\d{2})\b", text)]
        if len(years) < 3:
            return 0
        # Count inversions where a later item is greater (older to newer expected decreasing)
        inversions = 0
        for i in range(len(years) - 1):
            if years[i] < years[i+1]:
                inversions += 1
        ratio = inversions / (len(years) - 1)
        if ratio > 0.4:
            return 4
        if ratio > 0.2:
            return 2
        return 0

    def _experience_entry_penalty(self, sections: Dict[str, str]) -> int:
        """Penalty if too few experience entries (heuristic via bullets and date tokens)."""
        exp = sections.get("experience", "")
        if not exp:
            return 0
        bullets = len(re.findall(r"^\s*[-*•]\s+", exp, flags=re.MULTILINE))
        date_hits = len(re.findall(r"\b(19\d{2}|20\d{2})\b", exp))
        entries = max(bullets // 2, date_hits // 2)
        if entries >= 3:
            return 0
        if entries == 2:
            return 2
        return 4

    def _summary_length_penalty(self, text: str) -> int:
        """Penalty if summary/objective/profile paragraphs are too long."""
        m = re.search(r"(summary|objective|profile)\s*\n([\s\S]{0,800})", text, flags=re.IGNORECASE)
        if not m:
            return 0
        block = m.group(2)
        lines = [l for l in block.splitlines() if l.strip()]
        if len(lines) > 5:
            return 3
        longest = max((len(l) for l in lines), default=0)
        if longest > 180:
            return 2
        return 0

    def _quantified_bullet_ratio(self, text: str) -> float:
        """Ratio of bullets containing quantified results (%/$/numbers)."""
        bullets = [l.strip() for l in text.splitlines() if re.match(r"^\s*([-*•])\s+", l)]
        if not bullets:
            return 0.0
        quantified = 0
        for b in bullets:
            if re.search(r"\b\d+%|\$\d+[kKmM]?|\b\d{2,}\b", b):
                quantified += 1
            elif re.search(r"\b(increased|reduced|improved|grew|boosted|cut)\b", b, re.IGNORECASE) and re.search(r"\bby\b\s*\d+", b, re.IGNORECASE):
                quantified += 1
        return quantified / max(1, len(bullets))

    def _action_verb_bullet_ratio(self, text: str, action_verbs: List[str]) -> float:
        """Ratio of bullets starting with an action verb."""
        bullets = [l.strip() for l in text.splitlines() if re.match(r"^\s*([-*•])\s+", l)]
        if not bullets:
            return 0.0
        verbs = set([v.lower() for v in action_verbs])
        good = 0
        for b in bullets:
            m = re.match(r"^\s*[-*•]\s+([A-Za-z]+)", b)
            if not m:
                continue
            first = m.group(1).lower()
            if first in verbs:
                good += 1
        return good / max(1, len(bullets))

    def _buzzword_penalty(self, text: str) -> int:
        """Penalty for excessive vague buzzwords/resume cliches."""
        buzz = [
            "responsible for", "involved in", "synergy", "go-getter", "hard-working",
            "team player", "result-oriented", "detail-oriented", "self-starter",
            "problem-solver", "fast learner", "innovative", "dynamic", "motivated",
        ]
        text_l = text.lower()
        hits = sum(1 for b in buzz if b in text_l)
        if hits >= 6:
            return 5
        if hits >= 3:
            return 3
        if hits >= 1:
            return 1
        return 0

    def _first_person_penalty(self, text: str) -> int:
        """Penalty for 1st-person pronouns in resume body (I, me, my)."""
        if re.search(r"\b(i|me|my|mine)\b", text.lower()):
            return 2
        return 0

    def _file_name_penalty(self) -> int:
        """Penalty if file name is not human-name-like (e.g., lacks two alpha tokens)."""
        name = (self._ctx.get("filename") or "").lower()
        if not name:
            return 0
        base = re.sub(r"\.pdf$", "", name)
        tokens = [t for t in re.split(r"[_\-\s]+", base) if t.isalpha()]
        if len(tokens) < 2:
            return 2
        return 0

    def _page_count_penalty(self) -> int:
        """Penalty if pages not in [1,2]."""
        try:
            pc = int(self._ctx.get("page_count") or 0)
        except Exception:
            pc = 0
        if pc == 0:
            return 0
        if pc > 2:
            return 3
        return 0

    def _all_caps_penalty(self, text: str) -> int:
        """Penalty if too many ALL CAPS lines (shouting or headings overused)."""
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        if not lines:
            return 0
        def is_all_caps(line: str) -> bool:
            letters = re.findall(r"[A-Za-z]", line)
            if len(letters) < 5:
                return False
            return all(ch.isupper() for ch in letters)
        caps = sum(1 for l in lines if is_all_caps(l))
        ratio = caps / len(lines)
        if ratio > 0.15:
            return 3
        if ratio > 0.08:
            return 1
        return 0

    def _education_degree_penalty(self, sections: Dict[str, str]) -> int:
        """Penalty if education section lacks recognizable degree tokens."""
        edu = sections.get("education", "")
        if not edu:
            return 0
        tokens = [
            r"\b(bsc|bs|ba|msc|ms|ma|mba|phd|m\.sc|b\.sc|doctorate|bachelor|master|degree)\b"
        ]
        if any(re.search(p, edu, flags=re.IGNORECASE) for p in tokens):
            return 0
        return 2

    def _link_quality_penalty(self, text: str) -> int:
        """Penalty if links are low quality (only domain without profile path)."""
        text_l = text.lower()
        pen = 0
        if re.search(r"linkedin\.com(?!/in/)", text_l):
            pen += 1
        return min(2, pen)

    def _bullets_per_entry_penalty(self, sections: Dict[str, str]) -> int:
        """Penalty if average bullets per experience entry is out of [2,6]."""
        exp = sections.get("experience", "")
        if not exp:
            return 0
        bullets = len(re.findall(r"^\s*[-*•]\s+", exp, flags=re.MULTILINE))
        date_hits = len(re.findall(r"\b(19\d{2}|20\d{2})\b", exp))
        entries = max(1, max(bullets // 3, date_hits // 2))
        avg = bullets / max(1, entries)
        if avg < 2:
            return 2
        if avg > 6:
            return 2
        return 0
    
    def _date_consistency(self, text: str) -> float:
        """Calculate date format consistency score"""
        dates = DATE_RE.findall(text)
        if not dates:
            return 0.0
        uniq = len(set(dates))
        return min(1.0, uniq / 6.0)
    
    def _length_score(self, text: str) -> float:
        """Calculate length appropriateness score"""
        words = len(text.split())
        if 250 <= words <= 1200:
            return 1.0
        if 150 <= words < 250 or 1200 < words <= 2000:
            return 0.6
        return 0.3
    
    def _action_verbs_score(self, text: str) -> float:
        """Calculate action verbs usage score"""
        hits = self._count_keywords(text, self.action_verbs)
        if hits >= 10:
            return 1.0
        if hits >= 5:
            return 0.7
        if hits >= 2:
            return 0.4
        return 0.0
    
    def score_cv_text(self, cv_text: str, sector: str = None, auto_detect: bool = True) -> Dict:
        """Score CV text with enhanced features"""
        
        # Auto-detect sector if not provided
        if auto_detect and self.config.config.get("auto_sector_detection", True):
            detection = self.sector_detector.detect_sector(cv_text)
            if sector is None or detection.confidence > 0.3:
                sector = detection.detected_sector
                print(f"Auto-detected sector: {sector} (confidence: {detection.confidence:.2f})")
                if detection.alternatives:
                    print(f"Alternatives: {[f'{s} ({c:.2f})' for s, c in detection.alternatives]}")
        
        if sector is None:
            sector = "INFORMATION-TECHNOLOGY"  # Default
        
        # Check cache first
        config_version = f"{self.config.config['version']}-{self.config.config['rules_version']}"
        if self.config.config.get("cache_enabled", True):
            cached = self.cache.get_cached_score(cv_text, sector, config_version)
            if cached:
                cached["from_cache"] = True
                return cached
        
        # Calculate score
        breakdown = self._calculate_breakdown(cv_text, sector)
        recommendations = self._generate_recommendations(breakdown, sector)
        
        result = {
            "file": "text_input",
            "sector": sector,
            "score": breakdown.total,
            "breakdown": {
                "sections": breakdown.sections,
                "formatting": breakdown.formatting,
                "keywords": breakdown.keywords,
                "actions": breakdown.actions,
                "completeness": breakdown.completeness
            },
            "recommendations": recommendations,
            "impact_estimates": breakdown.impact_estimates,
            "config_version": config_version,
            "from_cache": False
        }
        
        # Cache result
        if self.config.config.get("cache_enabled", True):
            self.cache.cache_score(cv_text, sector, config_version, result)
        
        return result
    
    def _calculate_breakdown(self, cv_text: str, sector: str) -> ScoreBreakdown:
        """Calculate detailed score breakdown"""
        analyzer = self._get_analyzer(self.config.config.get("data_root", "data"))
        sections = analyzer.detect_sections(cv_text)
        # Normalize section heading synonyms
        if sections:
            normalized: Dict[str, str] = {}
            alias_map = {
                "work experience": "experience",
                "professional experience": "experience",
                "employment history": "experience",
                "projects": "experience",
                "education & certifications": "education",
                "academics": "education",
                "certifications": "education",
                "skills & tools": "skills",
                "technical skills": "skills",
                "contact information": "contact",
                "profile": "summary",
                "summary": "summary",
            }
            for key, val in list(sections.items()):
                low = key.strip().lower()
                target = alias_map.get(low)
                if target:
                    # merge content under canonical key
                    normalized[target] = (normalized.get(target, "") + "\n" + val).strip()
                else:
                    normalized[key] = val
            sections = normalized
        
        notes = []
        impact_estimates = {}
        penalties = 0
        
        # Sections score
        score_sections = 0
        section_weights = {"experience": 10, "education": 8, "skills": 7, "contact": 5}
        
        for section, weight in section_weights.items():
            if section in sections:
                score_sections += weight
            else:
                notes.append(f"Missing {section} section")
                impact_estimates[f"add_{section}_section"] = weight
        
        # Contact detection fix - check for email/phone even in sections
        if self._has_contact(cv_text):
            score_sections += 5  # Contact info bonus
        else:
            if "contact" not in sections:
                notes.append("Missing contact section")
                impact_estimates["add_contact_section"] = 5
        
        # Formatting score
        length_component = self._length_score(cv_text)
        date_component = self._date_consistency(cv_text)
        bullets_component = 1.0 if any(b in cv_text for b in ["•", "- ", "* "]) else 0.0
        
        score_formatting = round(length_component * 8 + date_component * 6 + bullets_component * 6)
        
        if length_component < 1.0:
            notes.append("CV length outside ideal range (250-1200 words)")
            impact_estimates["optimize_length"] = 3
        if date_component == 0.0:
            notes.append("Inconsistent or missing date formats")
            impact_estimates["fix_date_formats"] = 4
        if bullets_component == 0.0:
            notes.append("Limited use of bullet points")
            impact_estimates["add_bullet_points"] = 3

        # Additional formatting/content penalties
        # Columns/tables heuristic
        col_signal = self._columns_or_tables_signal(cv_text)
        if col_signal > 0.2:
            notes.append("Two-column/table-like layout detected; ATS parsing risk")
            penalties += 4

        # Header/footer contact risk
        hf_pen = header_footer_contact_penalty(cv_text)
        if hf_pen:
            notes.append("Avoid placing contact info solely in header/footer; move into body")
            penalties += hf_pen

        # Long paragraphs
        long_para = self._long_paragraphs_ratio(cv_text)
        if long_para > 0.3:
            notes.append("Paragraphs too long; break into concise bullets")
            penalties += 4

        # Bullet quality
        bq_pen = self._bullet_quality_penalty(cv_text)
        if bq_pen:
            notes.append("Overly long or multi-line bullet points")
            penalties += bq_pen

        # Hyphenation across lines
        hy_pen = hyphenation_penalty(cv_text)
        if hy_pen:
            notes.append("Avoid hyphenation across line breaks; may break ATS parsing")
            penalties += hy_pen

        # Reverse chronology
        rc_pen = self._reverse_chronology_penalty(cv_text)
        if rc_pen:
            notes.append("Dates not in reverse chronological order")
            penalties += rc_pen

        # Experience entries
        ee_pen = self._experience_entry_penalty(sections)
        if ee_pen:
            notes.append("Too few distinct experience entries")
            penalties += ee_pen

        # Summary length
        sl_pen = self._summary_length_penalty(cv_text)
        if sl_pen:
            notes.append("Summary/objective section too long")
            penalties += sl_pen

        # Quantified achievements ratio
        qa_ratio = self._quantified_bullet_ratio(cv_text)
        if qa_ratio < 0.3:
            notes.append("Low rate of quantified results in bullets (<30%)")
            penalties += 5

        # Action verb at bullet start ratio
        av_ratio = self._action_verb_bullet_ratio(cv_text, self.action_verbs)
        if av_ratio < 0.5:
            notes.append("Few bullets start with strong action verbs (<50%)")
            penalties += 3

        # Buzzword penalty
        bz_pen = self._buzzword_penalty(cv_text)
        if bz_pen:
            notes.append("Vague buzzwords detected; replace with concrete outcomes")
            penalties += bz_pen

        # Tense inconsistency
        ti_pen = tense_inconsistency_penalty(cv_text)
        if ti_pen:
            notes.append("Tense inconsistency between past and present across bullets")
            penalties += ti_pen

        # Keyword stuffing / skills block issues
        ks_pen = keyword_stuffing_penalty(cv_text, sector)
        if ks_pen:
            notes.append("Avoid raw keyword stuffing; use keywords in natural sentences")
            penalties += ks_pen
        sb_pen = skills_block_penalty(cv_text)
        if sb_pen:
            notes.append("Split very long comma-separated skills list into categorized bullets")
            penalties += sb_pen

        # First-person pronoun penalty
        fp_pen = self._first_person_penalty(cv_text)
        if fp_pen:
            notes.append("Avoid first-person pronouns in resume body")
            penalties += fp_pen

        # ALL CAPS overuse
        ac_pen = self._all_caps_penalty(cv_text)
        if ac_pen:
            notes.append("Excessive ALL CAPS usage; use standard capitalization")
            penalties += ac_pen

        # Education degree tokens
        ed_pen = self._education_degree_penalty(sections)
        if ed_pen:
            notes.append("Education section lacks clear degree notation (e.g., BSc, MSc, PhD)")
            penalties += ed_pen

        # Link quality
        lq_pen = max(self._link_quality_penalty(cv_text), link_validity_penalty(cv_text))
        if lq_pen:
            notes.append("Provide full LinkedIn profile URL (e.g., linkedin.com/in/username)")
            penalties += lq_pen

        # Non-ASCII heavy usage
        na_pen = non_ascii_penalty(cv_text)
        if na_pen:
            notes.append("Limit special characters/diacritics; ensure ATS-safe ASCII alternatives")
            penalties += na_pen

        # Spelling/grammar penalty (optional)
        sg_pen = spelling_grammar_penalty(cv_text)
        if sg_pen:
            notes.append("Reduce spelling/grammar issues for professional tone")
            penalties += sg_pen

        # Language mismatch
        lm_pen = language_mismatch_penalty(cv_text)
        if lm_pen:
            notes.append("Avoid mixing languages; keep resume in one language consistently")
            penalties += lm_pen

        # Bullets per entry balance
        bpe_pen = self._bullets_per_entry_penalty(sections)
        if bpe_pen:
            notes.append("Balance bullets per experience entry (2–6 recommended)")
            penalties += bpe_pen

        # Optional online link checks (do not fail build if network blocked)
        net_pen, broken = online_link_penalty_and_notes(cv_text)
        if net_pen:
            notes.append("Some profile links appear broken/unreachable")
            penalties += net_pen
        
        # Enhanced Keywords score with semantic matching
        enhanced_result = self.semantic_enhancer.enhanced_keyword_matching(cv_text, sector)
        kw_weight = self.config.get_weight("keywords", sector)
        
        # Calculate base score
        base_score = min(kw_weight, int((enhanced_result["total_score"] / 15.0) * kw_weight))
        
        # Apply modest enhancement factor (cap at 120% of base)
        enhancement_factor = min(enhanced_result["enhancement_factor"], 1.2)
        score_keywords = int(base_score * enhancement_factor)
        
        # Cap at sector weight to prevent inflation
        score_keywords = min(score_keywords, kw_weight)
        
        # Stricter cap: require at least 10 direct keyword matches for full component; else 70% cap
        try:
            direct_count = len(set(enhanced_result.get("direct_matches", [])))
        except Exception:
            direct_count = 0
        if direct_count < 10:
            score_keywords = min(score_keywords, int(kw_weight * 0.7))
        
        if score_keywords < kw_weight * 0.6:
            notes.append(f"Low {sector} keyword density")
            impact_estimates["add_sector_keywords"] = min(10, kw_weight - score_keywords)
        
        # Add semantic match details to notes
        if enhanced_result["semantic_matches"]:
            notes.append(f"Found {len(enhanced_result['semantic_matches'])} semantic skill matches")

        # Acronym + full form note
        acronym_full_form_note(cv_text, notes)
        
        # Actions score
        actions_component = self._action_verbs_score(cv_text)
        actions_weight = self.config.get_weight("actions", sector)
        score_actions = int(actions_component * actions_weight)
        # Stricter cap: require at least 6 action verbs; else 70% cap
        action_hits = self._count_keywords(cv_text, self.action_verbs)
        if action_hits < 6:
            score_actions = min(score_actions, int(actions_weight * 0.7))
        
        if score_actions < actions_weight * 0.5:
            notes.append("Limited use of action verbs")
            impact_estimates["add_action_verbs"] = min(8, actions_weight - score_actions)
        
        # Completeness score
        completeness = 0
        if EMAIL_RE.search(cv_text):
            completeness += 3
        if PHONE_RE.search(cv_text):
            completeness += 3
        if re.search(r"\b(linkedin\.com|github\.com|portfolio|behance|kaggle)\b", cv_text, re.IGNORECASE):
            completeness += 4
        
        if completeness < 6:
            notes.append("Missing contact/portfolio links")
            impact_estimates["add_contact_info"] = 6 - completeness
        
        # Repetition and passive voice penalties
        top_ratio, unique_ratio = self._word_stats(cv_text)
        if top_ratio > 0.06:
            notes.append("High word repetition; vary language")
            penalties += 3
        pv_ratio = self._passive_voice_ratio(cv_text)
        if pv_ratio > 0.15:
            notes.append("Excessive passive voice; prefer action-driven statements")
            penalties += 2

        # Date gap penalty (>12 months)
        gap_m = self._date_gap_months(cv_text)
        if gap_m >= 18:
            notes.append("Large timeline gaps detected; add context for gaps")
            penalties += 3

        # Date overlaps
        do_pen = self._date_overlap_penalty(cv_text)
        if do_pen:
            notes.append("Overlapping date ranges detected; clarify chronology")
            penalties += do_pen

        # Base total (max 90) minus penalties
        base_total = score_sections + score_formatting + score_keywords + score_actions + completeness - penalties
        total = min(90, base_total)
        
        # Bonus points for exceptional CVs (max +10)
        bonus = 0
        # Quantified achievements bonus
        if re.search(r'\b\d+%|\$\d+|increased.*\d+|reduced.*\d+|improved.*\d+', cv_text, re.IGNORECASE):
            bonus += 3
        # Multiple contact methods
        if EMAIL_RE.search(cv_text) and PHONE_RE.search(cv_text) and re.search(r'linkedin|github', cv_text, re.IGNORECASE):
            bonus += 2
        # Professional summary/objective
        if re.search(r'\b(summary|objective|profile)\b', cv_text, re.IGNORECASE):
            bonus += 2
        # Certifications mentioned
        if re.search(r'\b(certification|certified|certificate)\b', cv_text, re.IGNORECASE):
            bonus += 3
        
        total = min(100, total + bonus)
        
        return ScoreBreakdown(
            total=total,
            sections=score_sections,
            formatting=score_formatting,
            keywords=score_keywords,
            actions=score_actions,
            completeness=completeness,
            notes=notes,
            impact_estimates=impact_estimates
        )
    
    def _generate_recommendations(self, breakdown: ScoreBreakdown, sector: str) -> List[Dict]:
        """Generate detailed recommendations with impact estimates"""
        recommendations = []
        
        # Convert notes to recommendations
        for note in breakdown.notes:
            tr_note = self._to_tr(note)
            recommendations.append({
                "type": "improvement",
                "message": tr_note,
                "priority": "high" if ("Missing" in note or "eksik" in tr_note) else "medium"
            })
        
        # Add specific recommendations based on impact estimates
        for action, impact in breakdown.impact_estimates.items():
            if action == "add_experience_section":
                recommendations.append({
                    "type": "section",
                    "message": "Unvanlar, şirketler ve tarihler ile net bir Deneyim (Experience) bölümü ekleyin",
                    "impact": f"+{impact} puan",
                    "priority": "high"
                })
            elif action == "add_education_section":
                recommendations.append({
                    "type": "section", 
                    "message": "Derece, kurum ve mezuniyet tarihi içeren bir Eğitim (Education) bölümü ekleyin",
                    "impact": f"+{impact} puan",
                    "priority": "high"
                })
            elif action == "add_skills_section":
                recommendations.append({
                    "type": "section",
                    "message": "Teknik ve davranışsal becerileri içeren bir Skills bölümü ekleyin",
                    "impact": f"+{impact} puan", 
                    "priority": "high"
                })
            elif action == "add_sector_keywords":
                top_keywords = self.sector_detector.sector_keywords.get(sector, [])[:5]
                recommendations.append({
                    "type": "content",
                    "message": f"Daha fazla {sector} anahtar kelimesi ekleyin: {', '.join(top_keywords)}",
                    "impact": f"+{impact} puan",
                    "priority": "medium"
                })
            elif action == "add_action_verbs":
                recommendations.append({
                    "type": "content",
                    "message": "Daha fazla eylem fiili kullanın: led, developed, implemented, optimized, delivered",
                    "impact": f"+{impact} puan",
                    "priority": "medium"
                })
            elif action == "add_contact_info":
                recommendations.append({
                    "type": "contact",
                    "message": "E‑posta, telefon ve LinkedIn/GitHub bağlantıları ekleyin",
                    "impact": f"+{impact} puan",
                    "priority": "high"
                })
        
        # Remove duplicates and limit
        seen = set()
        unique_recs = []
        for rec in recommendations:
            key = rec["message"]
            if key not in seen:
                seen.add(key)
                unique_recs.append(rec)
        
        return unique_recs[:8]  # Top 8 recommendations
    
    def score_pdf_file(self, pdf_path: Path, sector: str = None, auto_detect: bool = True) -> Dict:
        """Score a PDF file with enhanced features"""
        try:
            # Extract text with OCR fallback
            text = self._extract_text_with_ocr_fallback(pdf_path)
            # Populate context
            self._ctx["filename"] = pdf_path.name
            try:
                self._ctx["page_count"] = str(self._page_count(pdf_path))
            except Exception:
                self._ctx["page_count"] = "0"
            
            if not text or len(text.strip()) < 50:
                return {
                    "file": str(pdf_path),
                    "sector": sector or "unknown",
                    "error": "Empty or unreadable text (possibly scanned PDF without OCR)",
                    "score": 0
                }
            
            # Score the text
            result = self.score_cv_text(text, sector, auto_detect)
            result["file"] = str(pdf_path)
            
            return result
            
        except Exception as e:
            return {
                "file": str(pdf_path),
                "sector": sector or "unknown", 
                "error": f"Processing error: {str(e)}",
                "score": 0
            }

    def _tokenize_keywords(self, text: str) -> List[str]:
        words = [w.lower() for w in re.findall(r"[A-Za-z][A-Za-z0-9+.#-]{1,}", text)]
        return [w for w in words if w not in self._stopwords and len(w) >= 3]

    def score_jd_fit_from_text(self, cv_result: Dict, jd_text: str) -> Dict:
        """Compute JD-CV fit: returns dict with fit score and missing/matched keywords.
        Deterministic: keyword overlap + optional semantic boost (capped)."""
        try:
            cv_path = Path(cv_result.get("file", ""))
            cv_text = self._extract_text_with_ocr_fallback(cv_path) if cv_path.exists() else ""
        except Exception:
            cv_text = ""

        sector = cv_result.get("sector") or "INFORMATION-TECHNOLOGY"
        sector_kw = [k.lower() for k in self.sector_detector.sector_keywords.get(sector, [])]
        jd_tokens = set(normalize_tokens(self._tokenize_keywords(jd_text)))
        cv_tokens = set(normalize_tokens(self._tokenize_keywords(cv_text)))

        # Required set = sector keywords present in JD OR top JD tokens
        req_keywords = set([kw for kw in sector_kw if kw in jd_tokens])
        if len(req_keywords) < 10:
            # augment with frequent JD tokens likely to be skills/tech
            counts = Counter([w for w in self._tokenize_keywords(jd_text) if len(w) <= 20])
            for w, c in counts.most_common(30):
                if c >= 2 and w not in req_keywords and w not in self._stopwords:
                    req_keywords.add(w)
                if len(req_keywords) >= 20:
                    break

        matched = sorted([w for w in req_keywords if w in cv_tokens])
        missing = sorted([w for w in req_keywords if w not in cv_tokens])

        # Must-have set: role preset + sector keywords present in JD (up to 12)
        role = infer_role_from_jd(jd_text)
        role_must = ROLE_PRESETS.get(role, [])
        must_have = []
        for w in role_must:
            if w in jd_tokens and w not in must_have:
                must_have.append(w)
        for w in sector_kw:
            if w in jd_tokens and w not in must_have:
                must_have.append(w)
        must_have = must_have[:12]
        # If still small, fill with frequent JD tokens
        if len(must_have) < 8:
            counts = Counter([w for w in normalize_tokens(self._tokenize_keywords(jd_text)) if len(w) <= 20])
            for w, _c in counts.most_common(40):
                if w not in must_have and w in req_keywords:
                    must_have.append(w)
                if len(must_have) >= 12:
                    break

        coverage = len(matched) / max(1, len(req_keywords))
        score = int(round(coverage * 100))

        # Semantic boost: if SBERT available, find semantic matches between JD tokens and CV sentences
        sem_boost = 0
        sem_count = 0
        try:
            if hasattr(self.semantic_enhancer, "model") and self.semantic_enhancer.model is not None and cv_text:
                sentences = [s.strip() for s in re.split(r"[.!?\n]", cv_text) if len(s.split()) > 4][:200]
                if sentences:
                    # Use JD tokens as proxy keywords for semantic match
                    semantic_result = self.semantic_enhancer.enhanced_keyword_matching(cv_text, sector)
                    sem_count = len(semantic_result.get("semantic_matches", []))
                    # conservative boost up to +10 based on semantic matches density
                    sem_boost = min(10, sem_count // 3)
        except Exception:
            sem_boost = 0

        total = max(0, min(100, score + sem_boost))
        cap_applied = False
        # Apply must-have cap: need at least 70% of must-have matched, else cap at 60
        if must_have:
            must_cov = len([w for w in must_have if w in cv_tokens]) / max(1, len(must_have))
            if must_cov < 0.7:
                total = min(total, 60)
                cap_applied = True
        return {
            "total": total,
            "base_overlap": score,
            "semantic_boost": sem_boost,
            "matched_keywords": matched[:30],
            "missing_keywords": missing[:30],
            "must_have": must_have[:20],
            "must_have_cap": cap_applied
        }

def main():
    parser = argparse.ArgumentParser(description="Enhanced ATS Scorer")
    parser.add_argument("--file", dest="single_file", type=str, help="Single PDF file to score")
    parser.add_argument("--sector", dest="sector", type=str, help="Sector for scoring")
    parser.add_argument("--no-auto-detect", action="store_true", help="Disable auto sector detection")
    parser.add_argument("--batch", action="store_true", help="Score all PDFs in data directory")
    parser.add_argument("--limit", type=int, default=10, help="Limit per sector for batch mode")
    parser.add_argument("--jd-file", type=str, default=None, help="Job Description file (txt/pdf)")
    parser.add_argument("--jd-text", type=str, default=None, help="Job Description text input")
    
    args = parser.parse_args()
    
    scorer = EnhancedATSScorer()
    
    if args.single_file:
        # Single file mode
        pdf_path = Path(args.single_file)
        if not pdf_path.exists():
            print(f"Error: File not found: {pdf_path}")
            return
        
        print(f"Scoring: {pdf_path.name}")
        result = scorer.score_pdf_file(pdf_path, args.sector, not args.no_auto_detect)

        # Optional JD matching
        jd_text = None
        if args.jd_text:
            jd_text = args.jd_text
        elif args.jd_file:
            jd_path = Path(args.jd_file)
            if jd_path.exists():
                try:
                    if jd_path.suffix.lower() == ".pdf":
                        # reuse OCR pipeline to extract JD from PDF
                        jd_text = scorer._extract_text_with_ocr_fallback(jd_path)
                    else:
                        jd_text = jd_path.read_text(encoding="utf-8", errors="ignore")
                except Exception as e:
                    print(f"JD read error: {e}")
        if jd_text and len(jd_text.strip()) > 30:
            jd_fit = scorer.score_jd_fit_from_text(result, jd_text)
            result["jd_fit"] = jd_fit
        
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
    elif args.batch:
        # Batch mode
        base = Path("data")
        data_root = base / "data" if (base / "data").exists() else base
        sector_dirs = [p for p in data_root.iterdir() if p.is_dir()]
        
        results = []
        for sector_dir in sector_dirs:
            sector = sector_dir.name
            pdfs = list(sector_dir.glob("*.pdf"))[:args.limit]
            
            for pdf in pdfs:
                print(f"Scoring: {sector} -> {pdf.name}")
                result = scorer.score_pdf_file(pdf, sector, not args.no_auto_detect)
                results.append(result)
        
        # Save results
        output_file = Path("ats_scores_enhanced.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({"results": results, "config_version": scorer.config.config["version"]}, 
                     f, indent=2, ensure_ascii=False)
        
        print(f"\nResults saved to: {output_file}")
        print(f"Total CVs scored: {len(results)}")
        
    else:
        print("Use --file for single file or --batch for multiple files")
        print("Example: python ats_scoring_enhanced.py --file cv.pdf --sector INFORMATION-TECHNOLOGY")

if __name__ == "__main__":
    main()
