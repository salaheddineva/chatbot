<?php

use App\Http\Controllers\Api\AppointmentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('appointments')->group(function () {
    Route::get('/availability', [AppointmentController::class, 'getAvailability']);
    Route::post('/create', [AppointmentController::class, 'createAppointment']);
    Route::get('/available-slots', [AppointmentController::class, 'findAvailableSlots']);
});
