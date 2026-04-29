import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

const sendEmail = async (toEmail: string, guestNames: string[], guestMeals: string[], guestRestrictions: string[]) => {
  const firstName = guestNames[0].split(' ')[0];
  const tableRows = guestNames.map((name, index) => {
    return `
      <tr>
        <td>${name}</td>
        <td>${guestMeals[index] || ''}</td>
        <td>${guestRestrictions[index] || ''}</td>
      </tr>
    `;
  }).join('');
  const options = {
    from: 'info@alexmax.love',
    to: toEmail,
    template: {
      id: 'rsvp-confirmation',
      variables: {
        first_name: firstName,
        table_rows: tableRows,
      },
    },
  };
  try {
    const { data, error } = await resend.emails.send(options);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
  }
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
  const db = env.DB;
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
    restrictions: z.array(z.string()),
    attend: z.string().transform(value => value === 'yes'),
    paddle: z.boolean().optional(),
    contact: z.email().optional(),
  }),
  handler: async ({ names, meals, restrictions, attend, contact, paddle }, { request, cookies }) => {
    const userAgent = request?.headers?.get('user-agent');
    const { city, region, country } = request?.cf as any;
    const guid = crypto.randomUUID();
    const date = new Date().toISOString();
    const guestNames = names.filter(Boolean);
    const guestData = guestNames.map((name, index) => (
      {
        guest_name: name,
        guest_meal: meals[index] || '',
        guest_diet: restrictions[index] || null,
        is_attending: attend,
        is_paddle: paddle,
        group_id: guid,
        group_email: (index < 1 && contact) ? contact : null,
        response_date: date,
        user_location: (index < 1) ? `${city}, ${region}, ${country}` : null,
        user_agent: (index < 1) ? userAgent : null,
      }
    ));

    await storeData(guestData);

    if (attend && contact) await sendEmail(contact, guestNames, meals, restrictions);

    const rsvpData = {
      group: guid,
      names: guestNames,
      attend,
    };

    cookies?.set('rsvp', JSON.stringify(rsvpData), {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365,
    });

    return rsvpData;
  },
});