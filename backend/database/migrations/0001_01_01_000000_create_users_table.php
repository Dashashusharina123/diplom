<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email')->nullable()->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('fio')->nullable();
            $table->string('title')->nullable();
            $table->enum('role', ['teacher', 'trainee'])->default('trainee');
            $table->rememberToken();
            $table->timestamps();
        });

        // Вставляем учителя по умолчанию с паролем 1234
        DB::table('users')->insert([
            'email' => 'teacher@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('1234'),
            'fio' => 'Учитель',
            'title' => 'Преподаватель',
            'role' => 'teacher',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
