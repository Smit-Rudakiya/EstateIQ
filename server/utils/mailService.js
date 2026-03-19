const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Email send error:', error);
        // Don't throw error in dev if SMTP not configured correctly
        if (process.env.NODE_ENV === 'production') throw error;
    }
};

const sendResetEmail = async (userEmail, resetLink) => {
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0f2fe; border-radius: 12px; background-color: #f0f9ff;">
            <h2 style="color: #0c4a6e; text-align: center;">EstateIQ Password Reset</h2>
            <p>Hello,</p>
            <p>You requested a password reset for your EstateIQ account. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e0f2fe; margin: 20px 0;">
            <p style="font-size: 12px; color: #64748b; text-align: center;">&copy; 2026 EstateIQ Real Estate Platform</p>
        </div>
    `;
    return sendEmail({ to: userEmail, subject: 'Password Reset Request — EstateIQ', html });
};

const sendWelcomeEmail = async (user) => {
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0f2fe; border-radius: 12px; background-color: #f0f9ff;">
            <h2 style="color: #0c4a6e; text-align: center;">Welcome to EstateIQ! 🎉</h2>
            <p>Hello ${user.firstName},</p>
            <p>Thank you for joining EstateIQ! Your account has been successfully created. You can now explore properties, upload documents for AI analysis, and manage your listings.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:5173/login" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Log In Now</a>
            </div>
            <p>Best Regards,<br>The EstateIQ Team</p>
            <hr style="border: 0; border-top: 1px solid #e0f2fe; margin: 20px 0;">
            <p style="font-size: 12px; color: #64748b; text-align: center;">&copy; 2026 EstateIQ Real Estate Platform</p>
        </div>
    `;
    return sendEmail({ to: user.email, subject: 'Welcome to EstateIQ!', html });
};

const sendContactResolvedEmail = async (contact) => {
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0f2fe; border-radius: 12px; background-color: #f0f9ff;">
            <h2 style="color: #0c4a6e; text-align: center;">Inquiry Resolved</h2>
            <p>Hi ${contact.name},</p>
            <p>We are happy to inform you that your inquiry regarding "<strong>${contact.subject}</strong>" has been resolved by our team.</p>
            <p><strong>Message:</strong> ${contact.message}</p>
            <p>If you have any further questions, feel free to contact us again.</p>
            <p>Best Regards,<br>The EstateIQ Team</p>
            <hr style="border: 0; border-top: 1px solid #e0f2fe; margin: 20px 0;">
            <p style="font-size: 12px; color: #64748b; text-align: center;">&copy; 2026 EstateIQ Real Estate Platform</p>
        </div>
    `;
    return sendEmail({ to: contact.email, subject: 'Your inquiry has been resolved — EstateIQ', html });
};

module.exports = {
    sendResetEmail,
    sendWelcomeEmail,
    sendContactResolvedEmail
};
