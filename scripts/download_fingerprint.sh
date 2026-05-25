TEMP="temp"
FILES="scripts/fingerprint.txt"

DEPOT_DOWNLOADER="$TEMP/DepotDownloader"
GAME="$TEMP/game"

set -a
source .env
set +a

$DEPOT_DOWNLOADER -os windows -app 3341250 -filelist $FILES -username $STEAM_USERNAME -password $STEAM_PASSWORD -dir $GAME