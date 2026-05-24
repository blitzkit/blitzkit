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

namespace BlitzKit.Game.Models;

public class BlitzFileProvider : DefaultFileProvider
{
  public BlitzFileProvider(string directory, string map)
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
