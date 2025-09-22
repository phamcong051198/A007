import PropTypes from 'prop-types'

const SwitchHorizontalBorder = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_1515_10082)">
      <path
        d="M2 13C2 6.37258 7.37258 1 14 1H38C44.6274 1 50 6.37258 50 13V37C50 43.6274 44.6274 49 38 49H14C7.37258 49 2 43.6274 2 37V13Z"
        fill="#0C0E12"
        shapeRendering="crispEdges"
      />
      <path
        d="M14 1.5H38C44.3513 1.5 49.5 6.64873 49.5 13V37C49.5 43.3513 44.3513 48.5 38 48.5H14C7.64873 48.5 2.5 43.3513 2.5 37V13C2.5 6.64873 7.64873 1.5 14 1.5Z"
        stroke="#22262F"
        shapeRendering="crispEdges"
      />
      <path
        d="M34 30H18M18 30L22 26M18 30L22 34M18 20H34M34 20L30 16M34 20L30 24"
        stroke="#CECFD2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_1515_10082"
        x="0"
        y="0"
        width="52"
        height="52"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="1" />
        <feGaussianBlur stdDeviation="1" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.0392157 0 0 0 0 0.0509804 0 0 0 0 0.0705882 0 0 0 0.05 0"
        />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1515_10082" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_1515_10082"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)
SwitchHorizontalBorder.propTypes = {
  className: PropTypes.string
}

export default SwitchHorizontalBorder
