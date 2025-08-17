import calendarEventsData from "@/services/mockData/calendarEvents.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let calendarEvents = [...calendarEventsData];

export const calendarService = {
  async getAll() {
    await delay(300);
    return [...calendarEvents];
  },

  async getByMonth(year, month) {
    await delay(250);
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    }).map(event => ({ ...event }));
  },

  async create(eventData) {
    await delay(400);
    const newId = Math.max(...calendarEvents.map(e => e.Id)) + 1;
    const newEvent = {
      Id: newId,
      ...eventData,
      type: eventData.type || "team-event"
    };
    calendarEvents.push(newEvent);
    return { ...newEvent };
  },

  async update(id, eventData) {
    await delay(400);
    const eventIndex = calendarEvents.findIndex(event => event.Id === parseInt(id));
    if (eventIndex === -1) throw new Error("Calendar event not found");
    
    calendarEvents[eventIndex] = {
      ...calendarEvents[eventIndex],
      ...eventData
    };
    
    return { ...calendarEvents[eventIndex] };
  },

  async delete(id) {
    await delay(300);
    const eventIndex = calendarEvents.findIndex(event => event.Id === parseInt(id));
    if (eventIndex === -1) throw new Error("Calendar event not found");
    
    calendarEvents.splice(eventIndex, 1);
    return true;
  }
};