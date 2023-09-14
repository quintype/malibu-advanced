const nodemailer = require('nodemailer');
const fs = require('fs');

// Define your email configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use the appropriate email service provider
  auth: {
    user: 'malibutestautomation@quintype.com',
    pass: 'your-password', // Store your password securely or use environment variables
  },
});

// Read the test report file
const reportFilePath = 'cypress/results/mochawesome-report/mochawesome.html';
const reportFile = fs.readFileSync(reportFilePath, 'utf8');

// Create the email message
const mailOptions = {
  from: 'deva@quintype.com',
  to: 'qa@quintype.com',
  subject: 'Cypress Test Report',
  html: reportFile,
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});
