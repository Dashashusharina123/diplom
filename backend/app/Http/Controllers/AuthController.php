<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

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
        // Добавьте логирование
        Log::info('Register data:', $request->all());

        $validated = $request->validate([
            'fio' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'group_id' => 'required|exists:groups,id'
        ]);

        $user = User::create([
            'fio' => $validated['fio'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'trainee',
            'group_id' => $validated['group_id']
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ученик зарегистрирован',
            'data' => $user
        ], 201);
    }
    /**
     * Получение всех учеников
     */
    public function getTrainees()
    {
        $trainees = User::where('role', 'trainee')
            ->with('group')
            ->orderBy('fio')
            ->get();

        return response()->json([
            'trainees' => $trainees->map(function ($trainee) {
                return [
                    'id' => $trainee->id,
                    'fio' => $trainee->fio,
                    'email' => $trainee->email,
                    'group_id' => $trainee->group_id,

                    // ВОТ ГЛАВНОЕ
                    'group_name' => $trainee->group?->name,

                    'created_at' => $trainee->created_at,
                ];
            })
        ]);
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
            'title' => 'nullable|string|max:255',
            'group_id' => 'nullable|exists:groups,id'  // ← ДОБАВИТЬ ЭТУ СТРОКУ
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

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Вход выполнен',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->fio,
                'email' => $user->email,
                'role' => $user->role,
                'group_id' => $user->group_id  // ← ДОБАВИТЬ ЭТО
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
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->fio ?? $user->name,
            'email' => $user->email,
            'role' => $user->role
        ]);
    }



    public function getProfile(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            return response()->json([
                'id' => $user->id,
                'email' => $user->email,
                'fio' => $user->fio,
                'title' => $user->title,
                'role' => $user->role,
                'group_id' => $user->group_id,
                'group' => $user->group ? [
                    'id' => $user->group->id,
                    'name' => $user->group->name
                ] : null,
                'created_at' => $user->created_at
            ]);
        } catch (\Exception $e) {
            Log::error('Get profile error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $validator = Validator::make($request->all(), [
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'fio' => 'nullable|string|max:255',
                'group_id' => 'nullable|exists:groups,id',
                'current_password' => 'required_with:new_password|string',
                'new_password' => 'nullable|string|min:6|confirmed'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            if ($request->has('email')) {
                $user->email = $request->email;
            }

            if ($request->has('fio')) {
                $user->fio = $request->fio;
            }

            if ($request->has('group_id')) {
                $user->group_id = $request->group_id;
            }

            if ($request->has('new_password') && !empty($request->new_password)) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json(['error' => 'Текущий пароль неверен'], 422);
                }
                $user->password = Hash::make($request->new_password);
            }

            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Профиль успешно обновлён',
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'fio' => $user->fio,
                    'title' => $user->title,
                    'role' => $user->role,
                    'group_id' => $user->group_id
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Update profile error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

}
