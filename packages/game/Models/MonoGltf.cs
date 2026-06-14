using System.Numerics;
using CUE4Parse_Conversion;
using CUE4Parse_Conversion.Materials;
using CUE4Parse_Conversion.Meshes;
using CUE4Parse_Conversion.Meshes.glTF;
using CUE4Parse_Conversion.Meshes.PSK;
using CUE4Parse_Conversion.Textures;
using CUE4Parse.UE4.Assets.Exports;
using CUE4Parse.UE4.Assets.Exports.Material;
using CUE4Parse.UE4.Assets.Exports.SkeletalMesh;
using CUE4Parse.UE4.Assets.Exports.StaticMesh;
using CUE4Parse.UE4.Assets.Objects;
using CUE4Parse.UE4.Objects.Core.Math;
using CUE4Parse.UE4.Objects.Meshes;
using SharpGLTF.Geometry;
using SharpGLTF.Geometry.VertexTypes;
using SharpGLTF.Materials;
using SharpGLTF.Memory;
using SharpGLTF.Scenes;
using SharpGLTF.Schema2;

namespace BlitzKit.Game.Models;

using ConfiguredMeshBuilder = MeshBuilder<
  VertexPositionNormalTangent,
  VertexColorXTextureX,
  VertexEmpty
>;

public class MonoGltf
{
  readonly SceneBuilder scene = new();
  readonly Dictionary<string, MaterialBuilder> materialMap = [];

  static readonly MaterialBuilder emptyMaterial = new("empty_material");
  static readonly ExporterOptions options = new() { TextureFormat = ETextureFormat.Jpeg };
  public static readonly Dictionary<string, KnownChannel[]> knownChannels = new()
  {
    { "BaseColor", [KnownChannel.BaseColor] },
    { "Normal", [KnownChannel.Normal] },
    { "RMAO", [KnownChannel.MetallicRoughness, KnownChannel.Occlusion] },
    // { "CDE", ?? },
  };
  static readonly byte[] stubBytes = File.ReadAllBytes("../game/stub/small.png");
  static readonly float scaleCorrection = 0.01f;

  public MonoGltf(FStructFallback settings)
  {
    var root = new NodeBuilder("root");

    Traverse(settings, root);
    scene.AddNode(root);
  }

  void Traverse(FStructFallback settings, NodeBuilder parent)
  {
    foreach (var property in settings.Properties)
    {
      var key = property.Name.Text;

      if (settings.TryGet<UStaticMesh>(key, out var staticMesh))
      {
        AddMesh(parent.CreateNode(key), staticMesh);
        continue;
      }

      if (settings.TryGet<USkeletalMesh>(key, out var skeletalMesh))
      {
        AddMesh(parent.CreateNode(key), skeletalMesh);
        continue;
      }

      if (settings.TryGet<FStructFallback[]>(key, out var array))
      {
        foreach (var item in array)
        {
          Traverse(item, parent.CreateNode(key));
        }

        continue;
      }

      if (key == "BoneTransform")
      {
        var transform = settings.Get<FStructFallback>(key);

        if (transform.TryGet<FQuat>("Rotation", out var rotation))
        {
          parent.WithLocalRotation(SwapYZ(rotation));
        }

        if (transform.TryGet<FVector>("Translation", out var translation))
        {
          parent.WithLocalTranslation(SwapYZ(translation) * scaleCorrection);
        }

        if (transform.TryGet<FVector>("Scale3D", out var scale))
        {
          parent.WithLocalScale(SwapYZ(scale));
        }

        continue;
      }

      // Console.WriteLine(
      //   $"{key} -> {property.Tag} ({property.TagData}) [{property.PropertyTagFlags}]"
      // );
    }
  }

