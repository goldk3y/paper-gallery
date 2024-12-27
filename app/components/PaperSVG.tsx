export default function PaperSVG() {
  return (
    <svg width="100%" height="100%" preserveAspectRatio="none">
      <defs>
        <filter id="paperEffect" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves="5"
            result="noise"
          />
          <feDiffuseLighting
            in="noise"
            lightingColor="#fff"
            surfaceScale="1.6"
            result="paper"
          >
            <feDistantLight azimuth="45" elevation="60" />
          </feDiffuseLighting>

          <feTurbulence
            type="turbulence"
            baseFrequency="0.05"
            numOctaves="3"
            seed="5"
            result="printNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="printNoise"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displacedImage"
          />

          <feBlend
            in="paper"
            in2="displacedImage"
            mode="multiply"
            result="final"
          />
        </filter>
      </defs>

      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="#ffffff"
        filter="url(#paperEffect)"
      />
    </svg>
  );
} 