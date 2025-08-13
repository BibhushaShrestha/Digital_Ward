import twilio from 'twilio';

// Create Twilio client
const createTwilioClient = () => {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
};

// Send SMS
export const sendSMS = async (options) => {
  try {
    const client = createTwilioClient();

    const message = await client.messages.create({
      body: options.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: options.to,
    });

    console.log('SMS sent: %s', message.sid);

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw new Error('SMS could not be sent');
  }
};

// Send OTP SMS
export const sendOTPSMS = async (mobileNumber, otp) => {
  const message = `Your OTP for Ward Connect Nepal is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;
  
  return sendSMS({
    to: mobileNumber,
    message,
  });
};

// Send application status SMS
export const sendApplicationStatusSMS = async (mobileNumber, application, status) => {
  const statusMessages = {
    submitted: 'Your application has been submitted successfully.',
    under_review: 'Your application is under review.',
    pending_documents: 'Additional documents required for your application.',
    approved: 'Congratulations! Your application has been approved.',
    rejected: 'Your application has been rejected. Please check details.',
    completed: 'Your application is completed. You can download your document.',
  };

  const message = `Application ${application.applicationId}: ${statusMessages[status] || 'Status updated.'} - Ward Connect Nepal`;
  
  return sendSMS({
    to: mobileNumber,
    message,
  });
};

// Send complaint update SMS
export const sendComplaintUpdateSMS = async (mobileNumber, complaint, update) => {
  const message = `Complaint ${complaint.complaintId}: ${update.message} - Ward Connect Nepal`;
  
  return sendSMS({
    to: mobileNumber,
    message,
  });
};

// Send broadcast SMS
export const sendBroadcastSMS = async (mobileNumbers, broadcast) => {
  const message = `Ward Notice: ${broadcast.title}. ${broadcast.content.substring(0, 100)}${broadcast.content.length > 100 ? '...' : ''} - Ward Connect Nepal`;
  
  const smsPromises = mobileNumbers.map(mobileNumber =>
    sendSMS({
      to: mobileNumber,
      message,
    })
  );

  return Promise.all(smsPromises);
};

// Send emergency notification SMS
export const sendEmergencySMS = async (mobileNumbers, emergencyMessage) => {
  const message = `URGENT: ${emergencyMessage} - Ward Connect Nepal`;
  
  const smsPromises = mobileNumbers.map(mobileNumber =>
    sendSMS({
      to: mobileNumber,
      message,
    })
  );

  return Promise.all(smsPromises);
};

// Send reminder SMS
export const sendReminderSMS = async (mobileNumber, reminder) => {
  const message = `Reminder: ${reminder.message} - Ward Connect Nepal`;
  
  return sendSMS({
    to: mobileNumber,
    message,
  });
};
