export const getLaunchArgs = (proxyScope: string, proxyIP?: string, proxyPort?: string) => {
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--mute-audio',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-infobars',
    '--disable-popup-blocking',
    '--window-size=1920,1080',
    // Bật third-party cookies
    '--disable-features=BlockThirdPartyCookies,CookieDeprecationLabel,TrackingProtection3pcd',
    '--enable-features=NetworkService,NetworkServiceInProcess'
  ]

  if (proxyScope !== 'None' && proxyIP && proxyPort) {
    args.push(`--proxy-server=http://${proxyIP}:${proxyPort}`)
  }

  return args
}
