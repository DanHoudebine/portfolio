"""
render_reel.py — Cinematic Blender reel for the Dan Houdebine portfolio.

Premium version (720p, 8s, 12 wireframe floaters, 3-phase camera) built on
top of the v1 scene composition that rendered well: world volumetric fog,
horizon sun, displaced low-poly terrain, wireframe grid underlay.

  & "C:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe" \\
        --background --python blender\\render_reel.py

Output: 192 PNG frames in blender/frames/ → encode to public/portfolio-reel.mp4
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy
import bmesh
from mathutils import Euler


# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────
OUTPUT_MP4 = r"D:\GitHub\Test\Test\public\portfolio-reel.mp4"
FRAMES_DIR = r"D:\GitHub\Test\Test\blender\frames"
RES_X = 1280
RES_Y = 720
FPS = 24
DURATION_S = 8.0
TOTAL_FRAMES = int(FPS * DURATION_S)
SEED = 42

ACCENT_BLUE = (0.376, 0.647, 0.980)
DEEP_BLUE   = (0.114, 0.310, 0.918)
NAVY        = (0.020, 0.040, 0.110)


# ─────────────────────────────────────────────────────────────────────────────
# Scene reset
# ─────────────────────────────────────────────────────────────────────────────
def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (
        bpy.data.meshes, bpy.data.materials, bpy.data.lights,
        bpy.data.cameras, bpy.data.curves, bpy.data.images, bpy.data.textures,
    ):
        for item in list(block):
            block.remove(item)


# ─────────────────────────────────────────────────────────────────────────────
# Materials
# ─────────────────────────────────────────────────────────────────────────────
def emission_material(name, color, strength):
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
    bsdf.inputs["Base Color"].default_value = (*NAVY, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.92
    bsdf.inputs["Metallic"].default_value = 0.05
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (0.10, 0.25, 0.55, 1.0)
    em.inputs["Strength"].default_value = 0.12
    fres = nt.nodes.new("ShaderNodeFresnel")
    fres.inputs["IOR"].default_value = 1.45
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(fres.outputs["Fac"], mix.inputs["Fac"])
    nt.links.new(bsdf.outputs["BSDF"], mix.inputs[1])
    nt.links.new(em.outputs["Emission"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    return mat


def wireframe_material(opacity=0.8):
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
    em.inputs["Color"].default_value = (*ACCENT_BLUE, 1.0)
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
def build_terrain():
    bpy.ops.mesh.primitive_plane_add(size=240, location=(0, -30, -3))
    plane = bpy.context.active_object
    plane.name = "Terrain"

    sub = plane.modifiers.new("Subdivide", "SUBSURF")
    sub.subdivision_type = "SIMPLE"
    if hasattr(sub, "levels"): sub.levels = 6
    elif hasattr(sub, "levels_viewport"): sub.levels_viewport = 6
    sub.render_levels = 6

    t1 = bpy.data.textures.new("T1", type="CLOUDS")
    t1.noise_scale = 2.5
    t1.noise_depth = 5
    d1 = plane.modifiers.new("Disp1", "DISPLACE")
    d1.texture = t1
    d1.strength = 8.0
    d1.mid_level = 0.45

    t2 = bpy.data.textures.new("T2", type="CLOUDS")
    t2.noise_scale = 0.45
    t2.noise_depth = 3
    d2 = plane.modifiers.new("Disp2", "DISPLACE")
    d2.texture = t2
    d2.strength = 1.2
    d2.mid_level = 0.5

    plane.data.materials.append(terrain_material())


def add_ico(loc, sc, rot):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1, location=loc)
    o = bpy.context.active_object
    o.scale = (sc, sc, sc); o.rotation_euler = Euler(rot, "XYZ")
    o.data.materials.append(wireframe_material()); return o


def add_cube(loc, sc, rot):
    bpy.ops.mesh.primitive_cube_add(size=2, location=loc)
    o = bpy.context.active_object
    o.scale = (sc, sc, sc); o.rotation_euler = Euler(rot, "XYZ")
    o.data.materials.append(wireframe_material()); return o


def add_octa(loc, sc, rot):
    mesh = bpy.data.meshes.new("Octa")
    obj = bpy.data.objects.new("Octa", mesh)
    bpy.context.collection.objects.link(obj)
    bm = bmesh.new()
    v = [
        bm.verts.new(( 1, 0, 0)), bm.verts.new((-1, 0, 0)),
        bm.verts.new(( 0, 1, 0)), bm.verts.new(( 0,-1, 0)),
        bm.verts.new(( 0, 0, 1)), bm.verts.new(( 0, 0,-1)),
    ]
    for f in [(4,0,2),(4,2,1),(4,1,3),(4,3,0),(5,2,0),(5,1,2),(5,3,1),(5,0,3)]:
        bm.faces.new([v[i] for i in f])
    bm.to_mesh(mesh); bm.free()
    obj.location = loc; obj.scale = (sc, sc, sc)
    obj.rotation_euler = Euler(rot, "XYZ")
    obj.data.materials.append(wireframe_material())
    return obj


def build_floaters():
    rng = _rng(SEED)
    placements = [
        ("ico",  (-7,  -10,  4), 1.4, (0.3, 0.4, 0.1)),
        ("cube", ( 8,  -14,  3), 1.0, (0.6, 0.2, 0.4)),
        ("octa", ( 0,  -22,  7), 1.6, (0.2, 0.7, 0.3)),
        ("ico",  (-12, -30,  5), 1.2, (0.8, 0.3, 0.5)),
        ("cube", ( 6,  -38,  6), 1.3, (0.4, 0.5, 0.2)),
        ("octa", (-4,  -50,  9), 1.8, (0.1, 0.9, 0.3)),
        ("ico",  ( 11, -60,  8), 1.5, (0.6, 0.4, 0.7)),
        ("cube", (-14, -68,  7), 1.2, (0.3, 0.6, 0.5)),
        ("octa", ( 7,  -85, 10), 2.0, (0.5, 0.3, 0.8)),
        ("ico",  ( 0,  -100, 8), 1.7, (0.7, 0.4, 0.2)),
        ("cube", (-9,  -110, 9), 1.4, (0.4, 0.5, 0.3)),
        ("octa", ( 13, -130, 11), 2.2, (0.6, 0.6, 0.4)),
    ]
    for geo, loc, sc, rot in placements:
        o = add_ico(loc, sc, rot) if geo == "ico" else \
            add_cube(loc, sc, rot) if geo == "cube" else \
            add_octa(loc, sc, rot)
        # keyframed rotation + bob — seamless loop
        o.rotation_mode = "XYZ"
        o.keyframe_insert("rotation_euler", frame=1)
        o.rotation_euler = (rot[0] + rng() * 2.0, rot[1] + rng() * 2.0, rot[2] + rng() * 1.5)
        o.keyframe_insert("rotation_euler", frame=TOTAL_FRAMES + 1)
        bz = loc[2]
        o.location.z = bz;       o.keyframe_insert("location", frame=1, index=2)
        o.location.z = bz + 0.7; o.keyframe_insert("location", frame=TOTAL_FRAMES // 2, index=2)
        o.location.z = bz;       o.keyframe_insert("location", frame=TOTAL_FRAMES + 1, index=2)


def build_sun_disk():
    bpy.ops.mesh.primitive_circle_add(
        vertices=80, radius=14, fill_type="NGON", location=(0, -90, 5),
    )
    sun = bpy.context.active_object
    sun.name = "HorizonSun"
    sun.rotation_euler = Euler((math.pi / 2, 0, 0), "XYZ")
    sun.data.materials.append(emission_material("SunMat", ACCENT_BLUE, 12.0))


def build_grid_underlay():
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, -50, -2.9))
    g = bpy.context.active_object
    g.name = "GridUnder"
    bm = bmesh.new()
    bm.from_mesh(g.data)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=30, use_grid_fill=True)
    bm.to_mesh(g.data); bm.free()
    wf = g.modifiers.new("Wire", "WIREFRAME")
    wf.thickness = 0.03
    g.data.materials.append(emission_material("GridMat", DEEP_BLUE, 1.2))


# ─────────────────────────────────────────────────────────────────────────────
# Lights
# ─────────────────────────────────────────────────────────────────────────────
def build_lights():
    bpy.ops.object.light_add(type="SUN", location=(0, -80, 10))
    s = bpy.context.active_object
    s.data.energy = 1.8
    s.data.color = (0.45, 0.65, 1.0)
    s.rotation_euler = Euler((math.radians(75), 0, 0), "XYZ")

    bpy.ops.object.light_add(type="AREA", location=(0, -10, 25))
    f = bpy.context.active_object
    f.data.energy = 600
    f.data.color = (0.6, 0.75, 1.0)
    f.data.size = 40
    f.rotation_euler = Euler((math.radians(-15), 0, 0), "XYZ")


# ─────────────────────────────────────────────────────────────────────────────
# Camera — 3-phase animation that loops
# ─────────────────────────────────────────────────────────────────────────────
def build_camera():
    bpy.ops.object.camera_add(location=(0, 4, 3.2))
    c = bpy.context.active_object
    c.data.lens = 28
    c.data.clip_end = 350
    bpy.context.scene.camera = c
    return c


def animate_camera(cam):
    F = TOTAL_FRAMES
    p1 = int(F * 0.40)
    p2 = int(F * 0.70)

    cam.location = (0.0, 4.0, 3.2)
    cam.rotation_euler = Euler((math.radians(82), 0, 0), "XYZ")
    cam.keyframe_insert("location", frame=1)
    cam.keyframe_insert("rotation_euler", frame=1)

    # P1 — lateral push, slight bank
    cam.location = (1.8, -8.0, 4.5)
    cam.rotation_euler = Euler((math.radians(84), 0, math.radians(3)), "XYZ")
    cam.keyframe_insert("location", frame=p1)
    cam.keyframe_insert("rotation_euler", frame=p1)

    # P2 — gentle arc up, opposite bank, slight tilt down
    cam.location = (-1.5, -16.0, 6.2)
    cam.rotation_euler = Euler((math.radians(86), 0, math.radians(-2)), "XYZ")
    cam.keyframe_insert("location", frame=p2)
    cam.keyframe_insert("rotation_euler", frame=p2)

    # Return to start — seamless loop
    cam.location = (0.0, 4.0, 3.2)
    cam.rotation_euler = Euler((math.radians(82), 0, 0), "XYZ")
    cam.keyframe_insert("location", frame=F + 1)
    cam.keyframe_insert("rotation_euler", frame=F + 1)


# ─────────────────────────────────────────────────────────────────────────────
# World — bg + volumetric scatter
# ─────────────────────────────────────────────────────────────────────────────
def setup_world():
    world = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Color"].default_value = (0.015, 0.025, 0.055, 1.0)
    bg.inputs["Strength"].default_value = 1.0
    vol = nt.nodes.new("ShaderNodeVolumeScatter")
    vol.inputs["Color"].default_value = (0.30, 0.50, 1.0, 1.0)
    vol.inputs["Density"].default_value = 0.028
    vol.inputs["Anisotropy"].default_value = 0.15
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    nt.links.new(vol.outputs["Volume"],     out.inputs["Volume"])


# ─────────────────────────────────────────────────────────────────────────────
# Render
# ─────────────────────────────────────────────────────────────────────────────
def configure_render():
    scene = bpy.context.scene
    rd = scene.render
    rd.resolution_x = RES_X
    rd.resolution_y = RES_Y
    rd.resolution_percentage = 100
    rd.fps = FPS
    scene.frame_start = 1
    scene.frame_end = TOTAL_FRAMES

    avail = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
    chosen = next((c for c in ["BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"] if c in avail), avail[0])
    rd.engine = chosen
    print(f"[render] engine: {chosen}")

    eevee = getattr(scene, "eevee", None)
    if eevee:
        for attr, val in {
            "use_volumetric_lights": True,
            "use_volumetric_shadows": False,
            "volumetric_tile_size": "8",
            "volumetric_samples": 48,
            "volumetric_sample_distribution": 0.85,
            "use_bloom": True,
            "bloom_intensity": 0.06,
            "use_taa_reprojection": True,
            "taa_render_samples": 16,
        }.items():
            if hasattr(eevee, attr):
                try: setattr(eevee, attr, val)
                except Exception: pass

    rd.image_settings.file_format = "PNG"
    rd.image_settings.color_mode = "RGB"
    rd.image_settings.compression = 15
    fd = Path(FRAMES_DIR)
    if fd.exists():
        for f in fd.glob("*.png"): f.unlink()
    fd.mkdir(parents=True, exist_ok=True)
    rd.filepath = str(fd / "frame_")

    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = -0.4


def _rng(seed):
    state = [seed & 0xFFFFFFFF]
    def nxt():
        x = state[0]
        x ^= (x << 13) & 0xFFFFFFFF
        x ^= (x >> 17) & 0xFFFFFFFF
        x ^= (x << 5)  & 0xFFFFFFFF
        state[0] = x & 0xFFFFFFFF
        return (state[0] & 0xFFFFFF) / 0xFFFFFF
    return nxt


def main():
    print("=== Building scene ===")
    clear_scene()
    setup_world()
    build_terrain()
    build_grid_underlay()
    build_sun_disk()
    build_floaters()
    build_lights()
    cam = build_camera()
    animate_camera(cam)
    configure_render()

    print("=== Rendering ===")
    print(f"Frames: 1..{TOTAL_FRAMES}  Size: {RES_X}×{RES_Y}  Output: {FRAMES_DIR}")
    bpy.ops.render.render(animation=True)

    pngs = sorted(Path(FRAMES_DIR).glob("frame_*.png"))
    if not pngs:
        print("[ERROR] no PNG frames produced")
        return 1
    print(f"[OK] {len(pngs)} frames rendered")
    return 0


if __name__ == "__main__":
    sys.exit(main())
