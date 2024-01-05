import nodemailer from 'nodemailer';

interface MailDetails {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (mail: MailDetails) => {
  // 1) Create Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PPORT),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define Email Options
  const mailOptions = {
    from: 'Mohamed Abozaid <hello@abozaid.io>',
    to: mail.email,
    subject: mail.subject,
    text: mail.message,
    // html: ,
  };

  // 3) Send the Email
  await transporter.sendMail(mailOptions);
};

export { sendEmail };
