import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      // Appears in header & footer of e-mails
      name: "Project Manager",
      link: "https://taskmanagelink.com/",
    },
  });
  // Email in the text formate
  const emailText = mailGenerator.generatePlaintext(options.mailgenContent);

  // Email in the HTML formate
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  // Creating transport for sending email
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  // Defining email options
    const mail = {
        from : "mail.taskmanager@example.com" ,
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHtml ,
    }

  // Sending Email
    try {
         await transporter.sendMail(mail);
    } catch (error) {
        console.error("🚫 Error sending email: ", error);
    }

};

// ----------------------- Email Verification MailGen Content ----------------------- //

const emailVerificationMailGenContent = (username, verificationURL) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our App! We are very excited to have you on board.",
      action: {
        instructions:
          "Please click the following button to verify your  account:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Confirm your account",
          link: verificationURL,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

// ----------------------- Forget Password MailGen Content ----------------------- //

const forgetPasswordVerificationMailGenContent = (
  username,
  passwordRestURL,
) => {
  return {
    body: {
      name: username,
      intro:
        "You have requested to reset your password. Please! Click the button below to proceed.",
      action: {
        instructions: "Click the button bellow to reset your password:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Reset your password:",
          link: passwordRestURL,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export {
  emailVerificationMailGenContent,
  forgetPasswordVerificationMailGenContent,
  sendEmail
};
