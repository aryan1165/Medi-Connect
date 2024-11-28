const nodemailer = require("nodemailer");

const mailSender = async (email, title, body, attachments = []) => {
  try {
    // Create a Transporter to send emails
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: "work.arjun221@gmail.com", // Sender's email
        pass: "zpgxeqmnavmipwxv",        // Use app-specific password
      },
    });

    // Send email with multiple attachments
    let info = await transporter.sendMail({
      from: "work.arjun221@gmail.com", // Sender's email address
      to: email,                      // Recipient's email address
      subject: title,                 // Email subject
      html: body,                     // HTML email body
      attachments: attachments        // Attachments array (multiple files)
    });

    console.log("Email sent successfully:", info); // Log success info
    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error; // Throw error to be handled by the caller
  }
};

module.exports = mailSender;
