<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\CalendarService;

$service = new CalendarService();
$events = $service->getAllLocationsCalendar(2026, 5);
print_r($events->toArray());
