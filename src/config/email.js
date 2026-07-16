const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: "Loop <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    return data;
  } catch (err) {
    console.log("Email sending failed ❌", err);
    throw err;
  }
};
module.exports = sendEmail;
