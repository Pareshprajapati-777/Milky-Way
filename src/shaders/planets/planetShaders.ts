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

      vec3 mapNormal = texture2D(uNormalMap, vUv).rgb * 2.0 - 1.0;
      float normalDetail = clamp(0.96 + mapNormal.z * 0.04, 0.90, 1.02);

      vec3 N = normalize(vNormalWorld);
      vec3 L = normalize(uSunDirection);
      float sunFacing = dot(N, L);

      float dayMask = smoothstep(-0.08, 0.22, sunFacing);
      float nightMask = 1.0 - smoothstep(-0.18, 0.10, sunFacing);

      float twilight = 1.0 - abs(smoothstep(-0.18, 0.18, sunFacing) - 0.5) * 2.0;
      twilight = clamp(twilight, 0.0, 1.0);

      vec3 daylight = dayColor * (0.18 + 0.82 * max(sunFacing, 0.0));
      vec3 city = nightColor * uNightIntensity * uCityGlow * vec3(1.00, 0.93, 0.78);

      vec3 finalColor = daylight * dayMask + city * nightMask;
      finalColor += dayColor * twilight * 0.045;
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
      rim = pow(rim, rimPower);
      float alpha = rim * rimAlpha;
      gl_FragColor = vec4(glowColor, alpha);
    }
  `
};

