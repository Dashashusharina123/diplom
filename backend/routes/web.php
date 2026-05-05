<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\TraineeController;

// ========== API МАРШРУТЫ ==========

// Teacher login
Route::post('/api/teacher/login', [TeacherController::class, 'login']);

// Tasks (доступно всем)
Route::get('/api/tasks', [TaskController::class, 'index']);
Route::post('/api/tasks', [TaskController::class, 'store']);
Route::get('/api/tasks/{id}', [TaskController::class, 'show']);
Route::put('/api/tasks/{id}', [TaskController::class, 'update']);
Route::delete('/api/tasks/{id}', [TaskController::class, 'destroy']);

// Results (только для учителя - проверка внутри контроллера)
Route::get('/api/results', [ResultController::class, 'index']);
Route::post('/api/results', [ResultController::class, 'store']);

// Trainees (доступно всем)
Route::get('/api/trainees', [TraineeController::class, 'index']);
Route::get('/api/trainees/{id}', [TraineeController::class, 'show']);
Route::post('/api/trainees', [TraineeController::class, 'store']);

// Health check
Route::get('/api/health', function() {
    return response()->json(['status' => 'ok', 'message' => 'API works']);
});

Route::get('/', function () {
    return view('welcome');
});
