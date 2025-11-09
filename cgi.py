"""
Compatibility shim for deprecated stdlib cgi module removed in Python 3.13.
Provides parse_header used by legacy dependencies.
"""

from typing import Dict, Tuple


def parse_header(value: str) -> Tuple[str, Dict[str, str]]:
    """
    Minimal implementation of cgi.parse_header.

    Splits a Content-Type style header into the main value and parameters.
    """
    if not value:
        return "", {}

    parts = [part.strip() for part in value.split(";")]
    key = parts[0]
    params: Dict[str, str] = {}

    for item in parts[1:]:
        if "=" in item:
            k, v = item.split("=", 1)
            params[k.strip()] = v.strip().strip('"')

    return key, params
