// Update the email service to add more debugging and error handling
const nodemailer = require("nodemailer")
const db = require("../config/database")

// Configure nodemailer with your email service
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail", // e.g., 'gmail', 'outlook', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Email service error:", error)
  } else {
    console.log("Email service is ready to send messages")
  }
})

/**
 * Send welcome email to newly registered user
 * @param {Object} user - User object containing email, name, etc.
 * @returns {Promise} - Promise resolving to the email sending result
 */
const sendWelcomeEmail = async (user) => {
  try {
    console.log("Sending welcome email to:", user.email)

    const mailOptions = {
      from: `"CUG Resource Hub" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Welcome to CUG Resource Hub!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="background-color: #00447c; padding: 15px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">Welcome to CUG Resource Hub!</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <p style="font-size: 16px;">Hello ${user.fullName || user.name},</p>
            
            <p style="font-size: 16px;">Thank you for joining the CUG Resource Hub! We're excited to have you as part of our academic community.</p>
            
            <p style="font-size: 16px;">With your new account, you can:</p>
            <ul style="font-size: 16px;">
              <li>Access academic resources from various departments</li>
              <li>Upload and share your own academic work</li>
              <li>Use AI-powered tools to summarize and analyze resources</li>
              <li>Connect with supervisors and other students</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/login" 
                 style="background-color: #00447c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Login to Your Account
              </a>
            </div>
            
            <p style="font-size: 16px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p style="font-size: 16px;">Best regards,<br>The CUG Resource Hub Team</p>
          </div>
          
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666;">
            <p>This is an automated message, please do not reply directly to this email.</p>
            <p>&copy; ${new Date().getFullYear()} CUG Resource Hub. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Welcome email sent:", info.messageId)
    return info
  } catch (error) {
    console.error("Error sending welcome email:", error)
    throw error
  }
}

/**
 * Send notification about new approved resource to all users
 * @param {Object} resource - Resource object with details about the approved resource
 * @returns {Promise} - Promise resolving when all emails are sent
 */
const sendResourceApprovalNotification = async (resource) => {
  try {
    console.log("Starting resource approval notification process for:", resource.title)

    // Get all active users from the database
    const [users] = await db.query('SELECT id, email, fullName FROM users WHERE status = "active"')

    if (!users || users.length === 0) {
      console.log("No active users to notify about the new resource")
      return { success: false, message: "No active users found" }
    }

    console.log(`Found ${users.length} active users to notify`)

    // Format resource type for display
    const resourceTypeMap = {
      "final-project": "Final Year Project",
      "mini-project": "Mini Project",
      thesis: "Thesis",
      "past-exam": "Past Exam",
    }

    const resourceType = resourceTypeMap[resource.type] || resource.type

    // Send emails in batches to avoid overwhelming the email server
    const batchSize = 50
    const totalBatches = Math.ceil(users.length / batchSize)

    console.log(`Sending resource approval notifications to ${users.length} users in ${totalBatches} batches`)

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      const batchEmails = batch.map((user) => user.email)

      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${totalBatches} with ${batchEmails.length} recipients`,
      )

      const mailOptions = {
        from: `"CUG Resource Hub" <${process.env.EMAIL_USER}>`,
        bcc: batchEmails, // Use BCC for privacy
        subject: `New ${resourceType} Available: ${resource.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="background-color: #00447c; padding: 15px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; text-align: center;">New Resource Available!</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <p style="font-size: 16px;">Hello CUG Resource Hub User,</p>
              
              <p style="font-size: 16px;">We're excited to inform you that a new academic resource has been approved and is now available:</p>
              
              <div style="background-color: #ffffff; border-left: 4px solid #00447c; padding: 15px; margin: 20px 0;">
                <h2 style="color: #00447c; margin-top: 0;">${resource.title}</h2>
                <p><strong>Type:</strong> ${resourceType}</p>
                <p><strong>Department:</strong> ${resource.department}</p>
                ${resource.studentName ? `<p><strong>Student:</strong> ${resource.studentName}</p>` : ""}
                ${resource.supervisorName ? `<p><strong>Supervisor:</strong> ${resource.supervisorName}</p>` : ""}
                ${resource.year ? `<p><strong>Year:</strong> ${resource.year}</p>` : ""}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/resources/${resource.id}" 
                   style="background-color: #00447c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View Resource
                </a>
              </div>
              
              <p style="font-size: 16px;">You can also use our AI-powered summary feature to quickly understand the key points of this resource.</p>
              
              <p style="font-size: 16px;">Best regards,<br>The CUG Resource Hub Team</p>
            </div>
            
            <div style="background-color: #f0f0f0; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666;">
              <p>You're receiving this email because you're a registered user of the CUG Resource Hub.</p>
              <p>To manage your email preferences, please visit your <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/profile/settings">account settings</a>.</p>
              <p>&copy; ${new Date().getFullYear()} CUG Resource Hub. All rights reserved.</p>
            </div>
          </div>
        `,
      }

      try {
        const info = await transporter.sendMail(mailOptions)
        console.log(`Batch ${Math.floor(i / batchSize) + 1}/${totalBatches} notification emails sent:`, info.messageId)
      } catch (error) {
        console.error(`Error sending batch ${Math.floor(i / batchSize) + 1}/${totalBatches}:`, error)
        // Continue with next batch even if this one fails
      }

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < users.length) {
        console.log("Adding delay between batches")
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    return { success: true, usersNotified: users.length }
  } catch (error) {
    console.error("Error sending resource approval notifications:", error)
    throw error
  }
}

module.exports = {
  sendWelcomeEmail,
  sendResourceApprovalNotification,
}
