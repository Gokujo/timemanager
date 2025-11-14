#!/bin/bash
# Script to extract changelog entries between versions
# Usage: ./extract-changelog.sh <current_version> <previous_version>

set -e

CURRENT_VERSION="${1:-}"
PREVIOUS_VERSION="${2:-}"
CHANGELOG_FILE="CHANGELOG.md"

if [ -z "$CURRENT_VERSION" ] || [ -z "$PREVIOUS_VERSION" ]; then
    echo "Usage: $0 <current_version> <previous_version>"
    echo "Example: $0 0.2.6 0.2.5"
    exit 1
fi

# Remove 'v' prefix if present
CURRENT_VERSION="${CURRENT_VERSION#v}"
PREVIOUS_VERSION="${PREVIOUS_VERSION#v}"

if [ ! -f "$CHANGELOG_FILE" ]; then
    echo "Error: $CHANGELOG_FILE not found"
    exit 1
fi

# Extract changelog section for current version
# Look for the version header and extract until the next version or end of file
CURRENT_SECTION=$(awk -v version="$CURRENT_VERSION" '
    BEGIN { in_section = 0; found = 0 }
    /^## \[/ {
        if (in_section) exit
        if ($0 ~ "\\[" version "\\]") {
            in_section = 1
            found = 1
        }
    }
    in_section { print }
' "$CHANGELOG_FILE")

if [ -z "$CURRENT_SECTION" ]; then
    echo "Warning: No changelog entry found for version $CURRENT_VERSION"
    exit 1
fi

echo "$CURRENT_SECTION"

