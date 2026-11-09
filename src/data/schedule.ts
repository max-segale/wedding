export interface ScheduleItem {
  day: string;
  events: {
    name: string;
    time: string;
    description: string;
    link?: string;
  }[],
}

export const scheduleItems = [
  {
    day : `Friday, September 11th`,
    events: [
      {
        name: `Paddle Board Party`,
        time: `11:00am`,
        description: `For anyone who wants to arrive early on Friday, we will be hosting a float down the Delaware River back to the Shawnee Inn. A group raft will be available if you cannot bring your own floation device.`,
      },
      {
        name: `Welcome Party`,
        time: `7:00pm`,
        description: `Let's get this party started with a joyful meet and greet with all of our family and friends. There will be a BBQ buffet dinner and drinks will be served.`,
      },
    ],
  },
  {
    day : `Saturday, September 12th`,
    events: [
      {
        name: `Wedding Ceremony`,
        time: `3:00pm`,
        description: `Join us on the banks of the Delaware River for a beautiful outdoor wedding ceremony on the Shawnee grand lawn.`,
      },
      {
        name: `Cocktail Hour`,
        time: `4:00pm`,
        description: `Hangout at the river-side pavilion and enjoy some drinks and hors d'oeuvres.`,
      },
      {
        name: `Wedding Reception`,
        time: `5:30pm`,
        description: `We move the party inside to the Worthington Ballroom for dinner and dancing.`,
      },
      {
        name: `After Party`,
        time: `10:00pm`,
        description: `Walk down to ShawneeCraft Brewery to keep the good times rolling and lounge around the fire pits.`,
      },
    ],
  },
];
