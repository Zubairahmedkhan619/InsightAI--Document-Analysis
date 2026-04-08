import { Resend } from 'resend';

const resend = new Resend('re_RsAr9AXk_MBFYbnC8pqSjwXZzzhc2DCd9');

export async function POST() {
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'alexsmith30052025@gmail.com',
    subject: 'Hello World',
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
  });

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({ data });
}


