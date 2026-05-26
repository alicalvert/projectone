export const prerender = false;

import type { APIRoute } from 'astro';
import { env as cfEnv } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request }) => {
  try {
    const apiKey = (cfEnv as any).RESEND_API_KEY;

    if (!apiKey) {
      return json({ error: 'Server configuration error' }, 500);
    }

    let body: Record<string, string>;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid request' }, 400);
    }

    const { name, email, website, message } = body;
    if (!name || !email || !website) {
      return json({ error: 'Missing required fields' }, 400);
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Project One <hello@projectone.me>',
        to: ['formrequest@projectone.me'],
        reply_to: email,
        subject: `Visibility audit request from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nWebsite: ${website}\n\n${message ?? ''}`.trim(),
        html: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Website:</strong> ${website}</p>
          ${message ? `<p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>` : ''}
        `,
      }),
    });

    if (!resendRes.ok) {
      return json({ error: 'Failed to send email' }, 500);
    }

    return json({ success: true }, 200);

  } catch {
    return json({ error: 'Server error' }, 500);
  }
};

function json(data: object, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
