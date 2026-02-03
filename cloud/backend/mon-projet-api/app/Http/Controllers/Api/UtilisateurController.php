<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Utilisateurs",
    description: "API CRUD pour les utilisateurs"
)]
class UtilisateurController extends Controller
{
    #[OA\Get(
        path: "/api/utilisateurs",
        summary: "Lister les utilisateurs",
        tags: ["Utilisateurs"]
    )]
    #[OA\Response(response: 200, description: "Liste des utilisateurs")]
    public function index(): JsonResponse
    {
        return response()->json(Utilisateur::all());
    }

    #[OA\Post(
        path: "/api/utilisateurs",
        summary: "Créer un utilisateur",
        tags: ["Utilisateurs"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["email", "mdp", "Id_role"],
            properties: [
                new OA\Property(property: "email", type: "string", example: "test@example.com"),
                new OA\Property(property: "mdp", type: "string", example: "123456"),
                new OA\Property(property: "Id_role", type: "integer", example: 1),
                new OA\Property(property: "id_deleted", type: "boolean", example: false),
                new OA\Property(property: "fire_user_id", type: "string", example: "b7Hk6pV0bVQq..." )
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Utilisateur créé")]
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|unique:utilisateur,email',
            'mdp' => 'required|min:6',
            'Id_role' => 'required|integer',
            'id_deleted' => 'sometimes|boolean',
            'fire_user_id' => 'nullable|string|unique:utilisateur,fire_user_id'
        ]);

        $data = $request->all();
        $data['mdp'] = Hash::make($data['mdp']);

        $user = Utilisateur::create($data);
        return response()->json($user, 201);
    }

    #[OA\Get(
        path: "/api/utilisateurs/{id}",
        summary: "Afficher un utilisateur",
        tags: ["Utilisateurs"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Utilisateur trouvé")]
    public function show(int $id): JsonResponse
    {
        return response()->json(Utilisateur::findOrFail($id));
    }

    #[OA\Put(
        path: "/api/utilisateurs/{id}",
        summary: "Modifier un utilisateur",
        tags: ["Utilisateurs"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Utilisateur modifié")]
    public function update(Request $request, int $id): JsonResponse
    {
        $user = Utilisateur::findOrFail($id);

        $request->validate([
            'email' => 'sometimes|email|unique:utilisateur,email,' . $user->Id_utilisateur . ',Id_utilisateur',
            'mdp' => 'sometimes|min:6',
            'Id_role' => 'sometimes|integer',
            'id_deleted' => 'sometimes|boolean',
            'fire_user_id' => 'nullable|string|unique:utilisateur,fire_user_id,' . $user->Id_utilisateur . ',Id_utilisateur'
        ]);

        $data = $request->all();
        if (isset($data['mdp'])) {
            $data['mdp'] = Hash::make($data['mdp']);
        }

        $user->update($data);
        return response()->json($user);
    }

    #[OA\Delete(
        path: "/api/utilisateurs/{id}",
        summary: "Supprimer un utilisateur",
        tags: ["Utilisateurs"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Utilisateur supprimé")]
    public function destroy(int $id): JsonResponse
    {
        Utilisateur::destroy($id);
        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}
