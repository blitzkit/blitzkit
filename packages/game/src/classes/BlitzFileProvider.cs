using CUE4Parse.FileProvider;
using CUE4Parse.MappingsProvider;
using CUE4Parse.UE4.Exceptions;
using CUE4Parse.UE4.Versions;
using CUE4Parse.Utils;

namespace game.src.classes;

public class BlitzFileProvider : DefaultFileProvider
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

  public new int Mount()
  {
    var countNewMounts = 0;

    foreach (var reader in _unloadedVfs.Keys)
    {
      if (reader.IsEncrypted && CustomEncryption == null || !reader.HasDirectoryIndex)
        continue;

      try
      {
        reader.MountTo(Files, PathComparer);
        _unloadedVfs.TryRemove(reader, out _);
        countNewMounts++;
      }
      catch (InvalidAesKeyException) { }
      catch (Exception e)
      {
        Log.Warning(
          e,
          $"Uncaught exception while loading file {reader.Path.SubstringAfterLast('/')}"
        );
      }
    }

    return countNewMounts;
  }
}
