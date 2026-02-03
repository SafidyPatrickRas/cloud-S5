<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entreprise;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Entreprises",
    description: "API CRUD pour les entreprises"
)]
class EntrepriseController extends Controller
{
    #[OA\Get(
        path: "/api/entreprises",
        summary: "Lister les entreprises",
        tags: ["Entreprises"]
    )]
    #[OA\Response(response: 200, description: "Liste des entreprises")]
    public function index(): JsonResponse
    {
        return response()->json(Entreprise::all());
    }

    #[OA\Post(
        path: "/api/entreprises",
        summary: "Créer une entreprise",
        tags: ["Entreprises"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["nom"],
            properties: [
                new OA\Property(property: "nom", type: "string", example: "Feno SARL"),
                new OA\Property(property: "is_deleted", type: "boolean", example: false)
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Entreprise créée")]
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nom' => 'required|string|max:100',
            'is_deleted' => 'sometimes|boolean'
        ]);

        $entreprise = Entreprise::create($request->all());
        return response()->json($entreprise, 201);
    }

    #[OA\Get(
        path: "/api/entreprises/{id}",
        summary: "Afficher une entreprise",
        tags: ["Entreprises"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Entreprise trouvée")]
    public function show(int $id): JsonResponse
    {
        return response()->json(Entreprise::findOrFail($id));
    }

    #[OA\Put(
        path: "/api/entreprises/{id}",
        summary: "Modifier une entreprise",
        tags: ["Entreprises"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Entreprise modifiée")]
    public function update(Request $request, int $id): JsonResponse
    {
        $entreprise = Entreprise::findOrFail($id);

        $request->validate([
            'nom' => 'sometimes|string|max:100',
            'is_deleted' => 'sometimes|boolean'
        ]);

        $entreprise->update($request->all());
        return response()->json($entreprise);
    }

    #[OA\Delete(
        path: "/api/entreprises/{id}",
        summary: "Supprimer une entreprise",
        tags: ["Entreprises"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Entreprise supprimée")]
    public function destroy(int $id): JsonResponse
    {
        Entreprise::destroy($id);
        return response()->json(['message' => 'Entreprise supprimée']);
    }
}
