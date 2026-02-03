<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Probleme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Problemes",
    description: "API CRUD pour les problèmes"
)]
class ProblemeController extends Controller
{
    #[OA\Get(
        path: "/api/problemes",
        summary: "Lister les problèmes",
        tags: ["Problemes"]
    )]
    #[OA\Response(response: 200, description: "Liste des problèmes")]
    public function index(): JsonResponse
    {
        return response()->json(
            Probleme::with(['signalements.status', 'signalements.utilisateur'])->get()
        );
    }

    #[OA\Post(
        path: "/api/problemes",
        summary: "Créer un problème",
        tags: ["Problemes"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["Id_entreprise", "Id_signalement"],
            properties: [
                new OA\Property(property: "budget", type: "number", example: 15000.50),
                new OA\Property(property: "surface", type: "number", example: 120.75),
                new OA\Property(property: "is_deleted", type: "boolean", example: false),
                new OA\Property(property: "Id_entreprise", type: "integer", example: 1),
                new OA\Property(property: "Id_signalement", type: "integer", example: 1)
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Problème créé")]
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'budget' => 'nullable|numeric',
            'surface' => 'nullable|numeric',
            'is_deleted' => 'sometimes|boolean',
            'Id_entreprise' => 'required|integer|exists:entreprise,Id_entreprise',
            'Id_signalement' => 'sometimes|integer|exists:signalement,Id_signalement',
            'Id_signalements' => 'sometimes|array',
            'Id_signalements.*' => 'integer|exists:signalement,Id_signalement'
        ]);

        $probleme = Probleme::create($request->only([
            'budget',
            'surface',
            'is_deleted',
            'Id_entreprise'
        ]));

        if ($request->filled('Id_signalement')) {
            $probleme->signalements()->syncWithoutDetaching([$request->Id_signalement]);
        }

        if ($request->filled('Id_signalements')) {
            $probleme->signalements()->syncWithoutDetaching($request->Id_signalements);
        }

        return response()->json($probleme, 201);
    }

    #[OA\Get(
        path: "/api/problemes/{id}",
        summary: "Afficher un problème",
        tags: ["Problemes"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Problème trouvé")]
    public function show(int $id): JsonResponse
    {
        return response()->json(
            Probleme::with(['signalements.status', 'signalements.utilisateur'])->findOrFail($id)
        );
    }

    #[OA\Put(
        path: "/api/problemes/{id}",
        summary: "Modifier un problème",
        tags: ["Problemes"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Problème modifié")]
    public function update(Request $request, int $id): JsonResponse
    {
        $probleme = Probleme::findOrFail($id);

        $request->validate([
            'budget' => 'nullable|numeric',
            'surface' => 'nullable|numeric',
            'is_deleted' => 'sometimes|boolean',
            'Id_entreprise' => 'sometimes|integer|exists:entreprise,Id_entreprise',
            'Id_signalement' => 'sometimes|integer|exists:signalement,Id_signalement',
            'Id_signalements' => 'sometimes|array',
            'Id_signalements.*' => 'integer|exists:signalement,Id_signalement'
        ]);

        $probleme->update($request->only([
            'budget',
            'surface',
            'is_deleted',
            'Id_entreprise'
        ]));

        if ($request->filled('Id_signalement')) {
            $probleme->signalements()->syncWithoutDetaching([$request->Id_signalement]);
        }

        if ($request->filled('Id_signalements')) {
            $probleme->signalements()->syncWithoutDetaching($request->Id_signalements);
        }

        return response()->json($probleme);
    }

    #[OA\Delete(
        path: "/api/problemes/{id}",
        summary: "Supprimer un problème",
        tags: ["Problemes"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Problème supprimé")]
    public function destroy(int $id): JsonResponse
    {
        Probleme::destroy($id);
        return response()->json(['message' => 'Problème supprimé']);
    }
}
