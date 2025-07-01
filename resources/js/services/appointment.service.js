export class AppointmentService {
  constructor() {
    this.baseUrl = '/api/appointments';
  }

  async getAvailability(timeMin, timeMax) {
    const response = await fetch(`${this.baseUrl}/availability?time_min=${timeMin}&time_max=${timeMax}`);

    if (!response.ok) {
      throw new Error(`Failed to get availability: ${response.statusText}`);
    }

    const data = await response.json();
    return data.busy;
  }

  async createAppointment(summary, description, startDateTime, endDateTime, attendees = []) {
    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
      body: JSON.stringify({
        title: summary,
        description,
        start_time: startDateTime,
        end_time: endDateTime,
        attendees
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create appointment: ${response.statusText}`);
    }

    return response.json();
  }

  async findAvailableSlots(duration, startDate, endDate, workingHours = { start: 9, end: 17 }) {
    const url = new URL(`${this.baseUrl}/available-slots`);
    url.searchParams.append('duration', duration);
    url.searchParams.append('start_date', startDate);
    url.searchParams.append('end_date', endDate);
    url.searchParams.append('working_hours[start]', workingHours.start);
    url.searchParams.append('working_hours[end]', workingHours.end);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to find available slots: ${response.statusText}`);
    }

    const data = await response.json();
    return data.available_slots;
  }
}