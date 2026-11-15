export const EarthNightDayShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormalWorld;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vNormalWorld = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D uDayMap;
    uniform sampler2D uNightMap;
    uniform sampler2D uNormalMap;
    uniform vec3 uSunDirection;
    uniform float uNightIntensity;
    uniform float uCityGlow;
    uniform float uTime;

    varying vec2 vUv;
    varying vec3 vNormalWorld;
    varying vec3 vWorldPosition;

    void main() {
      vec3 dayColor = texture2D(uDayMap, vUv).rgb;
      vec3 nightColor = texture2D(uNightMap, vUv).rgb;

      // Solid baseline: ensure oceans and land are never empty or transparent
      vec3 fallbackOcean = vec3(0.05, 0.18, 0.42);
      vec3 fallbackLand = vec3(0.14, 0.32, 0.16);
      float isLand = smoothstep(0.12, 0.35, dayColor.g - dayColor.b * 0.3);
      vec3 solidDayColor = length(dayColor) > 0.04 ? dayColor : mix(fallbackOcean, fallbackLand, isLand);

      vec3 mapNormal = texture2D(uNormalMap, vUv).rgb * 2.0 - 1.0;
      float normalDetail = clamp(0.96 + mapNormal.z * 0.04, 0.90, 1.02);

      vec3 N = normalize(vNormalWorld);
      vec3 L = normalize(uSunDirection);
      float sunFacing = dot(N, L);

      float dayMask = smoothstep(-0.08, 0.22, sunFacing);
      float nightMask = 1.0 - smoothstep(-0.18, 0.10, sunFacing);

      float twilight = 1.0 - abs(smoothstep(-0.18, 0.18, sunFacing) - 0.5) * 2.0;
      twilight = clamp(twilight, 0.0, 1.0);

      vec3 daylight = solidDayColor * (0.22 + 0.78 * max(sunFacing, 0.0));
      vec3 city = nightColor * uNightIntensity * uCityGlow * vec3(1.00, 0.93, 0.78);

      // Ambient starlight / earthshine so the dark side of Earth remains visible as an opaque, solid celestial sphere
      vec3 nightAmbient = solidDayColor * 0.16 + vec3(0.018, 0.035, 0.065);

      vec3 finalColor = daylight * dayMask + (city + nightAmbient) * nightMask;
      finalColor += solidDayColor * twilight * 0.06;
      finalColor *= normalDetail;
      finalColor += city * nightMask * 0.12;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

export const RayleighAtmosphereShader = {
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,

  fragmentShader: /* glsl */ `
    uniform vec3 glowColor;
    uniform float rimPower;
    uniform float rimAlpha;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      float rim = 1.0 - max(dot(vNormal, viewDirection), 0.0);
      float p = rimPower > 0.0 ? rimPower : 3.5;
      float a = rimAlpha > 0.0 ? rimAlpha : 0.25;
      rim = pow(clamp(rim, 0.0, 1.0), p);
      float alpha = rim * a;
      gl_FragColor = vec4(glowColor, alpha);
    }
  `
};

