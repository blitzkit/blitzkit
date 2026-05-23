using System.Runtime.InteropServices;
using CUE4Parse.Compression;
using CUE4Parse.FileProvider;
using CUE4Parse.MappingsProvider;
using CUE4Parse.UE4.Exceptions;
using CUE4Parse.UE4.Versions;
using CUE4Parse.Utils;

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
}
