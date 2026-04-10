<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LocationController extends Controller
{
    private function imageUrl(?string $path): ?string
    {
        if (!$path) return null;
        return str_starts_with($path, 'http') ? $path : asset('storage/' . $path);
    }

    public function index()
    {
        return Location::orderBy('name_en')
            ->paginate(15)
            ->through(fn ($l) => [
                'id' => $l->id,
                'name_en' => $l->name_en,
                'name_es' => $l->name_es,
                'description_en' => $l->description_en,
                'description_es' => $l->description_es,
                'address' => $l->address,
                'image' => $this->imageUrl($l->image),
                'availability_type' => $l->availability_type,
                'is_active' => $l->is_active,
            ]);
    }

    public function all()
    {
        return Location::where('is_active', true)
            ->orderBy('name_en')
            ->get(['id', 'name_en', 'name_es']);
    }

    public function show($id)
    {
        $l = Location::findOrFail($id);

        return response()->json([
            'id' => $l->id,
            'name_en' => $l->name_en,
            'name_es' => $l->name_es,
            'description_en' => $l->description_en,
            'description_es' => $l->description_es,
            'address' => $l->address,
            'image' => $this->imageUrl($l->image),
            'availability_type' => $l->availability_type,
            'is_active' => $l->is_active,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_es' => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'description_es' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'availability_type' => 'nullable|in:weekly,custom',
            'is_active' => 'nullable',
        ]);

        $data['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('locations', 'public');
        }

        $location = Location::create($data);

        return response()->json($location, 201);
    }

    public function update(Request $request, $id)
    {
        $location = Location::findOrFail($id);

        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_es' => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'description_es' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'availability_type' => 'nullable|in:weekly,custom',
            'is_active' => 'nullable',
        ]);

        $data['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('image')) {
            if ($location->image) {
                Storage::disk('public')->delete($location->image);
            }
            $data['image'] = $request->file('image')->store('locations', 'public');
        }

        $location->update($data);

        return response()->json($location);
    }

    public function destroy($id)
    {
        $location = Location::findOrFail($id);
        if ($location->image) {
            Storage::disk('public')->delete($location->image);
        }
        $location->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
