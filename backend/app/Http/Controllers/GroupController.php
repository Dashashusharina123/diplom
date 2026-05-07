<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GroupController extends Controller
{
    public function index()
    {
        try {
            $groups = Group::withCount('users')->get();
            return response()->json($groups);
        } catch (\Exception $e) {
            Log::error('Groups index error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getSelectList()
    {
        try {
            $groups = Group::select('id', 'name')->get();
            return response()->json($groups);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:groups'
            ]);

            $group = Group::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Группа создана',
                'group' => $group
            ], 201);
        } catch (\Exception $e) {
            Log::error('Group store error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $group = Group::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:groups,name,' . $id
            ]);

            $group->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Группа обновлена',
                'group' => $group
            ]);
        } catch (\Exception $e) {
            Log::error('Group update error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $group = Group::findOrFail($id);

            if ($group->users()->count() > 0) {
                return response()->json([
                    'error' => 'Нельзя удалить группу, в которой есть ученики'
                ], 422);
            }

            $group->delete();

            return response()->json([
                'success' => true,
                'message' => 'Группа удалена'
            ]);
        } catch (\Exception $e) {
            Log::error('Group destroy error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Получить задачи группы (простая связь через group_id)
    public function getGroupTasks($groupId)
    {
        try {
            $tasks = Task::where('group_id', $groupId)
                ->where('is_visible', true)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($tasks);
        } catch (\Exception $e) {
            Log::error('Get group tasks error: ' . $e->getMessage());
            return response()->json([]);
        }
    }

// Назначить задачу группе (обновляем group_id у задачи)
    public function assignTask(Request $request, $groupId)
    {
        try {
            $validated = $request->validate([
                'task_id' => 'required|exists:tasks,id'
            ]);

            $task = Task::findOrFail($validated['task_id']);
            $task->group_id = $groupId;
            $task->save();

            return response()->json(['success' => true, 'message' => 'Задача назначена группе']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

// Удалить задачу из группы (обнуляем group_id у задачи)
    public function removeTask(Request $request, $groupId)
    {
        try {
            $validated = $request->validate([
                'task_id' => 'required|exists:tasks,id'
            ]);

            $task = Task::findOrFail($validated['task_id']);
            $task->group_id = null;
            $task->save();

            return response()->json(['success' => true, 'message' => 'Задача удалена из группы']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
