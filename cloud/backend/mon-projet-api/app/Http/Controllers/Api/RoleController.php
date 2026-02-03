<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Roles",
    description: "API CRUD pour les rôles"
)]
class RoleController extends Controller
{
    #[OA\Get(
        path: "/api/roles",
        summary: "Lister les rôles",
        tags: ["Roles"]
    )]
    #[OA\Response(
        response: 200,
        description: "Liste des rôles"
    )]
    public function index(): JsonResponse
    {
        return response()->json(Role::all());
    }

    #[OA\Post(
        path: "/api/roles",
        summary: "Créer un rôle",
        tags: ["Roles"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["libelle", "niveau"],
            properties: [
                new OA\Property(property: "libelle", type: "string", example: "Administrateur"),
                new OA\Property(property: "niveau", type: "string", example: "1"),
                new OA\Property(property: "is_deleted", type: "boolean", example: false)
            ]
        )
    )]
    #[OA\Response(
        response: 201,
        description: "Rôle créé"
    )]
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'libelle' => 'required|string|unique:role,libelle',
            'niveau' => 'required|string',
            'is_deleted' => 'sometimes|boolean'
        ]);

        $role = Role::create($request->all());
        return response()->json($role, 201);
    }

    #[OA\Get(
        path: "/api/roles/{id}",
        summary: "Afficher un rôle",
        tags: ["Roles"]
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Rôle trouvé"
    )]
    #[OA\Response(
        response: 404,
        description: "Rôle non trouvé"
    )]
    public function show(int $id): JsonResponse
    {
        return response()->json(Role::findOrFail($id));
    }

    #[OA\Put(
        path: "/api/roles/{id}",
        summary: "Modifier un rôle",
        tags: ["Roles"]
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["libelle", "niveau"],
            properties: [
                new OA\Property(property: "libelle", type: "string", example: "Utilisateur"),
                new OA\Property(property: "niveau", type: "string", example: "2"),
                new OA\Property(property: "is_deleted", type: "boolean", example: false)
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: "Rôle modifié"
    )]
    #[OA\Response(
        response: 404,
        description: "Rôle non trouvé"
    )]
    public function update(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        $request->validate([
            'libelle' => 'required|string|unique:role,libelle,' . $role->Id_role . ',Id_role',
            'niveau' => 'required|string',
            'is_deleted' => 'sometimes|boolean'
        ]);

        $role->update($request->all());
        return response()->json($role);
    }

    #[OA\Delete(
        path: "/api/roles/{id}",
        summary: "Supprimer un rôle",
        tags: ["Roles"]
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Rôle supprimé"
    )]
    public function destroy(int $id): JsonResponse
    {
        Role::destroy($id);
        return response()->json(['message' => 'Rôle supprimé']);
    }
}
