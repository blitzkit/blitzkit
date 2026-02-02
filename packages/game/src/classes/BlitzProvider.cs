using CUE4Parse.FileProvider;
using CUE4Parse.UE4.Versions;
using Microsoft.JavaScript.NodeApi;

namespace game.src.classes;

[JSExport]
public class BlitzProvider
{
  private readonly DefaultFileProvider provider;

  public string[] files;
  public string[] tanksDirectoryNations;

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

    files = [.. provider.Files.Keys];

    var tanksBase = "Blitz/Content/Tanks/";
    tanksDirectoryNations =
    [
      .. files
        .Where(path => path.StartsWith(tanksBase))
        .Select(path => path[tanksBase.Length..])
        .Select(path => path.Split('/')[0])
        .Where(nation => !nation.EndsWith(".uasset") && nation != "TankStub")
        .Distinct(),
    ];
  }

  public string[] Files => files;
  public string[] TanksDirectoryNations => tanksDirectoryNations;

  public byte[] TankBigIcon(string tankId, string pdaName)
  {
    return [];
  }
}
