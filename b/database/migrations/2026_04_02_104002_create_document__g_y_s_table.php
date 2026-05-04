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
        Schema::create('document__g_y_s', function (Blueprint $table) {
            $table->id();
            $table->date('data');
            $table->string('train');
            $table->string('vagon');
            $table->string('station_from');
            $table->string('station_to');
            $table->string('station_code');
            $table->string('section');
            $table->string('participants');
            $table->string('carrier');
            $table->string('shipment');
            $table->date('cargo_receive');
            $table->string('cargo');
            $table->text('description');
            $table->timestamps();
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
