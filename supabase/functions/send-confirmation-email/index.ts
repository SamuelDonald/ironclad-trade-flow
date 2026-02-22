import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailData {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
}

interface WebhookPayload {
  user: {
    email: string;
    id: string;
  };
  email_data: EmailData;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();
    const { user, email_data } = payload;

    // Generate confirmation URL
    const confirmationUrl = `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`;

    // HTML email template
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm your PrimeLink email</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #9333ea;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #9333ea, #7c3aed);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-1px);
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                padding: 20px;
            }
            .button {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">PrimeLink Unity Services</div>
            <div class="subtitle">Your secure gateway to smarter trading</div>
        </div>
        
        <div class="content">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to PrimeLink Unity Services!</h2>
            
            <p>Please confirm your email address by clicking the button below to activate your account:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" class="button">Confirm Email</a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
                If the button doesn't work, you can copy and paste this link into your browser:<br>
                <a href="${confirmationUrl}" style="color: #9333ea; word-break: break-all;">${confirmationUrl}</a>
            </p>
        </div>
        
        <div class="footer">
            <p>If you did not create an account with PrimeLink, please ignore this email.</p>
            <p>&copy; 2024 PrimeLink Unity Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

    // Plain text version
    const textContent = `
Welcome to PrimeLink Unity Services!

Please confirm your email address by clicking the link below to activate your account:

${confirmationUrl}

If you did not create an account with PrimeLink, please ignore this email.

© 2024 PrimeLink Unity Services. All rights reserved.
`;

    console.log('Sending confirmation email to:', user.email);

    const emailResponse = await resend.emails.send({
      from: 'PrimeLink Unity Services <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Confirm your PrimeLink email',
      html: htmlContent,
      text: textContent,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    console.error('Error in send-confirmation-email function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
