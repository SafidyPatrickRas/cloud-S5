<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entreprise;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Entreprises",
    description: "Gestion des entreprises"
)]
class EntrepriseController extends Controller
{
    #[OA\Get(
        path: "/api/entreprises",
        summary: "Liste toutes les entreprises",
        tags: ["Entreprises"]
    )]
    #[OA\Response(response: 200, description: "Liste des entreprises")]
    public function index(): JsonResponse
    {
        $entreprises = Entreprise::where('is_deleted', false)->get();
        return response()->json($entreprises);
    }

    #[OA\Post(
        path: "/api/entreprises",
        summary: "Créer une nouvelle entreprise",
        tags: ["Entreprises"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["nom"],
            properties: [
                new OA\Property(property: "nom", type: "string", example: "BTP Madagascar"),
                new OA\Property(property: "contact", type: "string", example: "Jean Rakoto"),
                new OA\Property(property: "telephone", type: "string", example: "+261 34 12 345 67"),
                new OA\Property(property: "email", type: "string", example: "contact@entreprise.mg")
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Entreprise créée")]
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nom' => 'required|string|max:150',
            'contact' => 'nullable|string|max:150',
            'telephone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150'
        ]);

        $entreprise = Entreprise::create($request->all());
        return response()->json($entreprise, 201);
    }

    #[OA\Get(
        path: "/api/entreprises/{id}",
        summary: "Détails d'une entreprise",
        tags: ["Entreprises"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Détails de l'entreprise")]
    public function show(int $id): JsonResponse
    {
        $entreprise = Entreprise::where('id_entreprise', $id)
            ->where('is_deleted', false)
            ->firstOrFail();
        return response()->json($entreprise);
    }

    #[OA\Put(
        path: "/api/entreprises/{id}",
        summary: "Mettre à jour une entreprise",
        tags: ["Entreprises"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Entreprise mise à jour")]
    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'nom' => 'sometimes|required|string|max:150',
            'contact' => 'nullable|string|max:150',
            'telephone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150'
        ]);

        $entreprise = Entreprise::where('id_entreprise', $id)
            ->where('is_deleted', false)
            ->firstOrFail();
        
        $entreprise->update(array_merge($request->all(), ['last_update' => now()]));
        return response()->json($entreprise);
    }

    #[OA\Delete(
        path: "/api/entreprises/{id}",
        summary: "Supprimer une entreprise (soft delete)",
        tags: ["Entreprises"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 204, description: "Entreprise supprimée")]
    public function destroy(int $id): JsonResponse
    {
        $entreprise = Entreprise::where('id_entreprise', $id)
            ->where('is_deleted', false)
            ->firstOrFail();
        
        // Soft delete
        $entreprise->update([
            'is_deleted' => true,
            'last_update' => now()
        ]);
        
        return response()->json(null, 204);
    }
}
