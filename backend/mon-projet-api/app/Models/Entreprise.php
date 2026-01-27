<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Entreprise extends Model
{
    protected $table = 'entreprise';
    
    protected $primaryKey = 'id_entreprise';

    protected $fillable = [
        'nom',
        'contact',
        'telephone',
        'email',
        'is_deleted',
        'last_update'
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
        'last_update' => 'datetime',
    ];

    public $timestamps = true;

    // Relations
    public function problemesRoutiers()
    {
        return $this->hasMany(ProblemeRoutier::class, 'id_entreprise');
    }
}
