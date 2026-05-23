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
using SharpGLTF.Schema2;
using SkiaSharp;

namespace BlitzKit.Game.JSExport;

[JSExport]
public partial class GameInterface
{
  private readonly BlitzFileProvider provider;

  public HashSet<string> files;
  public string[] tanksDirectoryNations;

  public GameInterface(string directory, string map)
  {
    provider = new(directory, map);

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

    string oodlePath = "temp/oodle.so";
    OodleHelper.DownloadOodleDll(ref oodlePath);
    OodleHelper.Initialize(oodlePath);
  }

  public HashSet<string> Files => files;
  public string[] TanksDirectoryNations => tanksDirectoryNations;

  public byte[] TankBigIcon(string tankId, string pdaName)
  {
    foreach (var nation in tanksDirectoryNations)
    {
      var path = $"Blitz/Content/Tanks/{nation}/{tankId}/{pdaName}.{pdaName}";

      if (provider.TryLoadPackageObject<UPrimaryDataAsset>(path, out var pda))
      {
        var icon = pda.Get<FSoftObjectPath>("BigIcon");
        var uTexture = icon.Load<UTexture2D>();
        var cTexture = uTexture.Decode(ETexturePlatform.DesktopMobile);

        if (cTexture is null)
        {
          Console.WriteLine($"No tank big icon found for {tankId} in {pdaName}");
          return [];
        }

        var bitmap = cTexture.ToSkBitmap();
        var data = bitmap.Encode(SKEncodedImageFormat.Webp, 80);

        return data.ToArray();
      }
    }

    Console.WriteLine($"No tank big icon found for {tankId} in {pdaName}");
    return [];
  }

  [GeneratedRegex(@"T_UI_Flag_(\w+)_S")]
  private static partial Regex FlagNameRegex();

  private readonly string flagsPrefix = "Blitz/Content/UI/Textures/Flag/TankCard/";

  public byte[]? Flag(string nation)
  {
    foreach (var path in files)
    {
      if (!path.StartsWith(flagsPrefix))
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
          return Image(uTexture);
        }

        Console.WriteLine($"No flag found for {nation}");
        return null;
      }
    }

    Console.WriteLine($"No flag found for {nation}");
    return null;
  }

  private static readonly string equipmentPDAPrefix =
    "Blitz/Content/TanksStuff/Equipment/PDA_Equipment";
  private static readonly string equipmentPDASuffix = ".uasset";

  public byte[]? EquipmentIcon(string[] names)
  {
    List<string> candidates = [];

    foreach (var name in names)
    {
      candidates.AddRange([
        $"{equipmentPDAPrefix}{name}{equipmentPDASuffix}",
        $"{equipmentPDAPrefix}_{name}{equipmentPDASuffix}",
      ]);
    }

    string? candidate = null;
    foreach (var c in candidates)
    {
      if (!files.Contains(c))
      {
        continue;
      }

      candidate = c;
      break;
    }

    if (candidate is null)
    {
      Console.WriteLine($"No equipment pda found for {string.Join(", ", names)}");
      return null;
    }

    var pda = PDA(candidate);
    var icon = pda.Get<FSoftObjectPath>("Icon");

    return Image(icon);
  }

  private UPrimaryDataAsset PDA(string path)
  {
    var name = Path.GetFileNameWithoutExtension(path);
    var fullPath = $"{path}.{name}";
    var pda = provider.LoadPackageObject<UPrimaryDataAsset>(fullPath);

    return pda;
  }

  private readonly SKEncodedImageFormat imageFormat = SKEncodedImageFormat.Webp;
  private readonly int imageQuality = 80;

  private byte[]? Image(UTexture2D uTexture)
  {
    var cTexture = uTexture.Decode(ETexturePlatform.DesktopMobile);

    if (cTexture is null)
    {
      Console.WriteLine($"Could not extract icon for {uTexture}");
      return null;
    }

    var bitmap = cTexture.ToSkBitmap();
    var data = bitmap.Encode(imageFormat, imageQuality);

    return data.ToArray();
  }

  private byte[]? Image(FSoftObjectPath image)
  {
    var uTexture = image.Load<UTexture2D>();
    return Image(uTexture);
  }
}
