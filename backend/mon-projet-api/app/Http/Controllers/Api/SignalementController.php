<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Signalement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Signalements",
    description: "Gestion des signalements"
)]
class SignalementController extends Controller
{
    #[OA\Get(
        path: "/api/signalements",
        summary: "Liste tous les signalements",
        tags: ["Signalements"]
    )]
    #[OA\Response(response: 200, description: "Liste des signalements")]
    public function index(): JsonResponse
    {
        $signalements = Signalement::with(['probleme', 'user'])
            ->where('is_deleted', false)
            ->get();
        return response()->json($signalements);
    }

    #[OA\Post(
        path: "/api/signalements",
        summary: "Créer un nouveau signalement",
        tags: ["Signalements"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["id_probleme"],
            properties: [
                new OA\Property(property: "id_probleme", type: "string", example: "uuid-here"),
                new OA\Property(property: "user_id", type: "string", example: "uuid-here"),
                new OA\Property(property: "commentaire", type: "string", example: "Route en très mauvais état")
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Signalement créé")]
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'id_probleme' => 'required|uuid|exists:probleme_routier,id_probleme',
            'user_id' => 'nullable|uuid|exists:users,id',
            'commentaire' => 'nullable|string'
        ]);

        $signalement = Signalement::create($request->all());
        $signalement->load(['probleme', 'user']);
        
        return response()->json($signalement, 201);
    }

    #[OA\Get(
        path: "/api/signalements/{id}",
        summary: "Détails d'un signalement",
        tags: ["Signalements"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))]
    #[OA\Response(response: 200, description: "Détails du signalement")]
    public function show(string $id): JsonResponse
    {
        $signalement = Signalement::with(['probleme', 'user'])
            ->where('is_deleted', false)
            ->findOrFail($id);
        return response()->json($signalement);
    }

    #[OA\Get(
        path: "/api/problemes/{problemeId}/signalements",
        summary: "Signalements d'un problème spécifique",
        tags: ["Signalements"]
    )]
    #[OA\Parameter(name: "problemeId", in: "path", required: true, schema: new OA\Schema(type: "string"))]
    #[OA\Response(response: 200, description: "Liste des signalements")]
    public function getByProbleme(string $problemeId): JsonResponse
    {
        $signalements = Signalement::with('user')
            ->where('id_probleme', $problemeId)
            ->where('is_deleted', false)
            ->orderBy('date_signalement', 'desc')
            ->get();
        
        return response()->json($signalements);
    }

    #[OA\Delete(
        path: "/api/signalements/{id}",
        summary: "Supprimer un signalement (soft delete)",
        tags: ["Signalements"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))]
    #[OA\Response(response: 204, description: "Signalement supprimé")]
    public function destroy(string $id): JsonResponse
    {
        $signalement = Signalement::where('is_deleted', false)->findOrFail($id);
        $signalement->update([
            'is_deleted' => true,
            'last_update' => now()
        ]);
        return response()->json(null, 204);
    }
}
