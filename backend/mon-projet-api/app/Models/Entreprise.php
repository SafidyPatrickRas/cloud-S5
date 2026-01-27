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
        'email'
    ];

    public $timestamps = true;

    // Relations
    public function problemesRoutiers()
    {
        return $this->hasMany(ProblemeRoutier::class, 'id_entreprise');
    }
}
