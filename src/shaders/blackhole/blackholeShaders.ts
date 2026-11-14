export const BlackHoleAccretionShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,

  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec3 uInnerColor;
    uniform vec3 uOuterColor;
    uniform float uRadius;

    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    // Fast noise for relativistic accretion turbulence
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
      // Polar coords from center
      vec2 centered = vUv - 0.5;
      float dist = length(centered) * 2.0;
      float angle = atan(centered.y, centered.x);

      // Inner shadow boundary (event horizon / photon sphere cut-off)
      if (dist < 0.28) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }

      // Keplerian relativistic differential rotation (faster closer to horizon)
      float rotationSpeed = 1.2 / pow(max(dist, 0.1), 1.5);
      float spiral = angle + uTime * rotationSpeed;

      // Relativistic Doppler Beaming:
      // Approaching side (sin(angle) > 0) is blue-white boosted.
      // Receding side (sin(angle) < 0) is redshifted and dimmer.
      float dopplerFactor = sin(angle);
      vec3 beamedColor = mix(
        vec3(0.55, 0.05, 0.01), // Dim crimson-red receding side
        vec3(0.85, 0.95, 1.35), // Bright blue-white approaching side
        smoothstep(-0.8, 0.8, dopplerFactor)
      );

      // Turbulence bands
      float turbulence = noise(vec2(spiral * 4.0, dist * 12.0));
      float diskDensity = smoothstep(0.28, 0.45, dist) * (1.0 - smoothstep(0.70, 0.98, dist));

      vec3 baseDisk = mix(uInnerColor, uOuterColor, smoothstep(0.3, 0.8, dist));
      vec3 color = baseDisk * beamedColor * (0.65 + 0.7 * turbulence);

      // Strong Doppler intensity boost
      float dopplerIntensity = 1.0 + 0.85 * dopplerFactor;
      color *= dopplerIntensity;

      // Gravitational redshift near horizon
      if (dist < 0.4) {
        color *= vec3(1.2, 0.4, 0.1); // Strong shift toward event horizon red
      }

      float alpha = diskDensity * clamp(dopplerIntensity * 0.9, 0.15, 1.0);
      gl_FragColor = vec4(color, alpha);
    }
  `
};

export const GravitationalLensingShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,

  fragmentShader: /* glsl */ `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vec2 centered = (vUv - 0.5) * 2.0;
      float r = length(centered);

      // Shadow core (Schwarzschild shadow r < 0.42)
      if (r < 0.42) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }

      // Einstein ring peak around r ≈ 0.52
      float einsteinRing = exp(-pow((r - 0.52) * 12.0, 2.0));
      vec3 ringColor = vec3(1.0, 0.85, 0.55) * einsteinRing * 2.0;

      // Outer lensing falloff
      float halo = (1.0 - smoothstep(0.42, 0.95, r)) * 0.4;

      gl_FragColor = vec4(ringColor + vec3(halo * 0.2, halo * 0.4, halo * 0.8), einsteinRing * 0.9 + halo);
    }
  `
};

