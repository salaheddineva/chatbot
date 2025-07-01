<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\View\View;

class AppointmentController extends Controller
{
  public function index(): View
  {
    $appointments = Appointment::orderBy('start_time', 'desc')->get();

    return view('appointments.index', compact('appointments'));
  }
}