<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    // ========== УЧИТЕЛЬ (СЕССИИ) ==========

    /**
     * Логин учителя (через сессии)
     */
    public function teacherLogin(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|string'
        ]);

        $teacher = User::where('role', 'teacher')->first();

        if ($teacher && Hash::check($validated['password'], $teacher->password)) {
            session(['teacher_logged_in' => true, 'teacher_id' => $teacher->id]);

            return response()->json([
                'success' => true,
                'message' => 'Вход выполнен успешно',
                'role' => 'teacher',
                'teacher_id' => $teacher->id,
                'user' => [
                    'id' => $teacher->id,
                    'fio' => $teacher->fio,
                    'email' => $teacher->email,
                    'role' => $teacher->role
                ]
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
            'role' => session()->has('teacher_logged_in') ? 'teacher' : null,
            'teacher_id' => session()->get('teacher_id')
        ]);
    }

    // ========== УЧЕНИКИ (РЕГИСТРАЦИЯ) ==========

    /**
     * Регистрация ученика (с email и паролем)
     */
    public function registerTrainee(Request $request)
    {
        $validated = $request->validate([
            'fio' => 'required|string|max:255',
            'title' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        $existing = User::where('email', $validated['email'])->first();

        if ($existing) {
            return response()->json([
                'success' => true,
                'message' => 'Пользователь с таким email уже существует',
                'data' => $existing,
                'is_new' => false
            ]);
        }

        $user = User::create([
            'fio' => $validated['fio'],
            'title' => $validated['title'] ?? $validated['fio'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'trainee'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ученик зарегистрирован',
            'data' => $user,
            'is_new' => true
        ], 201);
    }

    /**
     * Получение всех учеников
     */
    public function getTrainees()
    {
        $trainees = User::where('role', 'trainee')
            ->orderBy('fio')
            ->get(['id', 'fio', 'title', 'email', 'created_at']);

        return response()->json($trainees);
    }

    /**
     * Получение конкретного ученика
     */
    public function getTrainee($id)
    {
        $trainee = User::where('role', 'trainee')->findOrFail($id);

        return response()->json([
            'id' => $trainee->id,
            'fio' => $trainee->fio,
            'title' => $trainee->title,
            'email' => $trainee->email,
            'created_at' => $trainee->created_at
        ]);
    }

    /**
     * Обновление данных ученика
     */
    public function updateTrainee(Request $request, $id)
    {
        $trainee = User::where('role', 'trainee')->findOrFail($id);

        $validated = $request->validate([
            'fio' => 'sometimes|string|max:255',
            'title' => 'nullable|string|max:255'
        ]);

        $trainee->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Данные обновлены',
            'data' => $trainee
        ]);
    }

    /**
     * Удаление ученика
     */
    public function deleteTrainee($id)
    {
        $trainee = User::where('role', 'trainee')->findOrFail($id);
        $trainee->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ученик удалён'
        ]);
    }

    // ========== АУТЕНТИФИКАЦИЯ ЧЕРЕЗ SANCTUM (ДЛЯ УЧЕНИКОВ) ==========

    /**
     * Вход пользователя (через Sanctum)
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Неверный email или пароль'
            ], 401);
        }

        // Создаем токен для ученика
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Вход выполнен',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->fio,
                'email' => $user->email,
                'role' => $user->role
            ]
        ]);
    }

    /**
     * Выход пользователя (через Sanctum)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Выход выполнен'
        ]);
    }

    /**
     * Получение текущего пользователя (через Sanctum)
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
