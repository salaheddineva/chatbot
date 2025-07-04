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
    const params = new URLSearchParams({
      duration,
      start_date: startDate,
      end_date: endDate,
      'working_hours[start]': workingHours.start,
      'working_hours[end]': workingHours.end
    });

    const response = await fetch(`${this.baseUrl}/available-slots?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to find available slots: ${response.statusText}`);
    }

    const data = await response.json();
    return data.available_slots;
  }
}