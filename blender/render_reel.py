"""
render_reel.py — Headless Blender render of a stylized environment reel
for the Dan Houdebine portfolio website.

Run:
  & "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" \
        --background --python blender\render_reel.py

Output:
  D:/GitHub/Test/Test/public/portfolio-reel.mp4

Scene: "Blue Cosmic Valley"
  - Low-poly mountainous terrain (displaced subdivided plane)
  - Volumetric blue fog
  - Distant blue horizon sun
  - Floating wireframe geometric shapes (icosahedron, cube, octahedron)
  - Cinematic camera dolly with subtle orbit; ends near start position for loop

Renderer: Eevee Next (1280×720, 24fps, 192 frames = 8s)
"""
from __future__ import annotations

import math
import os
import sys
from pathlib import Path

import bpy
import bmesh
from mathutils import Vector, Euler


# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────
OUTPUT_MP4   = r"D:\GitHub\Test\Test\public\portfolio-reel.mp4"
FRAMES_DIR   = r"D:\GitHub\Test\Test\blender\frames"
RES_X = 1024
RES_Y = 576
FPS = 24
DURATION_S = 5.0
TOTAL_FRAMES = int(FPS * DURATION_S)
SEED = 42


# ─────────────────────────────────────────────────────────────────────────────
# Scene reset
# ─────────────────────────────────────────────────────────────────────────────
def clear_scene() -> None:
    """Remove everything from the default scene."""
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (
        bpy.data.meshes, bpy.data.materials, bpy.data.lights,
        bpy.data.cameras, bpy.data.curves, bpy.data.images,
    ):
        for item in list(block):
            block.remove(item)


# ─────────────────────────────────────────────────────────────────────────────
# Materials
# ─────────────────────────────────────────────────────────────────────────────
def emission_material(name: str, color: tuple[float, float, float], strength: float):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1.0)
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return mat


