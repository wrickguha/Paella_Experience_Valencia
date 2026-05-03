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
use App\Http\Controllers\API\AboutController;
use App\Http\Controllers\API\ActivityController;
use App\Http\Controllers\API\CommunityController;
use App\Http\Controllers\API\ContactController;
use App\Http\Controllers\API\LanguageSessionController;
use App\Http\Controllers\API\LeadController;
use App\Http\Controllers\Admin\AboutController as AdminAboutController;
use App\Http\Controllers\Admin\ActivityController as AdminActivityController;
use App\Http\Controllers\Admin\CommunityMemberController as AdminCommunityMemberController;
use App\Http\Controllers\Admin\ContactMessageController as AdminContactMessageController;
use App\Http\Controllers\Admin\LanguageSessionController as AdminLanguageSessionController;
use App\Http\Controllers\Admin\LeadController as AdminLeadController;
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
Route::get('/about', [AboutController::class, 'index']);
Route::post('/contact', [ContactController::class, 'store']);

// Community, Language, Activities & Leads
Route::get('/activities', [ActivityController::class, 'index']);
Route::get('/community', [CommunityController::class, 'index']);
Route::post('/community/join', [CommunityController::class, 'join']);
Route::get('/languages', [LanguageSessionController::class, 'index']);
Route::post('/language/join', [LanguageSessionController::class, 'join']);
Route::post('/leads', [LeadController::class, 'store']);

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

    // About
    Route::get('/about', [AdminAboutController::class, 'index']);
    Route::post('/about', [AdminAboutController::class, 'store']);
    Route::post('/about/{id}', [AdminAboutController::class, 'update']);
    Route::delete('/about/{id}', [AdminAboutController::class, 'destroy']);
    Route::post('/about/reorder', [AdminAboutController::class, 'reorder']);

    // Contact Messages
    Route::get('/messages', [AdminContactMessageController::class, 'index']);
    Route::get('/messages/unread-count', [AdminContactMessageController::class, 'unreadCount']);
    Route::get('/messages/{contactMessage}', [AdminContactMessageController::class, 'show']);
    Route::put('/messages/{contactMessage}/read', [AdminContactMessageController::class, 'markRead']);
    Route::put('/messages/{contactMessage}/unread', [AdminContactMessageController::class, 'markUnread']);
    Route::delete('/messages/{contactMessage}', [AdminContactMessageController::class, 'destroy']);

    // Activities
    Route::get('/activities', [AdminActivityController::class, 'index']);
    Route::post('/activities', [AdminActivityController::class, 'store']);
    Route::put('/activities/{id}', [AdminActivityController::class, 'update']);
    Route::delete('/activities/{id}', [AdminActivityController::class, 'destroy']);

    // Community Members
    Route::get('/community', [AdminCommunityMemberController::class, 'index']);
    Route::put('/community/{id}', [AdminCommunityMemberController::class, 'update']);
    Route::delete('/community/{id}', [AdminCommunityMemberController::class, 'destroy']);

    // Language Sessions
    Route::get('/language-sessions', [AdminLanguageSessionController::class, 'index']);
    Route::post('/language-sessions', [AdminLanguageSessionController::class, 'store']);
    Route::put('/language-sessions/{id}', [AdminLanguageSessionController::class, 'update']);
    Route::delete('/language-sessions/{id}', [AdminLanguageSessionController::class, 'destroy']);

    // Leads
    Route::get('/leads', [AdminLeadController::class, 'index']);
    Route::get('/leads/stats', [AdminLeadController::class, 'stats']);
});
