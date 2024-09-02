"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetTemplate = void 0;
const passwordResetTemplate = (url) => {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <div style="padding: 20px; background-color: #ffffff; border-radius: 10px;">
          <h2 style="color: #333;">Reset Password</h2>
          <p style="color: #555; font-size: 16px;">
            Click the link below to reset your password:
          </p>
          <p style="font-size: 24px; font-weight: bold; color: #2c3e50; text-align: center; margin: 20px 0;">
           <a href="${url}">Click here</a>
          </p>
        </div>
        <div style="text-align: center; padding-top: 20px; color: #888; font-size: 14px;">
          <p>Need help? <a href="mailto:⁠support@flewwithus.com⁠" style="color: #3498db;">Contact Support</a></p>
          <p>&copy; ${new Date().getFullYear()} Flew With Us. All rights reserved.</p>
        </div>
      </div> `;
};
exports.passwordResetTemplate = passwordResetTemplate;
