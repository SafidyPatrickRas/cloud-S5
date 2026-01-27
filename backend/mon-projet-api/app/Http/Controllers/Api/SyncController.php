<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Models\SyncLog;
use Carbon\Carbon;

class SyncController extends Controller
{
    /**
     * Pull data from Firebase (sent by client) and upsert into local database.
     * Expects JSON: { problemes: [...], users: [...], signalements: [...] }
     */
    public function pull(Request $request): JsonResponse
    {
        $payload = $request->only(['problemes', 'users', 'signalements']);

        $managerId = optional($request->user())->id; // nullable if unauthenticated

        DB::beginTransaction();
        try {
            // Users
            foreach ($payload['users'] ?? [] as $u) {
                $id = $u['id'] ?? null;
                $incomingTs = $u['last_update'] ?? ($u['updated_at'] ?? null);

                if ($id && DB::table('users')->where('id', $id)->exists()) {
                    $existingTs = DB::table('users')->where('id', $id)->value('last_update') ?? DB::table('users')->where('id', $id)->value('updated_at');
                    if ($incomingTs && strtotime($incomingTs) <= strtotime($existingTs)) {
                        continue; // skip older
                    }
                    $update = [];
                    if (isset($u['email'])) $update['email'] = $u['email'];
                    if (isset($u['nom'])) $update['nom'] = $u['nom'];
                    if (isset($u['prenom'])) $update['prenom'] = $u['prenom'];
                    if (isset($u['blocked'])) $update['blocked'] = $u['blocked'];
                    if (isset($u['role_id'])) $update['role_id'] = $u['role_id'];
                    if (isset($u['is_deleted'])) $update['is_deleted'] = $u['is_deleted'];
                    $update['last_update'] = $incomingTs ?? Carbon::now();
                    $update['updated_at'] = Carbon::now();
                    DB::table('users')->where('id', $id)->update($update);
                } else {
                    // insert new user
                    $insert = [];
                    if ($id) $insert['id'] = $id;
                    $insert['email'] = $u['email'] ?? null;
                    if (isset($u['nom'])) $insert['nom'] = $u['nom'];
                    if (isset($u['prenom'])) $insert['prenom'] = $u['prenom'];
                    if (isset($u['password'])) $insert['password'] = $u['password'];
                    if (isset($u['password_hash'])) $insert['password_hash'] = $u['password_hash'];
                    $insert['role_id'] = $u['role_id'] ?? null;
                    $insert['blocked'] = $u['blocked'] ?? false;
                    $insert['failed_attempts'] = $u['failed_attempts'] ?? 0;
                    $insert['is_deleted'] = $u['is_deleted'] ?? false;
                    $insert['created_at'] = $u['created_at'] ?? Carbon::now();
                    $insert['updated_at'] = $u['updated_at'] ?? Carbon::now();
                    $insert['last_update'] = $incomingTs ?? Carbon::now();
                    DB::table('users')->insert($insert);
                }
            }

            // Problemes
            foreach ($payload['problemes'] ?? [] as $p) {
                $id = $p['id'] ?? ($p['id_probleme'] ?? null);
                $incomingTs = $p['last_update'] ?? ($p['updated_at'] ?? null);
                $lat = $p['latitude'] ?? $p['lat'] ?? null;
                $lng = $p['longitude'] ?? $p['lng'] ?? null;

                if (!$id) continue;

                if (DB::table('probleme_routier')->where('id_probleme', $id)->exists()) {
                    $existingTs = DB::table('probleme_routier')->where('id_probleme', $id)->value('last_update') ?? DB::table('probleme_routier')->where('id_probleme', $id)->value('updated_at');
                    if ($incomingTs && strtotime($incomingTs) <= strtotime($existingTs)) {
                        continue;
                    }
                    $bindings = [];
                    $sets = [];
                    if ($lat !== null && $lng !== null) {
                        $sets[] = "geom = ST_SetSRID(ST_MakePoint(?, ?), 4326)";
                        $bindings[] = $lng; $bindings[] = $lat;
                    }
                    if (isset($p['status'])) { $sets[] = 'status = ?'; $bindings[] = $p['status']; }
                    if (isset($p['surface_m2'])) { $sets[] = 'surface_m2 = ?'; $bindings[] = $p['surface_m2']; }
                    if (isset($p['budget'])) { $sets[] = 'budget = ?'; $bindings[] = $p['budget']; }
                    if (isset($p['id_entreprise'])) { $sets[] = 'id_entreprise = ?'; $bindings[] = $p['id_entreprise']; }
                    if (isset($p['is_deleted'])) { $sets[] = 'is_deleted = ?'; $bindings[] = $p['is_deleted']; }
                    $sets[] = 'last_update = ?'; $bindings[] = $incomingTs ?? Carbon::now();
                    $bindings[] = $id;
                    $sql = 'UPDATE probleme_routier SET ' . implode(', ', $sets) . ' , updated_at = NOW() WHERE id_probleme = ?';
                    DB::update($sql, $bindings);
                } else {
                    // insert
                    $sql = 'INSERT INTO probleme_routier (id_probleme, geom, status, surface_m2, budget, id_entreprise, is_deleted, created_at, updated_at, last_update) VALUES (?, ST_SetSRID(ST_MakePoint(?, ?), 4326), ?, ?, ?, ?, ?, ?, ?, ?)';
                    DB::insert($sql, [
                        $id,
                        $lng ?? 0,
                        $lat ?? 0,
                        $p['status'] ?? 'NOUVEAU',
                        $p['surface_m2'] ?? null,
                        $p['budget'] ?? null,
                        $p['id_entreprise'] ?? null,
                        $p['is_deleted'] ?? false,
                        $p['created_at'] ?? Carbon::now(),
                        $p['updated_at'] ?? Carbon::now(),
                        $incomingTs ?? Carbon::now()
                    ]);
                }
            }

            // Signalements
            foreach ($payload['signalements'] ?? [] as $s) {
                $id = $s['id'] ?? ($s['id_signalement'] ?? null);
                $incomingTs = $s['last_update'] ?? ($s['updated_at'] ?? null);
                if (!$id) continue;
                if (DB::table('signalement')->where('id_signalement', $id)->exists()) {
                    $existingTs = DB::table('signalement')->where('id_signalement', $id)->value('last_update') ?? DB::table('signalement')->where('id_signalement', $id)->value('date_signalement');
                    if ($incomingTs && strtotime($incomingTs) <= strtotime($existingTs)) {
                        continue;
                    }
                    $update = [];
                    if (isset($s['commentaire'])) $update['commentaire'] = $s['commentaire'];
                    if (isset($s['user_id'])) $update['user_id'] = $s['user_id'];
                    if (isset($s['id_probleme'])) $update['id_probleme'] = $s['id_probleme'];
                    if (isset($s['date_signalement'])) $update['date_signalement'] = $s['date_signalement'];
                    if (isset($s['is_deleted'])) $update['is_deleted'] = $s['is_deleted'];
                    $update['last_update'] = $incomingTs ?? Carbon::now();
                    $update['updated_at'] = Carbon::now();
                    DB::table('signalement')->where('id_signalement', $id)->update($update);
                } else {
                    $insert = [
                        'id_signalement' => $id,
                        'id_probleme' => $s['id_probleme'] ?? null,
                        'user_id' => $s['user_id'] ?? null,
                        'date_signalement' => $s['date_signalement'] ?? Carbon::now(),
                        'commentaire' => $s['commentaire'] ?? null,
                        'is_deleted' => $s['is_deleted'] ?? false,
                        'last_update' => $incomingTs ?? Carbon::now(),
                        'created_at' => $s['created_at'] ?? Carbon::now(),
                        'updated_at' => $s['updated_at'] ?? Carbon::now()
                    ];
                    DB::table('signalement')->insert($insert);
                }
            }

            // record sync log
            SyncLog::create([
                'type_sync' => 'PULL',
                'date_sync' => Carbon::now(),
                'manager_id' => $managerId ?? null,
                'resultat' => 'SUCCESS',
                'details' => 'Pulled from Firebase via client'
            ]);

            DB::commit();
            return response()->json(['status' => 'ok'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            SyncLog::create([
                'type_sync' => 'PULL',
                'date_sync' => Carbon::now(),
                'manager_id' => $managerId ?? null,
                'resultat' => 'ERROR',
                'details' => $e->getMessage()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
