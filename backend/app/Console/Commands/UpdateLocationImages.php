<?php

namespace App\Console\Commands;

use App\Models\Location;
use App\Models\LocationImage;
use Illuminate\Console\Command;

class UpdateLocationImages extends Command
{
    protected $signature   = 'images:update-locations';
    protected $description = 'Update location images to use real client photos';

    public function handle(): int
    {
        // Bloom Gallery / Speakeasy
        $bloom = Location::where('name_en', 'like', '%Bloom%')->first();
        if ($bloom) {
            $bloom->update(['image' => 'gallery/speakeasy-1.jpg']);
            LocationImage::where('location_id', $bloom->id)->delete();
            foreach ([
                'gallery/speakeasy-1.jpg',
                'gallery/speakeasy-2.jpg',
                'gallery/speakeasy-3.jpg',
                'gallery/speakeasy-4.jpg',
                'gallery/speakeasy-5.jpg',
            ] as $i => $img) {
                LocationImage::create(['location_id' => $bloom->id, 'image' => $img, 'sort_order' => $i]);
            }
            $this->info("Bloom Gallery updated (id={$bloom->id})");
        } else {
            $this->warn('Bloom Gallery not found');
        }

        // Casa Magnolia
        $magnolia = Location::where('name_en', 'like', '%Magnolia%')->first();
        if ($magnolia) {
            $magnolia->update(['image' => 'gallery/sobremesa.jpg']);
            LocationImage::where('location_id', $magnolia->id)->delete();
            foreach ([
                'gallery/sobremesa.jpg',
                'gallery/paella-1.jpg',
                'gallery/paella-valenciana.jpg',
                'gallery/chef-gene.jpg',
                'gallery/socarrat.jpg',
            ] as $i => $img) {
                LocationImage::create(['location_id' => $magnolia->id, 'image' => $img, 'sort_order' => $i]);
            }
            $this->info("Casa Magnolia updated (id={$magnolia->id})");
        } else {
            $this->warn('Casa Magnolia not found');
        }

        // Clear location cache so API returns fresh data
        \Illuminate\Support\Facades\Cache::forget('locations_en');
        \Illuminate\Support\Facades\Cache::forget('locations_es');

        $this->info('Location image cache cleared.');
        return self::SUCCESS;
    }
}
