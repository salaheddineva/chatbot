import PlanifyMeeting from './planify_meeting.tool.js';
import VerifyDisponibilityCalendar from './verify_disponibility_calendar.tool.js';

const tools = [
  { name: 'planify_meeting', tool: PlanifyMeeting },
  { name: 'verify_disponibility_calendar', tool: VerifyDisponibilityCalendar }
];

export function getToolByName(name) {
  const tool = tools.find(t => t.name === name);
  return tool ? tool.tool : null;
}