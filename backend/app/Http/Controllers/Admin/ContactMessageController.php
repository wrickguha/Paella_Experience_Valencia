<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::latest();

        if ($request->filled('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        return response()->json($query->paginate(20));
    }

    public function show(ContactMessage $contactMessage): JsonResponse
    {
        if (!$contactMessage->is_read) {
            $contactMessage->update(['is_read' => true]);
        }

        return response()->json($contactMessage);
    }

    public function markRead(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->update(['is_read' => true]);

        return response()->json(['message' => 'Marked as read']);
    }

    public function markUnread(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->update(['is_read' => false]);

        return response()->json(['message' => 'Marked as unread']);
    }

    public function destroy(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->delete();

        return response()->json(['message' => 'Message deleted']);
    }

    public function unreadCount(): JsonResponse
    {
        return response()->json([
            'count' => ContactMessage::unread()->count(),
        ]);
    }
}
