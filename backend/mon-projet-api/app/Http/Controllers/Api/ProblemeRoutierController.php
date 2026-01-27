<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProblemeRoutier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Problemes Routiers",
    description: "Gestion des problèmes routiers"
)]
class ProblemeRoutierController extends Controller
{
    #[OA\Get(
        path: "/api/problemes",
        summary: "Liste tous les problèmes routiers",
        tags: ["Problemes Routiers"]
    )]
    #[OA\Response(response: 200, description: "Liste des problèmes")]
    public function index(): JsonResponse
    {
        $problemes = DB::select("
            SELECT 
                p.id_probleme,
                ST_Y(p.geom) as latitude,
                ST_X(p.geom) as longitude,
                p.status,
                p.surface_m2,
                p.budget,
                p.lieu,
                p.description,
                p.id_entreprise,
                p.is_deleted,
                p.last_update,
                p.created_at,
                p.updated_at,
                u.email as signale_par_email,
                u.nom as signale_par_nom,
                u.prenom as signale_par_prenom,
                s.date_signalement,
                s.commentaire
            FROM probleme_routier p
            LEFT JOIN signalement s ON p.id_probleme = s.id_probleme AND s.is_deleted = false
            LEFT JOIN users u ON s.user_id = u.id
            WHERE p.is_deleted = false
            ORDER BY p.created_at DESC
        ");

        return response()->json($problemes);
    }

    #[OA\Post(
        path: "/api/problemes",
        summary: "Créer un nouveau problème routier",
        tags: ["Problemes Routiers"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["latitude", "longitude"],
            properties: [
                new OA\Property(property: "latitude", type: "number", example: -18.8792),
                new OA\Property(property: "longitude", type: "number", example: 47.5079),
                new OA\Property(property: "status", type: "string", example: "NOUVEAU"),
                new OA\Property(property: "surface_m2", type: "number", example: 25.5),
                new OA\Property(property: "budget", type: "number", example: 5000000),
                new OA\Property(property: "id_entreprise", type: "integer", example: 1)
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Problème créé")]
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'status' => 'nullable|in:NOUVEAU,EN_COURS,TERMINE',
            'surface_m2' => 'nullable|numeric|min:0',
            'budget' => 'nullable|numeric|min:0',
            'id_entreprise' => 'nullable|integer|exists:entreprise,id_entreprise'
        ]);

        $id = \Illuminate\Support\Str::uuid()->toString();
        
        DB::insert("
            INSERT INTO probleme_routier (id_probleme, geom, status, surface_m2, budget, id_entreprise, created_at, updated_at)
            VALUES (?, ST_SetSRID(ST_MakePoint(?, ?), 4326), ?, ?, ?, ?, NOW(), NOW())
        ", [
            $id,
            $request->longitude,
            $request->latitude,
            $request->status ?? 'NOUVEAU',
            $request->surface_m2,
            $request->budget,
            $request->id_entreprise
        ]);

        $probleme = DB::selectOne("
            SELECT 
                id_probleme,
                ST_Y(geom) as latitude,
                ST_X(geom) as longitude,
                status,
                surface_m2,
                budget,
                id_entreprise
            FROM probleme_routier
            WHERE id_probleme = ?
        ", [$id]);

        return response()->json($probleme, 201);
    }

    #[OA\Get(
        path: "/api/problemes/{id}",
        summary: "Détails d'un problème",
        tags: ["Problemes Routiers"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))]
    #[OA\Response(response: 200, description: "Détails du problème")]
    #[OA\Response(response: 404, description: "Problème non trouvé")]
    public function show(string $id): JsonResponse
    {
        $probleme = DB::selectOne("
            SELECT 
                p.id_probleme,
                ST_Y(p.geom) as latitude,
                ST_X(p.geom) as longitude,
                p.status,
                p.surface_m2,
                p.budget,
                p.lieu,
                p.description,
                p.id_entreprise,
                p.is_deleted,
                p.last_update,
                e.nom as entreprise_nom,
                p.created_at,
                p.updated_at
            FROM probleme_routier p
            LEFT JOIN entreprise e ON p.id_entreprise = e.id_entreprise
            WHERE p.id_probleme = ? AND p.is_deleted = false
        ", [$id]);

        if (!$probleme) {
            return response()->json(['message' => 'Problème non trouvé'], 404);
        }

        return response()->json($probleme);
    }

    #[OA\Put(
        path: "/api/problemes/{id}",
        summary: "Mettre à jour un problème",
        tags: ["Problemes Routiers"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))]
    #[OA\Response(response: 200, description: "Problème mis à jour")]
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => 'nullable|in:NOUVEAU,EN_COURS,TERMINE',
            'surface_m2' => 'nullable|numeric|min:0',
            'budget' => 'nullable|numeric|min:0',
            'lieu' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'id_entreprise' => 'nullable|integer|exists:entreprise,id_entreprise'
        ]);

        $updates = [];
        $params = [];

        if ($request->has('status')) {
            $updates[] = 'status = ?';
            $params[] = $request->status;
        }
        if ($request->has('surface_m2')) {
            $updates[] = 'surface_m2 = ?';
            $params[] = $request->surface_m2;
        }
        if ($request->has('budget')) {
            $updates[] = 'budget = ?';
            $params[] = $request->budget;
        }
        if ($request->has('lieu')) {
            $updates[] = 'lieu = ?';
            $params[] = $request->lieu;
        }
        if ($request->has('description')) {
            $updates[] = 'description = ?';
            $params[] = $request->description;
        }
        if ($request->has('id_entreprise')) {
            $updates[] = 'id_entreprise = ?';
            $params[] = $request->id_entreprise;
        }

        $updates[] = 'updated_at = NOW()';
        $updates[] = 'last_update = NOW()';
        $params[] = $id;

        DB::update("UPDATE probleme_routier SET " . implode(', ', $updates) . " WHERE id_probleme = ? AND is_deleted = false", $params);

        return $this->show($id);
    }

    #[OA\Delete(
        path: "/api/problemes/{id}",
        summary: "Supprimer un problème (soft delete)",
        tags: ["Problemes Routiers"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))]
    #[OA\Response(response: 204, description: "Problème supprimé")]
    public function destroy(string $id): JsonResponse
    {
        // Soft delete : on met is_deleted à true au lieu de supprimer
        DB::update("UPDATE probleme_routier SET is_deleted = true, last_update = NOW() WHERE id_probleme = ?", [$id]);
        return response()->json(null, 204);
    }
}
