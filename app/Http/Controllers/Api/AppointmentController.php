<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AppointmentService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
  private AppointmentService $appointmentService;

  public function __construct(AppointmentService $appointmentService)
  {
    $this->appointmentService = $appointmentService;
  }

  public function getAvailability(Request $request): JsonResponse
  {
    $request->validate([
      'time_min' => 'required|date',
      'time_max' => 'required|date',
    ]);

    $timeMin = Carbon::parse($request->time_min);
    $timeMax = Carbon::parse($request->time_max);

    $busySlots = $this->appointmentService->getAvailability($timeMin, $timeMax);

    return response()->json([
      'busy' => $busySlots->map(function ($appointment) {
        return [
          'id' => $appointment->id,
          'start' => $appointment->start_time->format('Y-m-d H:i:s'),
          'end' => $appointment->end_time->format('Y-m-d H:i:s'),
          'title' => $appointment->title,
        ];
      }),
    ]);
  }

  public function createAppointment(Request $request): JsonResponse
  {
    $request->validate([
      'title' => 'required|string',
      'description' => 'nullable|string',
      'start_time' => 'required|date',
      'end_time' => 'required|date|after:start_time',
      'attendees' => 'nullable|array',
    ]);

    $appointment = $this->appointmentService->createAppointment(
      $request->title,
      $request->description ?? '',
      Carbon::parse($request->start_time),
      Carbon::parse($request->end_time),
      $request->attendees ?? []
    );

    return response()->json([
      'success' => true,
      'appointment' => $appointment,
    ], 201);
  }

  public function findAvailableSlots(Request $request): JsonResponse
  {
    $request->validate([
      'duration' => 'required|integer|min:5',
      'start_date' => 'required|date',
      'end_date' => 'required|date|after_or_equal:start_date',
      'working_hours.start' => 'nullable|integer|min:0|max:23',
      'working_hours.end' => 'nullable|integer|min:0|max:23|gt:working_hours.start',
    ]);

    $availableSlots = $this->appointmentService->findAvailableSlots(
      $request->duration,
      Carbon::parse($request->start_date),
      Carbon::parse($request->end_date),
      $request->working_hours ?? ['start' => 9, 'end' => 17]
    );

    return response()->json([
      'available_slots' => $availableSlots,
    ]);
  }
}