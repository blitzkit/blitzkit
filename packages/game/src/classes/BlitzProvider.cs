using CUE4Parse.FileProvider;
using CUE4Parse.UE4.Versions;
using Microsoft.JavaScript.NodeApi;

namespace game.src.classes;

[JSExport]
public class BlitzProvider
{
    private readonly DefaultFileProvider provider;

    public BlitzProvider(string directory)
    {
        provider = new(
            directory: directory,
            searchOption: SearchOption.AllDirectories,
            versions: new(EGame.GAME_UE5_5),
            pathComparer: StringComparer.OrdinalIgnoreCase
        );
        provider.Initialize();
        provider.Mount();
    }

    public string[] Files()
    {
        return provider.Files.Keys.ToArray();
    }
}
