<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Логин учителя
     */
    public function teacherLogin(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|string'
        ]);

        // Ищем учителя
        $teacher = User::where('role', 'teacher')->first();

        if ($teacher && Hash::check($validated['password'], $teacher->password)) {
            session(['teacher_logged_in' => true, 'teacher_id' => $teacher->id]);

            return response()->json([
                'success' => true,
                'message' => 'Вход выполнен успешно',
                'role' => 'teacher'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Неверный пароль'
        ], 401);
    }

    /**
     * Выход учителя
     */
    public function teacherLogout()
    {
        session()->forget(['teacher_logged_in', 'teacher_id']);

        return response()->json([
            'success' => true,
            'message' => 'Выход выполнен'
        ]);
    }

    /**
     * Проверка статуса аутентификации учителя
     */
    public function checkTeacherAuth()
    {
        return response()->json([
            'authenticated' => session()->has('teacher_logged_in'),
            'role' => session()->has('teacher_logged_in') ? 'teacher' : null
        ]);
    }

    /**
     * Регистрация ученика
     */
    public function registerTrainee(Request $request)
    {
        $validated = $request->validate([
            'fio' => 'required|string|max:255',
            'title' => 'nullable|string|max:255'
        ]);

        // Проверяем, существует ли ученик с таким ФИО
        $existing = User::where('fio', $validated['fio'])
            ->where('role', 'trainee')
            ->first();

        if ($existing) {
            return response()->json([
                'success' => true,
                'message' => 'Ученик уже существует',
                'data' => $existing,
                'is_new' => false
            ]);
        }

        // Создаем нового ученика
        $user = User::create([
            'fio' => $validated['fio'],
            'title' => $validated['title'] ?? $validated['fio'],
            'role' => 'trainee',
            'password' => Hash::make('temporary')
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ученик зарегистрирован',
            'data' => $user,
            'is_new' => true
        ], 201);
    }
}
