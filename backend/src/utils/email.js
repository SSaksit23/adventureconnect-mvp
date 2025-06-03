// backend/src/utils/email.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email templates
const emailTemplates = {
  bookingInquiry: (data) => ({
    subject: `New Booking Inquiry for ${data.tripTitle}`,
    html: `
      <h2>New Booking Inquiry</h2>
      <p>You have received a new booking inquiry for your trip.</p>
      
      <h3>Trip Details:</h3>
      <ul>
        <li><strong>Trip:</strong> ${data.tripTitle}</li>
        <li><strong>Travel Date:</strong> ${data.travelDate}</li>
        <li><strong>Number of Participants:</strong> ${data.numParticipants}</li>
      </ul>
      
      <h3>Traveler Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${data.travelerName}</li>
        <li><strong>Email:</strong> ${data.travelerEmail}</li>
      </ul>
      
      <h3>Message from Traveler:</h3>
      <p>${data.message || 'No message provided'}</p>
      
      <h3>Special Requirements:</h3>
      <p>${data.specialRequirements || 'None specified'}</p>
      
      <p>Please log in to your AdventureConnect dashboard to respond to this inquiry.</p>
      
      <p>Best regards,<br>AdventureConnect Team</p>
    `
  }),

  bookingConfirmation: (data) => ({
    subject: `Booking Confirmation - ${data.tripTitle}`,
    html: `
      <h2>Booking Confirmation</h2>
      <p>Thank you for your booking inquiry! The provider will review your request and respond soon.</p>
      
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Trip:</strong> ${data.tripTitle}</li>
        <li><strong>Provider:</strong> ${data.providerName}</li>
        <li><strong>Travel Date:</strong> ${data.travelDate}</li>
        <li><strong>Number of Participants:</strong> ${data.numParticipants}</li>
        <li><strong>Total Price:</strong> $${data.totalPrice}</li>
      </ul>
      
      <h3>Next Steps:</h3>
      <ol>
        <li>The provider will review your inquiry within 24-48 hours</li>
        <li>You'll receive an email when they respond</li>
        <li>Once confirmed, you'll receive payment instructions</li>
      </ol>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br>AdventureConnect Team</p>
    `
  }),

  welcomeProvider: (data) => ({
    subject: 'Welcome to AdventureConnect!',
    html: `
      <h2>Welcome to AdventureConnect, ${data.firstName}!</h2>
      <p>Thank you for joining our community of specialized travel providers.</p>
      
      <h3>Getting Started:</h3>
      <ol>
        <li>Complete your provider profile</li>
        <li>Create your first trip listing</li>
        <li>Wait for approval from our team</li>
        <li>Start receiving booking inquiries!</li>
      </ol>
      
      <h3>Tips for Success:</h3>
      <ul>
        <li>Use high-quality photos in your listings</li>
        <li>Write detailed, engaging descriptions</li>
        <li>Respond to inquiries within 24 hours</li>
        <li>Keep your availability calendar updated</li>
      </ul>
      
      <p>We're excited to have you on board!</p>
      
      <p>Best regards,<br>AdventureConnect Team</p>
    `
  }),

  welcomeTraveler: (data) => ({
    subject: 'Welcome to AdventureConnect!',
    html: `
      <h2>Welcome to AdventureConnect, ${data.firstName}!</h2>
      <p>Get ready to discover unique travel experiences from passionate local experts.</p>
      
      <h3>Start Exploring:</h3>
      <ul>
        <li>Browse curated trips from expert providers</li>
        <li>Filter by destination, activity type, and dates</li>
        <li>Send inquiries directly to providers</li>
        <li>Book authentic, off-the-beaten-path experiences</li>
      </ul>
      
      <p>Your next adventure awaits!</p>
      
      <p>Best regards,<br>AdventureConnect Team</p>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: `"AdventureConnect" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendEmail
};