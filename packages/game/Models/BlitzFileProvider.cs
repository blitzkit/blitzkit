using System.Runtime.InteropServices;
using CUE4Parse_Conversion.Textures;
using CUE4Parse.Compression;
using CUE4Parse.FileProvider;
using CUE4Parse.MappingsProvider;
using CUE4Parse.UE4.Assets.Exports.Texture;
using CUE4Parse.UE4.Exceptions;
using CUE4Parse.UE4.Objects.Engine;
using CUE4Parse.UE4.Objects.UObject;
using CUE4Parse.UE4.Versions;
using CUE4Parse.Utils;
using SkiaSharp;
using CUE4Parse.UE4.Readers;
using CUE4Parse.UE4.AssetRegistry;
using System.Text.RegularExpressions;
using CUE4Parse.UE4.Assets.Exports;

namespace BlitzKit.Game.Models;

public partial class BlitzFileProvider : DefaultFileProvider
{
  [GeneratedRegex(@"\(GameplayTags=\(\(TagName=""(.+)""\)\)\)")]
  private static partial Regex GameplayTagsRegex();

  private readonly Dictionary<string, string> discovered = [];

  public BlitzFileProvider(string directory, string map, string temp)
    : base(
      directory: directory,
      searchOption: SearchOption.AllDirectories,
      versions: new(EGame.GAME_UE5_5),
      pathComparer: StringComparer.OrdinalIgnoreCase
    )
  {
    MappingsContainer = new FileUsmapTypeMappingsProvider(map);

    Initialize();
    Mount();

    string oodlePath = $"{temp}/oodle.so";
    OodleHelper.DownloadOodleDll(ref oodlePath!);
    OodleHelper.Initialize(oodlePath);

    if (TryGetGameFile("Blitz/AssetRegistry.bin", out var file))
    {
      var bytes = file.Read();
      var archive = new FByteArchive(file.Path, bytes, Versions);
      var state = new FAssetRegistryState(archive);

      foreach (var asset in state.PreallocatedAssetDataBuffers)
      {
        if (asset.TagsAndValues.TryGetValue("DiscoveryTags", out var tags))
        {
          var match = GameplayTagsRegex().Match(tags);

          if (!match.Success)
          {
            continue;
          }

          var tag = match.Groups[1].Value;
          discovered[tag] = asset.ObjectPath;
        }
      }
    }
  }

  public T Discovered<T>(string path) where T : UObject
  {
    return LoadPackageObject<T>(discovered[path]);
  }

  public UPrimaryDataAsset PDA(string path)
  {
    var name = Path.GetFileNameWithoutExtension(path);
    var combined = $"{path}.{name}";
    return LoadPackageObject<UPrimaryDataAsset>(combined);
  }

  public byte[] Image(FSoftObjectPath path)
  {
    var uTexture = path.Load<UTexture2D>();
    return Image(uTexture);
  }

  private readonly SKEncodedImageFormat imageFormat = SKEncodedImageFormat.Webp;
  private readonly int imageQuality = 80;

  public byte[] Image(UTexture2D uTexture)
  {
    var cTexture = uTexture.Decode(ETexturePlatform.DesktopMobile);

    ArgumentNullException.ThrowIfNull(cTexture);

    var bitmap = cTexture.ToSkBitmap();
    var data = bitmap.Encode(imageFormat, imageQuality);

    return data.ToArray();
  }
}
