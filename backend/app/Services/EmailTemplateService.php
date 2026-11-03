<?php

namespace App\Services;

use App\Models\EmailTemplate;
use DateTimeInterface;

class EmailTemplateService
{
    public function isEnabled(string $key): bool
    {
        $template = EmailTemplate::where('key', $key)->first();

        return $template?->is_active ?? true;
    }

    public function subject(string $key, string $fallback, array $data): string
    {
        $template = EmailTemplate::where('key', $key)->first();

        return $this->replaceVariables($template?->subject ?: $fallback, $data);
    }

    public function bodyText(string $key, array $data): ?string
    {
        $template = EmailTemplate::where('key', $key)->first();

        return $this->renderBodyText($template?->body_text, $data);
    }

    public function renderBodyText(?string $content, array $data): ?string
    {
        if ($content === null || trim($content) === '') {
            return null;
        }

        return $this->replaceVariables($content, $data);
    }

    private function replaceVariables(string $content, array $data): string
    {
        return preg_replace_callback('/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/', function (array $matches) use ($data) {
            $value = data_get($data, $matches[1]);

            if ($value === null || is_array($value) || is_object($value) && ! $value instanceof DateTimeInterface) {
                return $matches[0];
            }

            if ($value instanceof DateTimeInterface) {
                $value = $value->format('F j, Y');
            }

            $value = (string) $value;
            return str_replace(["\r", "\n"], ' ', $value);
        }, $content) ?? $content;
    }
}
