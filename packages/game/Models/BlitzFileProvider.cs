using System.Runtime.InteropServices;
using CUE4Parse.Compression;
using CUE4Parse.FileProvider;
using CUE4Parse.MappingsProvider;
using CUE4Parse.UE4.Versions;

namespace BlitzKit.Game.Models;

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

    Initialize();
    Mount();

    string libraryExtension;
    if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
    {
      libraryExtension = "dll";
    }
    else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
    {
      libraryExtension = "so";
    }
    else
    {
      throw new Exception("Unsupported OS");
    }

    OodleHelper.DownloadOodleDll($"../../temp/oodle.{libraryExtension}");
    OodleHelper.Initialize($"../../temp/oodle.{libraryExtension}");
  }
}
