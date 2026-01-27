import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';

export const server = {
  rsvp: defineAction({
    accept: 'form',
    input: z.object({
      names: z.array(z.string()),
      meals: z.array(z.string()),
      attend: z.string(),
    }),
    handler: async ({names, meals, attend}, context) => {
      const guestNames = names.filter(Boolean);
      const guestMeals = meals.filter(Boolean);
      const isAttending = attend === 'yes';

      const env = context.locals.runtime.env as Env;
      const db = env.wedding;

      const guests = [] as Array<Array<string | boolean>>;
      guestNames.forEach((name, index) => {
        guests.push(['test', name, isAttending, guestMeals[index] || '', 'note']);
      });
      const placeholders = guests.map(() => '(?, ?, ?, ?, ?)').join(', ');
      const flatValues = guests.flat();

      await db
        .prepare(`INSERT INTO guests (group_id, guest_name, is_attending, guest_meal, guest_note) VALUES ${placeholders}`)
        .bind(...flatValues)
        .run();

      return {
        guestNames,
        guestMeals,
        isAttending,
      };
    },
  })
}