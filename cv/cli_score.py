#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CLI wrapper to score a single CV PDF using the deterministic ATS scorer.

Usage:
  python cv/cli_score.py --file /path/to/file.pdf --sector INFORMATION-TECHNOLOGY

Outputs a single-line JSON to stdout with keys:
  {
    "file": str,
    "sector": str,
    "score": int,
    "breakdown": {"sections": int, "formatting": int, "keywords": int, "actions": int, "completeness": int},
    "recommendations": [str]
  }
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from ats_scoring_system import score_pdf_file
from cv_analyzer_prototype import CVAnalyzer


def main() -> int:
    parser = argparse.ArgumentParser(description="Score a single CV PDF and output JSON")
    parser.add_argument("--file", required=True, help="Path to the CV PDF file")
    parser.add_argument("--sector", required=True, help="Sector name, e.g., INFORMATION-TECHNOLOGY")
    args = parser.parse_args()

    pdf_path = Path(args.file)
    if not pdf_path.exists():
        print(json.dumps({"error": f"File not found: {pdf_path}"}, ensure_ascii=False))
        return 1

    # The data root used by CVAnalyzer: prefer cv/data or cv/data/data
    data_root = Path(__file__).resolve().parent / "data"
    if not data_root.exists():
        # fallback to repo root cv/data if run from elsewhere
        data_root = Path("cv") / "data"

    analyzer = CVAnalyzer(str(data_root))
    try:
        result = score_pdf_file(pdf_path, args.sector, analyzer)
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        return 1

    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())


