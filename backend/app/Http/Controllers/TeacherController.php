<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TeacherController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|string'
        ]);

        // Хэшируем правильный пароль
        $hashedPassword = Hash::make('1234');

        // Проверяем введенный пароль с хэшем
        if (Hash::check($validated['password'], $hashedPassword)) {
            session(['teacher_logged_in' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Login successful'
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => 'Неверный пароль'
        ], 401);
    }

    public function logout()
    {
        session()->forget('teacher_logged_in');

        return response()->json([
            'success' => true,
            'message' => 'Logout successful'
        ], 200);
    }

    public function check()
    {
        return response()->json([
            'authenticated' => session()->has('teacher_logged_in')
        ]);
    }
}
