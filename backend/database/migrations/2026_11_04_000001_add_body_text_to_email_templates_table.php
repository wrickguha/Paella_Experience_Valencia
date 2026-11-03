<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_templates', function (Blueprint $table) {
            $table->longText('body_text')->nullable();
        });

        DB::table('email_templates')
            ->whereNotNull('body_html')
            ->orderBy('id')
            ->get(['id', 'body_html'])
            ->each(function (object $template): void {
                $text = preg_replace('/<\s*br\s*\/?\s*>|<\s*\/\s*(?:p|div|li|h[1-6]|tr|blockquote)\s*>/i', "\n", $template->body_html);
                $text = html_entity_decode(strip_tags($text ?? $template->body_html), ENT_QUOTES | ENT_HTML5, 'UTF-8');

                DB::table('email_templates')
                    ->where('id', $template->id)
                    ->update(['body_text' => trim($text)]);
            });
    }

    public function down(): void
    {
        Schema::table('email_templates', function (Blueprint $table) {
            $table->dropColumn('body_text');
        });
    }
};
