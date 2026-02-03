<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Utilisateur;

class Signalement extends Model
{
    use HasFactory;

    protected $table = 'signalement';
    protected $primaryKey = 'Id_signalement';

    const CREATED_AT = 'create_at';
    const UPDATED_AT = 'update_at';

    protected $fillable = [
        'position_',
        'commentaire',
        'is_deleted',
        'Id_status',
        'Id_utilisateur'
    ];

    public function status()
    {
        return $this->belongsTo(Status::class, 'Id_status', 'Id_status');
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'Id_utilisateur', 'Id_utilisateur');
    }

    public function problemes()
    {
        return $this->belongsToMany(
            Probleme::class,
            'signale_probleme',
            'Id_signalement',
            'Id_probleme'
        );
    }
}
