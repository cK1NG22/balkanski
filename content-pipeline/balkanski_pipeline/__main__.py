"""Entrypoint: `python -m balkanski_pipeline` builds all configured languages."""

from __future__ import annotations

import sys

from .build import build_bosnian, build_croatian, build_serbian


def main() -> int:
    try:
        build_serbian()
        build_croatian()
        build_bosnian()
    except Exception as exc:
        print(f"\nPipeline failed: {exc}", file=sys.stderr)
        raise
    return 0


if __name__ == "__main__":
    sys.exit(main())
