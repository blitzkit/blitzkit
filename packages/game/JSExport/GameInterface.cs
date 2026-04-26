using System.IO;
using System.Text.RegularExpressions;
using BlitzKit.Game.Models;
using CUE4Parse_Conversion.Textures;
using CUE4Parse.UE4.Assets.Exports.Texture;
using CUE4Parse.UE4.Objects.Engine;
using CUE4Parse.UE4.Objects.UObject;
using Microsoft.JavaScript.NodeApi;
using SkiaSharp;

namespace BlitzKit.Game.JSExport;

[JSExport]
public partial class GameInterface
{
  private readonly BlitzFileProvider provider;

  public string[] files;
  public string[] tanksDirectoryNations;

  public GameInterface(string directory)
  {
    provider = new(directory);

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
    foreach (var nation in tanksDirectoryNations)
    {
      var path = $"Blitz/Content/Tanks/{nation}/{tankId}/{pdaName}.{pdaName}";

      if (provider.TryLoadPackageObject<UPrimaryDataAsset>(path, out var pda))
      {
        FSoftObjectPath objectPath = pda.Get<FSoftObjectPath>("BigIcon");
        UTexture2D uTexture = objectPath.Load<UTexture2D>();
        CTexture? cTexture = uTexture.Decode(ETexturePlatform.DesktopMobile);

        if (cTexture is null)
        {
          return [];
        }

        SKBitmap bitmap = cTexture.ToSkBitmap();
        SKData data = bitmap.Encode(SKEncodedImageFormat.Webp, 80);
        byte[] bytes = data.ToArray();

        return bytes;
      }
    }

    return [];
  }

  [GeneratedRegex(@"T_UI_Flag_(\w+)_S")]
  private static partial Regex FlagNameRegex();

  public byte[] Flag(string nation)
  {
    var flagsBase = "Blitz/Content/UI/Textures/Flag/TankCard/";

    foreach (var path in provider.Files.Keys)
    {
      if (!path.StartsWith(flagsBase))
      {
        continue;
      }

      var fileName = Path.GetFileNameWithoutExtension(path);
      var match = FlagNameRegex().Match(fileName);

      if (
        match.Success
        && match.Groups[1].Value.Equals(nation, StringComparison.CurrentCultureIgnoreCase)
      )
      {
        if (provider.TryLoadPackageObject<UTexture2D>($"{path}.{fileName}", out var uTexture))
        {
          CTexture? cTexture = uTexture.Decode(ETexturePlatform.DesktopMobile);

          if (cTexture is null)
          {
            return [];
          }

          SKBitmap bitmap = cTexture.ToSkBitmap();
          SKData data = bitmap.Encode(SKEncodedImageFormat.Webp, 80);
          byte[] bytes = data.ToArray();

          return bytes;
        }

        return [];
      }
    }

    return [];
  }
}
