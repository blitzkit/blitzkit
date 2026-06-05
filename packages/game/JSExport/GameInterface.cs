using System.Text.RegularExpressions;
using BlitzKit.Game.Models;
using CUE4Parse_Conversion.Textures;
using CUE4Parse.Compression;
using CUE4Parse.UE4.Assets.Exports;
using CUE4Parse.UE4.Assets.Exports.Texture;
using CUE4Parse.UE4.Assets.Objects.Properties;
using CUE4Parse.UE4.IO.Objects;
using CUE4Parse.UE4.Objects.Engine;
using CUE4Parse.UE4.Objects.UObject;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.JavaScript.NodeApi;
using SkiaSharp;
using CUE4Parse.UE4.AssetRegistry.Objects;
using CUE4Parse.UE4.Readers;
using CUE4Parse.UE4.AssetRegistry.Readers;
using CUE4Parse.UE4.AssetRegistry;

namespace BlitzKit.Game.JSExport;

[JSExport]
public partial class GameInterface
{
  private readonly BlitzFileProvider provider;

  public HashSet<string> files;

  public GameInterface(string directory, string map, string temp)
  {
    provider = new(directory, map, temp);
    files = [.. provider.Files.Keys];
  }

  public HashSet<string> Files => files;

  public byte[] TankBigIcon(string tag)
  {
    var pda = provider.Discovered<UPrimaryDataAsset>(tag);
    var icon = pda.Get<FSoftObjectPath>("BigIcon");
    return provider.Image(icon);
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
            Console.WriteLine($"No flag found for {nation}");
            return [];
          }

          SKBitmap bitmap = cTexture.ToSkBitmap();
          SKData data = bitmap.Encode(SKEncodedImageFormat.Webp, 80);

          return data.ToArray();
        }

        Console.WriteLine($"No flag found for {nation}");
        return [];
      }
    }

    Console.WriteLine($"No flag found for {nation}");
    return [];
  }

  public byte[] ConsumableIcon(string tag)
  {
    var pda = provider.Discovered<UPrimaryDataAsset>(tag);
    var icon = pda.Get<FSoftObjectPath>("Icon");
    return provider.Image(icon);
  }

  public byte[] EquipmentIcon(string tag)
  {
    var pda = provider.Discovered<UPrimaryDataAsset>(tag);
    var icon = pda.Get<FSoftObjectPath>("Icon");
    return provider.Image(icon);
  }
}
