<?php

use App\Http\Controllers\API\BookingController;
use App\Http\Controllers\API\CalendarController;
use App\Http\Controllers\API\ExperienceController;
use App\Http\Controllers\API\FaqController;
use App\Http\Controllers\API\GalleryController;
use App\Http\Controllers\API\LocationController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\SettingController;
use App\Http\Controllers\API\TestimonialController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Content APIs
|--------------------------------------------------------------------------
*/

Route::get('/experiences', [ExperienceController::class, 'index']);
Route::get('/experiences/{id}', [ExperienceController::class, 'show']);

Route::get('/locations', [LocationController::class, 'index']);
Route::get('/locations/{id}', [LocationController::class, 'show']);

Route::get('/calendar', [CalendarController::class, 'index']);
Route::get('/availability', [CalendarController::class, 'availability']);

Route::get('/gallery', [GalleryController::class, 'index']);
Route::get('/testimonials', [TestimonialController::class, 'index']);
Route::get('/faqs', [FaqController::class, 'index']);
Route::get('/settings', [SettingController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Booking & Payment APIs (rate limited)
|--------------------------------------------------------------------------
*/

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/booking/create', [BookingController::class, 'create']);
    Route::post('/payment/paypal', [PaymentController::class, 'capturePayPal']);
});
