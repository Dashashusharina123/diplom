<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TraineeController extends Controller
{
    public function index()
    {
        $trainees = DB::table('trainees')->get();
        return response()->json($trainees);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fio' => 'required|string|max:255',
            'title' => 'nullable|string|max:255'
        ]);

        $existing = DB::table('trainees')->where('fio', $validated['fio'])->first();

        if ($existing) {
            return response()->json([
                'success' => true,
                'message' => 'Ученик уже существует',
                'data' => $existing
            ], 200);
        }

        $id = DB::table('trainees')->insertGetId([
            'fio' => $validated['fio'],
            'title' => $validated['title'] ?? $validated['fio'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $trainee = DB::table('trainees')->where('id', $id)->first();

        return response()->json([
            'success' => true,
            'message' => 'Ученик сохранен',
            'data' => $trainee
        ], 201);
    }

    public function show($id)
    {
        $trainee = DB::table('trainees')->where('id', $id)->first();

        if (!$trainee) {
            return response()->json([
                'success' => false,
                'message' => 'Ученик не найден'
            ], 404);
        }

        return response()->json($trainee, 200);
    }
}
