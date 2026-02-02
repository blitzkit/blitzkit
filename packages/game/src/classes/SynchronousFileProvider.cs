using CUE4Parse.FileProvider;
using CUE4Parse.UE4.Exceptions;
using CUE4Parse.UE4.Versions;
using CUE4Parse.Utils;

public class SynchronousFileProvider(
  string directory,
  SearchOption searchOption,
  VersionContainer? versions = null,
  StringComparer? pathComparer = null
) : DefaultFileProvider(directory, searchOption, versions, pathComparer)
{
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
