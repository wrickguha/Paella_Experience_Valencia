<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            [
                'question_en' => 'What is included in the experience?',
                'question_es' => '¿Qué incluye la experiencia?',
                'answer_en' => 'Every experience includes a guided visit to a local market, a hands-on paella cooking class with a professional chef, all ingredients and equipment, wine/drinks during the meal, and a recipe booklet to take home.',
                'answer_es' => 'Cada experiencia incluye una visita guiada a un mercado local, una clase práctica de cocina de paella con un chef profesional, todos los ingredientes y utensilios, vino/bebidas durante la comida y un recetario para llevar.',
            ],
            [
                'question_en' => 'Do I need cooking experience?',
                'question_es' => '¿Necesito experiencia en cocina?',
                'answer_en' => 'Not at all! Our classes are designed for all skill levels. Our chefs guide you through every step with patience and good humor.',
                'answer_es' => '¡Para nada! Nuestras clases están diseñadas para todos los niveles. Nuestros chefs te guían paso a paso con paciencia y buen humor.',
            ],
            [
                'question_en' => 'What is the cancellation policy?',
                'question_es' => '¿Cuál es la política de cancelación?',
                'answer_en' => 'Full refund up to 48 hours before the event. Cancellations within 48 hours are non-refundable but can be rescheduled to another available date.',
                'answer_es' => 'Reembolso completo hasta 48 horas antes del evento. Las cancelaciones con menos de 48 horas no son reembolsables, pero se pueden reprogramar.',
            ],
            [
                'question_en' => 'Can you accommodate dietary restrictions?',
                'question_es' => '¿Pueden adaptarse a restricciones dietéticas?',
                'answer_en' => 'Absolutely! We can accommodate vegetarian, vegan, gluten-free, and most other dietary needs. Please let us know at least 24 hours in advance.',
                'answer_es' => '¡Por supuesto! Podemos adaptarnos a necesidades vegetarianas, veganas, sin gluten y la mayoría de restricciones dietéticas. Avísanos con al menos 24 horas de antelación.',
            ],
            [
                'question_en' => 'Is the experience suitable for children?',
                'question_es' => '¿La experiencia es apta para niños?',
                'answer_en' => 'Children aged 6 and above are welcome but must be accompanied by an adult. We provide kid-friendly tasks during the cooking session.',
                'answer_es' => 'Los niños a partir de 6 años son bienvenidos pero deben estar acompañados por un adulto. Proporcionamos tareas aptas para niños durante la sesión.',
            ],
            [
                'question_en' => 'What is the difference between Bloom Gallery and Casa Magnolia?',
                'question_es' => '¿Cuál es la diferencia entre Bloom Gallery y Casa Magnolia?',
                'answer_en' => 'Bloom Gallery is a vibrant creative space in the heart of Ruzafa, available on Saturdays at €59/person. Casa Magnolia is a stunning private villa with panoramic terrace views, available weekdays at €99/person. Both offer the same incredible paella experience.',
                'answer_es' => 'Bloom Gallery es un espacio creativo vibrante en el corazón de Ruzafa, disponible los sábados a 59€/persona. Casa Magnolia es una impresionante villa privada con terraza panorámica, disponible entre semana a 99€/persona. Ambas ofrecen la misma increíble experiencia de paella.',
            ],
        ];

        foreach ($faqs as $i => $f) {
            Faq::create(array_merge($f, ['sort_order' => $i]));
        }
    }
}
