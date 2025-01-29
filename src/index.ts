import dotenv from 'dotenv'
import { endOfYesterday, formatISO, format, parseISO, endOfToday } from 'date-fns'
import makeJwtClient from './auth'
import { google } from 'googleapis'

const WAKATIME_BASE_URL = 'https://api.wakatime.com/api/v1'

dotenv.config()

const base64GoogleServiceAccount = process.env.GOOGLE_SA_B64 || ''
if (!base64GoogleServiceAccount) {
  throw new Error('Missing GOOGLE_SA_B64')
}
const wakatimeAPIKey = process.env.WAKATIME_API_KEY
const googleSheetId = process.env.GOOGLE_SHEETS_ID
const sheetName = process.env.SHEET_NAME || 'Wakatime Time Raw'

interface WakatimeProjectSummary {
  name: string
  total_seconds: number
  percent: number
  digital: string
  text: string
  hours: number
  minutes: number
}

interface WakatimeSummaryResponse {
  data: {
    projects: WakatimeProjectSummary[]
  }[]
}

const yesterday = formatISO(endOfYesterday(), {
  // assuming the job is running on second day
  representation: 'date'
})
const parsedDate = parseISO(yesterday)

const main = async () => {
  console.log('Initialising')
  // initialise

  const projects = await getYesterdaySummary()
  const doc = await initGoogleSheet()
  const rows = makeProjectRows(projects)

  const response = await doc.spreadsheets.values.append({
    spreadsheetId: googleSheetId,
    range: `${sheetName}!A1:C`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rows
    }
  })
  const rowsAdded = response.data.updates?.updatedRows || 0
  console.log(`Added ${rowsAdded} rows`)
}

const getYesterdaySummary = async (): Promise<WakatimeProjectSummary[]> => {
  console.log('INIT: fetching data from wakatime')
  const response = await fetch(`${WAKATIME_BASE_URL}/users/current/summaries?range=yesterday`, {
    headers: {
      Authorization: `Basic ${Buffer.from(wakatimeAPIKey || '').toString('base64')}`
    }
  })
  const summary = await response.json() as WakatimeSummaryResponse
  const { projects } = summary.data[0]
  console.log('DONE: fetching data from wakatime')
  return projects || []
}

const initGoogleSheet = async () => {
  console.log('INIT: initialising google doc')
  const jwtClient = await makeJwtClient(base64GoogleServiceAccount)
  const sheets = google.sheets({ version: 'v4' , auth: jwtClient });
  console.log('COMPLETED: initialising google doc')
  return sheets
}

const makeProjectRows = (projects: WakatimeProjectSummary[]) => {
  return projects.map((p) => [format(parsedDate, 'yyyy-MM-dd'), p.name, p.total_seconds])
}

(async () => {
  await main()
})()
