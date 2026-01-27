<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Users",
    description: "Gestion des utilisateurs"
)]
class UserController extends Controller
{
    #[OA\Get(
        path: "/api/users",
        summary: "Lister tous les utilisateurs",
        tags: ["Users"]
    )]
    #[OA\Response(response: 200, description: "Liste des utilisateurs")]
    public function index(): JsonResponse
    {
        $users = User::with('role')->where('is_deleted', false)->get();
        return response()->json($users);
    }

    #[OA\Put(
        path: "/api/users/{id}",
        summary: "Modifier les informations d'un utilisateur",
        tags: ["Users"]
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
            properties: [
                new OA\Property(property: "email", type: "string", example: "nouvel.email@example.com"),
                new OA\Property(property: "password", type: "string", example: "nouveauMotDePasse"),
                new OA\Property(property: "role_id", type: "integer", example: 2),
                new OA\Property(property: "blocked", type: "boolean", example: false)
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Utilisateur modifié")]
    #[OA\Response(response: 404, description: "Utilisateur non trouvé")]
    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::where('id', $id)->where('is_deleted', false)->firstOrFail();

        $request->validate([
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|min:6',
            'role_id' => 'sometimes|integer',
            'blocked' => 'sometimes|boolean',
        ]);

        $data = $request->all();

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json($user);
    }
}
