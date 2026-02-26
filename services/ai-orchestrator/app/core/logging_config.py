"""Logging configuration for the Pulse AI orchestrator."""

import logging
import sys


def setup_logging(level: str = "INFO") -> None:
    """Configure structured logging to stdout for the pulse.* namespace."""
    formatter = logging.Formatter(
        fmt="%(asctime)s %(levelname)s [%(name)s] %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root = logging.getLogger("pulse")
    root.setLevel(getattr(logging, level.upper(), logging.INFO))
    root.addHandler(handler)
    root.propagate = False
