using System.Runtime.InteropServices;
using CUE4Parse.Compression;
using CUE4Parse.FileProvider;
using CUE4Parse.MappingsProvider;
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
    )
    {
      MappingsContainer = new FileUsmapTypeMappingsProvider("../../packages/closed/blitz.usmap"),
    };

    provider.Initialize();
    provider.Mount();

    string libraryExtension;
    if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
    {
      libraryExtension = "dll";
    }
    else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
    {
      libraryExtension = "so";
    }
    else
    {
      throw new Exception("Unsupported OS");
    }

    OodleHelper.DownloadOodleDll($"temp/oodle.{libraryExtension}");
    OodleHelper.Initialize($"temp/oodle.{libraryExtension}");

    // Console.WriteLine(
    //   provider.Files.Keys.Contains(
    //     "Blitz/Content/Tanks/USA/A97_M41_Bulldog/PDA_A97_M41_Bulldog.uasset"
    //   )
    // );

    // var pda = provider.LoadPackageObject(
    //   "Blitz/Content/Tanks/USA/A97_M41_Bulldog/PDA_A97_M41_Bulldog.PDA_A97_M41_Bulldog"
    // );

    // Console.WriteLine(pda);

    files = [.. provider.Files.Keys];

    Console.WriteLine(string.Join("\n", files));

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
    foreach (var nation in tanksDirectoryNations)
    {
      var path = $"Blitz/Content/Tanks/{nation}/{tankId}/{pdaName}.{pdaName}";

      Console.WriteLine(path);

      if (provider.TryLoadPackageObject(path, out var pda))
      {
        Console.WriteLine(pda);
        Console.WriteLine(pda.GetType());

        return [];
      }
      else
      {
        continue;
      }
    }

    throw new FileNotFoundException($"Tank {tankId}/{pdaName} not found in any nation");
  }
}
