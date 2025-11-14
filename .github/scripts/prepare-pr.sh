#!/bin/bash
# Script to prepare PR description with changelog information
# Usage: ./prepare-pr.sh [version] [previous_version]

set -e

CHANGELOG_FILE="CHANGELOG.md"
TEMPLATE_FILE=".github/pull_request_template.md"

# Get version from branch name if not provided
if [ -z "$1" ]; then
    BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
    if [[ "$BRANCH_NAME" =~ ^releases/v ]]; then
        VERSION=$(echo "$BRANCH_NAME" | sed 's/^releases\/v//')
    else
        echo "Error: No version provided and not on a release branch"
        echo "Usage: $0 [version] [previous_version]"
        echo "Example: $0 0.2.6 0.2.5"
        exit 1
    fi
else
    VERSION="${1#v}"  # Remove 'v' prefix if present
fi

# Find previous version if not provided
if [ -z "$2" ]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    GET_LATEST_VERSION="$SCRIPT_DIR/get-latest-version.sh"
    
    # Use helper script to get latest version
    if [ -f "$GET_LATEST_VERSION" ]; then
        LATEST_VERSION=$("$GET_LATEST_VERSION")
        # If current version is greater than latest, use latest as previous
        if [ "$(printf '%s\n' "$VERSION" "$LATEST_VERSION" | sort -V | tail -1)" = "$VERSION" ] && [ "$VERSION" != "$LATEST_VERSION" ]; then
            PREVIOUS_VERSION="$LATEST_VERSION"
        else
            # Current version is latest or less, find previous from branches/tags
            PREVIOUS_VERSION=$(git branch -r 2>/dev/null | grep -E "releases/v[0-9]+\.[0-9]+\.[0-9]+" | sed 's|origin/releases/v||' | sort -V | awk -v current="$VERSION" '$1 < current {prev=$1} END {print prev}')
        fi
    else
        # Fallback: try to get from git branches
        PREVIOUS_VERSION=$(git branch -r 2>/dev/null | grep -E "releases/v[0-9]+\.[0-9]+\.[0-9]+" | sed 's|origin/releases/v||' | sort -V | awk -v current="$VERSION" '$1 < current {prev=$1} END {print prev}')
    fi
    
    # Fallback: get from CHANGELOG.md
    if [ -z "$PREVIOUS_VERSION" ] && [ -f "$CHANGELOG_FILE" ]; then
        PREVIOUS_VERSION=$(grep -E "^## \[[0-9]+\.[0-9]+\.[0-9]+\]" "$CHANGELOG_FILE" | head -2 | tail -1 | sed 's/## \[\(.*\)\].*/\1/')
    fi
    
    if [ -z "$PREVIOUS_VERSION" ]; then
        PREVIOUS_VERSION="0.0.0"
        echo "Warning: Could not determine previous version, using 0.0.0"
    fi
else
    PREVIOUS_VERSION="${2#v}"  # Remove 'v' prefix if present
fi

echo "Version: v${VERSION}"
echo "Previous version: v${PREVIOUS_VERSION}"

# Extract changelog entry
if [ -f "$CHANGELOG_FILE" ]; then
    CHANGELOG_ENTRY=$(awk -v version="$VERSION" '
        BEGIN { in_section = 0; found = 0 }
        /^## \[/ {
            if (in_section) exit
            if ($0 ~ "\\[" version "\\]") {
                in_section = 1
                found = 1
                print
                next
            }
        }
        in_section {
            if (/^## \[/) exit
            print
        }
    ' "$CHANGELOG_FILE")
    
    if [ -z "$CHANGELOG_ENTRY" ]; then
        echo "Warning: No changelog entry found for version $VERSION"
    fi
else
    echo "Warning: $CHANGELOG_FILE not found"
    CHANGELOG_ENTRY=""
fi

# Get current date
CURRENT_DATE=$(date +%Y-%m-%d)

# Replace placeholders in template
if [ -f "$TEMPLATE_FILE" ]; then
    sed -e "s/{VERSION}/[${VERSION}](https://github.com/Gokujo/timemanager/tree/releases\/v${VERSION})/g" \
        -e "s/{PREVIOUS_VERSION}/[${PREVIOUS_VERSION}](https://github.com/Gokujo/timemanager/tree/releases\/v${PREVIOUS_VERSION})/g" \
        -e "s/{DATE}/${CURRENT_DATE}/g" \
        "$TEMPLATE_FILE" > /tmp/pr_description.md
    
    # Insert changelog entry if found
    if [ -n "$CHANGELOG_ENTRY" ]; then
        # Create a temporary file with the changelog entry
        echo "$CHANGELOG_ENTRY" > /tmp/changelog_entry.md
        
        # Replace the placeholder section in the template
        # Find the ```markdown block and replace everything until ``` with the actual changelog
        awk -v version="$VERSION" '
            BEGIN { in_markdown = 0; changelog_printed = 0 }
            /^```markdown$/ {
                in_markdown = 1
                print
                # Print the changelog entry
                while ((getline line < "/tmp/changelog_entry.md") > 0) {
                    print line
                }
                close("/tmp/changelog_entry.md")
                changelog_printed = 1
                next
            }
            in_markdown && /^```$/ {
                in_markdown = 0
                print
                next
            }
            in_markdown {
                # Skip lines inside the markdown block (placeholder content)
                next
            }
            { print }
        ' /tmp/pr_description.md > /tmp/pr_description_final.md
        mv /tmp/pr_description_final.md /tmp/pr_description.md
    fi
    
    echo ""
    echo "PR Description prepared:"
    echo "========================"
    cat /tmp/pr_description.md
    echo ""
    echo "========================"
    echo "PR Description saved to: /tmp/pr_description.md"
    echo "You can copy this to your PR description."
else
    echo "Error: Template file $TEMPLATE_FILE not found"
    exit 1
fi

