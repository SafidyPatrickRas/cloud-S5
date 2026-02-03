<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\EntrepriseController;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\UtilisateurController;
use App\Http\Controllers\Api\SignalementController;
use App\Http\Controllers\Api\ProblemeController;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::apiResource('roles', RoleController::class);
Route::apiResource('entreprises', EntrepriseController::class);
Route::apiResource('statuses', StatusController::class);
Route::apiResource('utilisateurs', UtilisateurController::class);
Route::apiResource('signalements', SignalementController::class);
Route::get('signalements-unassigned', [SignalementController::class, 'unassigned']);
Route::apiResource('problemes', ProblemeController::class);

