import PropTypes from 'prop-types'
type Theme = 'blue' | 'green' | 'purple'
const ExclamationTriangle = ({ className }) => {
  const buildTarget = import.meta.env.VITE_BUILD_TARGET

  let theme: Theme = 'blue'
  switch (buildTarget) {
    case 'BSoft':
      theme = 'blue'
      break
    case 'BSoft-switch':
      theme = 'green'
      break
    case 'BSoft-corners':
      theme = 'purple'
      break
    default:
      theme = 'blue'
  }

  const themeClass = 'text-[#D92D20]'
  // if (theme === 'blue') themeClass = 'text-[#155EEF]'
  // else if (theme === 'green') themeClass = 'text-[#7F56D9]'
  // else if (theme === 'purple') themeClass = 'text-[#14B800]'

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${className} ${themeClass}`}
      stroke="#FFA500"
      strokeWidth={0}
    >
      <path
        fillRule="evenodd"
        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
        clipRule="evenodd"
        stroke="inherit"
      />
    </svg>
  )
}

ExclamationTriangle.propTypes = {
  className: PropTypes.string
}

export default ExclamationTriangle
