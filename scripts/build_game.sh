cd packages/game
dotnet build --no-restore -clp:ErrorsOnly
find ./bin -type f | sort
