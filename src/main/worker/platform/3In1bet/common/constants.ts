export const API_BASE_URL = 'https://www.8611357.com'

export const API_ENDPOINTS = {
  AR: `${API_BASE_URL}/member/betsview/data.asmx/sports/order/unify`,
  BET_NOW: `${API_BASE_URL}/member/betsview/Bet.asmx/BetNow`,
  CHECK: `${API_BASE_URL}/check.aspx`,
  DATA_ODDS: `${API_BASE_URL}/Member/BetsView/BetLight/DataOdds.ashx`,
  MAIN_TOP_HEADER: `${API_BASE_URL}/main/topheader.aspx?lan=en-US`,
  PROCESSLOGIN: `${API_BASE_URL}/main/processlogin.aspx`,
  SET_DATA: `${API_BASE_URL}/member/betsview/Bet.asmx/SetData`,
  USER_INFO_PANEL_HOST: `${API_BASE_URL}/member/betsview/UserInfoPanelHost.aspx?Ajax=1`
}

export const REFERER_DATA_ODDS = {
  Early: `${API_BASE_URL}/Member/BetOdds/HdpDouble.aspx?v=1&m1=Early&sports=S_&isHighlight=false`,
  Running: `${API_BASE_URL}/Member/BetOdds/HdpDouble.aspx?v=1&m1=Running&sports=S_&isHighlight=false`,
  Today: `${API_BASE_URL}/Member/BetOdds/HdpDouble.aspx?v=1&m1=Today&sports=S_&isHighlight=false`
}
