<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::all();
        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'document_l_y_id' => 'nullable|integer',
            'document_g_y_id' => 'nullable|integer',
        ]);

        $task = Task::create($validated);

        return response()->json([
            'success' => true,
            'task' => $task
        ]);
    }

    public function update(Request $request, $id)
    {
        $task = Task::find($id);
        if ($task) {
            $task->title = $request->title ?? $task->title;
            $task->description = $request->description ?? $task->description;
            $task->save();
        }
        return response()->json($task);
    }

    public function destroy($id)
    {
        $task = Task::find($id);
        if ($task) {
            $task->delete();
        }
        return response()->json(['message' => 'Deleted']);
    }
}
