using BlitzKit.Game.Models;
using CUE4Parse_Conversion.Textures;
using CUE4Parse.UE4.Assets.Exports.Texture;
using CUE4Parse.UE4.Objects.Engine;
using CUE4Parse.UE4.Objects.UObject;
using Microsoft.JavaScript.NodeApi;
using SkiaSharp;

namespace BlitzKit.Game.JSExport;

[JSExport]
public class GameInterface
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
          continue;
        }

        SKBitmap bitmap = cTexture.ToSkBitmap();
        SKData data = bitmap.Encode(SKEncodedImageFormat.Webp, 80);
        byte[] bytes = data.ToArray();

        return bytes;
      }
      else
      {
        continue;
      }
    }

    return [];
  }
}