def terrain_material():
    mat = bpy.data.materials.new(name="TerrainMat")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (0.02, 0.04, 0.10, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.92
    bsdf.inputs["Metallic"].default_value = 0.05
    # Subtle blue rim via emission mixed in
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (0.10, 0.25, 0.55, 1.0)
    em.inputs["Strength"].default_value = 0.12
    mix = nt.nodes.new("ShaderNodeMixShader")
    fres = nt.nodes.new("ShaderNodeFresnel")
    fres.inputs["IOR"].default_value = 1.45
    nt.links.new(fres.outputs["Fac"], mix.inputs["Fac"])
    nt.links.new(bsdf.outputs["BSDF"], mix.inputs[1])
    nt.links.new(em.outputs["Emission"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    return mat


def wireframe_material(opacity: float = 0.8):
    """Wireframe emission look using the Wireframe shader node."""
    mat = bpy.data.materials.new(name="WireMat")
    mat.use_nodes = True
    mat.blend_method = "BLEND"
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    wire = nt.nodes.new("ShaderNodeWireframe")
    wire.use_pixel_size = True
    wire.inputs["Size"].default_value = 1.5
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (0.23, 0.51, 0.96, 1.0)  # #3b82f6
    em.inputs["Strength"].default_value = 4.0
    transp = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(wire.outputs["Fac"], mix.inputs["Fac"])
    nt.links.new(transp.outputs["BSDF"], mix.inputs[1])
    nt.links.new(em.outputs["Emission"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    return mat


# ─────────────────────────────────────────────────────────────────────────────
# Geometry
# ─────────────────────────────────────────────────────────────────────────────
def build_terrain() -> bpy.types.Object:
    """Subdivided plane with mountainous displacement."""
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, -20, -3))
    plane = bpy.context.active_object
    plane.name = "Terrain"

    # Heavily subdivide
    mod_sub = plane.modifiers.new("Subdivide", "SUBSURF")
    mod_sub.subdivision_type = "SIMPLE"
    # Blender 5+ renamed levels_viewport → levels
    if hasattr(mod_sub, "levels"):
        mod_sub.levels = 6
    elif hasattr(mod_sub, "levels_viewport"):
        mod_sub.levels_viewport = 6
    mod_sub.render_levels = 6

    # Displace with noise texture
    tex = bpy.data.textures.new("TerrainNoise", type="MUSGRAVE") \
        if "MUSGRAVE" in [t.value for t in bpy.types.ImageTexture.bl_rna.properties["type"].enum_items] \
        else bpy.data.textures.new("TerrainNoise", type="CLOUDS")
    # Use simple CLOUDS (always available across Blender versions)
    tex = bpy.data.textures.new("TerrainNoise", type="CLOUDS")
    tex.noise_scale = 2.5
    tex.noise_depth = 5

    mod_disp = plane.modifiers.new("Displace", "DISPLACE")
    mod_disp.texture = tex
    mod_disp.strength = 8.0
    mod_disp.mid_level = 0.45

    # Second displacement for high-freq detail
    tex2 = bpy.data.textures.new("TerrainDetail", type="CLOUDS")
    tex2.noise_scale = 0.45
    tex2.noise_depth = 3
    mod_disp2 = plane.modifiers.new("DisplaceDetail", "DISPLACE")
    mod_disp2.texture = tex2
    mod_disp2.strength = 1.2
    mod_disp2.mid_level = 0.5

    plane.data.materials.append(terrain_material())
    return plane


def add_floater(geo_type: str, location: tuple[float, float, float],
                scale: float, rotation: tuple[float, float, float]) -> bpy.types.Object:
    if geo_type == "ico":
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1, location=location)
    elif geo_type == "cube":
        bpy.ops.mesh.primitive_cube_add(size=2, location=location)
    elif geo_type == "octa":
        # Build a true octahedron via bmesh (no add-on dependency)
        mesh = bpy.data.meshes.new("Octa")
        obj = bpy.data.objects.new("Octa", mesh)
        bpy.context.collection.objects.link(obj)
        bm = bmesh.new()
        verts = [
            bm.verts.new(( 1, 0, 0)),
            bm.verts.new((-1, 0, 0)),
            bm.verts.new(( 0, 1, 0)),
            bm.verts.new(( 0,-1, 0)),
            bm.verts.new(( 0, 0, 1)),
            bm.verts.new(( 0, 0,-1)),
        ]
        for face in [(4,0,2),(4,2,1),(4,1,3),(4,3,0),
                     (5,2,0),(5,1,2),(5,3,1),(5,0,3)]:
            bm.faces.new([verts[i] for i in face])
        bm.to_mesh(mesh); bm.free()
        obj.location = location
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
    else:
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1, location=location)

    obj = bpy.context.active_object
    obj.scale = (scale, scale, scale)
    obj.rotation_euler = Euler(rotation, "XYZ")
    obj.data.materials.append(wireframe_material())
    return obj


def build_floaters() -> list[bpy.types.Object]:
    """Scattered wireframe shapes that 'drift' (we animate them via simple keyframes)."""
    rng = _rng(SEED)
    placements = [
        ("ico",  (-6,  -8,  3), 1.4, (0.3, 0.4, 0.1)),
        ("cube", ( 7,  -10, 2), 1.0, (0.6, 0.2, 0.4)),
        ("ico",  ( 0,  -25, 6), 1.8, (0.2, 0.7, 0.3)),
        ("octa", (-9,  -18, 4), 1.2, (0.8, 0.3, 0.5)),
        ("cube", ( 4,  -30, 5), 1.5, (0.4, 0.5, 0.2)),
        ("ico",  (-3,  -45, 8), 2.0, (0.1, 0.9, 0.3)),
        ("octa", ( 10, -50, 7), 1.7, (0.6, 0.4, 0.7)),
        ("cube", (-12, -60, 6), 1.4, (0.3, 0.6, 0.5)),
        ("ico",  ( 6,  -70, 9), 2.2, (0.5, 0.3, 0.8)),
        ("octa", ( 0,  -85, 5), 1.6, (0.7, 0.4, 0.2)),
    ]
    objs = []
    for geo_type, loc, sc, rot in placements:
        o = add_floater(geo_type, loc, sc, rot)
        objs.append(o)
        # Add simple keyframe rotation animation (full rotation across the 8s)
        o.rotation_mode = "XYZ"
        o.keyframe_insert("rotation_euler", frame=1)
        o.rotation_euler = (
            rot[0] + rng() * 2.0,
            rot[1] + rng() * 2.0,
            rot[2] + rng() * 1.0,
        )
        o.keyframe_insert("rotation_euler", frame=TOTAL_FRAMES + 1)
        # Bob up/down via location Z
        base_z = loc[2]
        o.location.z = base_z
        o.keyframe_insert("location", frame=1, index=2)
        o.location.z = base_z + 0.7
        o.keyframe_insert("location", frame=TOTAL_FRAMES // 2, index=2)
        o.location.z = base_z
        o.keyframe_insert("location", frame=TOTAL_FRAMES + 1, index=2)
    return objs


def build_sun_disk() -> bpy.types.Object:
    """Distant glowing disk at horizon — emission plane."""
    bpy.ops.mesh.primitive_circle_add(
        vertices=64, radius=14, fill_type="NGON", location=(0, -90, 5),
    )
    sun = bpy.context.active_object
    sun.name = "HorizonSun"
    sun.rotation_euler = Euler((math.pi / 2, 0, 0), "XYZ")
    sun.data.materials.append(emission_material("SunMat", (0.376, 0.647, 0.980), 12.0))
    return sun


def build_grid_overlay() -> bpy.types.Object:
    """Wireframe grid plane below ground for added Tron feel (rendered translucent)."""
    bpy.ops.mesh.primitive_plane_add(size=180, location=(0, -40, -2.9))
    grid = bpy.context.active_object
    grid.name = "GridPlane"
    # subdivide
    bm = bmesh.new()
    bm.from_mesh(grid.data)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=30, use_grid_fill=True)
    bm.to_mesh(grid.data)
    bm.free()
    # wireframe modifier
    wf = grid.modifiers.new("Wire", "WIREFRAME")
    wf.thickness = 0.03
    grid.data.materials.append(emission_material("GridMat", (0.30, 0.55, 1.0), 2.0))
    return grid


# ─────────────────────────────────────────────────────────────────────────────
# Lights
# ─────────────────────────────────────────────────────────────────────────────
def build_lights() -> None:
    # Strong blue rim from low angle
    bpy.ops.object.light_add(type="SUN", location=(0, -80, 10))
    sun = bpy.context.active_object
    sun.data.energy = 1.8
    sun.data.color = (0.45, 0.65, 1.0)
    sun.rotation_euler = Euler((math.radians(75), 0, 0), "XYZ")

    # Soft fill from above
    bpy.ops.object.light_add(type="AREA", location=(0, -10, 25))
    fill = bpy.context.active_object
    fill.data.energy = 600
    fill.data.color = (0.6, 0.75, 1.0)
    fill.data.size = 40
    fill.rotation_euler = Euler((math.radians(-15), 0, 0), "XYZ")


# ─────────────────────────────────────────────────────────────────────────────
# Camera + animation
# ─────────────────────────────────────────────────────────────────────────────
def build_camera() -> bpy.types.Object:
    bpy.ops.object.camera_add(location=(0, 4, 3.2))
    cam = bpy.context.active_object
    cam.data.lens = 28  # wide
    cam.data.clip_end = 300
    # Make scene camera
    bpy.context.scene.camera = cam
    return cam


def animate_camera(cam: bpy.types.Object) -> None:
    """Slow forward dolly + subtle sway. Returns near origin to ease loop."""
    # Start
    cam.location = (0.0, 4.0, 3.2)
    cam.rotation_euler = Euler((math.radians(82), 0, 0), "XYZ")
    cam.keyframe_insert("location", frame=1)
    cam.keyframe_insert("rotation_euler", frame=1)

    # Mid — forward + tilt up slightly + lateral sway
    cam.location = (1.6, -8.0, 4.4)
    cam.rotation_euler = Euler((math.radians(85), 0, math.radians(3)), "XYZ")
    cam.keyframe_insert("location", frame=TOTAL_FRAMES // 2)
    cam.keyframe_insert("rotation_euler", frame=TOTAL_FRAMES // 2)

    # End — back near origin for seamless loop
    cam.location = (0.0, 4.0, 3.2)
    cam.rotation_euler = Euler((math.radians(82), 0, 0), "XYZ")
    cam.keyframe_insert("location", frame=TOTAL_FRAMES + 1)
    cam.keyframe_insert("rotation_euler", frame=TOTAL_FRAMES + 1)

    # Make all f-curves smoothly cyclic-ish via bezier (default already)


# ─────────────────────────────────────────────────────────────────────────────
# World (background + volumetric fog)
# ─────────────────────────────────────────────────────────────────────────────
def setup_world() -> None:
    world = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Color"].default_value = (0.015, 0.025, 0.055, 1.0)  # very dark navy
    bg.inputs["Strength"].default_value = 1.0
    # Volumetric scatter for atmospheric fog
    vol = nt.nodes.new("ShaderNodeVolumeScatter")
    vol.inputs["Color"].default_value = (0.30, 0.50, 1.0, 1.0)
    vol.inputs["Density"].default_value = 0.028
    vol.inputs["Anisotropy"].default_value = 0.15
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    nt.links.new(vol.outputs["Volume"],     out.inputs["Volume"])


# ─────────────────────────────────────────────────────────────────────────────
# Render settings
# ─────────────────────────────────────────────────────────────────────────────
def configure_render(_out_mp4: str) -> None:
    scene = bpy.context.scene
    rd = scene.render

    rd.resolution_x = RES_X
    rd.resolution_y = RES_Y
    rd.resolution_percentage = 100
    rd.fps = FPS

    scene.frame_start = 1
    scene.frame_end = TOTAL_FRAMES

    # Renderer: prefer Eevee Next (Blender 4.2+); fall back to legacy Eevee/Cycles
    candidates = ["BLENDER_EEVEE_NEXT", "BLENDER_EEVEE", "CYCLES"]
    avail = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
    chosen = next((c for c in candidates if c in avail), avail[0])
    rd.engine = chosen
    print(f"[render] engine: {chosen}")

    # Eevee volumetric tweaks (legacy + next have different attr names)
    eevee = getattr(scene, "eevee", None)
    if eevee:
        for attr, val in {
            "use_volumetric_lights": True,
            "use_volumetric_shadows": False,   # disable for speed
            "volumetric_tile_size": "8",
            "volumetric_samples": 32,           # lighter
            "volumetric_sample_distribution": 0.85,
            "use_bloom": True,
            "bloom_intensity": 0.05,
            "use_taa_reprojection": True,
            "taa_render_samples": 8,            # fast preview-grade AA
        }.items():
            if hasattr(eevee, attr):
                try:
                    setattr(eevee, attr, val)
                except Exception:
                    pass

    # PNG image sequence output (Blender 5.x lost FFMPEG support)
    rd.image_settings.file_format = "PNG"
    rd.image_settings.color_mode = "RGB"
    rd.image_settings.compression = 15
    frames_dir = Path(FRAMES_DIR)
    if frames_dir.exists():
        # Clean previous frames
        for f in frames_dir.glob("*.png"):
            f.unlink()
    frames_dir.mkdir(parents=True, exist_ok=True)
    # Blender appends frame number; we want frames_dir/frame_0001.png ...
    rd.filepath = str(frames_dir / "frame_")

    # Color management — slight contrast
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = -0.4


# ─────────────────────────────────────────────────────────────────────────────
# Tiny deterministic RNG (avoid 'random' module side effects)
# ─────────────────────────────────────────────────────────────────────────────
def _rng(seed: int):
    state = [seed & 0xFFFFFFFF]
    def nxt() -> float:
        # xorshift32 → 0..1
        x = state[0]
        x ^= (x << 13) & 0xFFFFFFFF
        x ^= (x >> 17) & 0xFFFFFFFF
        x ^= (x << 5)  & 0xFFFFFFFF
        state[0] = x & 0xFFFFFFFF
        return (state[0] & 0xFFFFFF) / 0xFFFFFF
    return nxt


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────
def main() -> int:
    print("=== Building scene ===")
    clear_scene()
    setup_world()
    build_terrain()
    build_grid_overlay()
    build_sun_disk()
    build_floaters()
    build_lights()
    cam = build_camera()
    animate_camera(cam)
    configure_render(OUTPUT_MP4)

    print("=== Rendering ===")
    print(f"Frames: 1..{TOTAL_FRAMES}  Size: {RES_X}×{RES_Y}  Output dir: {FRAMES_DIR}")
    bpy.ops.render.render(animation=True)

    pngs = sorted(Path(FRAMES_DIR).glob("frame_*.png"))
    if not pngs:
        print("[ERROR] no PNG frames produced")
        return 1
    print(f"[OK] rendered {len(pngs)} frames in {FRAMES_DIR}")
    print(f"     run ffmpeg externally to encode → {OUTPUT_MP4}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
