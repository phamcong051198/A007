import fs from 'fs'
import path from 'path'
//'chrome-headless-shell'<=>'chrome'
export async function getChromeExecutablePath() {
  const basePath = path.join('resources', '.cache', 'puppeteer', 'chrome')
  try {
    const directories = fs
      .readdirSync(basePath, { withFileTypes: true })
      .filter((dir) => dir.isDirectory() && dir.name.startsWith('win64-'))
      .map((dir) => dir.name)

    if (directories.length === 0) {
      throw new Error('Chrome folder not found in cache.')
    }

    const latestVersion = directories.sort((a, b) => b.localeCompare(a))[0]
    return path.join(basePath, latestVersion, 'chrome-win64', 'chrome.exe')
  } catch (error) {
    console.error('Error finding Chrome path:', error)
    throw error
  }
}
