REPO_USER="SteamRE"
REPO_NAME="DepotDownloader"
TEMP="temp"

OUT="$TEMP/$REPO_NAME"
ZIP="$TEMP/$REPO_NAME.zip"

URL=$(
  curl -s "https://api.github.com/repos/$REPO_USER/$REPO_NAME/releases/latest" \
    | jq -r '.assets[]
      | select(.name | contains("linux-x64"))
      | .browser_download_url' \
    | head -n 1
)

mkdir -p "$TEMP"
curl -L "$URL" -o "$ZIP"
unzip -p "$ZIP" "$REPO_NAME" > "$OUT"
rm "$ZIP"

chmod +x "$OUT"