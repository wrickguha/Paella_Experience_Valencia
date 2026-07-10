<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('settings')) {
            $enJsonPath = base_path('../frontend/src/locales/en.json');
            
            if (file_exists($enJsonPath)) {
                $enJson = json_decode(file_get_contents($enJsonPath), true);
                
                $spanishQuestions = $enJson['spanishTest']['questions'] ?? [];
                $englishQuestions = $enJson['englishTest']['questions'] ?? [];
                
                Setting::updateOrCreate(
                    ['key' => 'spanishTest_questions'],
                    ['value' => json_encode($spanishQuestions, JSON_UNESCAPED_UNICODE), 'group' => 'general']
                );
                
                Setting::updateOrCreate(
                    ['key' => 'englishTest_questions'],
                    ['value' => json_encode($englishQuestions, JSON_UNESCAPED_UNICODE), 'group' => 'general']
                );
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('settings')) {
            Setting::whereIn('key', ['spanishTest_questions', 'englishTest_questions'])->delete();
        }
    }
};
