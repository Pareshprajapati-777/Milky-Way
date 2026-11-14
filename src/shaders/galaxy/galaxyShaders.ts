export const GalaxyDustShaders = {
  vertexShader: /* glsl */ `
    attribute float size;
    attribute vec3 customColor;
    varying vec3 vColor;
    varying float vDistance;

    void main() {
      vColor = customColor;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vDistance = -mvPosition.z;
      gl_PointSize = size * (400.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: /* glsl */ `
    varying vec3 vColor;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      // Soft gaussian profile
      float alpha = exp(-dist * dist * 9.0);
      gl_FragColor = vec4(vColor, alpha * 0.7);
    }
  `
};

export const GalacticBulgeShader = {
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform vec3 uBulgeColor;
    uniform float uIntensity;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      float radial = length(vPosition) / 25.0;
      float glow = exp(-radial * 2.8) * uIntensity;
      gl_FragColor = vec4(uBulgeColor * glow, glow);
    }
  `
};

export const StarDiffractionShader = {
  vertexShader: /* glsl */ `
    attribute float aSize;
    attribute vec3 aColor;
    varying vec3 vColor;

    void main() {
      vColor = aColor;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = aSize * (350.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: /* glsl */ `
    varying vec3 vColor;

    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float dist = length(uv);
      if (dist > 0.5) discard;

      // Diffraction cross spike
      float spike = max(
        exp(-abs(uv.x) * 35.0) * exp(-abs(uv.y) * 4.0),
        exp(-abs(uv.y) * 35.0) * exp(-abs(uv.x) * 4.0)
      );

      float core = exp(-dist * 18.0);
      float alpha = clamp(core * 1.5 + spike * 0.45, 0.0, 1.0);

      gl_FragColor = vec4(vColor, alpha);
    }
  `
};

