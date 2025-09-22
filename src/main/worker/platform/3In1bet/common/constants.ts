export const API_BASE_URL = 'https://www.8611357.com'

export const API_ENDPOINTS = {
  CHECK: `${API_BASE_URL}/check.aspx`,
  PROCESSLOGIN: `${API_BASE_URL}/main/processlogin.aspx`,
  MAIN_TOP_HEADER: `${API_BASE_URL}/main/topheader.aspx?lan=en-US`,
  USER_INFO_PANEL_HOST: `${API_BASE_URL}/member/betsview/UserInfoPanelHost.aspx?Ajax=1`,
  DATA_ODDS: `${API_BASE_URL}/Member/BetsView/BetLight/DataOdds.ashx`,
  SET_DATA: `${API_BASE_URL}/member/betsview/Bet.asmx/SetData`,
  BET_NOW: `${API_BASE_URL}/member/betsview/Bet.asmx/BetNow`,
  AR: `${API_BASE_URL}/member/betsview/tradein.asmx/ar`
}

export const REFERER_DATA_ODDS = {
  Early: `${API_BASE_URL}/Member/BetOdds/HdpDouble.aspx?v=1&m1=Early&sports=S_&isHighlight=false`,
  Today: `${API_BASE_URL}/Member/BetOdds/HdpDouble.aspx?v=1&m1=Today&sports=S_&isHighlight=false`,
  Running: `${API_BASE_URL}/Member/BetOdds/HdpDouble.aspx?v=1&m1=Running&sports=S_&isHighlight=false`
}
