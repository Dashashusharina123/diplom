<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class TraineeController extends Controller
{
    public function index(Request $request)
    {
        // Проверяем авторизацию учителя через сессию
        $isTeacherAuth = session()->has('teacher_logged_in');

        // Или через Sanctum
        $user = $request->user();

        return response()->json([
            'is_teacher_session' => $isTeacherAuth,
            'sanctum_user' => $user ? $user->id : null,
            'session_data' => session()->all(),
            'trainees' => User::where('role', 'trainee')->get(['id', 'fio', 'title', 'email', 'created_at'])
        ]);
    }
}
