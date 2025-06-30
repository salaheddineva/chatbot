export class GoogleCalendarService {
  constructor(clientId, apiKey, discoveryDocs, scopes) {
    this.clientId = clientId;
    this.apiKey = apiKey;
    this.discoveryDocs = discoveryDocs;
    this.scopes = scopes;
    this.tokenClient = null;
    this.gapiInitialized = false;
    this.gisInitialized = false;
  }

  async initialize() {
    if (!this.gapiInitialized) {
      await this.loadGapiAndInitialize();
    }

    if (!this.gisInitialized) {
      await this.initializeTokenClient();
    }

    return {
      gapiInitialized: this.gapiInitialized,
      gisInitialized: this.gisInitialized
    };
  }

  async loadGapiAndInitialize() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        gapi.load('client', async () => {
          try {
            await gapi.client.init({
              apiKey: this.apiKey,
              discoveryDocs: this.discoveryDocs,
            });
            this.gapiInitialized = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async initializeTokenClient() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: this.scopes.join(' '),
          callback: (tokenResponse) => {
            if (tokenResponse.error) {
              reject(tokenResponse);
            } else {
              this.gisInitialized = true;
              resolve(tokenResponse);
            }
          },
        });
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async authenticate() {
    if (!this.gapiInitialized || !this.gisInitialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      this.tokenClient.requestAccessToken({ prompt: '' });
      const checkAuthInterval = setInterval(() => {
        if (gapi.client.getToken()) {
          clearInterval(checkAuthInterval);
          resolve(true);
        }
      }, 100);
    });
  }

  async getAvailability(timeMin, timeMax, calendarId = 'primary') {
    try {
      const response = await gapi.client.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.result.items;
      const busySlots = events.map(event => ({
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        title: event.summary,
      }));

      return busySlots;
    } catch (error) {
      throw new Error(`Failed to fetch availability: ${error.message}`);
    }
  }

  async createAppointment(summary, description, startDateTime, endDateTime, attendees = [], calendarId = 'primary') {
    try {
      const event = {
        summary,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: attendees.map(email => ({ email })),
      };

      const response = await gapi.client.calendar.events.insert({
        calendarId,
        resource: event,
        sendUpdates: 'all',
      });

      return response.result;
    } catch (error) {
      throw new Error(`Failed to create appointment: ${error.message}`);
    }
  }

  async findAvailableSlots(duration, startDate, endDate, workingHours = { start: 9, end: 17 }, calendarId = 'primary') {
    const timeMin = new Date(startDate).toISOString();
    const timeMax = new Date(endDate).toISOString();
    const busySlots = await this.getAvailability(timeMin, timeMax, calendarId);

    const availableSlots = [];
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (currentDate < endDateObj) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        const dayStart = new Date(currentDate);
        dayStart.setHours(workingHours.start, 0, 0, 0);

        const dayEnd = new Date(currentDate);
        dayEnd.setHours(workingHours.end, 0, 0, 0);

        let timeSlotStart = new Date(dayStart);

        while (timeSlotStart < dayEnd) {
          const timeSlotEnd = new Date(timeSlotStart);
          timeSlotEnd.setMinutes(timeSlotStart.getMinutes() + duration);

          if (timeSlotEnd <= dayEnd) {
            const isAvailable = !busySlots.some(slot => {
              const slotStart = new Date(slot.start);
              const slotEnd = new Date(slot.end);
              return timeSlotStart < slotEnd && timeSlotEnd > slotStart;
            });

            if (isAvailable) {
              availableSlots.push({
                start: timeSlotStart.toISOString(),
                end: timeSlotEnd.toISOString(),
              });
            }
          }

          timeSlotStart.setMinutes(timeSlotStart.getMinutes() + 30);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableSlots;
  }
}