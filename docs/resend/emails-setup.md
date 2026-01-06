## Integrating Resend With Node Js , Express , MongoDB 

Node.JS
Send Email :
IMPORT { RESEND } FROM 'RESEND';

CONST RESEND = NEW RESEND('RE_XXXXXXXXX');

AWAIT RESEND.EMAILS.SEND({
  FROM: 'ACME <ONBOARDING@RESEND.DEV>',
  TO: ['DELIVERED@RESEND.DEV'],
  SUBJECT: 'HELLO WORLD',
  HTML: '<P>IT WORKS!</P>',
});













## Send Batch Email :

IMPORT { RESEND } FROM 'RESEND';

CONST RESEND = NEW RESEND('RE_XXXXXXXXX');

AWAIT RESEND.BATCH.SEND([
  {
    FROM: 'ACME <ONBOARDING@RESEND.DEV>',
    TO: ['FOO@GMAIL.COM'],
    SUBJECT: 'HELLO WORLD',
    HTML: '<H1>IT WORKS!</H1>',
  },
  {
    FROM: 'ACME <ONBOARDING@RESEND.DEV>',
    TO: ['BAR@OUTLOOK.COM'],
    SUBJECT: 'WORLD HELLO',
    HTML: '<P>IT WORKS!</P>',
  },
]);
## RETRIEVE EMAIL
import { Resend } from 'resend';

const resend = new Resend('re_xxxxxxxxx');
resend.emails.get('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d');



Update Email
import { Resend } from 'resend';

const resend = new Resend('re_xxxxxxxxx');

const oneMinuteFromNow = new Date(Date.now() + 1000 * 60).toISOString();

resend.emails.update({
  id: '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d',
  scheduledAt: oneMinuteFromNow,
});

## Cancel Email:
import { Resend } from 'resend';

const resend = new Resend('re_xxxxxxxxx');

resend.emails.cancel('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d');

List Emails
import { Resend } from 'resend';

const resend = new Resend('re_xxxxxxxxx');

const { data, error } = await resend.emails.list();

List Attachments 
import { Resend } from 'resend';

const resend = new Resend('re_xxxxxxxxx');

const { data, error } = await resend.emails.attachments.list({
  emailId: '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d',
});
Retrieve Attachments
import { Resend } from 'resend';

const resend = new Resend('re_xxxxxxxxx');

const { data, error } = await resend.emails.attachments.get({
  id: '4a90a90a-90a9-0a90-a90a-90a90a90a90a',
  emailId: '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d',
});


