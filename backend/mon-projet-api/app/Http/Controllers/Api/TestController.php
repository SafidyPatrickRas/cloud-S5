<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Test;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Tests",
    description: "API CRUD Test"
)]
class TestController extends Controller
{
    #[OA\Get(
        path: "/api/tests",
        summary: "Lister les tests",
        tags: ["Tests"]
    )]
    #[OA\Response(
        response: 200,
        description: "Liste des tests"
    )]
    public function index(): JsonResponse
    {
        return response()->json(Test::all());
    }

    #[OA\Post(
        path: "/api/tests",
        summary: "Créer un test",
        tags: ["Tests"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["name"],
            properties: [
                new OA\Property(property: "name", type: "string", example: "Test API"),
                new OA\Property(property: "description", type: "string", example: "Description")
            ]
        )
    )]
    #[OA\Response(
        response: 201,
        description: "Test créé"
    )]
    public function store(Request $request): JsonResponse
    {
        $test = Test::create($request->all());
        return response()->json($test, 201);
    }

    #[OA\Get(
        path: "/api/tests/{id}",
        summary: "Afficher un test",
        tags: ["Tests"]
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Test trouvé"
    )]
    #[OA\Response(
        response: 404,
        description: "Test non trouvé"
    )]
    public function show(int $id): JsonResponse
    {
        return response()->json(Test::findOrFail($id));
    }

    #[OA\Put(
        path: "/api/tests/{id}",
        summary: "Modifier un test",
        tags: ["Tests"]
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Test modifié"
    )]
    #[OA\Response(
        response: 404,
        description: "Test non trouvé"
    )]
    public function update(Request $request, int $id): JsonResponse
    {
        $test = Test::findOrFail($id);
        $test->update($request->all());
        return response()->json($test);
    }

    #[OA\Delete(
        path: "/api/tests/{id}",
        summary: "Supprimer un test",
        tags: ["Tests"]
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Test supprimé"
    )]
    public function destroy(int $id): JsonResponse
    {
        Test::destroy($id);
        return response()->json(['message' => 'Supprimé']);
    }
}
