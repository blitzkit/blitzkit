using System.IO.Compression;
using System.Net;
using System.Net.Http.Headers;
using CUE4Parse.Compression;

namespace BlitzKit.Game.Synchronous;

public static class SynchronousOodleHelper
{
  public static bool DownloadOodleDll(string? path = null)
  {
    path ??= OodleHelper.OODLE_DLL_NAME_OLD;

    if (File.Exists(path))
      return false;

    using var client = new HttpClient(
      new SocketsHttpHandler
      {
        UseProxy = false,
        UseCookies = false,
        AutomaticDecompression = DecompressionMethods.All,
      }
    );

    client.DefaultRequestHeaders.UserAgent.Add(
      new ProductInfoHeaderValue(
        nameof(CUE4Parse),
        typeof(OodleHelper).Assembly.GetName().Version?.ToString() ?? "1.0.0"
      )
    );
    client.Timeout = TimeSpan.FromSeconds(30);

    return DownloadOodleDllFromOodleUE(client, path);
  }

  public static bool DownloadOodleDllFromOodleUE(HttpClient client, string path)
  {
    const string url =
      "https://github.com/WorkingRobot/OodleUE/releases/download/2025-07-31-1001/clang-cl.zip"; // 2.9.14
    const string entryName = "bin/Release/oodle-data-shared.dll";

    try
    {
      using var response = client.GetAsync(url).GetAwaiter().GetResult();
      response.EnsureSuccessStatusCode();

      using var responseStream = response.Content.ReadAsStreamAsync().GetAwaiter().GetResult();
      using var zip = new ZipArchive(responseStream, ZipArchiveMode.Read);
      var entry = zip.GetEntry(entryName);
      ArgumentNullException.ThrowIfNull(entry, "oodle entry in zip not found");

      using var entryStream = entry.Open();
      using var fs = File.Create(path);
      entryStream.CopyTo(fs);

      return true;
    }
    catch (Exception e)
    {
      Console.WriteLine($"Uncaught exception while downloading oodle dll from OodleUE: {e}");
    }

    return false;
  }

  public static void Initialize(string? path = null)
  {
    OodleHelper.Initialize(path);
  }
}
