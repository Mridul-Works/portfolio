// Shaders that turn the (ocean) scene into a desert:
//  - a sand shader for the former water planes: procedural dune ripples,
//    self-lit by a single warm sun, fading into horizon haze.
//  - a sky-dome gradient with a warm sun disk and glow.

const GLSL_NOISE = /* glsl */ `
  float hash(vec2 p){
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0;
    float a = 0.5;
    for(int i = 0; i < 5; i++){
      v += a * vnoise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }
`;

export const sandVertexShader = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormalW;

  void main(){
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export const sandFragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vWorldPos;
  varying vec3 vNormalW;

  uniform vec3  uCam;
  uniform vec3  uSunDir;
  uniform vec3  uSunColor;
  uniform vec3  uSandLit;
  uniform vec3  uSandShadow;
  uniform vec3  uFogColor;
  uniform float uFogDensity;
  uniform float uRippleScale;

  // Neon blob interaction.
  uniform vec3  uBlobPos;
  uniform vec3  uBlobColor;
  uniform float uBlobRadius;
  uniform float uGroundY;

  ${GLSL_NOISE}

  // Height field used only to derive a ripple normal (fine wind ripples + dunes).
  float sandHeight(vec2 p){
    float dunes = fbm(p * 0.12) * 1.2;
    float ripples = sin(p.x * uRippleScale + fbm(p * 0.8) * 4.0) * 0.5
                  + sin(p.y * uRippleScale * 0.6) * 0.25;
    return dunes + ripples * 0.15;
  }

  void main(){
    vec2 p = vWorldPos.xz;

    // Perturb the flat plane normal with the ripple gradient so it catches light.
    float e = 0.06;
    float hx = sandHeight(p + vec2(e, 0.0)) - sandHeight(p - vec2(e, 0.0));
    float hz = sandHeight(p + vec2(0.0, e)) - sandHeight(p - vec2(0.0, e));
    vec3 n = normalize(vNormalW + vec3(-hx, 0.0, -hz) * 1.4);

    vec3 sun = normalize(uSunDir);
    float diff = clamp(dot(n, sun), 0.0, 1.0);

    // Base sand color varies with the large dune field.
    float dune = clamp(fbm(p * 0.12) * 0.7 + 0.35, 0.0, 1.0);
    vec3 sand = mix(uSandShadow, uSandLit, dune);

    // Lambert + soft sky ambient + a warm grazing sheen toward the sun.
    float ambient = 0.42;
    sand *= (ambient + diff * 1.05);
    sand += uSunColor * pow(diff, 3.0) * 0.12;

    // Fine grain sparkle.
    sand += (hash(p * 240.0) - 0.5) * 0.025;

    // --- Neon blob: a purple glow pooling on the sand, plus a cast shadow. ---
    // Radial purple glow pooling around the blob (scaled to the blob's size).
    float gDist = length(vWorldPos - uBlobPos);
    float glow = exp(-pow(gDist / max(uBlobRadius, 0.001), 2.0) * 0.7);
    sand += uBlobColor * glow * 0.8;

    // Shadow: project the blob onto the ground along the sun direction and throw
    // it long (late-afternoon feel), as an ellipse stretched away from the sun.
    vec3 sd = normalize(uSunDir);
    float tt = (uBlobPos.y - uGroundY) / max(sd.y, 0.001) * 2.2;
    vec2 shadowCenter = uBlobPos.xz - sd.xz * tt;
    vec2 shDir = normalize(-sd.xz);           // shadow stretches this way
    vec2 rel = p - shadowCenter;
    float along = dot(rel, shDir);
    float perp = dot(rel, vec2(-shDir.y, shDir.x));
    float sDist = length(vec2(along * 0.5, perp)); // squash along-axis -> elongate
    float shadow = smoothstep(uBlobRadius * 1.8, uBlobRadius * 0.2, sDist);
    sand *= (1.0 - shadow * 0.8);

    // Distance haze so the flats melt into the sky at the horizon.
    float dist = length(vWorldPos - uCam);
    float fog = 1.0 - exp(-uFogDensity * dist);
    vec3 col = mix(sand, uFogColor, clamp(fog, 0.0, 1.0));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const skyVertexShader = /* glsl */ `
  varying vec3 vDir;
  void main(){
    vDir = position; // sphere is centered on the camera rig
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const skyFragmentShader = /* glsl */ `
  precision highp float;
  varying vec3 vDir;

  uniform vec3 uSkyTop;
  uniform vec3 uSkyHorizon;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;

  void main(){
    vec3 d = normalize(vDir);
    float t = clamp(d.y * 1.1 + 0.12, 0.0, 1.0);
    vec3 sky = mix(uSkyHorizon, uSkyTop, pow(t, 0.55));

    float s = max(dot(d, normalize(uSunDir)), 0.0);
    sky += uSunColor * pow(s, 90.0) * 1.4; // sun disk
    sky += uSunColor * pow(s, 6.0) * 0.30;  // warm glow

    gl_FragColor = vec4(sky, 1.0);
  }
`;

// --- Neon blob ---------------------------------------------------------------
// An icosphere pushed around by animated 3D noise (a different lumpy shape every
// moment), shaded as an emissive neon surface with a bright fresnel rim.
const GLSL_NOISE3D = /* glsl */ `
  float hash31(vec3 p){
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float vnoise3(vec3 x){
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
          mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
          mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }
  float fbm3(vec3 p){
    float v = 0.0;
    float a = 0.5;
    for(int i = 0; i < 4; i++){ v += a * vnoise3(p); p *= 2.03; a *= 0.5; }
    return v;
  }
`;

export const blobVertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormalW;
  varying vec3 vWorldPos;

  ${GLSL_NOISE3D}

  void main(){
    // Displace along the normal by evolving noise -> a writhing, random blob.
    float n = fbm3(normal * 1.6 + uTime * 0.25);
    float disp = (n - 0.5) * 0.9;
    vec3 pos = position + normal * disp;

    // Cheap re-normal: perturb toward the noise gradient so the rim reads.
    float e = 0.15;
    float nx = fbm3((normal + vec3(e,0,0)) * 1.6 + uTime * 0.25);
    float ny = fbm3((normal + vec3(0,e,0)) * 1.6 + uTime * 0.25);
    float nz = fbm3((normal + vec3(0,0,e)) * 1.6 + uTime * 0.25);
    vec3 grad = vec3(nx, ny, nz) - n;
    vec3 nrm = normalize(normal - grad * 1.5);

    vec4 wp = modelMatrix * vec4(pos, 1.0);
    vWorldPos = wp.xyz;
    vNormalW = normalize(mat3(modelMatrix) * nrm);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export const blobFragmentShader = /* glsl */ `
  precision highp float;
  varying vec3 vNormalW;
  varying vec3 vWorldPos;

  uniform vec3  uColor;
  uniform vec3  uCamPos;
  uniform float uTime;

  void main(){
    vec3 V = normalize(uCamPos - vWorldPos);
    // Softer falloff (lower power, wider spread) so the rim reads as a hazy
    // bloom rather than a crisp outline — a slight out-of-focus feel.
    float fres = pow(1.0 - max(dot(normalize(vNormalW), V), 0.0), 1.4);

    // Deep purple core, hot magenta-white rim, gently pulsing.
    vec3 col = uColor * 0.55;
    col += uColor * fres * 3.0;
    col += vec3(1.0, 0.6, 1.0) * fres * fres * 1.2;
    col *= 0.9 + 0.18 * sin(uTime * 2.2);

    gl_FragColor = vec4(col, 1.0);
  }
`;
