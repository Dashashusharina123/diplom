<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DocumentController extends Controller
{
    // Сохранить ЛУ-23
    public function storeLY(Request $request)
    {
        try {
            Log::info('storeLY - данные:', $request->all());

            $id = DB::table('document__l_y_s')->insertGetId([
                'result_id' => $request->result_id,
                'data' => $request->data,
                'train' => $request->train,
                'vagon' => $request->vagon,
                'station_from' => $request->station_from,
                'station_to' => $request->station_to,
                'chief' => $request->chief,
                'conductor' => $request->conductor,
                'seat' => $request->seat,
                'linen_issued' => $request->linen_issued,
                'passenger' => $request->passenger,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Документ ЛУ-23 сохранен',
                'id' => $id
            ]);

        } catch (\Exception $e) {
            Log::error('storeLY error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Получить ЛУ-23 по result_id
    public function getLY($resultId)
    {
        $document = DB::table('document__l_y_s')->where('result_id', $resultId)->first();
        return response()->json(['success' => true, 'data' => $document]);
    }
}
