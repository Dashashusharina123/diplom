<?php

namespace App\Http\Controllers;

use App\Models\Document_GY;
use App\Models\Document_LY;
use App\Models\Result;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DocumentController extends Controller
{
    // Сохранить ГУ-23
    public function storeGY(Request $request)
    {
        try {
            Log::info('storeGY', $request->all());

            $validated = $request->validate([
                'result_id' => 'required|integer',
                'trainee_id' => 'required|integer',
                'task_id' => 'required|integer',
                'data' => 'nullable|date',
                'train' => 'nullable|string',
                'vagon' => 'nullable|string',
                'station_from' => 'nullable|string',
                'station_to' => 'nullable|string',
                'station_code' => 'nullable|string',
                'section' => 'nullable|string',
                'participants' => 'nullable|string',
                'carrier' => 'nullable|string',
                'shipment' => 'nullable|string',
                'cargo_receive' => 'nullable|date',
                'cargo' => 'nullable|string',
                'description' => 'nullable|string'
            ]);

            $document = Document_GY::updateOrCreate(
                ['result_id' => $validated['result_id']],
                $validated
            );

            return response()->json([
                'success' => true,
                'message' => 'Документ ГУ-23 сохранен',
                'data' => $document
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Получить ГУ-23
    public function getGY($resultId)
    {
        try {
            $document = Document_GY::where('result_id', $resultId)->first();

            return response()->json([
                'success' => true,
                'data' => $document
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Сохранить ЛУ-23
    public function storeLY(Request $request)
    {
        try {
            $validated = $request->validate([
                'result_id' => 'required|integer',
                'trainee_id' => 'required|integer',
                'task_id' => 'required|integer',
                'data' => 'nullable|date',
                'train' => 'nullable|string',
                'vagon' => 'nullable|string',
                'station_from' => 'nullable|string',
                'station_to' => 'nullable|string',
                'chief' => 'nullable|string',
                'conductor' => 'nullable|string',
                'seat' => 'nullable|string',
                'linen_issued' => 'nullable|string',
                'passenger' => 'nullable|string'
            ]);

            $document = Document_LY::updateOrCreate(
                ['result_id' => $validated['result_id']],
                $validated
            );

            return response()->json([
                'success' => true,
                'message' => 'Документ ЛУ-23 сохранен',
                'data' => $document
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Получить ЛУ-23
    public function getLY($resultId)
    {
        try {
            $document = Document_LY::where('result_id', $resultId)->first();

            return response()->json([
                'success' => true,
                'data' => $document
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Все документы ученика
    public function getByTrainee($traineeId)
    {
        try {
            $guDocuments = Document_GY::where('trainee_id', $traineeId)->get();
            $lyDocuments = Document_LY::where('trainee_id', $traineeId)->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'gu23' => $guDocuments,
                    'ly23' => $lyDocuments
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
