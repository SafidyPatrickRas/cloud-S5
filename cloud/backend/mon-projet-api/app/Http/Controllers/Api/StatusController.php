<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Status",
    description: "API CRUD pour les status"
)]
class StatusController extends Controller
{
    #[OA\Get(
        path: "/api/statuses",
        summary: "Lister les status",
        tags: ["Status"]
    )]
    #[OA\Response(response: 200, description: "Liste des status")]
    public function index(): JsonResponse
    {
        return response()->json(Status::all());
    }

    #[OA\Post(
        path: "/api/statuses",
        summary: "Créer un status",
        tags: ["Status"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["libelle", "niveau"],
            properties: [
                new OA\Property(property: "libelle", type: "string", example: "Nouveau"),
                new OA\Property(property: "niveau", type: "integer", example: 1),
                new OA\Property(property: "is_deleted", type: "string", example: "non")
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Status créé")]
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'libelle' => 'required|string|max:50',
            'niveau' => 'required|integer',
            'is_deleted' => 'nullable|string|max:50'
        ]);

        $status = Status::create($request->all());
        return response()->json($status, 201);
    }

    #[OA\Get(
        path: "/api/statuses/{id}",
        summary: "Afficher un status",
        tags: ["Status"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Status trouvé")]
    public function show(int $id): JsonResponse
    {
        return response()->json(Status::findOrFail($id));
    }

    #[OA\Put(
        path: "/api/statuses/{id}",
        summary: "Modifier un status",
        tags: ["Status"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Status modifié")]
    public function update(Request $request, int $id): JsonResponse
    {
        $status = Status::findOrFail($id);

        $request->validate([
            'libelle' => 'sometimes|string|max:50',
            'niveau' => 'sometimes|integer',
            'is_deleted' => 'nullable|string|max:50'
        ]);

        $status->update($request->all());
        return response()->json($status);
    }

    #[OA\Delete(
        path: "/api/statuses/{id}",
        summary: "Supprimer un status",
        tags: ["Status"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Status supprimé")]
    public function destroy(int $id): JsonResponse
    {
        Status::destroy($id);
        return response()->json(['message' => 'Status supprimé']);
    }
}
