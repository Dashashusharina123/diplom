<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TeacherLoginTest extends TestCase
{
    public function test_can_login_with_correct_password()
    {
        $response = $this->postJson('/api/teacher/login', [
            'password' => '1234'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful'
            ]);
    }

    public function test_cannot_login_with_wrong_password()
    {
        $response = $this->postJson('/api/teacher/login', [
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Неверный пароль'
            ]);
    }

    public function test_login_requires_password()
    {
        $response = $this->postJson('/api/teacher/login', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }
}
