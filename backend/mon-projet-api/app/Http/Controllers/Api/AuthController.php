<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\LoginAttempt;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Auth",
    description: "Gestion de l'inscription et du login"
)]
class AuthController extends Controller
{
    #[OA\Post(
        path: "/api/register",
        summary: "Créer un nouvel utilisateur",
        tags: ["Auth"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["email", "password", "role_id"],
            properties: [
                new OA\Property(property: "email", type: "string", example: "test@example.com"),
                new OA\Property(property: "password", type: "string", example: "123456"),
                new OA\Property(property: "role_id", type: "integer", example: 1)
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Utilisateur créé avec succès")]
    #[OA\Response(response: 422, description: "Données invalides")]
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'nom' => 'nullable|string|max:100',
            'prenom' => 'nullable|string|max:100',
            'role_id' => 'required|integer'
        ]);

        // Création utilisateur
        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'role_id' => $request->role_id,
            'blocked' => false,
            'failed_attempts' => 0
        ]);

        // Créer l'enregistrement LoginAttempt avec 0 tentatives
        LoginAttempt::create([
            'user_id' => $user->id,
            'attempts' => 0,
            'blocked_until' => null
        ]);

        // Générer un token JWT
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }
}
