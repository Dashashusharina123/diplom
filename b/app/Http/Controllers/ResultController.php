<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResultController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');

        $query = DB::table('results')
            ->join('trainees', 'results.trainee_id', '=', 'trainees.id')
            ->join('tasks', 'results.task_id', '=', 'tasks.id')
            ->select(
                'results.id',
                'trainees.fio as name',
                'tasks.title as session',
                'results.time',
                'results.score'
            );

        // ДОБАВЛЯЕМ ПОИСК ПО ФИО
        if (!empty($search)) {
            $query->where('trainees.fio', 'like', '%' . $search . '%');
        }

        $results = $query->orderBy('results.created_at', 'desc')->get();

        $results = $results->map(function($item) {
            $item->doc = '📄';
            return $item;
        });

        return response()->json($results);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'trainee_name' => 'required|string',
                'session_title' => 'required|string',
                'score' => 'required|string',
                'time' => 'required|string'
            ]);

            // 1. Сохраняем ученика
            $trainee = DB::table('trainees')->where('fio', $validated['trainee_name'])->first();
            if (!$trainee) {
                $traineeId = DB::table('trainees')->insertGetId([
                    'title' => $validated['trainee_name'],
                    'fio' => $validated['trainee_name'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $traineeId = $trainee->id;
            }

            // 2. Сохраняем задание
            $task = DB::table('tasks')->where('title', $validated['session_title'])->first();
            if (!$task) {
                $taskId = DB::table('tasks')->insertGetId([
                    'title' => $validated['session_title'],
                    'description' => $validated['session_title'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $taskId = $task->id;
            }

            // 3. Получаем пользователя
            $user = DB::table('users')->first();
            if (!$user) {
                $userId = DB::table('users')->insertGetId([
                    'password' => '1234',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $userId = $user->id;
            }

            // 4. Сохраняем результат
            $resultId = DB::table('results')->insertGetId([
                'user_id' => $userId,
                'task_id' => $taskId,
                'trainee_id' => $traineeId,
                'score' => $validated['score'],
                'time' => $validated['time'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'id' => $resultId,
                'name' => $validated['trainee_name'],
                'session' => $validated['session_title'],
                'time' => $validated['time'],
                'score' => $validated['score'],
                'doc' => '📄'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}
