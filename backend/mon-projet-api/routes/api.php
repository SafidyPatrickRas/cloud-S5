<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\Api\LoginAttemptController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\EntrepriseController;
use App\Http\Controllers\Api\ProblemeRoutierController;
use App\Http\Controllers\Api\SignalementController;
use App\Http\Controllers\Api\SyncController;

// Auth
Route::post('login', [LoginAttemptController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);
Route::post('reset-block/{user_id}', [LoginAttemptController::class, 'resetBlock']);

// Resources
Route::apiResource('tests', TestController::class);
Route::apiResource('roles', RoleController::class);
Route::apiResource('entreprises', EntrepriseController::class);
Route::apiResource('problemes', ProblemeRoutierController::class);
Route::apiResource('signalements', SignalementController::class);

// Users
Route::get('users', [UserController::class, 'index']);
Route::put('users/{id}', [UserController::class, 'update']);

// Sync endpoints
Route::post('sync/pull', [SyncController::class, 'pull']);

// Signalements par problème
Route::get('problemes/{problemeId}/signalements', [SignalementController::class, 'getByProbleme']);
