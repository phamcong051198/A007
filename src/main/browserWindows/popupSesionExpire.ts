import { BrowserWindow } from 'electron'

export function createSessionExpirePopup(expiredDate: string | Date, autoCloseMs = 5000) {
  const popupWindow = new BrowserWindow({
    modal: true,
    width: 480,
    height: 270,
    show: true,
    resizable: false,
    autoHideMenuBar: true,
    center: true,
    title: 'Session Expiry Notice',
    alwaysOnTop: true,
    backgroundColor: '#151924', // Nền tối
    icon:
      import.meta.env.VITE_BUILD_TARGET === 'BSoft' ? 'build/icon.png' : 'build/icon-corners.png',
    webPreferences: {
      contextIsolation: true,
      sandbox: false
    }
  })

  // Format remaining time
  const expired = typeof expiredDate === 'string' ? new Date(expiredDate) : expiredDate
  const now = new Date()
  const diffMs = expired.getTime() - now.getTime()

  let message: string
  if (diffMs <= 0) {
    message = 'Your session has expired. Please log in again.'
  } else {
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24)
    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60)

    const parts: string[] = []
    if (diffDays > 0) parts.push(`${diffDays} day${diffDays > 1 ? 's' : ''}`)
    if (diffHours > 0) parts.push(`${diffHours} hour${diffHours > 1 ? 's' : ''}`)
    if (diffMinutes > 0) parts.push(`${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`)

    const left = parts.length > 0 ? parts.join(' ') : 'less than a minute'
    message = `Your session will expire in ${left}. Please save your work and login again if needed.`
  }

  const formattedExpired = expired.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const countdownSeconds = Math.round(autoCloseMs / 1000)

  const htmlContent = `
    <html>
      <head>
        <title>Session Expiry Notice</title>
        <style>
          @import url('https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap');
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            background: #151924;
          }
          body {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Roboto', sans-serif;
            background: #151924;
          }
          .overlay {
            width: 100vw;
            height: 100vh;
            background: rgba(21, 25, 36, 0.96);
            position: fixed;
            top: 0; left: 0;
            z-index: 1;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .popup {
            background: #181f2a;
            box-shadow: 0 8px 40px rgba(0,0,0,0.48);
            border-radius: 20px;
            min-width: 340px;
            max-width: 440px;
            width: 100%;
            padding: 36px 30px 28px 30px;
            text-align: center;
            position: relative;
            z-index: 2;
            color: #fff;
            animation: popupIn 0.3s cubic-bezier(.6,2,.7,.7);
          }
          @keyframes popupIn {
            from { transform: scale(0.92) translateY(40px); opacity:0; }
            to   { transform: scale(1) translateY(0); opacity:1; }
          }
          .icon-warning {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 10px;
          }
          .icon-warning svg {
            background: #272e3a;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.12);
            padding: 11px;
            width: 48px;
            height: 48px;
          }
          .close-btn {
            position: absolute; top: 12px; right: 12px;
            width: 32px; height: 32px;
            background: none;
            border: none;
            border-radius: 50%;
            font-size: 22px;
            color: #64748b;
            cursor: pointer;
            transition: background 0.15s, color 0.15s;
            z-index: 10;
          }
          .close-btn:hover { background: #23293a; color: #f87171; }
          .title {
            font-size: 1.38rem;
            font-weight: bold;
            color: #fff;
            margin-bottom: 15px;
          }
          .message {
            font-size: 17px;
            color: #e5e7eb;
            margin-bottom: 20px;
          }
          .expired-date {
            font-size: 14px;
            color: #d1d5db;
            margin-bottom: 16px;
          }
          .countdown {
            font-size: 15px;
            color: #ef4444;
            font-weight: 500;
            letter-spacing: 1px;
            margin-top: 12px;
            background: none;
            border-radius: 8px;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div class="overlay">
          <div class="popup">
            <button class="close-btn" onclick="window.close()" title="Close">&times;</button>
            <div class="icon-warning">
              <svg viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="#fef3c7"/>
                <path d="M20 11v11" stroke="#f59e42" stroke-width="2.2" stroke-linecap="round"/>
                <circle cx="20" cy="28" r="1.5" fill="#f59e42"/>
              </svg>
            </div>
            <div class="title">Session Expiry Notice</div>
            <div class="message">${message}</div>
            <div class="expired-date">Expiry date: <b>${formattedExpired}</b></div>
            <div class="countdown">
              This popup will automatically close in <span id="countdown">${countdownSeconds}</span> second${countdownSeconds !== 1 ? 's' : ''}.
            </div>
          </div>
        </div>
        <script>
          var c = ${countdownSeconds};
          var countdownEl = document.getElementById('countdown');
          var timer = setInterval(function() {
            c--;
            if (c <= 0) {
              window.close();
              clearInterval(timer);
            } else {
              countdownEl.textContent = c;
            }
          }, 1000);
        </script>
      </body>
    </html>
  `

  popupWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)
  return popupWindow
}
