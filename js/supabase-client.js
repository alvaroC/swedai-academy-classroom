// ====================================================
// SwedAI Academy Classroom – Supabase Client
// ====================================================
// 🔧 FYLL I DINA SUPABASE-UPPGIFTER HÄR:

const SUPABASE_URL = 'https://adwlxsasasdjwaxixfqf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_F6FoJiFZ0O744zoe3BDATA_3eclCFfp';

// ====================================================
// Enroll a user – sparar i tabellen "Enrolling" i Supabase
// ====================================================
async function enrollUser(email, courseId, courseName) {
    const trimmed = email.trim().toLowerCase();

    // Enkel validering
    if (!trimmed || !trimmed.includes('@')) {
        return { ok: false, message: 'Ange en giltig e-postadress.' };
    }

    try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ email: trimmed })
        });

        if (resp.status === 201) {
            // ── Bekräftelsemejl skickas nu automatiskt via Supabase Database Webhook ──

            return { ok: true, message: '✅ Tack! Du är anmäld. Kolla din inbox!' };

        } else if (resp.status === 409) {
            return { ok: false, message: '📧 Den e-postadressen är redan anmäld.' };
        } else {
            const err = await resp.json().catch(() => ({}));
            console.error('Supabase error:', err);
            return { ok: false, message: 'Något gick fel. Försök igen.' };
        }

    } catch (e) {
        console.error('Enrollment network error:', e);
        return { ok: false, message: 'Nätverksfel – kontrollera din anslutning.' };
    }
}

// ====================================================
// Global handler – anropas från enrollment-formuläret
// ====================================================
window.handleEnrollSubmit = async function (btn, inputId, courseId, courseName) {
    const input = document.getElementById(inputId);
    const feedback = document.getElementById(`${inputId}-feedback`);
    if (!input || !feedback) return;

    const email = input.value;
    btn.disabled = true;
    btn.textContent = 'Skickar...';
    feedback.textContent = '';
    feedback.className = 'enroll-feedback';

    const result = await enrollUser(email, courseId, courseName);

    feedback.textContent = result.message;
    feedback.classList.add(result.ok ? 'enroll-success' : 'enroll-error');

    if (result.ok) {
        input.value = '';
        btn.textContent = 'Skickat ✓';
    } else {
        btn.disabled = false;
        btn.textContent = 'Skicka';
    }
};
