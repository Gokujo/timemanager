#!/bin/bash
# Script to calculate the next version (patch version + 1)
# Usage: ./get-next-version.sh [base_version]
# If base_version is not provided, it will use get-latest-version.sh to find it
# Returns: Next version number (e.g., "0.2.7")

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GET_LATEST_VERSION="$SCRIPT_DIR/get-latest-version.sh"

if [ -n "$1" ]; then
    BASE_VERSION="${1#v}"  # Remove 'v' prefix if present
else
    # Get latest version using the helper script
    BASE_VERSION=$("$GET_LATEST_VERSION")
fi

# Remove any suffixes (e.g., "0.2.6-beta" -> "0.2.6")
BASE_VERSION=$(echo "$BASE_VERSION" | sed 's/-.*$//' | sed 's/\+.*$//' | sed 's/_.*$//')

# Validate version format (must be X.Y.Z)
if ! [[ "$BASE_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: Invalid version format: $BASE_VERSION (expected X.Y.Z)" >&2
    exit 1
fi

# Split version into parts
IFS='.' read -r MAJOR MINOR PATCH <<< "$BASE_VERSION"

# Increment patch version
PATCH=$((PATCH + 1))

# Output next version
echo "${MAJOR}.${MINOR}.${PATCH}"

