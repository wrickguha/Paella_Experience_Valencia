<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ClearPendingBookings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bookings:clear-pending';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear pending bookings older than 24 hours';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = Booking::where('payment_status', 'pending')
            ->where('created_at', '<', Carbon::now()->subHours(24))
            ->delete();

        $this->info("Cleared {$count} pending bookings older than 24 hours.");
    }
}
