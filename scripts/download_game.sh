TEMP="temp"

DEPOT_DOWNLOADER="$TEMP/DepotDownloader"
GAME="$TEMP/game"

set -a
source .env
set +a

$DEPOT_DOWNLOADER -os $STEAM_OS -app $STEAM_APP -username $STEAM_USERNAME -password $STEAM_PASSWORD -dir $GAME
