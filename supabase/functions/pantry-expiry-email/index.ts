import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExpiringItem {
  name: string;
  expiresAt: string;
  status: string;
  daysLeft: number | null;
}

interface EmailRequest {
  email: string;
  expiringItems: ExpiringItem[];
}

const getStatusEmoji = (status: string) => {
  switch (status) {
    case 'expired': return '🔴';
    case 'urgent': return '🟠';
    case 'soon': return '🟡';
    default: return '🟢';
  }
};

const getStatusText = (status: string, daysLeft: number | null) => {
  if (status === 'expired') return 'Expired';
  if (daysLeft === 0) return 'Expires today';
  if (daysLeft === 1) return '1 day left';
  return `${daysLeft} days left`;
};

function readErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, expiringItems }: EmailRequest = await req.json();

    if (!email || !expiringItems || expiringItems.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending expiry email to ${email} with ${expiringItems.length} items`);

    // Separate items by urgency
    const expiredItems = expiringItems.filter(i => i.status === 'expired');
    const urgentItems = expiringItems.filter(i => i.status === 'urgent');
    const soonItems = expiringItems.filter(i => i.status === 'soon');

    // Build HTML email
    const itemsHtml = expiringItems.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          ${getStatusEmoji(item.status)} ${item.name}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: ${
          item.status === 'expired' ? '#ef4444' : 
          item.status === 'urgent' ? '#f97316' : '#eab308'
        }; font-weight: 500;">
          ${getStatusText(item.status, item.daysLeft)}
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🥘 LadhaQuest Pantry</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your Weekly Expiry Digest</p>
            </div>
            
            <!-- Summary -->
            <div style="padding: 20px; background: #fff7ed; border-bottom: 1px solid #fed7aa;">
              <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #9a3412;">
                ⚠️ ${expiringItems.length} item${expiringItems.length > 1 ? 's' : ''} need attention
              </h2>
              <p style="margin: 0; color: #c2410c; font-size: 14px;">
                ${expiredItems.length > 0 ? `${expiredItems.length} expired, ` : ''}
                ${urgentItems.length > 0 ? `${urgentItems.length} urgent, ` : ''}
                ${soonItems.length > 0 ? `${soonItems.length} expiring soon` : ''}
              </p>
            </div>
            
            <!-- Items Table -->
            <div style="padding: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 12px; background: #f3f4f6; border-radius: 8px 0 0 8px;">Ingredient</th>
                    <th style="text-align: right; padding: 12px; background: #f3f4f6; border-radius: 0 8px 8px 0;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>
            
            <!-- Tips -->
            <div style="padding: 20px; background: #f0fdf4; border-top: 1px solid #bbf7d0;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #166534;">💡 Quick Tips</h3>
              <ul style="margin: 0; padding: 0 0 0 20px; color: #15803d; font-size: 14px;">
                <li style="margin-bottom: 5px;">Use expiring vegetables in stews or soups</li>
                <li style="margin-bottom: 5px;">Freeze items you can't use in time</li>
                <li>Check LadhaQuest for recipes using your expiring items</li>
              </ul>
            </div>
            
            <!-- CTA -->
            <div style="padding: 30px; text-align: center;">
              <a href="https://www.ladhaquest.com/pantry" style="display: inline-block; background: #f97316; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                View My Pantry
              </a>
            </div>
            
            <!-- Footer -->
            <div style="padding: 20px; background: #f9fafb; text-align: center; font-size: 12px; color: #6b7280;">
              <p style="margin: 0;">You're receiving this because you enabled pantry alerts.</p>
              <p style="margin: 5px 0 0 0;">LadhaQuest - Discover African Cuisine</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "LadhaQuest <noreply@ladhaquest.com>",
      to: [email],
      subject: `🥘 ${expiringItems.length} pantry item${expiringItems.length > 1 ? 's' : ''} expiring soon`,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: readErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
