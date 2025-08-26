const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  init() {
    // Gmail configuration using App Password
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_APP_PASSWORD // Your Gmail App Password
      }
    });
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }

  async sendVerificationEmail(email, verificationCode, firstName = 'User') {
    const mailOptions = {
      from: {
        name: 'AgriBasket Team',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Verify Your AgriBasket Account',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #16a085, #27ae60);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
            }
            .welcome {
              font-size: 18px;
              color: #2c3e50;
              margin-bottom: 20px;
            }
            .verification-code {
              background: #ecf0f1;
              border-left: 4px solid #27ae60;
              padding: 20px;
              margin: 25px 0;
              text-align: center;
              border-radius: 5px;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #27ae60;
              letter-spacing: 5px;
              font-family: 'Courier New', monospace;
            }
            .instructions {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              background: #27ae60;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              background: #34495e;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 14px;
            }
            .security-note {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌱 AgriBasket</h1>
              <p>Fresh From Farm to Your Home</p>
            </div>
            
            <div class="content">
              <h2 class="welcome">Welcome to AgriBasket, ${firstName}!</h2>
              
              <p>Thank you for creating an account with us. To complete your registration and secure your account, please verify your email address using the verification code below:</p>
              
              <div class="verification-code">
                <p style="margin: 0; font-size: 16px; color: #7f8c8d;">Your Verification Code:</p>
                <div class="code">${verificationCode}</div>
              </div>
              
              <div class="instructions">
                <h3 style="margin-top: 0; color: #2c3e50;">How to verify:</h3>
                <ol>
                  <li>Go back to the AgriBasket registration page</li>
                  <li>Enter the verification code above</li>
                  <li>Click "Verify Email" to complete your registration</li>
                </ol>
              </div>
              
              <div class="security-note">
                <strong>🔒 Security Note:</strong> This verification code is valid for 15 minutes and can only be used once. If you didn't create an account with AgriBasket, please ignore this email.
              </div>
              
              <p>Once verified, you'll be able to:</p>
              <ul>
                <li>✅ Browse and purchase fresh organic products</li>
                <li>✅ Track your orders in real-time</li>
                <li>✅ Save your favorite items</li>
                <li>✅ Get exclusive deals and offers</li>
              </ul>
              
              <p>If you have any questions, feel free to contact our support team.</p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The AgriBasket Team</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>&copy; 2025 AgriBasket. All rights reserved.</p>
              <p>Fresh, Organic, Direct from Farm</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(email, firstName = 'User') {
    const mailOptions = {
      from: {
        name: 'AgriBasket Team',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🎉 Welcome to AgriBasket - Your Account is Ready!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to AgriBasket</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #16a085, #27ae60);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .content {
              padding: 40px 30px;
            }
            .welcome-badge {
              background: #27ae60;
              color: white;
              padding: 10px 20px;
              border-radius: 25px;
              display: inline-block;
              margin: 20px 0;
              font-weight: 600;
            }
            .feature-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin: 25px 0;
            }
            .feature {
              text-align: center;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .footer {
              background: #34495e;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌱 Welcome to AgriBasket!</h1>
              <p>Your journey to fresh, organic food starts now</p>
            </div>
            
            <div class="content">
              <h2>Hello ${firstName}! 🎉</h2>
              
              <div class="welcome-badge">Account Successfully Verified!</div>
              
              <p>Congratulations! Your AgriBasket account has been successfully created and verified. You're now part of our community of health-conscious consumers who choose fresh, organic products directly from local farms.</p>
              
              <div class="feature-grid">
                <div class="feature">
                  <h3>🥕 Fresh Products</h3>
                  <p>Premium organic fruits, vegetables, and farm products</p>
                </div>
                <div class="feature">
                  <h3>🚚 Fast Delivery</h3>
                  <p>Quick and reliable delivery to your doorstep</p>
                </div>
                <div class="feature">
                  <h3>🌱 Farm Direct</h3>
                  <p>Direct from certified organic farms</p>
                </div>
                <div class="feature">
                  <h3>💳 Secure Payments</h3>
                  <p>Safe and encrypted payment processing</p>
                </div>
              </div>
              
              <h3>What's Next?</h3>
              <ul>
                <li>🛒 Start shopping for fresh organic products</li>
                <li>📱 Download our mobile app for easy ordering</li>
                <li>🔔 Enable notifications for exclusive deals</li>
                <li>👥 Follow us on social media for farming tips</li>
              </ul>
              
              <p style="margin-top: 30px;">
                Thank you for choosing AgriBasket. We're excited to serve you!<br><br>
                Happy Shopping!<br>
                <strong>The AgriBasket Team</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>&copy; 2025 AgriBasket. All rights reserved.</p>
              <p>Supporting local farmers, nourishing your family</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${email}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendPasswordResetEmail(email, resetToken, firstName = 'User') {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: {
        name: 'AgriBasket Team',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🔒 Reset Your AgriBasket Password',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #e74c3c, #c0392b);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .content {
              padding: 40px 30px;
            }
            .reset-button {
              display: inline-block;
              background: #e74c3c;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .security-note {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              font-size: 14px;
            }
            .footer {
              background: #34495e;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset</h1>
              <p>AgriBasket Account Security</p>
            </div>
            
            <div class="content">
              <h2>Hello ${firstName},</h2>
              
              <p>We received a request to reset your AgriBasket account password. If you made this request, click the button below to reset your password:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="reset-button">Reset My Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">${resetUrl}</p>
              
              <div class="security-note">
                <strong>🔒 Security Information:</strong>
                <ul style="margin: 10px 0;">
                  <li>This link is valid for 1 hour only</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password won't change until you create a new one</li>
                </ul>
              </div>
              
              <p>If you continue to have problems, please contact our support team.</p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The AgriBasket Security Team</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>&copy; 2025 AgriBasket. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${email}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

module.exports = new EmailService();
