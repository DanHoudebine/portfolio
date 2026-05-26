"""
render_reel.py — Cycles path-traced reel for the Dan Houdebine portfolio.

Premium upgrade over the Eevee v5: switches to Cycles for physically-correct
emission, volumetric god rays, accurate fog interaction with the horizon sun
and emissive monoliths. Uses OptiX on NVIDIA GPUs (RTX 5070 detected).

  & "C:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe" \\
        --background --python blender\\render_reel.py

Outputs 192 PNG frames at 1280×720, 24 fps (8-second seamless loop).
Encode externally to public/portfolio-reel.mp4 via ffmpeg.
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
FRAMES_DIR  = r"D:\GitHub\Test\Test\blender\frames"
RES_X = 1280
RES_Y = 720
FPS = 24
DURATION_S = 8.0
TOTAL_FRAMES = int(FPS * DURATION_S)
SEED = 42

# Cycles quality — OptiX denoise lets us run very low samples
CYCLES_SAMPLES = 48           # with OIDN/OptiX denoise = clean
CYCLES_VOL_BOUNCES = 2
CYCLES_VOL_STEP_RATE = 0.5    # smaller = sharper god rays
CYCLES_VOL_STEP_RATE_RENDER = 0.5

ACCENT_BLUE = (0.376, 0.647, 0.980)
DEEP_BLUE   = (0.114, 0.310, 0.918)
NAVY        = (0.020, 0.040, 0.110)


# ─────────────────────────────────────────────────────────────────────────────
# GPU/OptiX setup (runs at module load before anything else)
# ─────────────────────────────────────────────────────────────────────────────
def setup_gpu():
    """Enable OptiX (NVIDIA RTX) if available, fall back to CUDA, then CPU."""
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
    except KeyError:
        print("[gpu] cycles addon not enabled — defaulting to CPU")
        return None

    # Try backends in preference order
    for backend in ("OPTIX", "CUDA", "HIP", "ONEAPI", "METAL"):
        try:
            prefs.compute_device_type = backend
            prefs.refresh_devices()
            devices = [d for d in prefs.devices if d.type == backend]
            if devices:
                for d in prefs.devices:
                    # Enable matching backend devices, leave CPU off (it'd slow GPU down)
                    d.use = (d.type == backend)
                names = [d.name for d in devices]
                print(f"[gpu] using {backend}: {', '.join(names)}")
                return backend
        except Exception as e:
            print(f"[gpu] {backend} unavailable: {e}")

    print("[gpu] no GPU backend usable, using CPU")
    return None


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
    bsdf.inputs["Metallic"].default_value = 0.08
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (0.10, 0.25, 0.55, 1.0)
    em.inputs["Strength"].default_value = 0.20
    fres = nt.nodes.new("ShaderNodeFresnel")
    fres.inputs["IOR"].default_value = 1.45
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(fres.outputs["Fac"], mix.inputs["Fac"])
    nt.links.new(bsdf.outputs["BSDF"], mix.inputs[1])
    nt.links.new(em.outputs["Emission"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    return mat


def monolith_material():
    """Vertical gradient emission — bright top, dark base, reads as a beacon."""
    mat = bpy.data.materials.new(name="MonolithMat")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em  = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*ACCENT_BLUE, 1.0)
    txc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    rng = nt.nodes.new("ShaderNodeMapRange")
    rng.inputs["From Min"].default_value = -0.5
    rng.inputs["From Max"].default_value =  0.5
    rng.inputs["To Min"].default_value = 0.6     # never fully dark
    rng.inputs["To Max"].default_value = 8.0     # bright tip
    nt.links.new(txc.outputs["Generated"], sep.inputs["Vector"])
    nt.links.new(sep.outputs["Z"], rng.inputs["Value"])
    nt.links.new(rng.outputs["Result"], em.inputs["Strength"])
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return mat


def wireframe_material():
    mat = bpy.data.materials.new(name="WireMat")
    mat.use_nodes = True
    mat.blend_method = "BLEND"
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    wire = nt.nodes.new("ShaderNodeWireframe")
    wire.use_pixel_size = False  # Cycles handles real wireframe size well
    wire.inputs["Size"].default_value = 0.025
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*ACCENT_BLUE, 1.0)
    em.inputs["Strength"].default_value = 5.0
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
    t1.noise_scale = 6.0
    t1.noise_depth = 3
    d1 = plane.modifiers.new("Disp1", "DISPLACE")
    d1.texture = t1
    d1.strength = 6.0
    d1.mid_level = 0.5

    t2 = bpy.data.textures.new("T2", type="CLOUDS")
    t2.noise_scale = 1.0
    t2.noise_depth = 4
    d2 = plane.modifiers.new("Disp2", "DISPLACE")
    d2.texture = t2
    d2.strength = 2.0
    d2.mid_level = 0.5

    plane.data.materials.append(terrain_material())


def build_monoliths():
    """5 emissive obelisks scaling up in size with distance."""
    placements = [
        # (location, height, base, twist)
        ((-7,  -10, 4), 8.0,  0.7, math.radians(15)),
        (( 9,  -18, 5), 10.0, 0.7, math.radians(-25)),
        ((-4,  -32, 6), 13.0, 0.85, math.radians(8)),
        (( 11, -48, 7), 15.0, 0.8, math.radians(-12)),
        ((-13, -64, 8), 17.0, 0.95, math.radians(20)),
    ]
    mat = monolith_material()
    for loc, h, b, tw in placements:
        bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
        obj = bpy.context.active_object
        obj.scale = (b, b, h)
        obj.rotation_euler = Euler((0, 0, tw), "XYZ")
        obj.data.materials.append(mat)


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
        ("ico",  (-5,  -6,  4), 1.0, (0.3, 0.4, 0.1)),
        ("cube", ( 6,  -10, 3), 0.8, (0.6, 0.2, 0.4)),
        ("octa", ( 0,  -16, 7), 1.2, (0.2, 0.7, 0.3)),
        ("ico",  (-10, -24, 5), 1.0, (0.8, 0.3, 0.5)),
        ("cube", ( 4,  -30, 6), 1.0, (0.4, 0.5, 0.2)),
        ("octa", (-3,  -42, 9), 1.4, (0.1, 0.9, 0.3)),
        ("ico",  ( 9,  -50, 8), 1.2, (0.6, 0.4, 0.7)),
        ("cube", (-12, -58, 7), 1.0, (0.3, 0.6, 0.5)),
        ("octa", ( 6,  -75, 10), 1.6, (0.5, 0.3, 0.8)),
        ("ico",  ( 0,  -90, 8), 1.4, (0.7, 0.4, 0.2)),
    ]
    for geo, loc, sc, rot in placements:
        o = add_ico(loc, sc, rot) if geo == "ico" else \
            add_cube(loc, sc, rot) if geo == "cube" else \
            add_octa(loc, sc, rot)
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
        vertices=96, radius=15, fill_type="NGON", location=(0, -85, 7),
    )
    sun = bpy.context.active_object
    sun.name = "HorizonSun"
    sun.rotation_euler = Euler((math.pi / 2, 0, 0), "XYZ")
    sun.data.materials.append(emission_material("SunMat", ACCENT_BLUE, 25.0))


def build_grid_underlay():
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, -50, -2.9))
    g = bpy.context.active_object
    g.name = "GridUnder"
    bm = bmesh.new()
    bm.from_mesh(g.data)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=30, use_grid_fill=True)
    bm.to_mesh(g.data); bm.free()
    wf = g.modifiers.new("Wire", "WIREFRAME")
    wf.thickness = 0.025
    g.data.materials.append(emission_material("GridMat", DEEP_BLUE, 2.5))


# ─────────────────────────────────────────────────────────────────────────────
# Lights
# ─────────────────────────────────────────────────────────────────────────────
def build_lights():
    bpy.ops.object.light_add(type="SUN", location=(0, -80, 12))
    s = bpy.context.active_object
    s.data.energy = 2.5
    s.data.color = (0.55, 0.72, 1.0)
    s.rotation_euler = Euler((math.radians(76), 0, 0), "XYZ")
    s.data.angle = math.radians(2)

    bpy.ops.object.light_add(type="AREA", location=(0, -10, 25))
    f = bpy.context.active_object
    f.data.energy = 1200
    f.data.color = (0.60, 0.76, 1.0)
    f.data.size = 40
    f.rotation_euler = Euler((math.radians(-15), 0, 0), "XYZ")


# ─────────────────────────────────────────────────────────────────────────────
# Camera + 3-phase animation
# ─────────────────────────────────────────────────────────────────────────────
def build_camera():
    bpy.ops.object.camera_add(location=(0, 4, 3.2))
    c = bpy.context.active_object
    c.data.lens = 28
    c.data.clip_end = 350
    c.data.dof.use_dof = True
    c.data.dof.focus_distance = 35.0
    c.data.dof.aperture_fstop = 4.0
    bpy.context.scene.camera = c
    return c


def animate_camera(cam):
    F = TOTAL_FRAMES
    p1 = int(F * 0.40)
    p2 = int(F * 0.70)

    cam.location = (0.0, 5.0, 3.4)
    cam.rotation_euler = Euler((math.radians(84), 0, 0), "XYZ")
    cam.keyframe_insert("location", frame=1)
    cam.keyframe_insert("rotation_euler", frame=1)

    cam.location = (1.8, -8.0, 4.8)
    cam.rotation_euler = Euler((math.radians(85), 0, math.radians(3)), "XYZ")
    cam.keyframe_insert("location", frame=p1)
    cam.keyframe_insert("rotation_euler", frame=p1)

    cam.location = (-1.5, -18.0, 6.6)
    cam.rotation_euler = Euler((math.radians(86), 0, math.radians(-2)), "XYZ")
    cam.keyframe_insert("location", frame=p2)
    cam.keyframe_insert("rotation_euler", frame=p2)

    cam.location = (0.0, 5.0, 3.4)
    cam.rotation_euler = Euler((math.radians(84), 0, 0), "XYZ")
    cam.keyframe_insert("location", frame=F + 1)
    cam.keyframe_insert("rotation_euler", frame=F + 1)


# ─────────────────────────────────────────────────────────────────────────────
# World — dark sky + volumetric scatter (god rays now actually render in Cycles)
# ─────────────────────────────────────────────────────────────────────────────
def setup_world():
    world = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Color"].default_value = (0.018, 0.040, 0.105, 1.0)
    bg.inputs["Strength"].default_value = 1.6
    vol = nt.nodes.new("ShaderNodeVolumeScatter")
    vol.inputs["Color"].default_value = (0.30, 0.55, 1.0, 1.0)
    vol.inputs["Density"].default_value = 0.025
    vol.inputs["Anisotropy"].default_value = 0.40   # strong forward = nice god rays
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    nt.links.new(vol.outputs["Volume"],     out.inputs["Volume"])


# ─────────────────────────────────────────────────────────────────────────────
# Render (Cycles + OptiX denoise)
# ─────────────────────────────────────────────────────────────────────────────
def configure_render(gpu_backend):
    scene = bpy.context.scene
    rd = scene.render
    rd.resolution_x = RES_X
    rd.resolution_y = RES_Y
    rd.resolution_percentage = 100
    rd.fps = FPS
    scene.frame_start = 1
    scene.frame_end = TOTAL_FRAMES

    rd.engine = "CYCLES"
    cy = scene.cycles

    def _set(obj, attr, val):
        if hasattr(obj, attr):
            try: setattr(obj, attr, val)
            except Exception as e: print(f"[cy] {attr} set failed: {e}")

    _set(cy, "feature_set", "SUPPORTED")
    _set(cy, "device", "GPU" if gpu_backend else "CPU")
    _set(cy, "samples", CYCLES_SAMPLES)
    _set(cy, "use_adaptive_sampling", True)
    _set(cy, "adaptive_threshold", 0.02)
    _set(cy, "use_denoising", True)

    denoiser = "OPTIX" if gpu_backend == "OPTIX" else "OPENIMAGEDENOISE"
    _set(cy, "denoiser", denoiser)
    _set(cy, "denoising_input_passes", "RGB_ALBEDO_NORMAL")
    _set(cy, "denoising_prefilter", "ACCURATE")

    _set(cy, "volume_max_steps", 256)
    _set(cy, "volume_step_rate", CYCLES_VOL_STEP_RATE)
    _set(cy, "volume_preview_step_rate", CYCLES_VOL_STEP_RATE)
    _set(cy, "max_bounces", 4)
    _set(cy, "diffuse_bounces", 2)
    _set(cy, "glossy_bounces", 2)
    _set(cy, "transmission_bounces", 2)
    _set(cy, "volume_bounces", CYCLES_VOL_BOUNCES)
    _set(cy, "transparent_max_bounces", 4)
    _set(cy, "use_preview_denoising", False)
    _set(cy, "tile_size", 2048)
    _set(cy, "use_auto_tile", False)

    # PNG sequence
    rd.image_settings.file_format = "PNG"
    rd.image_settings.color_mode = "RGB"
    rd.image_settings.compression = 15
    fd = Path(FRAMES_DIR)
    if fd.exists():
        for f in fd.glob("*.png"): f.unlink()
    fd.mkdir(parents=True, exist_ok=True)
    rd.filepath = str(fd / "frame_")

    # Color management
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = 0.2

    print(f"[render] CYCLES samples={cy.samples} device={cy.device} denoiser={getattr(cy,'denoiser','?')}")


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
    print("=== GPU setup ===")
    backend = setup_gpu()

    print("=== Building scene ===")
    clear_scene()
    setup_world()
    build_terrain()
    build_grid_underlay()
    build_sun_disk()
    build_monoliths()
    build_floaters()
    build_lights()
    cam = build_camera()
    animate_camera(cam)
    configure_render(backend)

    print("=== Rendering ===")
    print(f"Frames 1..{TOTAL_FRAMES}  Size {RES_X}×{RES_Y}  Output: {FRAMES_DIR}")
    bpy.ops.render.render(animation=True)

    pngs = sorted(Path(FRAMES_DIR).glob("frame_*.png"))
    if not pngs:
        print("[ERROR] no PNG frames produced")
        return 1
    print(f"[OK] {len(pngs)} frames rendered")
    return 0


if __name__ == "__main__":
    sys.exit(main())
