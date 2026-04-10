<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function index()
    {
        return Testimonial::orderBy('sort_order')->paginate(15);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'location_label' => 'nullable|string|max:255',
            'review_en' => 'required|string',
            'review_es' => 'nullable|string',
            'rating' => 'required|integer|between:1,5',
            'avatar' => 'nullable|string|max:500',
            'is_active' => 'nullable',
            'sort_order' => 'nullable|integer',
        ]);

        $data['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        return response()->json(Testimonial::create($data), 201);
    }

    public function update(Request $request, $id)
    {
        $testimonial = Testimonial::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'location_label' => 'nullable|string|max:255',
            'review_en' => 'required|string',
            'review_es' => 'nullable|string',
            'rating' => 'required|integer|between:1,5',
            'avatar' => 'nullable|string|max:500',
            'is_active' => 'nullable',
            'sort_order' => 'nullable|integer',
        ]);

        $data['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        $testimonial->update($data);

        return response()->json($testimonial);
    }

    public function destroy($id)
    {
        Testimonial::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
