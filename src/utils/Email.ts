import nodemailer from 'nodemailer';
import Iuser from '../interfaces/user.interface';
import pug from 'pug';
import { htmlToText } from 'html-to-text';

/*
@usage  new Email(user).sendWelcome()
        new Email(user).sendPasswordReset()

*/
class Email {
  from = `Mohamed Abozaid <${process.env.EMAIL_FROM}>`;

  constructor(
    public user: Iuser,
    public URL: string,
  ) {
    this.user = user;
    this.URL = URL;
  }

  createTransporter() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid - Real emails
      return;
    } else if (process.env.NODE_ENV === 'development') {
      // mailtrap sandbox
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PPORT),
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }

  async send(template: string, subject: string) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}`, {
      subject,
      firstname: this.user.name.split(' ')[0],
      URL: this.URL,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.user.email,
      subject,
      html,
      text: htmlToText(html), // text version of the HTML because it's better for email delivery rates and also for spam folders, also some ppl prefer plain simple text emails
    };

    // 3) Create Transporter and Send the Email
    await this.createTransporter()?.sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome.pug', 'Welcome to Natours Family');
  }

  async sendPasswordReset() {
    await this.send('passwordReset.pug', 'Your password reset token (valid for only 10 minutes)');
  }
}

export default Email;
