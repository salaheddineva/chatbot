<?php

namespace App\Services;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AppointmentService
{
  public function getAvailability(Carbon $timeMin, Carbon $timeMax): Collection
  {
    return Appointment::where('status', 'scheduled')
      ->where('start_time', '>=', $timeMin)
      ->where('end_time', '<=', $timeMax)
      ->get();
  }

  public function createAppointment(
    string $title,
    string $description,
    Carbon $startDateTime,
    Carbon $endDateTime,
    array $attendees = []
  ): Appointment {
    return Appointment::create([
      'title' => $title,
      'description' => $description,
      'start_time' => $startDateTime,
      'end_time' => $endDateTime,
      'attendees' => $attendees,
    ]);
  }

  public function findAvailableSlots(
    int $durationMinutes,
    Carbon $startDate,
    Carbon $endDate,
    array $workingHours = ['start' => 9, 'end' => 17]
  ): array {
    $busySlots = $this->getAvailability($startDate, $endDate);
    $availableSlots = [];

    for ($day = $startDate->copy(); $day <= $endDate; $day->addDay()) {
      $dayStart = $day->copy()->setHour($workingHours['start'])->setMinute(0)->setSecond(0);
      $dayEnd = $day->copy()->setHour($workingHours['end'])->setMinute(0)->setSecond(0);

      $conflictingAppointments = $busySlots->filter(function ($appointment) use ($dayStart, $dayEnd) {
        return $appointment->start_time < $dayEnd && $appointment->end_time > $dayStart;
      });

      $timeSlots = $this->generateTimeSlots($dayStart, $dayEnd, $durationMinutes, $conflictingAppointments);
      $availableSlots = array_merge($availableSlots, $timeSlots);
    }

    return $availableSlots;
  }

  private function generateTimeSlots(
    Carbon $dayStart,
    Carbon $dayEnd,
    int $durationMinutes,
    Collection $conflictingAppointments
  ): array {
    $slots = [];
    $currentSlotStart = $dayStart->copy();

    while ($currentSlotStart->addMinutes($durationMinutes) <= $dayEnd) {
      $currentSlotEnd = $currentSlotStart->copy()->addMinutes($durationMinutes);

      $isAvailable = $conflictingAppointments->every(function ($appointment) use ($currentSlotStart, $currentSlotEnd) {
        return $appointment->end_time <= $currentSlotStart || $appointment->start_time >= $currentSlotEnd;
      });

      if ($isAvailable) {
        $slots[] = [
          'start' => $currentSlotStart->format('Y-m-d H:i:s'),
          'end' => $currentSlotEnd->format('Y-m-d H:i:s'),
        ];
      }

      $currentSlotStart = $currentSlotStart->addMinutes($durationMinutes);
    }

    return $slots;
  }
}