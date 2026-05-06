<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResultController extends Controller
{
    public function index()
    {
        try {
            $results = DB::table('results')
                ->select(
                    'id',
                    'user_id',
                    'task_id',
                    'score',
                    'time',
                    'teacher_comment',  // ← ДОБАВИТЬ
                    'created_at'
                )
                ->orderBy('created_at', 'desc')
                ->get();

            // Добавляем имя ученика из users таблицы
            $results = $results->map(function($result) {
                $user = DB::table('users')->where('id', $result->user_id)->first();
                return (object) [
                    'id' => $result->id,
                    'trainee_name' => $user->fio ?? $user->name ?? 'Ученик',
                    'session_title' => 'Тестирование',
                    'score' => $result->score,
                    'time' => $result->time,
                    'teacher_comment' => $result->teacher_comment ?? null,  // ← ДОБАВИТЬ
                    'created_at' => $result->created_at,
                    'doc' => '📄'
                ];
            });

            return response()->json($results);
        } catch (\Exception $e) {
            Log::error('Results index error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'user_id' => 'nullable|integer',
                'task_id' => 'nullable|integer',
                'score' => 'required|string',
                'time' => 'required|string'
            ]);

            $id = DB::table('results')->insertGetId([
                'user_id' => $validated['user_id'] ?? null,
                'task_id' => $validated['task_id'] ?? null,
                'score' => $validated['score'],
                'time' => $validated['time'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'id' => $id,
                'message' => 'Результат сохранён'
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Results store error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $result = DB::table('results')->where('id', $id)->first();
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            DB::table('results')->where('id', $id)->update([
                'score' => $request->score,
                'time' => $request->time,
                'updated_at' => now()
            ]);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            DB::table('results')->where('id', $id)->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function addComment(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'comment' => 'nullable|string|max:1000'
            ]);

            DB::table('results')
                ->where('id', $id)
                ->update([
                    'teacher_comment' => $validated['comment'],
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Комментарий сохранён'
            ]);
        } catch (\Exception $e) {
            Log::error('Add comment error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // ✅ НОВЫЙ МЕТОД: Получить комментарий
    public function getComment($id)
    {
        try {
            $result = DB::table('results')
                ->select('teacher_comment')
                ->where('id', $id)
                ->first();

            return response()->json([
                'success' => true,
                'comment' => $result->teacher_comment ?? null
            ]);
        } catch (\Exception $e) {
            Log::error('Get comment error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
