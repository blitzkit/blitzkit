cd packages/game
dotnet build -clp:ErrorsOnly
find ./bin -type f | sort
