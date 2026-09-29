<?php
/**
 * Instellingen (wp_options 'pbv_instellingen') met standaardwaarden.
 */

defined( 'ABSPATH' ) || exit;

class PBV_Instellingen {

	const OPTIE = 'pbv_instellingen';

	/** Velden die op de trekkerkaart aan of uit gezet kunnen worden. */
	const VELDEN = array(
		'transmissie'   => 'Transmissie',
		'snelheid'      => 'Maximumsnelheid',
		'vooras'        => 'Vooras',
		'achteras'      => 'Achteras',
		'asklasse'      => 'Asklasse',
		'chassis'       => 'Chassisnummer',
		'bouwjaar'      => 'Bouwjaren',
		'regio'         => 'Regio',
		'voorwaarde'    => 'Voorwaarde',
		'componenten'   => 'Componenten (JD)',
		'banden_std'    => 'Standaardbanden',
		'extra'         => 'Overige gegevens',
		'opmerking'     => 'Opmerking',
		'bron'          => 'Bron',
		'flensmaat'     => 'Flensmaat',
		'steekcirkel'   => 'Steekcirkel',
		'bouten'        => 'Aantal bouten',
		'draad'         => 'Draad',
		'boutgat'       => 'Boutgat',
		'naafgat'       => 'Naafgat',
		'boutzitting'   => 'Boutzitting',
		'aanhaalmoment' => 'Aanhaalmoment',
		'spacer'        => 'Spacer',
	);

	public static function standaard() {
		return array(
			'wachtwoord_gebruiker' => '',
			'wachtwoord_beheer'    => '',
			'zones'                => PBV_Reken::ZONES,
			'zones_per_merk'       => array(),
			'velden'               => array_fill_keys( array_keys( self::VELDEN ), true ),
			'kleur_primair'        => '#1f2a2e',
			'kleur_accent'         => '#c10e1a',
			'bedrijfsnaam'         => 'Polderbanden.nl',
			'bedrijfsregel'        => 'Creil (NOP) · info@polderbanden.nl · +31 (0)85 483 2790',
			'logo_url'             => '',
			'pagina_id'            => 0,
		);
	}

	public static function alle() {
		$opgeslagen = get_option( self::OPTIE, array() );
		$waarden    = wp_parse_args( is_array( $opgeslagen ) ? $opgeslagen : array(), self::standaard() );
		$waarden['zones']  = wp_parse_args( (array) $waarden['zones'], PBV_Reken::ZONES );
		$waarden['velden'] = wp_parse_args( (array) $waarden['velden'], array_fill_keys( array_keys( self::VELDEN ), true ) );
		return $waarden;
	}

	public static function get( $sleutel ) {
		$alle = self::alle();
		return $alle[ $sleutel ] ?? null;
	}

	public static function bewaar( array $wijzigingen ) {
		$alle = array_merge( self::alle(), $wijzigingen );
		update_option( self::OPTIE, $alle, false );
		return $alle;
	}

	/** Instellingen die de front-end mag zien (zonder wachtwoorden). */
	public static function publiek() {
		$a = self::alle();
		return array(
			'zones'          => array_map( 'floatval', $a['zones'] ),
			'zones_per_merk' => (object) $a['zones_per_merk'],
			'velden'         => $a['velden'],
			'veldnamen'      => self::VELDEN,
			'bedrijfsnaam'   => $a['bedrijfsnaam'],
			'bedrijfsregel'  => $a['bedrijfsregel'],
			'logo_url'       => $a['logo_url'],
		);
	}
}
