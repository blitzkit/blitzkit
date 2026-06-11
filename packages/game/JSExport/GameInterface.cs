using System.Text.Json;
using System.Text.RegularExpressions;
using BlitzKit.Game.Models;
using CUE4Parse_Conversion;
using CUE4Parse_Conversion.Materials;
using CUE4Parse_Conversion.Meshes;
using CUE4Parse_Conversion.Textures;
using CUE4Parse_Conversion.UEFormat.Enums;
using CUE4Parse.UE4.Assets.Exports;
using CUE4Parse.UE4.Assets.Exports.Engine;
using CUE4Parse.UE4.Assets.Exports.Material;
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

  readonly Dictionary<string, string> texturePaths = new();
  readonly string textureCache = "../../temp/textures.json";

  public void DiscoverTextures(string[] tankTags)
  {
    if (File.Exists(textureCache))
    {
      Console.WriteLine("Found textures cache");

      var content = File.ReadAllText(textureCache);
      var cached = JsonSerializer.Deserialize<Dictionary<string, string>>(content);

      foreach (var (key, value) in cached)
      {
        texturePaths[key] = value;
      }

      return;
    }

    Console.WriteLine("Textures cache not found, building...");

    var options = new ExporterOptions() { TextureFormat = ETextureFormat.Jpeg };

    foreach (var tag in tankTags)
    {
      var pda = provider.Discovered<UPrimaryDataAsset>(tag);

      foreach (var group in tankPartPrefixes.Values)
      {
        var dataTable = pda.Get<UDataTable>(group);

        foreach (var row in dataTable.RowMap.Values)
        {
          var visualData = row.Get<UObject>("VisualData");
          var meshSettings = visualData.Get<FStructFallback>("MeshSettings");

          foreach (var property in meshSettings.Properties)
          {
            if (meshSettings.TryGet<UStaticMesh>(property.Name.Text, out var mesh))
            {
              mesh.TryConvert(out var convertedMesh);

              var lod0 = convertedMesh.LODs.Find(lod => !lod.SkipLod);

              if (lod0 == null || lod0.Sections == null)
              {
                continue;
              }

              foreach (var section in lod0.Sections.Value)
              {
                if (section.Material == null)
                {
                  continue;
                }

                var materialInterface = section.Material.Load<UMaterialInterface>();

                if (materialInterface == null)
                {
                  continue;
                }

                var materialData = new MaterialData() { Parameters = new() };

                materialInterface.GetParams(materialData.Parameters, options.MaterialFormat);

                foreach (var parameterTexture in materialData.Parameters.Textures)
                {
                  if (MonoGltf.knownChannels.TryGetValue(parameterTexture.Key, out var channel))
                  {
                    var path = parameterTexture.Value.GetPathName();
                    var name = Path.GetFileNameWithoutExtension(path);

                    texturePaths[name] = path;
                  }
                }
              }
            }
          }
        }
      }
    }

    Console.WriteLine($"Discovered {texturePaths.Count} textures");
    Directory.CreateDirectory(Path.GetDirectoryName(textureCache));

    var json = JsonSerializer.Serialize(texturePaths);

    File.WriteAllText(textureCache, json);

    Console.WriteLine("Saved textures cache");
  }

  public List<string> Textures => [.. texturePaths.Keys];

  public byte[] Texture(string name)
  {
    var path = texturePaths[name];
    var texture = provider.LoadPackageObject<UTexture2D>(path);
    return provider.Image(texture);
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
    var meshes = new List<UStaticMesh>();

    foreach (var property in meshSettings.Properties)
    {
      var name = property.Name.Text;

      if (name == "CollisionMesh")
      {
        continue;
      }

      if (meshSettings.TryGet<UStaticMesh>(name, out var mesh))
      {
        meshes.Add(mesh);
      }
    }

    var gltf = new MonoGltf(meshes);

    return gltf.Write($"{tag}/{part}");
  }
}
