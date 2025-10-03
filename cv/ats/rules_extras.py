from __future__ import annotations

import re
from typing import List, Tuple

EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
PHONE_RE = re.compile(r"\b(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}\b")


def header_footer_contact_penalty(text: str) -> int:
    lines = [l for l in text.splitlines() if l.strip()]
    if not lines:
        return 0
    first = "\n".join(lines[:2])
    last = "\n".join(lines[-2:])
    mid = "\n".join(lines[2:-2]) if len(lines) > 4 else ""
    header_hit = (EMAIL_RE.search(first) or PHONE_RE.search(first)) and not (EMAIL_RE.search(mid) or PHONE_RE.search(mid))
    footer_hit = (EMAIL_RE.search(last) or PHONE_RE.search(last)) and not (EMAIL_RE.search(mid) or PHONE_RE.search(mid))
    return 2 if (header_hit or footer_hit) else 0


def hyphenation_penalty(text: str) -> int:
    if re.search(r"[A-Za-z]{3,}-\s*\n\s*[A-Za-z]{2,}", text):
        return 2
    return 0


def non_ascii_penalty(text: str) -> int:
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


def keyword_stuffing_penalty(text: str, sector: str) -> int:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    bad = 0
    for l in lines:
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


def skills_block_penalty(text: str) -> int:
    for m in re.finditer(r"skills\s*:?\s*(.+)", text, flags=re.IGNORECASE):
        tail = m.group(1)
        if tail.count(",") >= 12 and len(tail) > 200:
            return 2
    return 0


def language_mismatch_penalty(text: str) -> int:
    tr_chars = len(re.findall(r"[çğıöşüÇĞİÖŞÜ]", text))
    en_tech = len(re.findall(r"\b(python|java|react|cloud|aws|api|docker|kubernetes|machine learning)\b", text, flags=re.IGNORECASE))
    if tr_chars >= 20 and en_tech >= 10:
        return 2
    return 0


def acronym_full_form_note(text: str, notes: List[str]):
    pairs = {
        "SEO": "search engine optimization",
        "NLP": "natural language processing",
        "KPI": "key performance indicator",
        "ETL": "extract transform load",
        "CI/CD": "continuous integration",
        "API": "application programming interface",
    }
    tl = text.lower()
    for acro, full in pairs.items():
        if re.search(rf"\b{re.escape(acro)}\b", text) and full not in tl:
            notes.append(f"Consider writing '{acro} ({full})' at least once for ATS")


# ===== Additional quality rules =====
def tense_inconsistency_penalty(text: str) -> int:
    """Heuristic: mix of past-tense (-ed) and present-tense (manage/manage(s)/managing) in bullets."""
    bullets = [l.strip() for l in text.splitlines() if re.match(r"^\s*([-*•])\s+", l)]
    if not bullets:
        bullets = [l.strip() for l in text.splitlines() if l.strip()]
    past = sum(1 for b in bullets if re.search(r"\b\w+ed\b", b))
    present = sum(1 for b in bullets if re.search(r"\b(manage|lead|design|develop|implement|own|drive|build|optimize|coordinate|analyze|support)(s|ing)?\b", b, re.IGNORECASE))
    total = max(1, len(bullets))
    mix_ratio = min(1.0, (past > 0 and present > 0) * (min(past, present) / total))
    if mix_ratio > 0.4:
        return 3
    if mix_ratio > 0.25:
        return 2
    return 0


def link_validity_penalty(text: str) -> int:
    """Format-level link checks (no network). Ensure LinkedIn/GitHub URLs have path."""
    pen = 0
    if re.search(r"linkedin\.com(?!/in/)", text, flags=re.IGNORECASE):
        pen += 1
    if re.search(r"github\.com(?!/[^/\s]+)", text, flags=re.IGNORECASE):
        pen += 1
    return min(3, pen)


def spelling_grammar_penalty(text: str) -> int:
    """Optional: LanguageTool-based grammar/spell penalty. If lib missing, return 0."""
    try:
        import language_tool_python  # type: ignore
        tool = language_tool_python.LanguageToolPublicAPI('en-US')
        matches = tool.check(text[:20000])  # cap for speed
        density = len(matches) / max(1, len(text.split()))
        if density > 0.06:
            return 6
        if density > 0.03:
            return 3
        if density > 0.015:
            return 1
        return 0
    except Exception:
        return 0


SYNONYM_MAP = {
    # common tech abbrev ↔ full
    "js": "javascript",
    "py": "python",
    "ts": "typescript",
    "pgsql": "postgresql",
    "k8s": "kubernetes",
    "ci": "continuous integration",
    "cd": "continuous delivery",
}


def normalize_tokens(tokens: List[str]) -> List[str]:
    out: List[str] = []
    for t in tokens:
        low = t.lower()
        out.append(SYNONYM_MAP.get(low, low))
    return out


# ===== Role presets for JD must-have =====
ROLE_PRESETS = {
    "data scientist": ["python","pandas","scikit-learn","machine learning","statistics","sql","modeling","experimentation","notebook"],
    "data analyst": ["sql","excel","dashboard","tableau","powerbi","reporting","kpi","analysis","insights"],
    "backend engineer": ["python","java","node","api","rest","sql","docker","aws","microservices"],
    "frontend engineer": ["javascript","react","typescript","html","css","webpack","ui","accessibility"],
    "ml engineer": ["python","pytorch","tensorflow","mlops","docker","kubernetes","inference","deployment"],
}


def infer_role_from_jd(jd_text: str) -> str:
    tl = jd_text.lower()
    for role in ROLE_PRESETS.keys():
        if role in tl:
            return role
    # simple fallbacks
    if "backend" in tl:
        return "backend engineer"
    if "frontend" in tl or "react" in tl:
        return "frontend engineer"
    if "data scientist" in tl:
        return "data scientist"
    if "data analyst" in tl:
        return "data analyst"
    if "ml engineer" in tl or "machine learning engineer" in tl:
        return "ml engineer"
    return ""


def tense_inconsistency_by_experience(exp_text: str) -> int:
    if not exp_text:
        return 0
    bullets = [l.strip() for l in exp_text.splitlines() if l.strip()]
    past = sum(1 for b in bullets if re.search(r"\b\w+ed\b", b))
    present = sum(1 for b in bullets if re.search(r"\b(manage|lead|design|develop|implement|own|drive|build|optimize|coordinate|analyze|support)(s|ing)?\b", b, re.IGNORECASE))
    total = max(1, len(bullets))
    mix_ratio = min(1.0, (past > 0 and present > 0) * (min(past, present) / total))
    if mix_ratio > 0.4:
        return 3
    if mix_ratio > 0.25:
        return 2
    return 0


def online_link_penalty_and_notes(text: str, timeout: float = 3.0) -> Tuple[int, List[str]]:
    """Attempt HEAD requests to LinkedIn/GitHub URLs; penalize broken. No-op on network errors."""
    try:
        import re as _re
        import urllib.request as _url
        urls = _re.findall(r"https?://[^\s)]+", text)
        check = [u for u in urls if "linkedin.com" in u or "github.com" in u]
        broken: List[str] = []
        for u in check[:10]:  # cap
            try:
                req = _url.Request(u, method="HEAD")
                with _url.urlopen(req, timeout=timeout) as resp:
                    code = getattr(resp, 'status', 200)
                    if code >= 400:
                        broken.append(u)
            except Exception:
                broken.append(u)
        if len(broken) >= 3:
            return 3, broken
        if len(broken) == 2:
            return 2, broken
        if len(broken) == 1:
            return 1, broken
        return 0, []
    except Exception:
        return 0, []


