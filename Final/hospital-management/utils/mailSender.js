const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    // Create a Transporter to send emails
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: "work.arjun221@gmail.com",
        pass: "zpgxeqmnavmipwxv",
      },
    });

    // Send emails to users
    let info = await transporter.sendMail({
      from: "work.arjun221@gmail.com", // Sender's name (you can customize this)
      to: email, // Recipient's email
      subject: title, // Email subject
      html: body, // Email body (HTML format)
    });
    console.log("Email info: ", info); // Log email details for debugging
    return info;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = mailSender;
