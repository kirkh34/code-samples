/* A function to send an email using the next js API routes */
import { NextApiRequest, NextApiResponse } from 'next/types';
import nodemailer from 'nodemailer';
import * as Sentry from '@sentry/browser';

const SendEmail = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = req.body;

  //console.log('data', data);

  const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
      user: 'REDACTED',
      pass: 'REDACTED',
    },
  });

  try {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Anderprints DTF" <support@anderprintsdtf.com>', // sender address
      to: data.to, // list of receivers
      subject: data.subject, // Subject line
      text: data.text, // plain text body
      html: data.html, // html body
    });

    //console.log('Message sent: %s', info.messageId);

    res.status(200).json({ success: true });
  } catch (error: any) {
    Sentry.captureException(error);
    Sentry.captureMessage('Send email error');
    res.status(200).json({ success: false, message: error.message });
  }
};

export default SendEmail;
