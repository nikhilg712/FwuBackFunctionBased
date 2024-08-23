export const generateOTPTemplate = (otp: string) => {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
      <div style="padding: 20px; background-color: #ffffff; border-radius: 10px;">
        <h2 style="color: #333;">Email Verification</h2>
        <p style="color: #555; font-size: 16px;">
          Thank you for signing up with <strong>Flew With Us</strong>! To complete your registration, please use the OTP (One-Time Password) below to verify your email address.
        </p>
        <p style="font-size: 24px; font-weight: bold; color: #2c3e50; text-align: center; margin: 20px 0;">
          ${otp}
        </p>
        <p style="color: #555; font-size: 16px;">
          This OTP is valid for the next 10 minutes. If you did not request this, please ignore this email.
        </p>
      </div>
      <div style="text-align: center; padding-top: 20px; color: #888; font-size: 14px;">
        <p>Need help? <a href="mailto:⁠support@flewwithus.com⁠" style="color: #3498db;">Contact Support</a></p>
        <p>&copy; ${new Date().getFullYear()} Flew With Us. All rights reserved.</p>
      </div>
    </div> `;
};
