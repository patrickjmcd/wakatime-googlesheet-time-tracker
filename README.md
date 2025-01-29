# wakatime-googlesheet-time-tracker

Automatically log daily project wise work hours to google sheet using wakatime API


## Setup

1. Create a new Google Sheet and note the sheet ID from the URL.
2. Set the sheet ID as an environment variable `GOOGLE_SHEETS_ID`.
3. Create a new Google Cloud project and enable the Google Sheets API.
4. Create a service account user and a JSON key file.
5. base64 encode the contents of the key file and set it as an environment variable `GOOGLE_SA_B64`.
6. Add the service account email to the Google Sheet with edit permissions.
7. Get your Wakatime API key from [here](https://wakatime.com/settings).
8. Set the Wakatime API key as an environment variable `WAKATIME_API_KEY`.
9. Set all the environment variables as secrets in your GitHub repository.
10. Adjust the cron schedule in the workflow file as per your timezone.
11. Push the code to your GitHub repository.
