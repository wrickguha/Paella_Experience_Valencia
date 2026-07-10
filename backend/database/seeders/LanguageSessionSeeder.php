<?php

namespace Database\Seeders;

use App\Models\LanguageSession;
use Illuminate\Database\Seeder;

class LanguageSessionSeeder extends Seeder
{
    public function run(): void
    {
        LanguageSession::truncate();

        // 1. Standard Language Sessions
        LanguageSession::create([
            'title_en' => 'Tapas & Talk (Spanish/English)',
            'title_es' => 'Tapas y Charlas (Español/Inglés)',
            'description_en' => 'A relaxed evening practicing language while enjoying traditional tapas in a social atmosphere.',
            'description_es' => 'Una tarde relajada practicando idiomas mientras disfrutas de tapas tradicionales en un ambiente social.',
            'language_type' => 'both',
            'skill_level' => null,
            'is_active' => true,
            'sort_order' => 1,
            'test_type' => 'session',
        ]);

        LanguageSession::create([
            'title_en' => 'Spanish Conversation Coffee',
            'title_es' => 'Café de Conversación en Español',
            'description_en' => 'Practice speaking Spanish over coffee with native speakers helping you along the way.',
            'description_es' => 'Practica hablar español tomando un café con hablantes nativos que te ayudarán en el camino.',
            'language_type' => 'spanish',
            'skill_level' => 'beginner',
            'is_active' => true,
            'sort_order' => 2,
            'test_type' => 'session',
        ]);

        LanguageSession::create([
            'title_en' => 'Advanced English Debate',
            'title_es' => 'Debate en Inglés Avanzado',
            'description_en' => 'Engage in interesting debates on cultural and current topic themes to polish your English.',
            'description_es' => 'Participa en debates interesantes sobre temas de cultura y actualidad para perfeccionar tu inglés.',
            'language_type' => 'english',
            'skill_level' => 'advanced',
            'is_active' => true,
            'sort_order' => 3,
            'test_type' => 'session',
        ]);

        // 2. Level Tests (Pruebas de Nivel)
        LanguageSession::create([
            'title_en' => 'Spanish Level Test — A1/A2',
            'title_es' => 'Prueba de Nivel de Español — A1/A2',
            'description_en' => 'Listen to the audio introduction and check if you understand the basic structures of daily Spanish.',
            'description_es' => 'Escucha la introducción en audio y comprueba si entiendes las estructuras básicas del español cotidiano.',
            'language_type' => 'spanish',
            'skill_level' => 'beginner',
            'is_active' => true,
            'sort_order' => 1,
            'test_type' => 'level_test',
            'audio_url' => null,
        ]);

        LanguageSession::create([
            'title_en' => 'Spanish Level Test — B1/B2',
            'title_es' => 'Prueba de Nivel de Español — B1/B2',
            'description_en' => 'Listen to the audio introduction to assess your comprehension of past tenses and opinions.',
            'description_es' => 'Escucha la introducción en audio para evaluar tu comprensión de los tiempos pasados y opiniones.',
            'language_type' => 'spanish',
            'skill_level' => 'intermediate',
            'is_active' => true,
            'sort_order' => 2,
            'test_type' => 'level_test',
            'audio_url' => null,
        ]);

        LanguageSession::create([
            'title_en' => 'English Level Test — B2/C1',
            'title_es' => 'Prueba de Nivel de Inglés — B2/C1',
            'description_en' => 'An evaluation designed for intermediate-advanced speakers looking to assess conversational flow.',
            'description_es' => 'Una evaluación diseñada para hablantes intermedios-avanzados que buscan evaluar el flujo conversacional.',
            'language_type' => 'english',
            'skill_level' => 'advanced',
            'is_active' => true,
            'sort_order' => 3,
            'test_type' => 'level_test',
            'audio_url' => null,
        ]);
    }
}
