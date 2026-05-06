<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TaskController extends Controller
{
    // Для учителя - все задачи
    public function index()
    {
        try {
            $tasks = Task::orderBy('created_at', 'desc')->get();
            return response()->json($tasks);
        } catch (\Exception $e) {
            Log::error('Tasks index error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Для ученика - только видимые задачи
    public function getVisibleTasks()
    {
        try {
            $tasks = Task::where('is_visible', true)
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($tasks);
        } catch (\Exception $e) {
            Log::error('Visible tasks error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'document_l_y_id' => 'nullable|integer',
                'document_g_y_id' => 'nullable|integer',
                'is_visible' => 'boolean'
            ]);

            // Устанавливаем значение по умолчанию для is_visible
            if (!isset($validated['is_visible'])) {
                $validated['is_visible'] = true;
            }

            $task = Task::create($validated);

            return response()->json([
                'success' => true,
                'task' => $task
            ], 201);
        } catch (\Exception $e) {
            Log::error('Task store error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $task = Task::find($id);

            if (!$task) {
                return response()->json(['error' => 'Task not found'], 404);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'document_l_y_id' => 'nullable|integer',
                'document_g_y_id' => 'nullable|integer',
                'is_visible' => 'boolean'
            ]);

            $task->update($validated);

            return response()->json([
                'success' => true,
                'task' => $task
            ]);
        } catch (\Exception $e) {
            Log::error('Task update error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $task = Task::find($id);

            if ($task) {
                $task->delete();
                return response()->json(['message' => 'Task deleted successfully']);
            }

            return response()->json(['error' => 'Task not found'], 404);
        } catch (\Exception $e) {
            Log::error('Task destroy error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Переключить видимость задачи
    public function toggleVisibility($id)
    {
        try {
            $task = Task::find($id);

            if (!$task) {
                return response()->json(['error' => 'Task not found'], 404);
            }

            $task->is_visible = !$task->is_visible;
            $task->save();

            return response()->json([
                'success' => true,
                'is_visible' => $task->is_visible,
                'message' => $task->is_visible ? 'Задача видна ученикам' : ' Задача скрыта от учеников'
            ]);
        } catch (\Exception $e) {
            Log::error('Toggle visibility error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Показать одну задачу
    public function show($id)
    {
        try {
            $task = Task::find($id);

            if (!$task) {
                return response()->json(['error' => 'Task not found'], 404);
            }

            return response()->json($task);
        } catch (\Exception $e) {
            Log::error('Task show error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