  void AddMesh(NodeBuilder meshNode, UObject mesh)
  {
    if (mesh is UStaticMesh staticMesh)
    {
      staticMesh.TryConvert(out var convertedStaticMesh);

      var lod0 = convertedStaticMesh.LODs.Find(lod => !lod.SkipLod)!;

      var i = 0;
      foreach (var section in lod0.Sections!.Value)
      {
        var sectionNode = meshNode.CreateNode($"{i++}");
        var configured = ParseSection(section, lod0, lod0.Verts!);

        scene.AddRigidMesh(configured, sectionNode);
      }

      return;
    }

    if (mesh is USkeletalMesh skeletalMesh)
    {
      skeletalMesh.TryConvert(out var convertedSkeletalMesh);

      var lod0 = convertedSkeletalMesh.LODs.Find(lod => !lod.SkipLod)!;

      var i = 0;
      foreach (var section in lod0.Sections!.Value)
      {
        var sectionNode = meshNode.CreateNode($"{i++}");
        var configured = ParseSection(section, lod0, lod0.Verts!);

        scene.AddRigidMesh(configured, sectionNode);
      }

      return;
    }
  }

  ConfiguredMeshBuilder ParseSection(CMeshSection section, CBaseMeshLod lod, CMeshVertex[] vertices)
  {
    var meshBuilder = new ConfiguredMeshBuilder();
    MaterialBuilder materialBuilder;

    if (section.Material == null || section.MaterialName == null)
    {
      materialBuilder = emptyMaterial;
    }
    else if (materialMap.TryGetValue(section.MaterialName, out MaterialBuilder? value))
    {
      materialBuilder = value;
    }
    else
    {
      var materialInterface = section.Material.Load<UMaterialInterface>()!;
      var materialData = new MaterialData() { Parameters = new() };

      materialInterface.GetParams(materialData.Parameters, options.MaterialFormat);
      materialBuilder = new();
      materialMap.Add(section.MaterialName, materialBuilder);

      foreach (var parameterTexture in materialData.Parameters.Textures)
      {
        if (knownChannels.TryGetValue(parameterTexture.Key, out var channels))
        {
          var texture = parameterTexture.Value;
          var name = Path.GetFileNameWithoutExtension(texture.GetPathName());
          var path = $"../../../textures/{name}.webp";

          var lastIndex = stubBytes.Length - 1;
          stubBytes[lastIndex] = (byte)(++stubBytes[lastIndex] % 255);
          var uniqueBytes = (byte[])stubBytes.Clone();
          var stubImage = new MemoryImage(uniqueBytes);

          foreach (var channel in channels)
          {
            materialBuilder.WithChannelImage(channel, stubImage);
            materialBuilder.GetChannel(channel).Texture.PrimaryImage.Name = path;
          }
        }
      }
    }

    var primitive = meshBuilder.UsePrimitive(materialBuilder);

    for (int faceIndex = 0; faceIndex < section.NumFaces; faceIndex++)
    {
      var wedgeIndex = new int[3];
      for (var k = 0; k < wedgeIndex.Length; k++)
      {
        wedgeIndex[k] = (int)lod.Indices!.Value[section.FirstIndex + faceIndex * 3 + k];
      }

      var vertex1 = vertices[wedgeIndex[0]];
      var vertex2 = vertices[wedgeIndex[1]];
      var vertex3 = vertices[wedgeIndex[2]];

      var (v1, v2, v3) = PrepareTriangles(vertex1, vertex2, vertex3);
      var (c1, c2, c3) = PrepareUVsAndTexCoords(lod, vertex1, vertex2, vertex3, wedgeIndex);

      primitive.AddTriangle((v1, c1), (v2, c2), (v3, c3));
    }

    return meshBuilder;
  }

  public byte[] Write(string name)
  {
    var model = scene.ToGltf2();

    model.Asset.Copyright = null;
    model.Asset.Generator = null;

    var mappedTextures = new Dictionary<MemoryImage, string>();

    foreach (var image in model.LogicalImages)
    {
      mappedTextures[image.Content] = image.Name!;
      image.Name = null;
    }

    var stream = new MemoryStream();
    var context = WriteContext
      .CreateFromStream(stream)
      .WithSettingsFrom(
        new()
        {
          ImageWriting = ResourceWriteMode.SatelliteFile,
          ImageWriteCallback = (context, assetName, image) =>
          {
            return mappedTextures[image];
          },
        }
      );

    context.WriteBinarySchema2(name, model);

    return stream.ToArray();
  }

