import express from 'express';
import dotenv from 'dotenv';
import twilio from 'twilio';
import { getPositiveIntEnv, getRequiredEnv } from './env';

dotenv.config({path: '.env.local'});

const PORT = getPositiveIntEnv('PORT', '3001');
const TWILIO_ACCOUNT_SID = getRequiredEnv('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = getRequiredEnv('TWILIO_AUTH_TOKEN');

const app = express();
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

app.get('/', (req, res) => {
  res.send("Hallo");
});

export function run() {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}.`);
  });
};
