import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';

async function handleNewGuest({ names, meals, attend }: { names: string[]; meals: string[]; attend: string }) {
  const guestNames = names.filter(Boolean);
  const guestMeals = meals.filter(Boolean);
  const isAttending = attend === 'yes';

  return {
    guestNames,
    guestMeals,
    isAttending,
  };
}

export const server = {
  rsvp: defineAction({
    accept: 'form',
    input: z.object({
      names: z.array(z.string()),
      meals: z.array(z.string()),
      attend: z.string(),
    }),
    handler: handleNewGuest,
  })
}