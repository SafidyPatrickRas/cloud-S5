<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    use HasFactory;

    protected $table = 'status';
    protected $primaryKey = 'Id_status';

    const CREATED_AT = 'create_at';
    const UPDATED_AT = 'update_at';

    protected $fillable = [
        'libelle',
        'niveau',
        'is_deleted'
    ];

    public function signalements()
    {
        return $this->hasMany(Signalement::class, 'Id_status', 'Id_status');
    }
}