  private static (
    VertexPositionNormalTangent,
    VertexPositionNormalTangent,
    VertexPositionNormalTangent
  ) PrepareTriangles(CMeshVertex vert1, CMeshVertex vert2, CMeshVertex vert3)
  {
    var v1 = new VertexPositionNormalTangent(
      SwapYZ(vert1.Position * scaleCorrection),
      SwapYZAndNormalize((FVector)vert1.Normal),
      SwapYZAndNormalize((Vector4)vert1.Tangent)
    );
    var v2 = new VertexPositionNormalTangent(
      SwapYZ(vert2.Position * scaleCorrection),
      SwapYZAndNormalize((FVector)vert2.Normal),
      SwapYZAndNormalize((Vector4)vert2.Tangent)
    );
    var v3 = new VertexPositionNormalTangent(
      SwapYZ(vert3.Position * scaleCorrection),
      SwapYZAndNormalize((FVector)vert3.Normal),
      SwapYZAndNormalize((Vector4)vert3.Tangent)
    );

    return (v1, v2, v3);
  }

  public static FVector SwapYZ(FVector vec)
  {
    var res = new FVector(vec.X, vec.Z, vec.Y);
    return res;
  }

  public static Quaternion SwapYZ(Quaternion q)
  {
    return Quaternion.Normalize(new Quaternion(q.X, q.Z, q.Y, -q.W));
  }

  public static FVector SwapYZAndNormalize(FVector vec)
  {
    var res = SwapYZ(vec);
    res.Normalize();
    return res;
  }

  public static Vector4 SwapYZAndNormalize(Vector4 vec)
  {
    return Vector4.Normalize(new Vector4(vec.X, vec.Z, vec.Y, vec.W));
  }

  public static (
    VertexColorXTextureX,
    VertexColorXTextureX,
    VertexColorXTextureX
  ) PrepareUVsAndTexCoords(
    CBaseMeshLod lod,
    CMeshVertex vert1,
    CMeshVertex vert2,
    CMeshVertex vert3,
    int[] indices
  )
  {
    return PrepareUVsAndTexCoords(
      lod.VertexColors ?? new FColor[lod.NumVerts],
      vert1,
      vert2,
      vert3,
      lod.ExtraUV!.Value,
      indices
    );
  }

  public static (
    VertexColorXTextureX,
    VertexColorXTextureX,
    VertexColorXTextureX
  ) PrepareUVsAndTexCoords(
    FColor[] colors,
    CMeshVertex vert1,
    CMeshVertex vert2,
    CMeshVertex vert3,
    FMeshUVFloat[][] uvs,
    int[] indices
  )
  {
    var (uvs1, uvs2, uvs3) = PrepareUVs(vert1, vert2, vert3, uvs, indices);

    var c1 = new VertexColorXTextureX((Vector4)colors[indices[0]] / 255, uvs1);
    var c2 = new VertexColorXTextureX((Vector4)colors[indices[1]] / 255, uvs2);
    var c3 = new VertexColorXTextureX((Vector4)colors[indices[2]] / 255, uvs3);

    return (c1, c2, c3);
  }

  private static (List<Vector2>, List<Vector2>, List<Vector2>) PrepareUVs(
    CMeshVertex vert1,
    CMeshVertex vert2,
    CMeshVertex vert3,
    FMeshUVFloat[][] uvs,
    int[] indices
  )
  {
    var uvs1 = new List<Vector2>() { (Vector2)vert1.UV };
    var uvs2 = new List<Vector2>() { (Vector2)vert2.UV };
    var uvs3 = new List<Vector2>() { (Vector2)vert3.UV };

    foreach (var uv in uvs)
    {
      uvs1.Add((Vector2)uv[indices[0]]);
      uvs2.Add((Vector2)uv[indices[1]]);
      uvs3.Add((Vector2)uv[indices[2]]);
    }

    return (uvs1, uvs2, uvs3);
  }
}
