<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
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
        path: "/api/login",
        summary: "Login utilisateur",
        tags: ["Auth"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["email", "mdp"],
            properties: [
                new OA\Property(property: "email", type: "string", example: "test@example.com"),
                new OA\Property(property: "mdp", type: "string", example: "123456")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Connexion réussie")]
    #[OA\Response(response: 401, description: "Email ou mot de passe invalide")]
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'mdp' => 'required'
        ]);

        $user = Utilisateur::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->mdp, $user->mdp)) {
            return response()->json(['error' => 'Email ou mot de passe invalide'], 401);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    #[OA\Post(
        path: "/api/register",
        summary: "Créer un nouvel utilisateur",
        tags: ["Auth"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["email", "mdp", "Id_role"],
            properties: [
                new OA\Property(property: "email", type: "string", example: "test@example.com"),
                new OA\Property(property: "mdp", type: "string", example: "123456"),
                new OA\Property(property: "Id_role", type: "integer", example: 1),
                new OA\Property(property: "fire_user_id", type: "string", example: "b7Hk6pV0bVQq..." )
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Utilisateur créé avec succès")]
    #[OA\Response(response: 422, description: "Données invalides")]
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|unique:utilisateur,email',
            'mdp' => 'required|min:6',
            'Id_role' => 'required|integer',
            'fire_user_id' => 'nullable|string|unique:utilisateur,fire_user_id'
        ]);

        // Création utilisateur
        $user = Utilisateur::create([
            'email' => $request->email,
            'mdp' => Hash::make($request->mdp),
            'Id_role' => $request->Id_role,
            'id_deleted' => false,
            'fire_user_id' => $request->fire_user_id
        ]);

        // Générer un token JWT
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }
}
