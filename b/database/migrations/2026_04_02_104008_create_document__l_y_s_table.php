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
        Schema::create('document__l_y_s', function (Blueprint $table) {
            $table->id();
            $table->date('data');
            $table->string('train');
            $table->string('vagon');
            $table->string('station_from');
            $table->string('station_to');
            $table->string('chief');
            $table->string('conductor');
            $table->string('seat');
            $table->string('linen_issued');
            $table->string('passenger');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document__l_y_s');
    }
};
