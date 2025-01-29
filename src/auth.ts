import { google } from 'googleapis';
import { type JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const makeJwtClient = async (serviceAccountB64: string) => {
    try {
        const serviceAccount = JSON.parse(Buffer.from(serviceAccountB64, 'base64').toString());
        const jwtClient: JWT = new google.auth.JWT(
            serviceAccount.client_email,
            undefined,
            serviceAccount.private_key,
            SCOPES,
        );
        await jwtClient.authorize();
        return jwtClient;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export default makeJwtClient;
