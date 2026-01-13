<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: "Mon API Laravel 2026",
    version: "1.0.0",
    description: "Documentation de mon API générée avec Swagger"
)]
#[OA\Server(url: "http://localhost:8000", description: "Serveur Local")]
abstract class Controller
{
    //
}
