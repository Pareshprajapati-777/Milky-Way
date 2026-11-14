export const SunSurfaceShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D uTexture;
    uniform float uTime;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    float hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash21(i);
      float b = hash21(i + vec2(1.0, 0.0));
      float c = hash21(i + vec2(0.0, 1.0));
      float d = hash21(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += noise(p) * a;
        p *= 2.02;
        a *= 0.5;
      }
      return v;
    }

    float spot(vec2 uv, vec2 center, vec2 scale, float rotation) {
      vec2 p = uv - center;
      p.x -= round(p.x);

      float c = cos(rotation);
      float s = sin(rotation);
      p = vec2(p.x * c - p.y * s, p.x * s + p.y * c);
      p /= scale;

      float d = length(p);
      float irregular = fbm(uv * 90.0 + center * 17.0);
      float boundary = d + (irregular - 0.5) * 0.12;

      float pen = 1.0 - smoothstep(0.62, 1.05, boundary);
      float umb = 1.0 - smoothstep(0.18, 0.48, boundary);

      return umb * 0.95 + pen * 0.35;
    }

    float sunspotGroups(vec2 uv) {
      float s = 0.0;
      s += spot(uv, vec2(0.105, 0.425), vec2(0.018, 0.026),  0.20);
      s += spot(uv, vec2(0.132, 0.445), vec2(0.010, 0.016), -0.30);
      s += spot(uv, vec2(0.153, 0.418), vec2(0.006, 0.010),  0.10);
      s += spot(uv, vec2(0.285, 0.395), vec2(0.023, 0.032), -0.15);
      s += spot(uv, vec2(0.315, 0.415), vec2(0.011, 0.018),  0.40);
      s += spot(uv, vec2(0.482, 0.485), vec2(0.032, 0.045),  0.20);
      s += spot(uv, vec2(0.515, 0.455), vec2(0.017, 0.027), -0.25);
      s += spot(uv, vec2(0.548, 0.475), vec2(0.011, 0.018),  0.30);
      s += spot(uv, vec2(0.675, 0.395), vec2(0.038, 0.050), -0.25);
      s += spot(uv, vec2(0.712, 0.415), vec2(0.019, 0.029),  0.25);
      s += spot(uv, vec2(0.742, 0.385), vec2(0.012, 0.019), -0.20);
      s += spot(uv, vec2(0.872, 0.365), vec2(0.020, 0.029),  0.10);
      return clamp(s, 0.0, 1.0);
    }

    void main() {
      vec2 uv = vUv;
      vec3 base = texture2D(uTexture, uv).rgb;

      // Fine dynamic convection granulation
      float n1 = fbm(uv * 70.0 + vec2(uTime * 0.025, -uTime * 0.012));
      float n2 = fbm(uv * 150.0 - vec2(uTime * 0.018, uTime * 0.009));
      float gran = mix(n1, n2, 0.32);

      vec3 granularBoost = vec3(1.0, 0.30, 0.035) * (gran - 0.48) * 0.18;
      base += granularBoost;

      // Sunspots with deep umbra and warm penumbra
      float spots = sunspotGroups(uv);
      spots = clamp(spots * mix(0.82, 1.18, noise(uv * 210.0)), 0.0, 1.0);

      base = mix(base, base * vec3(0.035, 0.018, 0.004), smoothstep(0.30, 0.72, spots));
      float pen = smoothstep(0.05, 0.45, spots) * (1.0 - smoothstep(0.45, 0.90, spots));
      base += vec3(0.16, 0.022, 0.002) * pen;

      // Limb darkening falloff
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float facing = max(dot(normalize(vNormal), viewDir), 0.0);
      float limb = pow(facing, 0.48);
      base *= mix(0.57, 1.0, limb);

      // Subtle hot limb emission
      float edge = pow(1.0 - facing, 3.2);
      base += vec3(1.0, 0.18, 0.008) * edge * 0.075;
      base *= 1.25;

      gl_FragColor = vec4(max(base, vec3(0.003, 0.001, 0.0002)), 1.0);
    }
  `
};

export const SunCoronalFlareShader = {
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec4 world = modelMatrix * vec4(position, 1.0);
      vWorldPosition = world.xyz;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,

  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uAlpha;
    uniform vec3 uColor;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float facing = abs(dot(normalize(vNormal), viewDir));
      float rim = pow(1.0 - facing, 3.0);

      float a = atan(vNormal.y, vNormal.x);
      float stream = 0.72 + 0.28 * sin(a * 18.0 + uTime * 0.10);

      float alpha = rim * stream * uAlpha;
      gl_FragColor = vec4(uColor, alpha);
    }
  `
};

