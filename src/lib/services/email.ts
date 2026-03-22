/**
 * Email Service using Resend
 * Handles reminder notifications and transactional emails
 */

import { Resend } from "resend";

// Initialize Resend client (API key from environment)
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "GrowKeeper <notifications@growkeeper.app>";

export interface SendReminderEmailParams {
  to: string;
  userName?: string;
  tasks: Array<{
    plantName: string;
    taskType: string;
    dueDate: string;
  }>;
}

export interface SendWelcomeEmailParams {
  to: string;
  userName?: string;
}

/**
 * Send task reminder email
 */
export async function sendReminderEmail({ to, userName, tasks }: SendReminderEmailParams) {
  const name = userName || "Plant Parent";
  const taskCount = tasks.length;
  const taskList = tasks
    .map((t) => `• ${t.taskType} - ${t.plantName} (due: ${t.dueDate})`)
    .join("\n");

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `🌿 You have ${taskCount} plant care ${taskCount === 1 ? "task" : "tasks"} due`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 48px;">🌱</span>
              <h1 style="color: #16a34a; margin: 16px 0 8px;">GrowKeeper</h1>
            </div>
            
            <p style="color: #334155; font-size: 16px;">Hi ${name},</p>
            
            <p style="color: #334155; font-size: 16px;">
              Your plants need some attention! You have <strong>${taskCount}</strong> care ${taskCount === 1 ? "task" : "tasks"} due:
            </p>
            
            <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 24px 0;">
              ${tasks
                .map(
                  (t) => `
                <div style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #dcfce7;">
                  <span style="font-size: 20px; margin-right: 12px;">
                    ${t.taskType === "watered" ? "💧" : t.taskType === "fertilized" ? "🌱" : "🌿"}
                  </span>
                  <div>
                    <strong style="color: #166534;">${t.taskType}</strong>
                    <br>
                    <span style="color: #4ade80; font-size: 14px;">${t.plantName}</span>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
            
            <div style="text-align: center; margin-top: 24px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://growkeeper.app"}/dashboard" 
                 style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                View Dashboard
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
              You're receiving this because you enabled email reminders in GrowKeeper.
              <br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://growkeeper.app"}/settings" style="color: #94a3b8;">
                Manage notification preferences
              </a>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Hi ${name},

Your plants need some attention! You have ${taskCount} care ${taskCount === 1 ? "task" : "tasks"} due:

${taskList}

View your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || "https://growkeeper.app"}/dashboard

- GrowKeeper Team
      `,
    });

    if (error) {
      console.error("Error sending reminder email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Error sending reminder email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail({ to, userName }: SendWelcomeEmailParams) {
  const name = userName || "Plant Parent";

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "🌱 Welcome to GrowKeeper!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 64px;">🌱</span>
              <h1 style="color: #16a34a; margin: 16px 0 8px;">Welcome to GrowKeeper!</h1>
            </div>
            
            <p style="color: #334155; font-size: 16px;">Hi ${name},</p>
            
            <p style="color: #334155; font-size: 16px;">
              We're excited to have you! GrowKeeper helps you keep your plants healthy and thriving.
            </p>
            
            <h3 style="color: #16a34a; margin-top: 24px;">Getting Started:</h3>
            
            <div style="margin: 16px 0;">
              <div style="display: flex; align-items: center; padding: 12px 0;">
                <span style="background: #f0fdf4; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: bold; color: #16a34a;">1</span>
                <span style="color: #334155;">Add your first plant to your collection</span>
              </div>
              <div style="display: flex; align-items: center; padding: 12px 0;">
                <span style="background: #f0fdf4; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: bold; color: #16a34a;">2</span>
                <span style="color: #334155;">Log your first care event (watering, fertilizing, etc.)</span>
              </div>
              <div style="display: flex; align-items: center; padding: 12px 0;">
                <span style="background: #f0fdf4; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: bold; color: #16a34a;">3</span>
                <span style="color: #334155;">Set up reminders so you never forget to care for your plants</span>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 24px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://growkeeper.app"}/plants/new" 
                 style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Add Your First Plant
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
              Happy growing! 🌿
              <br>
              The GrowKeeper Team
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: "Failed to send email" };
  }
}
