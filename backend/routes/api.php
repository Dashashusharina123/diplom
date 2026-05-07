<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\TraineeController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\GroupController;

// ========== АУТЕНТИФИКАЦИЯ ==========

// Учитель (через сессии)
Route::post('/auth/teacher/login', [AuthController::class, 'teacherLogin']);
Route::post('/auth/teacher/logout', [AuthController::class, 'teacherLogout']);
Route::get('/auth/teacher/check', [AuthController::class, 'checkTeacherAuth']);

// Ученик (регистрация + login через Sanctum)
Route::post('/auth/trainee/register', [AuthController::class, 'registerTrainee']);
Route::post('/login', [AuthController::class, 'login'])->name('login');


// ========== ЗАДАЧИ (БЕЗ АВТОРИЗАЦИИ, ЧТОБЫ НЕ ЛОМАЛОСЬ) ==========

// ========== ЗАДАЧИ ==========

// Все задачи (для учителя)
Route::get('/tasks', [TaskController::class, 'index']);
Route::get('/tasks/{id}', [TaskController::class, 'show'])->whereNumber('id');
Route::post('/tasks', [TaskController::class, 'store']);
Route::put('/tasks/{id}', [TaskController::class, 'update'])->whereNumber('id');
Route::delete('/tasks/{id}', [TaskController::class, 'destroy'])->whereNumber('id');
Route::patch('/tasks/{id}/toggle-visibility', [TaskController::class, 'toggleVisibility']); // ← НОВЫЙ МАРШРУТ

// Только видимые задачи (для учеников)
Route::get('/tasks/visible', [TaskController::class, 'getVisibleTasks']);


// ========== ОСТАЛЬНЫЕ ДАННЫЕ (ПОКА БЕЗ SANCTUM) ==========

// Результаты
Route::get('/results', [ResultController::class, 'index']);
Route::get('/results/{id}', [ResultController::class, 'show'])->whereNumber('id');
Route::post('/results', [ResultController::class, 'store']);
Route::put('/results/{id}', [ResultController::class, 'update'])->whereNumber('id');
Route::delete('/results/{id}', [ResultController::class, 'destroy'])->whereNumber('id');

// Ученики
// Ученики - используем AuthController вместо TraineeController
Route::get('/trainees', [AuthController::class, 'getTrainees']);
Route::get('/trainees/{id}', [AuthController::class, 'getTrainee'])->whereNumber('id');
Route::put('/trainees/{id}', [AuthController::class, 'updateTrainee'])->whereNumber('id');
Route::delete('/trainees/{id}', [AuthController::class, 'deleteTrainee'])->whereNumber('id');

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
Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('/results/{id}/comment', [ResultController::class, 'addComment']);
Route::get('/results/{id}/comment', [ResultController::class, 'getComment']);

// Профиль (требует авторизации)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [AuthController::class, 'getProfile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
});

Route::get('/users/{id}/stats', [ResultController::class, 'getUserStats']);

// Группы
// Группы
Route::get('/groups', [GroupController::class, 'index']);
Route::get('/groups/select', [GroupController::class, 'getSelectList']);
Route::post('/groups', [GroupController::class, 'store']);
Route::put('/groups/{id}', [GroupController::class, 'update']);
Route::delete('/groups/{id}', [GroupController::class, 'destroy']);
Route::get('/groups/{groupId}/tasks', [GroupController::class, 'getGroupTasks']);
Route::post('/groups/{groupId}/assign-task', [GroupController::class, 'assignTask']);
Route::delete('/groups/{groupId}/remove-task', [GroupController::class, 'removeTask']);
