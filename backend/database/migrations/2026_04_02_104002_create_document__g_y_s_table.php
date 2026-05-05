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
        // Удаляем старую таблицу если есть
        Schema::dropIfExists('document__g_y_s');

        // Создаем новую с правильными полями
        Schema::create('document__g_y_s', function (Blueprint $table) {
            $table->id();
            // Добавляем поля для связей
            $table->unsignedBigInteger('result_id')->nullable();
            $table->unsignedBigInteger('trainee_id')->nullable();
            $table->unsignedBigInteger('task_id')->nullable();
            // Поля документа
            $table->date('data')->nullable();
            $table->string('train')->nullable();
            $table->string('vagon')->nullable();
            $table->string('station_from')->nullable();
            $table->string('station_to')->nullable();
            $table->string('station_code')->nullable();
            $table->string('section')->nullable();
            $table->string('participants')->nullable();
            $table->string('carrier')->nullable();
            $table->string('shipment')->nullable();
            $table->date('cargo_receive')->nullable();
            $table->string('cargo')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            // Добавляем индексы для быстрого поиска
            $table->index('result_id');
            $table->index('trainee_id');
            $table->index('task_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document__g_y_s');
    }
};
