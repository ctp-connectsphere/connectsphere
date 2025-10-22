import { Resend } from 'resend'
import { EMAIL_CONFIG } from '@/lib/config/env'

const resend = new Resend(EMAIL_CONFIG.apiKey)

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailTemplate) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [to],
      subject,
      html,
      text,
    })

    if (error) {
      console.error('Email sending failed:', error)
      return { success: false, error: error.message }
    }

    console.log('Email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string, userName: string) {
  const subject = 'Reset Your ConnectSphere Password'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - ConnectSphere</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #007aff;
          margin-bottom: 10px;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 12px;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          background: #007aff;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">ConnectSphere</div>
        <p>Study Partner Matching Platform</p>
      </div>
      
      <div class="content">
        <h2>Password Reset Request</h2>
        <p>Hello ${userName},</p>
        
        <p>We received a request to reset your password for your ConnectSphere account. If you made this request, click the button below to reset your password:</p>
        
        <div style="text-align: center;">
          <a href="${resetLink}" class="button">Reset Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace;">${resetLink}</p>
        
        <div class="warning">
          <strong>Security Notice:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email.
        </div>
        
        <p>If you have any questions, please contact our support team.</p>
        
        <p>Best regards,<br>The ConnectSphere Team</p>
      </div>
      
      <div class="footer">
        <p>This email was sent to ${email}</p>
        <p>© 2024 ConnectSphere. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  const text = `
Password Reset Request - ConnectSphere

Hello ${userName},

We received a request to reset your password for your ConnectSphere account.

To reset your password, visit this link:
${resetLink}

This link will expire in 1 hour for your security.

If you didn't request this password reset, please ignore this email.

Best regards,
The ConnectSphere Team
  `

  return await sendEmail({
    to: email,
    subject,
    html,
    text
  })
}

export async function sendWelcomeEmail(email: string, userName: string) {
  const subject = 'Welcome to ConnectSphere!'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ConnectSphere</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #007aff;
          margin-bottom: 10px;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 12px;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          background: #007aff;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">ConnectSphere</div>
        <p>Study Partner Matching Platform</p>
      </div>
      
      <div class="content">
        <h2>Welcome to ConnectSphere!</h2>
        <p>Hello ${userName},</p>
        
        <p>Welcome to ConnectSphere! We're excited to help you find the perfect study partners on campus.</p>
        
        <p>To get started:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Add your courses</li>
          <li>Set your availability</li>
          <li>Start connecting with fellow students!</li>
        </ul>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Get Started</a>
        </div>
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
        
        <p>Happy studying!<br>The ConnectSphere Team</p>
      </div>
      
      <div class="footer">
        <p>This email was sent to ${email}</p>
        <p>© 2024 ConnectSphere. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: email,
    subject,
    html
  })
}
