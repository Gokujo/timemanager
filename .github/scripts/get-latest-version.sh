#!/bin/bash
# Script to get the latest version from release branches or tags
# Usage: ./get-latest-version.sh [--format=full|version-only]
# Returns: Latest version number (e.g., "0.2.6" or "v0.2.6" if format=full)

set -e

FORMAT="${1:-version-only}"
if [[ "$FORMAT" == "--format=full" ]]; then
    FORMAT="full"
else
    FORMAT="version-only"
fi

# Fetch all branches and tags to ensure we have the latest information
git fetch --tags --prune --prune-tags 2>/dev/null || true
git fetch origin --prune 2>/dev/null || true

# Try to get from release branches first (releases/v*)
LATEST_BRANCH_VERSION=$(git branch -r 2>/dev/null | \
    grep -E "origin/releases/v[0-9]+\.[0-9]+\.[0-9]+" | \
    sed 's|origin/releases/v||' | \
    sort -V | \
    tail -1)

# Try to get from tags (v0.0.* pattern)
LATEST_TAG_VERSION=$(git tag -l "v[0-9]*\.[0-9]*\.[0-9]*" 2>/dev/null | \
    sed 's/^v//' | \
    sort -V | \
    tail -1)

# Compare and use the latest version
if [ -n "$LATEST_BRANCH_VERSION" ] && [ -n "$LATEST_TAG_VERSION" ]; then
    # Both exist, compare them
    if [ "$(printf '%s\n' "$LATEST_BRANCH_VERSION" "$LATEST_TAG_VERSION" | sort -V | tail -1)" = "$LATEST_BRANCH_VERSION" ]; then
        LATEST_VERSION="$LATEST_BRANCH_VERSION"
    else
        LATEST_VERSION="$LATEST_TAG_VERSION"
    fi
elif [ -n "$LATEST_BRANCH_VERSION" ]; then
    LATEST_VERSION="$LATEST_BRANCH_VERSION"
elif [ -n "$LATEST_TAG_VERSION" ]; then
    LATEST_VERSION="$LATEST_TAG_VERSION"
else
    # No version found, default to dev
    LATEST_VERSION="dev"
fi

# Remove any suffixes (e.g., "0.2.6-beta" -> "0.2.6")
LATEST_VERSION=$(echo "$LATEST_VERSION" | sed 's/-.*$//' | sed 's/\+.*$//' | sed 's/_.*$//')

# Output based on format
if [ "$FORMAT" = "full" ]; then
    echo "v${LATEST_VERSION}"
else
    echo "$LATEST_VERSION"
fi

