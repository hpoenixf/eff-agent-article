#!/usr/bin/env python3
"""Report privacy-sensitive publication candidates without echoing matched values."""
from __future__ import annotations

import argparse
import re
from pathlib import Path

TEXT_SUFFIXES = {".md", ".mdx", ".html", ".htm", ".svg", ".json", ".txt", ".yaml", ".yml", ".toml", ".xml"}
SKIP_PARTS = {".git", "node_modules", ".next", ".contentlayer", "dist", "build"}
PATTERNS = {
    "email": re.compile(r"(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b"),
    "phone": re.compile(r"(?<!\d)(?:\+?86[- ]?)?1[3-9]\d{9}(?!\d)"),
    "government_id_like": re.compile(r"(?<!\d)\d{17}[\dXx](?!\d)"),
    "long_account_number": re.compile(r"(?<!\d)\d{16,19}(?!\d)"),
    "credential": re.compile(r"(?i)(?:sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:api[_ -]?key|password|client[_ -]?secret)\s*[:=]\s*[\"']?[^\s\"']{12,})"),
    "bearer_credential": re.compile(r"(?i)\bBearer\s+[A-Za-z0-9._~+/=-]{16,}"),
    "absolute_local_path": re.compile(r"/(?:Users|home|private|tmp)/[^\s)`\"']+"),
    "local_or_private_endpoint": re.compile(r"(?i)(?:https?://)?(?:localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?::\d+)?(?:/[^\s)\"']*)?"),
}


def candidates(path: Path):
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except (UnicodeDecodeError, OSError):
        return
    for number, line in enumerate(lines, 1):
        for kind, pattern in PATTERNS.items():
            if pattern.search(line):
                yield number, kind


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="+", type=Path, help="files or directories to review")
    args = parser.parse_args()
    files: set[Path] = set()
    for path in args.paths:
        if path.is_file():
            files.add(path)
        elif path.is_dir():
            for candidate in path.rglob("*"):
                if candidate.is_file() and candidate.suffix.lower() in TEXT_SUFFIXES and not (SKIP_PARTS & set(candidate.parts)):
                    files.add(candidate)
        else:
            print(f"MISSING {path}")
            return 2
    findings = 0
    for path in sorted(files):
        for line, kind in candidates(path) or ():
            print(f"REVIEW {path}:{line} [{kind}]")
            findings += 1
    print(f"Scanned {len(files)} text files; {findings} review candidate(s). Matches are not printed.")
    return 1 if findings else 0


if __name__ == "__main__":
    raise SystemExit(main())
