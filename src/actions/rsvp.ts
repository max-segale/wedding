import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';

const resend = new Resend('re_HV6cwCnf_GS79TPuvPSXBmLQL3dJeM1xj');

const sendEmail = (toEmail: string, guestNames: any) => {
  resend.emails.send({
    from: 'info@alexmax.love',
    to: toEmail,
    subject: "You're Confirmed",
    html: `<p>Thanks ${guestNames} on sending your <strong>new email</strong>!</p>`
  });
};

const storeData = async (dataRows: any) => {
  const colNames = Object.keys(dataRows[0]);
  const valueRows = dataRows.map((rowObj: any) => Object.values(rowObj));
  const tableCols = colNames.join(', ');
  const placeholderRows = valueRows.map(() => (
    `(${colNames.map(() => '?').join(', ')})`
  )).join(', ');
  const sqlStatement = `INSERT INTO guests (${tableCols}) VALUES ${placeholderRows}`;
  const allValues = valueRows.flat();
  const db = env.wedding;
  await db
    .prepare(sqlStatement)
    .bind(...allValues)
    .run();
};

export const rsvp = defineAction({
  accept: 'form',
  input: z.object({
    names: z.array(z.string()),
    meals: z.array(z.string()),
    requests: z.array(z.string()),
    attend: z.string(),
    contact: z.email().optional(),
  }),
  handler: async ({names, meals, requests, attend, contact}, context) => {
    const ctxRequest = context?.request || {};
    const cfObj = ctxRequest.cf || {};
    const userAgent = ctxRequest.headers?.get('user-agent');
    const { city, region, country } = cfObj;
    const guid = crypto.randomUUID();
    const attending = attend === 'yes';
    const date = new Date().toISOString();
    const guestNames = names.filter(Boolean);
    const guestData = guestNames.map((name, index) => (
      {
        guest_name: name,
        guest_meal: meals[index] || '',
        guest_note: requests[index] || null,
        guest_email: (index < 1 && contact) ? contact : null,
        is_attending: attending,
        group_id: guid,
        response_date: date,
        user_location: (index < 1) ? `${city}, ${region}, ${country}` : null,
        user_agent: (index < 1) ? userAgent : null,
      }
    ));

    await storeData(guestData);

    if (attending && contact) sendEmail(contact, guestNames);

    context.cookies.set('rsvp', guid, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365,
    });

    return {
      id: guid,
      names: guestNames,
      attending,
    };
  },
});