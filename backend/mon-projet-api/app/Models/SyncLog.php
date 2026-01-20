<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SyncLog extends Model
{
    protected $table = 'sync_log';
    
    protected $primaryKey = 'id_sync';

    protected $fillable = [
        'type_sync',
        'date_sync',
        'manager_id',
        'resultat',
        'details'
    ];

    protected $casts = [
        'date_sync' => 'datetime',
    ];

    public $timestamps = false;

    // Relations
    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }
}
