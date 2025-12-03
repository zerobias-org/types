#!/bin/bash

# Get published packages
packages=$(npx lerna list --since HEAD~1 --json --no-progress 2>/dev/null | grep -v '^lerna' | jq -c '.[]')

if [ -z "$packages" ]; then
  echo "No packages published"
  exit 0
fi

# Group packages by category
declare -A core_pkgs amazon_pkgs google_pkgs microsoft_pkgs atlassian_pkgs

while IFS= read -r pkg; do
  name=$(echo "$pkg" | jq -r '.name')
  version=$(echo "$pkg" | jq -r '.version')
  location=$(echo "$pkg" | jq -r '.location')
  changelog="https://github.com/${GITHUB_REPOSITORY}/blob/main/$(realpath --relative-to=. "$location")/CHANGELOG.md"

  entry="• \`${name}@${version}\` <${changelog}|changelog>"

  case "$name" in
    *core*) core_pkgs["$name"]="$entry" ;;
    *amazon*) amazon_pkgs["$name"]="$entry" ;;
    *google*) google_pkgs["$name"]="$entry" ;;
    *microsoft*) microsoft_pkgs["$name"]="$entry" ;;
    *atlassian*) atlassian_pkgs["$name"]="$entry" ;;
  esac
done <<< "$packages"

# Generate output
output=""

# Add actor info if available
if [ -n "$GITHUB_ACTOR" ]; then
  output+="Published by *@${GITHUB_ACTOR}*"
  output+=$'\n\n'
fi

if [ ${#core_pkgs[@]} -gt 0 ]; then
  output+="*:package: Core*"
  output+=$'\n'
  for entry in "${core_pkgs[@]}"; do
    output+="${entry}"
    output+=$'\n'
  done
  output+=$'\n'
fi

if [ ${#amazon_pkgs[@]} -gt 0 ]; then
  output+="*:aws: Amazon*"
  output+=$'\n'
  for entry in "${amazon_pkgs[@]}"; do
    output+="${entry}"
    output+=$'\n'
  done
  output+=$'\n'
fi

if [ ${#google_pkgs[@]} -gt 0 ]; then
  output+="*:gcp: Google*"
  output+=$'\n'
  for entry in "${google_pkgs[@]}"; do
    output+="${entry}"
    output+=$'\n'
  done
  output+=$'\n'
fi

if [ ${#microsoft_pkgs[@]} -gt 0 ]; then
  output+="*:azure: Microsoft*"
  output+=$'\n'
  for entry in "${microsoft_pkgs[@]}"; do
    output+="${entry}"
    output+=$'\n'
  done
  output+=$'\n'
fi

if [ ${#atlassian_pkgs[@]} -gt 0 ]; then
  output+="*:atlassian: Atlassian*"
  output+=$'\n'
  for entry in "${atlassian_pkgs[@]}"; do
    output+="${entry}"
    output+=$'\n'
  done
fi

printf '%s' "$output"
