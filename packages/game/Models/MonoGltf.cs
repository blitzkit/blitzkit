using System.Numerics;
using System.Text;
using BlitzKit.Game.JSExport;
using CUE4Parse_Conversion;
using CUE4Parse_Conversion.Materials;
using CUE4Parse_Conversion.Meshes;
using CUE4Parse_Conversion.Meshes.glTF;
using CUE4Parse_Conversion.Meshes.PSK;
using CUE4Parse_Conversion.Textures;
using CUE4Parse.UE4.Assets.Exports.Material;
using CUE4Parse.UE4.Assets.Exports.StaticMesh;
using CUE4Parse.UE4.Assets.Exports.Texture;
using CUE4Parse.UE4.Objects.Core.Math;
using CUE4Parse.UE4.Objects.Meshes;
using SharpGLTF.Geometry;
using SharpGLTF.Geometry.VertexTypes;
using SharpGLTF.Materials;
using SharpGLTF.Memory;
using SharpGLTF.Scenes;
using SharpGLTF.Schema2;
using SharpGLTF.Validation;

namespace BlitzKit.Game.Models;

using ConfiguredMeshBuilder = MeshBuilder<
  VertexPositionNormalTangent,
  VertexColorXTextureX,
  VertexEmpty
>;

public class MonoGltf
{
  readonly SceneBuilder scene;
  readonly Dictionary<string, Dictionary<KnownChannel, string>> textureMap = [];

  readonly Dictionary<string, KnownChannel> knownChannels = new()
  {
    { "BaseColor", KnownChannel.BaseColor },
    { "Normal", KnownChannel.Normal },
    { "RMAO", KnownChannel.MetallicRoughness },
    // { "CDE", ?? },
  };

  public MonoGltf(UStaticMesh staticMesh)
  {
    scene = new(staticMesh.Name);
    var options = new ExporterOptions() { TextureFormat = ETextureFormat.Jpeg };

    staticMesh.TryConvert(out var convertedMesh);
    var lod =
      convertedMesh.LODs.Find(lod => !lod.SkipLod) ?? throw new Exception("Failed to find lod0");

    MaterialBuilder emptyMaterial = new("empty_material");
    Dictionary<string, MaterialBuilder> materialMap = [];

    int sectionIndex = 0;
    foreach (var section in lod.Sections.Value)
    {
      ConfiguredMeshBuilder meshBuilder = new($"{staticMesh.Name}_section_{sectionIndex}");
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
        materialBuilder = new(section.MaterialName);

        var textures = new Dictionary<KnownChannel, string>();

        materialMap.Add(section.MaterialName, materialBuilder);
        textureMap.Add(section.MaterialName, textures);

        foreach (var parameterTexture in materialData.Parameters.Textures)
        {
          if (knownChannels.TryGetValue(parameterTexture.Key, out var channel))
          {
            materialBuilder.WithChannelImage(channel, "../../stub/stupid.png");

            // var texture = parameterTexture.Value;
            // var name = Path.GetFileNameWithoutExtension(texture.GetPathName());

            // textures.Add(channel, name);
          }
          else
          {
            // Console.WriteLine($"Unsupported texture type: {parameterTexture.Key}");
          }
        }
      }

      var primitive = meshBuilder.UsePrimitive(materialBuilder);

      for (int faceIndex = 0; faceIndex < section.NumFaces; faceIndex++)
      {
        var wedgeIndex = new int[3];
        for (var k = 0; k < wedgeIndex.Length; k++)
        {
          wedgeIndex[k] = (int)lod.Indices.Value[section.FirstIndex + faceIndex * 3 + k];
        }

        var vertex1 = lod.Verts[wedgeIndex[0]];
        var vertex2 = lod.Verts[wedgeIndex[1]];
        var vertex3 = lod.Verts[wedgeIndex[2]];

        var (v1, v2, v3) = PrepareTris(vertex1, vertex2, vertex3);
        var (c1, c2, c3) = PrepareUVsAndTexCoords(lod, vertex1, vertex2, vertex3, wedgeIndex);

        primitive.AddTriangle((v1, c1), (v2, c2), (v3, c3));
      }

      scene.AddRigidMesh(meshBuilder, Matrix4x4.Identity);
    }
  }

  public byte[] Write(string name)
  {
    var stream = new MemoryStream();
    var context = WriteContext
      .CreateFromStream(stream)
      .WithSettingsFrom(
        new()
        {
          ImageWriting = ResourceWriteMode.SatelliteFile,
          ImageWriteCallback = (context, assetName, image) =>
          {
            return "/textures/my-ass.png";
          },
        }
      );
    var model = scene.ToGltf2();

    context.WriteBinarySchema2(name, model);

    return stream.ToArray();
  }

  private static (
    VertexPositionNormalTangent,
    VertexPositionNormalTangent,
    VertexPositionNormalTangent
  ) PrepareTris(CMeshVertex vert1, CMeshVertex vert2, CMeshVertex vert3)
  {
    VertexPositionNormalTangent v1 = new(
      SwapYZ(vert1.Position * 0.01f),
      SwapYZAndNormalize((FVector)vert1.Normal),
      SwapYZAndNormalize((Vector4)vert1.Tangent)
    );
    VertexPositionNormalTangent v2 = new(
      SwapYZ(vert2.Position * 0.01f),
      SwapYZAndNormalize((FVector)vert2.Normal),
      SwapYZAndNormalize((Vector4)vert2.Tangent)
    );
    VertexPositionNormalTangent v3 = new(
      SwapYZ(vert3.Position * 0.01f),
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
      lod.ExtraUV.Value,
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
