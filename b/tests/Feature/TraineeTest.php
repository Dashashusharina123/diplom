<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

class TraineeTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_all_trainees()
    {
        // Создаем тестовые данные
        DB::table('trainees')->insert([
            'fio' => 'Иванов Иван Иванович',
            'title' => 'Cecsna 1',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // ВЕРНУЛИ /api обратно, так как маршрут в web.php с префиксом /api
        $response = $this->getJson('/api/trainees');

        $response->assertStatus(200);
    }

    public function test_can_create_trainee()
    {
        $data = [
            'fio' => 'Сидоров Сидор Сидорович',
            'title' => 'New Trainee'
        ];

        // ВЕРНУЛИ /api обратно
        $response = $this->postJson('/api/trainees', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('trainees', [
            'fio' => 'Сидоров Сидор Сидорович'
        ]);
    }

    public function test_can_get_single_trainee()
    {
        // Создаем тестового ученика
        $traineeId = DB::table('trainees')->insertGetId([
            'title' => 'Test Trainee',
            'fio' => 'Тестов Тест Тестович',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // ВЕРНУЛИ /api обратно
        $response = $this->getJson("/api/trainees/{$traineeId}");

        $response->assertStatus(200);
        $response->assertJson([
            'id' => $traineeId,
            'title' => 'Test Trainee',
            'fio' => 'Тестов Тест Тестович'
        ]);
    }

    public function test_fio_is_required_for_creation()
    {
        $data = [
            'title' => 'No FIO Trainee'
        ];

        // ВЕРНУЛИ /api обратно
        $response = $this->postJson('/api/trainees', $data);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['fio']);
    }
}
