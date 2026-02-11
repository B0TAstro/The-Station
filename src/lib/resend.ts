import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSubscriptionReminder(
    to: string,
    subscriptionName: string,
    amount: number,
    daysUntil: number
) {
    try {
        await resend.emails.send({
            from: 'The Station <notifications@yourdomain.com>',
            to,
            subject: `🔔 Rappel: ${subscriptionName} arrive à échéance`,
            html: `
        <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="border: 3px solid #000; padding: 20px;">
            <h1 style="margin: 0 0 20px 0; font-size: 24px;">The Station</h1>
            <p style="font-size: 16px; margin: 0 0 10px 0;">
              <strong>${subscriptionName}</strong> va être débité dans <strong>${daysUntil} jours</strong>.
            </p>
            <p style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #2563eb;">
              ${amount.toFixed(2)} €
            </p>
            <p style="font-size: 14px; color: #666;">
              Si tu souhaites résilier cet abonnement, c'est le moment !
            </p>
          </div>
        </div>
      `,
        });

        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
}
