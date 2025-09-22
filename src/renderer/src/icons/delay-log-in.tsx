import PropTypes from 'prop-types'

const DelayLogin = ({ className }) => (
  <svg
    width="15"
    height="16"
    viewBox="0 0 15 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className}`}
  >
    <path
      d="M7 5.3335L9.66667 8.00016M9.66667 8.00016L7 10.6668M9.66667 8.00016H1M1.22521 4.66683C2.37791 2.67416 4.53239 1.3335 7 1.3335C10.6819 1.3335 13.6667 4.31826 13.6667 8.00016C13.6667 11.6821 10.6819 14.6668 7 14.6668C4.53239 14.6668 2.37791 13.3262 1.22521 11.3335"
      stroke="#F79009"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
DelayLogin.propTypes = {
  className: PropTypes.string
}

export default DelayLogin
