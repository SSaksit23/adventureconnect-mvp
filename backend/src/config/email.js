const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: `"AdventureConnect" <${process.env.EMAIL_FROM || 'noreply@adventureconnect.com'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    // Don't throw in development if email is not configured
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

module.exports = { sendEmail };
