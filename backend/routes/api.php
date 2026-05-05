<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\TraineeController;
use App\Http\Controllers\DocumentController;

// ========== АУТЕНТИФИКАЦИЯ ==========

// Учитель (через сессии)
Route::post('/auth/teacher/login', [AuthController::class, 'teacherLogin']);
Route::post('/auth/teacher/logout', [AuthController::class, 'teacherLogout']);
Route::get('/auth/teacher/check', [AuthController::class, 'checkTeacherAuth']);

// Ученик (регистрация + login через Sanctum)
Route::post('/auth/trainee/register', [AuthController::class, 'registerTrainee']);
Route::post('/login', [AuthController::class, 'login'])->name('login');


// ========== ЗАДАЧИ (БЕЗ АВТОРИЗАЦИИ, ЧТОБЫ НЕ ЛОМАЛОСЬ) ==========

Route::get('/tasks', [TaskController::class, 'index']);
Route::get('/tasks/{id}', [TaskController::class, 'show'])->whereNumber('id');
Route::post('/tasks', [TaskController::class, 'store']);
Route::put('/tasks/{id}', [TaskController::class, 'update'])->whereNumber('id');
Route::delete('/tasks/{id}', [TaskController::class, 'destroy'])->whereNumber('id');


// ========== ОСТАЛЬНЫЕ ДАННЫЕ (ПОКА БЕЗ SANCTUM) ==========

// Результаты
Route::get('/results', [ResultController::class, 'index']);
Route::get('/results/{id}', [ResultController::class, 'show'])->whereNumber('id');
Route::post('/results', [ResultController::class, 'store']);
Route::put('/results/{id}', [ResultController::class, 'update'])->whereNumber('id');
Route::delete('/results/{id}', [ResultController::class, 'destroy'])->whereNumber('id');

// Ученики
Route::get('/trainees', [TraineeController::class, 'index']);
Route::get('/trainees/{id}', [TraineeController::class, 'show'])->whereNumber('id');
Route::post('/trainees', [TraineeController::class, 'store']);
Route::put('/trainees/{id}', [TraineeController::class, 'update'])->whereNumber('id');
Route::delete('/trainees/{id}', [TraineeController::class, 'destroy'])->whereNumber('id');

// Документы
Route::get('/documents/gu23/{resultId}', [DocumentController::class, 'getGY'])->whereNumber('resultId');
Route::get('/documents/ly23/{resultId}', [DocumentController::class, 'getLY'])->whereNumber('resultId');
Route::get('/documents/trainee/{traineeId}', [DocumentController::class, 'getByTrainee'])->whereNumber('traineeId');

Route::post('/documents/gu23', [DocumentController::class, 'storeGY']);
Route::put('/documents/gu23/{id}', [DocumentController::class, 'updateGY'])->whereNumber('id');
Route::delete('/documents/gu23/{id}', [DocumentController::class, 'destroyGY'])->whereNumber('id');

Route::post('/documents/ly23', [DocumentController::class, 'storeLY']);
Route::put('/documents/ly23/{id}', [DocumentController::class, 'updateLY'])->whereNumber('id');
Route::delete('/documents/ly23/{id}', [DocumentController::class, 'destroyLY'])->whereNumber('id');


// ========== СЕРВИС ==========

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API works'
    ]);
});
