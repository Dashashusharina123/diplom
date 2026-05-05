<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class TeacherAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Проверяем, есть ли сессия учителя
        if (!session()->has('teacher_logged_in')) {
            return response()->json([
                'success' => false,
                'message' => 'Вы не авторизованы. Доступ только для учителей.'
            ], 401);
        }

        return $next($request);
    }
}
