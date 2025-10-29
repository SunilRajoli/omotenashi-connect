#!/usr/bin/env bash
set -e
if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Please install PostgreSQL client."
fi
