<?php

namespace Tests\Feature;

use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_all_tasks()
    {
        Task::create([
            'title' => 'Тестовое задание',
            'description' => 'Описание тестового задания'
        ]);

        $response = $this->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['title' => 'Тестовое задание']);
    }

    public function test_can_create_task()
    {
        $taskData = [
            'title' => 'Новое задание',
            'description' => 'Описание нового задания'
        ];

        $response = $this->postJson('/api/tasks', $taskData);

        $response->assertStatus(201)
            ->assertJsonFragment(['title' => 'Новое задание']);

        $this->assertDatabaseHas('tasks', ['title' => 'Новое задание']);
    }

    public function test_can_update_task()
    {
        $task = Task::create([
            'title' => 'Старое название',
            'description' => 'Старое описание'
        ]);

        $updateData = [
            'title' => 'Новое название',
            'description' => 'Новое описание'
        ];

        $response = $this->putJson("/api/tasks/{$task->id}", $updateData);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tasks', ['title' => 'Новое название']);
    }

    public function test_can_delete_task()
    {
        $task = Task::create([
            'title' => 'Задание для удаления',
            'description' => 'Описание'
        ]);

        $response = $this->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_validation_fails_when_title_missing()
    {
        $response = $this->postJson('/api/tasks', ['description' => 'Без названия']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }
}
