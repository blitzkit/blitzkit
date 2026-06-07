using System.Numerics;
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
using SharpGLTF.Scenes;

namespace BlitzKit.Game.Models;

using ConfiguredMeshBuilder = MeshBuilder<
    VertexPositionNormalTangent,
    VertexColorXTextureX,
    VertexEmpty
>;

public class MonoGltf
{
    readonly SceneBuilder Scene;

    public MonoGltf(UStaticMesh staticMesh)
    {
        Scene = new(staticMesh.Name);
        ExporterOptions options = new() { TextureFormat = ETextureFormat.Jpeg };
        staticMesh.TryConvert(out var convertedMesh);
        var lod =
            convertedMesh.LODs.Find(lod => !lod.SkipLod)
            ?? throw new Exception("Failed to find lod0");

        MaterialBuilder emptyMaterial = new("empty_material");
        Dictionary<string, MaterialBuilder> namedMaterials = [];

        Console.WriteLine(lod.Sections.Value.Length);

        int sectionIndex = 0;
        foreach (var section in lod.Sections.Value)
        {
            Console.WriteLine(section.MaterialName);

            ConfiguredMeshBuilder meshBuilder = new($"{staticMesh.Name}_section_{sectionIndex}");
            MaterialBuilder materialBuilder;

            if (section.Material == null || section.MaterialName == null)
            {
                materialBuilder = emptyMaterial;
            }
            else if (namedMaterials.TryGetValue(section.MaterialName, out MaterialBuilder? value))
            {
                materialBuilder = value;
            }
            else
            {
                var materialInterface = section.Material.Load<UMaterialInterface>()!;
                MaterialData materialData = new() { Textures = [], Parameters = new() };
                materialInterface.GetParams(materialData.Parameters, options.MaterialFormat);
                materialBuilder = new(section.MaterialName);

                foreach (var parameterTexture in materialData.Parameters.Textures)
                {
                    var texture = parameterTexture.Value;

                    if (
                        texture is not UTexture2D texture2d
                        || texture2d.Decode(options.Platform) is not { } bitmap
                    )
                    {
                        Console.WriteLine($"Failed to decode texture: {texture?.Name}");
                        continue;
                    }

                    switch (parameterTexture.Key)
                    {
                        case "BaseColor":
                        {
                            var encoded = bitmap.Encode(options.TextureFormat, false, out var _);
                            var bytes = encoded.ToArray();
                            materialBuilder.WithBaseColor(bytes);

                            break;
                        }

                        case "Normal":
                        {
                            var encoded = bitmap.Encode(options.TextureFormat, false, out var _);
                            var bytes = encoded.ToArray();
                            materialBuilder.WithNormal(bytes);

                            break;
                        }

                        case "RMAO":
                        {
                            var encoded = bitmap.Encode(options.TextureFormat, false, out var _);

                            // for (int y = 0; y < bitmap.Height; y++)
                            // {
                            //     for (int x = 0; x < bitmap.Width; x++)
                            //     {
                            //         var index = y * bitmap.Width + x;
                            //         var color = bitmap.Pixels[index];
                            //         bitmap.Pixels[index] = new(
                            //             color.Blue,
                            //             color.Red,
                            //             color.Green,
                            //             color.Alpha
                            //         );
                            //     }
                            // }

                            var bytes = encoded.ToArray();
                            materialBuilder.WithBaseColor(bytes);

                            break;
                        }

                        case "CDE":
                        {
                            // idk wtf this is
                            break;
                        }

                        default:
                        {
                            Console.WriteLine($"Unsupported texture type: {parameterTexture.Key}");
                            break;
                        }
                    }
                }
            }

            var primitive = meshBuilder.UsePrimitive(materialBuilder);

            Console.WriteLine($"faces: {section.NumFaces}");

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
                var (c1, c2, c3) = PrepareUVsAndTexCoords(
                    lod,
                    vertex1,
                    vertex2,
                    vertex3,
                    wedgeIndex
                );

                primitive.AddTriangle((v1, c1), (v2, c2), (v3, c3));
            }

            Scene.AddRigidMesh(meshBuilder, Matrix4x4.Identity);
        }
    }

    public ArraySegment<byte> Write()
    {
        return Scene.ToGltf2().WriteGLB();
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
