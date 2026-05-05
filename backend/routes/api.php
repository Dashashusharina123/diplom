<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\TraineeController;
use App\Http\Controllers\DocumentController;

Route::post('/teacher/login', [TeacherController::class, 'login']);

Route::get('/tasks', [TaskController::class, 'index']);
Route::post('/tasks', [TaskController::class, 'store']);
Route::get('/tasks/{id}', [TaskController::class, 'show']);
Route::put('/tasks/{id}', [TaskController::class, 'update']);
Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);

Route::get('/results', [ResultController::class, 'index']);
Route::post('/results', [ResultController::class, 'store']);

Route::get('/trainees', [TraineeController::class, 'index']);
Route::get('/trainees/{id}', [TraineeController::class, 'show']);
Route::post('/trainees', [TraineeController::class, 'store']);

Route::post('/documents/gu23', [DocumentController::class, 'storeGY']);
Route::get('/documents/gu23/{resultId}', [DocumentController::class, 'getGY']);

Route::post('/documents/ly23', [DocumentController::class, 'storeLY']);
Route::get('/documents/ly23/{resultId}', [DocumentController::class, 'getLY']);

Route::get('/documents/trainee/{traineeId}', [DocumentController::class, 'getByTrainee']);

Route::get('/health', function() {
    return response()->json(['status' => 'ok', 'message' => 'API works']);
});
