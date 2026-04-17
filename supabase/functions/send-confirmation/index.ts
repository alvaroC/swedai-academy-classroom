// ====================================================
// Supabase Edge Function: send-confirmation
// Anropas från supabase-client.js efter INSERT
// Skickar bekräftelsemejl via Resend
// ====================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL = 'SwedAI Academy <noreply@swedaiacademy.se>';

serve(async (req: Request) => {

    // Tillåt CORS (anropas från webbläsaren)
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
        });
    }

    try {
        const payload = await req.json();
        const email = payload.record?.email || payload.email;

        if (!email || !email.includes('@')) {
            return new Response(JSON.stringify({ error: 'Ogiltig e-post' }), { status: 400 });
        }

        // ── Skicka via Resend ──────────────────────────────
        const resendResp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: [email],
                subject: '🎓 Välkommen till SwedAI Academy – du är anmäld!',
                html: buildEmailHtml(email),
            }),
        });

        if (!resendResp.ok) {
            const err = await resendResp.json();
            console.error('Resend error:', err);
            return new Response(JSON.stringify({ error: 'Kunde inte skicka mejl' }), { status: 500 });
        }

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (e) {
        console.error('Edge function error:', e);
        return new Response(JSON.stringify({ error: 'Serverfel' }), { status: 500 });
    }
});

// ── HTML-mall för bekräftelsemejlet ───────────────────────
function buildEmailHtml(email: string): string {
    return `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Välkommen till SwedAI Academy</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
        <tr>
            <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                    <!-- HEADER -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:36px 40px;text-align:center;">
                            <div style="font-size:2rem;margin-bottom:8px;">📚</div>
                            <h1 style="margin:0;font-size:1.4rem;font-weight:700;color:white;letter-spacing:-0.3px;">
                                SwedAI Academy
                            </h1>
                            <p style="margin:4px 0 0;font-size:0.8rem;color:rgba(255,255,255,0.45);letter-spacing:0.3px;">
                                ChatGPT Mastery Program
                            </p>
                        </td>
                    </tr>

                    <!-- BODY -->
                    <tr>
                        <td style="padding:40px 40px 32px;">
                            <h2 style="margin:0 0 16px;font-size:1.3rem;font-weight:700;color:#0f172a;">
                                Du är anmäld! 🎉
                            </h2>
                            <p style="margin:0 0 16px;font-size:0.95rem;color:#334155;line-height:1.7;">
                                Tack för ditt intresse för att lära dig mer om AI!
                                
                            </p>
                            

                            <!-- AUDIO PLAYER CARD -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:24px 0;width:100%;max-width:100%;">
                                <tr>
                                    <td width="48" style="vertical-align:middle;">
                                        <a href="https://swedai-academy-classroom.vercel.app/lyssna.html" target="_blank" style="display:inline-block;width:48px;height:48px;background:#D91B24;border-radius:50%;text-align:center;text-decoration:none;">
                                            <span style="display:inline-block;margin:13px 0 0 3px;font-size:1rem;color:white;">▶</span>
                                        </a>
                                    </td>
                                    <td style="padding-left:16px;vertical-align:middle;text-align:left;">
                                        <div style="font-size:0.95rem;font-weight:700;color:#0f172a;margin-bottom:2px;">
                                            Här kommer mer om AI: lyssna gärna på denna Podcast: "Nivå 6 från AI Learning Hub" 🎧
                                        </div>
                                        <div style="font-size:0.75rem;color:#64748b;margin-bottom:8px;">
                                            Klicka för att spela audio (m4a)
                                        </div>
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="height:4px;background:#e2e8f0;border-radius:2px;width:100%;">
                                                    <div style="height:4px;background:#D91B24;border-radius:2px;width:35%;"></div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- DIVIDER -->
                    <tr>
                        <td style="padding:0 40px;">
                            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;">
                        </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td style="padding:24px 40px;text-align:center;">
                            <p style="margin:0;font-size:0.78rem;color:#94a3b8;line-height:1.6;">
                                Du fick det här mejlet eftersom <strong>${email}</strong> anmälde sig på
                                <a href="https://swedaiacademy.se" style="color:#3b82f6;text-decoration:none;">swedaiacademy.se</a>.<br>
                                © ${new Date().getFullYear()} SwedAI Academy. Alla rättigheter förbehållna.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>`;
}
