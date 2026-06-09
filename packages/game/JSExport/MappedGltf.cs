using System.Text.Json;
using Microsoft.JavaScript.NodeApi;
using SharpGLTF.Materials;

namespace BlitzKit.Game.JSExport;

[JSExport]
public readonly struct MappedGltf
{
  public string Json { get; }
  public Dictionary<string, Dictionary<KnownChannel, string>> TextureMap { get; }

  public MappedGltf(string json, Dictionary<string, Dictionary<KnownChannel, string>> textureMap)
  {
    Json = json;
    TextureMap = textureMap;
  }

  public string ToJson()
  {
    return JsonSerializer.Serialize(this);
  }
}
