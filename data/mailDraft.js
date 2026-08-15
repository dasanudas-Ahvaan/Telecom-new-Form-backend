// emailTemplates.js

const emailTemplates = {
  otpVerification: ({ otpCode, validityMinutes = 5, orgName = "Ahvaan" }) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Verification Code</title></head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 20px; color: #333333;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
        <tr>
          <td>
            <h2 style="color: #2d3748; margin-top: 0; font-size: 24px;">Verification Required</h2>
            <p style="font-size: 16px; color: #4a5568;">Dear <strong>Dharm rakshak</strong>,</p>
            <p style="font-size: 16px; color: #4a5568;">Please use the following OTP to complete your authentication:</p>
            
            <div style="background-color: #edf2f7; padding: 15px; text-align: center; border-radius: 6px; margin: 25px 0;">
              <h3 style="margin: 0; font-size: 28px; letter-spacing: 4px; color: #2b6cb0;">${otpCode}</h3>
            </div>
            
            <ul style="font-size: 14px; color: #4a5568;">
              <li><strong>Important:</strong> Valid for the next ${validityMinutes} minutes.</li>
              <li><strong>Security:</strong> Never share this code. Our team will never ask for it.</li>
            </ul>
            
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="font-size: 12px; color: #a0aec0;">Best regards,<br><strong>${orgName} Team</strong><br></p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,

  welcomeEmail: ({
    fullName,
    organizationName = "आह्वान-धर्म रक्षा समिति",
  }) => `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
      <meta charset="utf-8">
      <title>स्वागत - ${organizationName}</title>
    </head>
    <body style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; background-color: #f7f9fc; margin: 0; padding: 20px; color: #333333;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #fff8e1; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);">
        <tr>
          <td align="center">

            <!-- Main Heading (h2) -->
            <h2 style="color: #d32f2f; margin-top: 0; margin-bottom: 20px; font-size: 24px; font-weight: bold; text-align: center;">
              🙏 आपका हार्दिक स्वागत है 🙏
            </h2>

            <hr style="border: none; border-top: 1px solid #ffe0b2; margin: 20px auto; width: 80%;">

            <!-- Body Content -->
            <div style="font-size: 16px; line-height: 1.6; color: #444444; text-align: left; padding: 0 15px;">
              <p style="margin-top: 0;">
                <b>${fullName} जी,</b>
              </p>
              <p>
                धर्म, रक्षा तथा सेवा के इस पुनीत अभियान में स्वेच्छा से जुड़ने के लिए <b>हम हृदय से आपके आभारी हैं</b>।
              </p>
              <p>
                आपका यह सहयोग, सनातन धर्म और राष्ट्र की सेवा के हमारे सामूहिक लक्ष्य को एक नई दिशा और <b>अभूतपूर्व बल</b> प्रदान करता है।
              </p>
              <p>
                हमारी टीम आगे के निर्देशों के लिए 7 से 10 कार्य दिवसों में आपसे संपर्क करेगी।
              </p>
            </div>

            <!-- Highlighted Callout (h3) -->
            <div style="background-color: #ffecb3; padding: 15px; border-radius: 8px; margin: 25px 15px; border-left: 4px solid #d32f2f; text-align: center;">
              <h3 style="margin: 0; font-size: 18px; color: #b71c1c; font-weight: bold;">
                धर्म सेवा ही सबसे बड़ा धर्म है।
              </h3>
            </div>

            <hr style="border: none; border-top: 1px solid #ffe0b2; margin: 20px auto; width: 80%;">

            <!-- Footer / Sign-off -->
            <p style="margin-top: 25px; color: #555555; font-size: 15px; line-height: 1.5; text-align: center;">
              🚩 <b>जय श्री राम!</b><br>
              <span style="font-size: 14px; color: #666666;">— Team ${organizationName}</span>
            </p>

          </td>
        </tr>
      </table>
    </body>
    </html>
  `,
};

module.exports = emailTemplates;

/**
 *  <!-- Logo / Image Header -->
            <div style="margin-bottom: 25px;">
              <img src="cid:logoImage" alt="${organizationName}" style="max-width: 150px; height: auto; border-radius: 8px; display: block;"/>
            </div>
 */
