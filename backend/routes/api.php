<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BookingController;
use App\Http\Controllers\API\CalendarController;
use App\Http\Controllers\API\ExperienceController;
use App\Http\Controllers\API\FaqController;
use App\Http\Controllers\API\GalleryController;
use App\Http\Controllers\API\LocationController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\SettingController;
use App\Http\Controllers\API\TestimonialController;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ExperienceController as AdminExperienceController;
use App\Http\Controllers\Admin\LocationController as AdminLocationController;
use App\Http\Controllers\Admin\CalendarController as AdminCalendarController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\GalleryController as AdminGalleryController;
use App\Http\Controllers\Admin\TestimonialController as AdminTestimonialController;
use App\Http\Controllers\Admin\FaqController as AdminFaqController;
use App\Http\Controllers\Admin\SettingController as AdminSettingController;
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

Route::middleware(['auth:sanctum', 'throttle:10,1'])->group(function () {
    Route::post('/booking/create', [BookingController::class, 'create']);
    Route::post('/payment/create-order', [PaymentController::class, 'createOrder']);
    Route::post('/payment/capture', [PaymentController::class, 'capture']);
});

// PayPal webhook — no throttle, no CSRF
Route::post('/payment/webhook', [PaymentController::class, 'webhook']);

/*
|--------------------------------------------------------------------------
| User Auth (public)
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| User API (Sanctum-protected, role: user)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile/update', [AuthController::class, 'updateProfile']);
    Route::get('/user/bookings', [AuthController::class, 'bookings']);
});

/*
|--------------------------------------------------------------------------
| Admin Auth (public)
|--------------------------------------------------------------------------
*/

Route::post('/admin/login', [AdminAuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Admin API (Sanctum-protected)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Auth
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me', [AdminAuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);
    Route::get('/dashboard/recent-bookings', [AdminDashboardController::class, 'recentBookings']);
    Route::get('/dashboard/revenue-chart', [AdminDashboardController::class, 'revenueChart']);

    // Experiences
    Route::get('/experiences', [AdminExperienceController::class, 'index']);
    Route::get('/experiences/{id}', [AdminExperienceController::class, 'show']);
    Route::post('/experiences', [AdminExperienceController::class, 'store']);
    Route::post('/experiences/{id}', [AdminExperienceController::class, 'update']);
    Route::delete('/experiences/{id}', [AdminExperienceController::class, 'destroy']);

    // Locations
    Route::get('/locations', [AdminLocationController::class, 'index']);
    Route::get('/locations/all', [AdminLocationController::class, 'all']);
    Route::get('/locations/{id}', [AdminLocationController::class, 'show']);
    Route::post('/locations', [AdminLocationController::class, 'store']);
    Route::post('/locations/{id}', [AdminLocationController::class, 'update']);
    Route::delete('/locations/{id}', [AdminLocationController::class, 'destroy']);

    // Calendar
    Route::get('/calendar/month', [AdminCalendarController::class, 'month']);
    Route::get('/calendar/slots', [AdminCalendarController::class, 'slots']);
    Route::post('/calendar/slots', [AdminCalendarController::class, 'createSlot']);
    Route::put('/calendar/slots/{id}', [AdminCalendarController::class, 'updateSlot']);
    Route::delete('/calendar/slots/{id}', [AdminCalendarController::class, 'deleteSlot']);
    Route::post('/calendar/block', [AdminCalendarController::class, 'blockDate']);
    Route::post('/calendar/unblock', [AdminCalendarController::class, 'unblockDate']);

    // Bookings
    Route::get('/bookings', [AdminBookingController::class, 'index']);
    Route::get('/bookings/{id}', [AdminBookingController::class, 'show']);
    Route::put('/bookings/{id}/status', [AdminBookingController::class, 'updateStatus']);

    // Payments
    Route::get('/payments', [AdminPaymentController::class, 'index']);
    Route::get('/payments/{id}', [AdminPaymentController::class, 'show']);

    // Gallery
    Route::get('/gallery', [AdminGalleryController::class, 'index']);
    Route::post('/gallery', [AdminGalleryController::class, 'store']);
    Route::post('/gallery/{id}', [AdminGalleryController::class, 'update']);
    Route::delete('/gallery/{id}', [AdminGalleryController::class, 'destroy']);
    Route::post('/gallery/reorder', [AdminGalleryController::class, 'reorder']);

    // Testimonials
    Route::get('/testimonials', [AdminTestimonialController::class, 'index']);
    Route::post('/testimonials', [AdminTestimonialController::class, 'store']);
    Route::put('/testimonials/{id}', [AdminTestimonialController::class, 'update']);
    Route::delete('/testimonials/{id}', [AdminTestimonialController::class, 'destroy']);

    // FAQs
    Route::get('/faqs', [AdminFaqController::class, 'index']);
    Route::post('/faqs', [AdminFaqController::class, 'store']);
    Route::put('/faqs/{id}', [AdminFaqController::class, 'update']);
    Route::delete('/faqs/{id}', [AdminFaqController::class, 'destroy']);

    // Settings
    Route::get('/settings', [AdminSettingController::class, 'index']);
    Route::put('/settings', [AdminSettingController::class, 'update']);
});
