<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index()
    {
        return Faq::orderBy('sort_order')->paginate(15);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'question_en' => 'required|string',
            'question_es' => 'nullable|string',
            'answer_en' => 'required|string',
            'answer_es' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable',
        ]);

        $data['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        return response()->json(Faq::create($data), 201);
    }

    public function update(Request $request, $id)
    {
        $faq = Faq::findOrFail($id);

        $data = $request->validate([
            'question_en' => 'required|string',
            'question_es' => 'nullable|string',
            'answer_en' => 'required|string',
            'answer_es' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable',
        ]);

        $data['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        $faq->update($data);

        return response()->json($faq);
    }

    public function destroy($id)
    {
        Faq::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
