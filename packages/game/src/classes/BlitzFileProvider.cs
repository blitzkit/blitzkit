using CUE4Parse.MappingsProvider;
using CUE4Parse.UE4.Versions;

namespace game.src.classes;

public class BlitzFileProvider : SynchronousFileProvider
{
  public BlitzFileProvider(string directory)
    : base(
      directory: directory,
      searchOption: SearchOption.AllDirectories,
      versions: new(EGame.GAME_UE5_5),
      pathComparer: StringComparer.OrdinalIgnoreCase
    )
  {
    MappingsContainer = new FileUsmapTypeMappingsProvider("../../packages/closed/blitz.usmap");
  }
}
