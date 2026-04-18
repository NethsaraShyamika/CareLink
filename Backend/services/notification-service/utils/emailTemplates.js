export const baseTemplate = (recipientName, contentHtml) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background-color: #0077B6; padding: 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
            .header p { color: #90E0EF; margin: 5px 0 0 0; font-size: 14px; }
            .body { padding: 30px; }
            .body h2 { color: #333333; font-size: 20px; }
            .body p { color: #555555; font-size: 15px; line-height: 1.6; }
            .info-box { background-color: #f0f8ff; border-left: 4px solid #0077B6; padding: 15px 20px; border-radius: 5px; margin: 20px 0; }
            .info-box p { margin: 5px 0; color: #333; font-size: 14px; }
            .info-box span { font-weight: bold; color: #0077B6; }
            .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; margin: 10px 0; }
            .badge-booked { background-color: #d4edda; color: #155724; }
            .badge-completed { background-color: #cce5ff; color: #004085; }
            .badge-cancelled { background-color: #f8d7da; color: #721c24; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee; }
            .footer p { color: #aaaaaa; font-size: 12px; margin: 4px 0; }
            .footer a { color: #0077B6; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏥 HealthCare Platform</h1>
                <p>Your Trusted Telemedicine Partner</p>
            </div>
            <div class="body">
                <h2>Hello, ${recipientName}! 👋</h2>
                ${contentHtml}
                <p>If you have any questions please contact our support team.</p>
            </div>
            <div class="footer">
                <p>© 2026 HealthCare Platform. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
                <p><a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a> | <a href="#">Contact Support</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const appointmentBookedTemplate = (recipientName, appointmentId, doctorName, patientName, date, time, isDoctor, videoLink) => {
    const contentHtml = isDoctor ? `
        <span class="status-badge badge-booked">📅 New Appointment Scheduled</span>
        <p>A new appointment has been scheduled. Here are the details:</p>
        <div class="info-box">
            <p>📋 <span>Appointment ID:</span> ${appointmentId}</p>
            <p>🧑‍💼 <span>Patient:</span> ${patientName}</p>
            <p>📅 <span>Date:</span> ${date}</p>
            <p>🕐 <span>Time:</span> ${time}</p>
        </div>
        <p>Please be available at the scheduled time for the video consultation.</p>
        <p>🔗 <a href="${videoLink}" target="_blank" rel="noopener noreferrer">Open the appointment page</a></p>
        <p>The page will show a preview image and then redirect you into the video call.</p>
    ` : `
        <span class="status-badge badge-booked">✅ Appointment Confirmed</span>
        <p>Your appointment has been successfully booked. Here are your details:</p>
        <div class="info-box">
            <p>📋 <span>Appointment ID:</span> ${appointmentId}</p>
            <p>👨‍⚕️ <span>Doctor:</span> ${doctorName}</p>
            <p>📅 <span>Date:</span> ${date}</p>
            <p>🕐 <span>Time:</span> ${time}</p>
        </div>
        <p>Please make sure to join the video consultation on time.</p>
        <p>🔗 <a href="${videoLink}" target="_blank" rel="noopener noreferrer">Open the appointment page</a></p>
        <p>The page will show a preview image and then redirect you into the video call.</p>
    `;
    return baseTemplate(recipientName, contentHtml);
};

export const appointmentConfirmedTemplate = (recipientName, appointmentId, doctorName, patientName, date, time, isDoctor, videoLink) => {
    const contentHtml = isDoctor ? `
        <span class="status-badge badge-booked">✅ Appointment Confirmed</span>
        <p>Your appointment has been confirmed. Here are the details:</p>
        <div class="info-box">
            <p>📋 <span>Appointment ID:</span> ${appointmentId}</p>
            <p>🧑‍⚕️ <span>Patient:</span> ${patientName}</p>
            <p>📅 <span>Date:</span> ${date}</p>
            <p>🕐 <span>Time:</span> ${time}</p>
        </div>
        <p>🔗 <a href="${videoLink}" target="_blank" rel="noopener noreferrer">Open the appointment page</a></p>
        <p>Please click the link at the scheduled time to start the consultation.</p>
    ` : `
        <span class="status-badge badge-booked">✅ Appointment Confirmed</span>
        <p>Your appointment has been confirmed. Here are the details:</p>
        <div class="info-box">
            <p>📋 <span>Appointment ID:</span> ${appointmentId}</p>
            <p>👨‍⚕️ <span>Doctor:</span> ${doctorName}</p>
            <p>📅 <span>Date:</span> ${date}</p>
            <p>🕐 <span>Time:</span> ${time}</p>
        </div>
        <p>🔗 <a href="${videoLink}" target="_blank" rel="noopener noreferrer">Open the appointment page</a></p>
        <p>Please click the link at the scheduled time to join your consultation.</p>
    `;
    return baseTemplate(recipientName, contentHtml);
};

export const appointmentAcceptedTemplate = (recipientName, appointmentId, doctorName, patientName, date, time, isDoctor, appointmentUrl, loginUrl) => {
    const contentHtml = isDoctor ? `
        <span class="status-badge badge-booked">✅ Appointment Accepted</span>
        <p>You have accepted the appointment. Here are the details:</p>
        <div class="info-box">
            <p>📋 <span>Appointment ID:</span> ${appointmentId}</p>
            <p>🧑‍⚕️ <span>Patient:</span> ${patientName}</p>
            <p>📅 <span>Date:</span> ${date}</p>
            <p>🕐 <span>Time:</span> ${time}</p>
        </div>
        <p>The patient has been notified to complete payment. You will receive the video consultation link once payment is processed.</p>
    ` : `
        <span class="status-badge badge-booked">✅ Appointment Accepted - Awaiting Payment</span>
        <p>Your appointment has been accepted by Dr. ${doctorName}. Here are the details:</p>
        <div class="info-box">
            <p>📋 <span>Appointment ID:</span> ${appointmentId}</p>
            <p>👨‍⚕️ <span>Doctor:</span> ${doctorName}</p>
            <p>📅 <span>Date:</span> ${date}</p>
            <p>🕐 <span>Time:</span> ${time}</p>
        </div>
        <p><strong>Please log in to your dashboard and complete the payment to fully secure and confirm your appointment.</strong></p>
        <p><strong>Action:</strong> <a href="${appointmentUrl}" target="_blank" rel="noopener noreferrer">Open your appointments page</a></p>
        <p>If you are not already signed in, use this link: <a href="${loginUrl}" target="_blank" rel="noopener noreferrer">Login to CareLink</a>.</p>
        <p>Your video consultation link will be provided immediately once the payment is successful.</p>
    `;
    return baseTemplate(recipientName, contentHtml);
};

export const reminderTemplate = (recipientName, appointmentId, doctorName, patientName, date, time, isDoctor) => {
    const contentHtml = isDoctor ? `
        <span class="status-badge badge-booked">⏰ Appointment Reminder</span>
        <p>This is a reminder for your upcoming appointment with patient ${patientName}.</p>
        <div class="info-box">
            <p>📋 <span>Appointment ID:</span> ${appointmentId}</p>
            <p>📅 <span>Date:</span> ${date}</p>
            <p>🕐 <span>Time:</span> ${time}</p>
        </div>
        <p>Please be ready at the scheduled time.</p>
    ` : `
        <span class="status-badge badge-booked">⏰ Appointment Reminder</span>
        <p>This is a reminder for your upcoming appointment with Dr. ${doctorName}.</p>
        <div class="info-box">
            <p>📋 <span>Appointment ID:</span> ${appointmentId}</p>
            <p>📅 <span>Date:</span> ${date}</p>
            <p>🕐 <span>Time:</span> ${time}</p>
        </div>
        <p>Please be ready at the scheduled time.</p>
    `;
    return baseTemplate(recipientName, contentHtml);
};

export const consultationCompletedTemplate = (recipientName, appointmentId, doctorName, patientName, isDoctor) => {
    const contentHtml = isDoctor ? `
        <span class="status-badge badge-completed">✅ Consultation Completed</span>
        <p>The consultation session has been completed. Here are the details:</p>
        <div class="info-box">
            <p>📋 <span>Appointment ID:</span> ${appointmentId}</p>
            <p>🧑‍💼 <span>Patient:</span> ${patientName}</p>
            <p>📅 <span>Completed On:</span> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Please upload the prescription and medical notes for the patient.</p>
    ` : `
        <span class="status-badge badge-completed">✅ Consultation Completed</span>
        <p>Your consultation has been completed. Here are the details:</p>
        <div class="info-box">
            <p>📋 <span>Appointment ID:</span> ${appointmentId}</p>
            <p>👨‍⚕️ <span>Doctor:</span> ${doctorName}</p>
            <p>📅 <span>Completed On:</span> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Your prescription will be available in your profile shortly. Please follow the doctor's advice carefully.</p>
    `;
    return baseTemplate(recipientName, contentHtml);
};

export const appointmentCancelledTemplate = (recipientName, appointmentId, doctorName, patientName, isDoctor) => {
    const contentHtml = isDoctor ? `
        <span class="status-badge badge-cancelled">❌ Appointment Cancelled</span>
        <p>An appointment has been cancelled. Here are the details:</p>
        <div class="info-box">
            <p>📋 <span>Appointment ID:</span> ${appointmentId}</p>
            <p>🧑‍💼 <span>Patient:</span> ${patientName}</p>
            <p>📅 <span>Cancelled On:</span> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Your schedule has been updated accordingly.</p>
    ` : `
        <span class="status-badge badge-cancelled">❌ Appointment Cancelled</span>
        <p>Unfortunately your appointment has been cancelled. Here are the details:</p>
        <div class="info-box">
            <p>📋 <span>Appointment ID:</span> ${appointmentId}</p>
            <p>👨‍⚕️ <span>Doctor:</span> ${doctorName}</p>
            <p>📅 <span>Cancelled On:</span> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>You can book a new appointment anytime. We apologize for any inconvenience.</p>
    `;
    return baseTemplate(recipientName, contentHtml);
};