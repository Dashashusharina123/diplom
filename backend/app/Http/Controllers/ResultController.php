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
                    'results.id',
                    'results.user_id',
                    'results.task_id',
                    'results.score',
                    'results.time',
                    'results.teacher_comment',
                    'results.created_at'
                )
                ->orderBy('created_at', 'desc')
                ->get();

            $results = $results->map(function($result) {
                $user = DB::table('users')->where('id', $result->user_id)->first();

                // Получаем название группы
                $groupName = null;
                if ($user && $user->group_id) {
                    $group = DB::table('groups')->where('id', $user->group_id)->first();
                    $groupName = $group ? $group->name : null;
                }

                return (object) [
                    'id' => $result->id,
                    'user_id' => $result->user_id,
                    'trainee_name' => $user->fio ?? $user->name ?? 'Ученик',
                    'trainee_group' => $groupName,
                    'session_title' => 'Тестирование',
                    'score' => $result->score,
                    'time' => $result->time,
                    'teacher_comment' => $result->teacher_comment,
                    'created_at' => $result->created_at
                ];
            });

            return response()->json($results);
        } catch (\Exception $e) {
            Log::error('Results index error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage(), 'line' => $e->getLine()], 500);
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


    // Добавьте этот метод в ResultController.php

    public function getUserStats($userId)
    {
        try {
            $results = DB::table('results')
                ->where('user_id', $userId)
                ->get();

            $totalTests = $results->count();

            if ($totalTests === 0) {
                return response()->json([
                    'total_tests' => 0,
                    'passed_tests' => 0,
                    'failed_tests' => 0,
                    'success_rate' => 0,
                    'average_score_percent' => 0,
                    'average_score_5' => 0,
                    'best_result' => '—',
                    'worst_result' => '—'
                ]);
            }

            $passedTests = 0;
            $totalPercent = 0;
            $bestPercent = 0;
            $worstPercent = 100;
            $bestResultStr = '';
            $worstResultStr = '';

            foreach ($results as $result) {
                $scoreParts = explode('/', $result->score);
                $correct = (int)$scoreParts[0];
                $total = (int)$scoreParts[1];
                $percent = $total > 0 ? ($correct / $total) * 100 : 0;

                $totalPercent += $percent;

                if ($percent >= 70) {
                    $passedTests++;
                }

                if ($percent > $bestPercent) {
                    $bestPercent = $percent;
                    $bestResultStr = $result->score;
                }

                if ($percent < $worstPercent) {
                    $worstPercent = $percent;
                    $worstResultStr = $result->score;
                }
            }

            $averagePercent = $totalPercent / $totalTests;
            $averageScore5 = ($averagePercent / 100) * 5;

            return response()->json([
                'total_tests' => $totalTests,
                'passed_tests' => $passedTests,
                'failed_tests' => $totalTests - $passedTests,
                'success_rate' => round(($passedTests / $totalTests) * 100),
                'average_score_percent' => round($averagePercent),
                'average_score_5' => round($averageScore5, 1),
                'best_result' => $bestResultStr,
                'worst_result' => $worstResultStr
            ]);

        } catch (\Exception $e) {
            Log::error('Get user stats error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
