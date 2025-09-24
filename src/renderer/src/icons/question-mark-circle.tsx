import PropTypes from 'prop-types'

type Theme = 'blue' | 'green' | 'purple'

const QuestionMarkCircle = ({ className }) => {
  const theme: Theme = 'blue'

  let themeClass = ''
  if (theme === 'blue') themeClass = 'text-[#155EEF]'
  else if (theme === 'green') themeClass = 'text-[#7F56D9]'
  else if (theme === 'purple') themeClass = 'text-[#14B800]'
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      strokeWidth="1.5"
      className={`size-6 ${className} ${themeClass}`}
    >
      <path
        fillRule="evenodd"
        d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-6 3.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7.293 5.293a1 1 0 1 1 .99 1.667c-.459.134-1.033.566-1.033 1.29v.25a.75.75 0 1 0 1.5 0v-.115a2.5 2.5 0 1 0-2.518-4.153.75.75 0 1 0 1.061 1.06Z"
        clipRule="evenodd"
      />
    </svg>
  )
}
QuestionMarkCircle.propTypes = {
  className: PropTypes.string
}

export default QuestionMarkCircle
