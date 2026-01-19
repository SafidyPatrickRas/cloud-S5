<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoginAttempt;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "LoginAttempts",
    description: "Gestion des tentatives de connexion et blocage"
)]
class LoginAttemptController extends Controller
{
    // Limite de tentatives par défaut
    private int $maxAttempts = 3;
    private int $blockMinutes = 15;

    #[OA\Post(
        path: "/api/login",
        summary: "Login utilisateur avec gestion des tentatives",
        tags: ["LoginAttempts"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["email", "password"],
            properties: [
                new OA\Property(property: "email", type: "string", example: "test@example.com"),
                new OA\Property(property: "password", type: "string", example: "123456")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Connexion réussie")]
    #[OA\Response(response: 401, description: "Email ou mot de passe invalide")]
    #[OA\Response(response: 423, description: "Compte bloqué")]
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'Email ou mot de passe invalide'], 401);
        }

        $loginAttempt = LoginAttempt::firstOrCreate(
            ['user_id' => $user->id],
            ['attempts' => 0, 'blocked_until' => null]
        );

        // Vérifier blocage
        if ($loginAttempt->blocked_until && Carbon::now()->lt($loginAttempt->blocked_until)) {
            return response()->json(['error' => 'Compte bloqué, réessayez plus tard'], 423);
        }

        // Vérifier mot de passe
        if (!\Hash::check($request->password, $user->password)) {
            $loginAttempt->increment('attempts');

            if ($loginAttempt->attempts >= $this->maxAttempts) {
                $loginAttempt->blocked_until = Carbon::now()->addMinutes($this->blockMinutes);
                $loginAttempt->attempts = 0;
            }

            $loginAttempt->save();

            return response()->json(['error' => 'Email ou mot de passe invalide'], 401);
        }

        // Réinitialiser tentatives si login réussi
        $loginAttempt->update([
            'attempts' => 0,
            'blocked_until' => null
        ]);

        // Générer token JWT
        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($user);

        return response()->json(['token' => $token]);
    }

    #[OA\Post(
        path: "/api/reset-block/{user_id}",
        summary: "Réinitialiser le blocage d'un utilisateur",
        tags: ["LoginAttempts"]
    )]
    #[OA\Parameter(name: "user_id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Blocage réinitialisé")]
    public function resetBlock(int $user_id): JsonResponse
    {
        $loginAttempt = LoginAttempt::where('user_id', $user_id)->first();

        if (!$loginAttempt) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        $loginAttempt->update([
            'attempts' => 0,
            'blocked_until' => null
        ]);

        return response()->json(['message' => 'Blocage réinitialisé']);
    }
}
