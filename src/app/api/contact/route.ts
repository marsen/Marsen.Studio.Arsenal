import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { env } from '@/lib/env';

export async function POST(req: NextRequest) {
  if (!env.resendApiKey) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }

  try {
    const { email, message } = (await req.json()) as {
      email: string;
      message: string;
    };

    if (!email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const resend = new Resend(env.resendApiKey);

    await resend.emails.send({
      from: `Contact Form <${env.resendFromEmail}>`,
      to: 'admin@marsen.me',
      replyTo: email,
      subject: `新訊息來自 ${email}`,
      text: `寄件人：${email}\n\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
