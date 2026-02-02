using System.Runtime.InteropServices;
using CUE4Parse.Compression;
using Microsoft.JavaScript.NodeApi;

namespace game.src.classes;

[JSExport]
public class GameInterface
{
  private readonly BlitzFileProvider provider;

  public string[] files;
  public string[] tanksDirectoryNations;

  public GameInterface(string directory)
  {
    provider = new(directory);

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

    Directory.CreateDirectory("../../temp");
    Console.WriteLine($"../..temp/oodle.{libraryExtension}");
    var bool1 = OodleHelper.DownloadOodleDll($"../..temp/oodle.{libraryExtension}");
    Console.WriteLine(bool1);
    OodleHelper.Initialize($"../..temp/oodle.{libraryExtension}");

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

    var pda = provider.LoadPackageObject(
      "Blitz/Content/Tanks/USA/A97_M41_Bulldog/PDA_A97_M41_Bulldog.PDA_A97_M41_Bulldog"
    );

    Console.WriteLine(pda);
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
