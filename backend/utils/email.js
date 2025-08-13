import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const message = {
      from: `${process.env.EMAIL_FROM} <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message,
    };

    const info = await transporter.sendMail(message);

    console.log('Email sent: %s', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Ward Connect Nepal';
  const message = `
    Dear ${user.firstName} ${user.lastName},

    Welcome to Ward Connect Nepal! Your account has been successfully created.

    Your account details:
    - Citizenship Number: ${user.citizenshipNumber}
    - Mobile Number: ${user.mobileNumber}
    ${user.email ? `- Email: ${user.email}` : ''}

    Please verify your contact information to access all features.

    Best regards,
    Ward Connect Nepal Team
  `;

  return sendEmail({
    email: user.email || user.mobileNumber,
    subject,
    message,
  });
};

// Send verification email
export const sendVerificationEmail = async (user, token) => {
  const subject = 'Verify Your Email - Ward Connect Nepal';
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Ward Connect Nepal</h2>
      <h3>Email Verification</h3>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" 
         style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Verify Email
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>Ward Connect Nepal Team</p>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject,
    message: `Please verify your email by clicking this link: ${verificationUrl}`,
    html,
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (user, token) => {
  const subject = 'Password Reset Request - Ward Connect Nepal';
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Ward Connect Nepal</h2>
      <h3>Password Reset Request</h3>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>You requested a password reset for your account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" 
         style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Reset Password
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>Ward Connect Nepal Team</p>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject,
    message: `You requested a password reset. Click this link to reset your password: ${resetUrl}`,
    html,
  });
};

// Send application status update email
export const sendApplicationStatusEmail = async (user, application, status) => {
  const subject = `Application Status Update - ${application.applicationId}`;
  
  const statusMessages = {
    submitted: 'Your application has been submitted successfully and is under review.',
    under_review: 'Your application is currently being reviewed by our staff.',
    pending_documents: 'Additional documents are required to process your application.',
    approved: 'Congratulations! Your application has been approved.',
    rejected: 'Your application has been rejected. Please check the details for more information.',
    completed: 'Your application has been completed. You can download your document.',
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Ward Connect Nepal</h2>
      <h3>Application Status Update</h3>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>Your application status has been updated:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Application ID:</strong> ${application.applicationId}</p>
        <p><strong>Service:</strong> ${application.title}</p>
        <p><strong>Status:</strong> <span style="color: #2563eb; font-weight: bold;">${status}</span></p>
        <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <p>${statusMessages[status] || 'Your application status has been updated.'}</p>
      <p>You can track your application progress by logging into your account.</p>
      <p>Best regards,<br>Ward Connect Nepal Team</p>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject,
    message: `Your application ${application.applicationId} status has been updated to ${status}.`,
    html,
  });
};

// Send complaint update email
export const sendComplaintUpdateEmail = async (user, complaint, update) => {
  const subject = `Complaint Update - ${complaint.complaintId}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Ward Connect Nepal</h2>
      <h3>Complaint Update</h3>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>Your complaint has been updated:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
        <p><strong>Subject:</strong> ${complaint.subject}</p>
        <p><strong>Status:</strong> <span style="color: #2563eb; font-weight: bold;">${update.status}</span></p>
        <p><strong>Message:</strong> ${update.message}</p>
        <p><strong>Updated:</strong> ${new Date(update.updatedAt).toLocaleDateString()}</p>
      </div>
      <p>You can track your complaint progress by logging into your account.</p>
      <p>Best regards,<br>Ward Connect Nepal Team</p>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject,
    message: `Your complaint ${complaint.complaintId} has been updated: ${update.message}`,
    html,
  });
};

// Send broadcast notification email
export const sendBroadcastEmail = async (users, broadcast) => {
  const subject = `Ward Notice: ${broadcast.title}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Ward Connect Nepal</h2>
      <h3>${broadcast.title}</h3>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p>${broadcast.content}</p>
        ${broadcast.attachment ? `<p><strong>Attachment:</strong> <a href="${broadcast.attachment.url}">Download</a></p>` : ''}
      </div>
      <p><strong>Category:</strong> ${broadcast.category}</p>
      <p><strong>Priority:</strong> ${broadcast.priority}</p>
      <p><strong>Posted:</strong> ${new Date(broadcast.createdAt).toLocaleDateString()}</p>
      <p>Best regards,<br>Ward Connect Nepal Team</p>
    </div>
  `;

  const emailPromises = users.map(user => 
    sendEmail({
      email: user.email,
      subject,
      message: broadcast.content,
      html,
    })
  );

  return Promise.all(emailPromises);
};
