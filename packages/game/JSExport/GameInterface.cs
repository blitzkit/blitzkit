using System.Text.RegularExpressions;
using BlitzKit.Game.Models;
using CUE4Parse_Conversion;
using CUE4Parse_Conversion.Meshes;
using CUE4Parse_Conversion.Textures;
using CUE4Parse_Conversion.UEFormat.Enums;
using CUE4Parse.UE4.Assets.Exports;
using CUE4Parse.UE4.Assets.Exports.Engine;
using CUE4Parse.UE4.Assets.Exports.StaticMesh;
using CUE4Parse.UE4.Assets.Exports.Texture;
using CUE4Parse.UE4.Assets.Objects;
using CUE4Parse.UE4.Objects.Engine;
using CUE4Parse.UE4.Objects.UObject;
using Microsoft.JavaScript.NodeApi;
using SharpGLTF.Materials;
using SkiaSharp;

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

  readonly Dictionary<string, string> tankPartPrefixes = new()
  {
    { "chassis", "DT_Chassis" },
    { "hull", "DT_Hulls" },
    { "turret", "DT_Turrets" },
    { "gun", "DT_Guns" },
  };

  public byte[] TankPart(string tag, string part)
  {
    try
    {
      var pda = provider.Discovered<UPrimaryDataAsset>(tag);
      UDataTable? dataTable = null;

      foreach (var (prefix, name) in tankPartPrefixes)
      {
        if (!part.StartsWith(prefix))
        {
          continue;
        }

        dataTable = pda.Get<UDataTable>(name);
        break;
      }

      if (dataTable == null)
      {
        throw new ArgumentException($"Unknown tank part: {part}");
      }

      dataTable.TryGetDataTableRow(part, StringComparison.Ordinal, out var row);

      if (row == null)
      {
        throw new ArgumentException($"Unknown tank part: {part}");
      }

      var visualData = row.Get<UObject>("VisualData");
      var meshSettings = visualData.Get<FStructFallback>("MeshSettings");
      // var collisionMesh = meshSettings.Get<UStaticMesh>("CollisionMesh");
      var mesh = meshSettings.Get<UStaticMesh>("Mesh");

      var gltf = new MonoGltf(mesh);

      return gltf.Write($"{tag}/${part}");
    }
    catch (Exception e)
    {
      throw new Exception($"Failed to export tank part: {part}", e);
    }
  }
}
