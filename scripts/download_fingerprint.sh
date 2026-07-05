TEMP="temp"
FILES="temp/fingerprint.txt"

DEPOT_DOWNLOADER="$TEMP/DepotDownloader"
GAME="$TEMP/game"

set -a
source .env
set +a

echo $STEAM_FINGERPRINT > $FILES
$DEPOT_DOWNLOADER -os $STEAM_OS -app $STEAM_APP -filelist $FILES -username $STEAM_USERNAME -password $STEAM_PASSWORD -dir $GAME
