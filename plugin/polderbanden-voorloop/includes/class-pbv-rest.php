<?php
/**
 * REST API (namespace pbv/v1). Alle routes behalve inloggen vereisen een geldige sessie;
 * beheerroutes vereisen de rol beheerder.
 */

defined( 'ABSPATH' ) || exit;

class PBV_Rest {

	const NS = 'pbv/v1';

	public static function registreer() {
		$open      = '__return_true';
		$gebruiker = array( __CLASS__, 'mag_lezen' );
		$beheer    = array( __CLASS__, 'mag_beheren' );

		self::route( '/sessie', 'GET', array( __CLASS__, 'sessie' ), $open );
		self::route( '/sessie', 'POST', array( __CLASS__, 'inloggen' ), $open );
		self::route( '/sessie', 'DELETE', array( __CLASS__, 'uitloggen' ), $open );

		self::route( '/start', 'GET', array( __CLASS__, 'start' ), $gebruiker );
		self::route( '/types/(?P<id>\d+)', 'GET', array( __CLASS__, 'type' ), $gebruiker );
		self::route( '/banden', 'GET', array( __CLASS__, 'banden' ), $gebruiker );
		self::route( '/banden', 'POST', array( __CLASS__, 'band_toevoegen' ), $gebruiker );
		self::route( '/banden/(?P<id>\d+)', 'DELETE', array( __CLASS__, 'band_verwijderen' ), $beheer );
		self::route( '/berekeningen', 'GET', array( __CLASS__, 'berekeningen' ), $gebruiker );
		self::route( '/berekeningen', 'POST', array( __CLASS__, 'berekening_opslaan' ), $gebruiker );
		self::route( '/berekeningen/(?P<id>\d+)', 'GET', array( __CLASS__, 'berekening' ), $gebruiker );
		self::route( '/berekeningen/(?P<id>\d+)', 'DELETE', array( __CLASS__, 'berekening_verwijderen' ), $beheer );

		self::route( '/instellingen', 'POST', array( __CLASS__, 'instellingen_opslaan' ), $beheer );
		self::route( '/types', 'POST', array( __CLASS__, 'type_nieuw' ), $beheer );
		self::route( '/types/(?P<id>\d+)', 'POST', array( __CLASS__, 'type_wijzigen' ), $beheer );
		self::route( '/uitvoeringen', 'POST', array( __CLASS__, 'uitvoering_nieuw' ), $beheer );
		self::route( '/uitvoeringen/(?P<id>\d+)', 'POST', array( __CLASS__, 'uitvoering_wijzigen' ), $beheer );
		self::route( '/uitvoeringen/(?P<id>\d+)', 'DELETE', array( __CLASS__, 'uitvoering_verwijderen' ), $beheer );
		self::route( '/review', 'GET', array( __CLASS__, 'review' ), $beheer );
		self::route( '/review/(?P<id>\d+)', 'POST', array( __CLASS__, 'review_besluit' ), $beheer );
		self::route( '/review/bulk', 'POST', array( __CLASS__, 'review_bulk' ), $beheer );
		self::route( '/log', 'GET', array( __CLASS__, 'log' ), $beheer );
	}

	private static function route( $pad, $methode, $callback, $permissie ) {
		register_rest_route( self::NS, $pad, array(
			'methods'             => $methode,
			'callback'            => function ( $request ) use ( $callback ) {
				$antwoord = rest_ensure_response( call_user_func( $callback, $request ) );
				if ( $antwoord instanceof WP_REST_Response ) {
					$antwoord->header( 'X-Robots-Tag', 'noindex, nofollow' );
					$antwoord->header( 'Cache-Control', 'no-store' );
				}
				return $antwoord;
			},
			'permission_callback' => $permissie,
		) );
	}

	public static function mag_lezen() {
		return PBV_Toegang::heeft_toegang() ? true : new WP_Error( 'pbv_geen_toegang', 'Log eerst in.', array( 'status' => 401 ) );
	}

	public static function mag_beheren() {
		return PBV_Toegang::is_beheerder() ? true : new WP_Error( 'pbv_geen_beheer', 'Alleen voor beheerders.', array( 'status' => 403 ) );
	}

	// ------------------------------------------------------------------

	public static function sessie() {
		return array( 'rol' => PBV_Toegang::rol(), 'ingesteld' => PBV_Toegang::is_ingesteld() );
	}

	public static function inloggen( WP_REST_Request $r ) {
		$rol = PBV_Toegang::inloggen( (string) $r->get_param( 'wachtwoord' ) );
		return is_wp_error( $rol ) ? $rol : array( 'rol' => $rol );
	}

	public static function uitloggen() {
		PBV_Toegang::uitloggen();
		return array( 'rol' => null );
	}

	/** Alles wat de app bij het opstarten nodig heeft. */
	public static function start() {
		return array(
			'rol'          => PBV_Toegang::rol(),
			'boom'         => PBV_Data::boom(),
			'banden'       => PBV_Data::banden(),
			'instellingen' => PBV_Instellingen::publiek(),
		);
	}

	public static function type( WP_REST_Request $r ) {
		$type = PBV_Data::type( (int) $r['id'] );
		return $type ? $type : new WP_Error( 'pbv_niet_gevonden', 'Type niet gevonden.', array( 'status' => 404 ) );
	}

	public static function banden() {
		return PBV_Data::banden();
	}

	public static function band_toevoegen( WP_REST_Request $r ) {
		$id = PBV_Data::band_opslaan( $r->get_json_params() ?: $r->get_params() );
		return is_wp_error( $id ) ? $id : array( 'id' => $id, 'banden' => PBV_Data::banden() );
	}

	public static function band_verwijderen( WP_REST_Request $r ) {
		PBV_Data::band_verwijderen( (int) $r['id'] );
		return array( 'banden' => PBV_Data::banden() );
	}

	public static function berekeningen( WP_REST_Request $r ) {
		return PBV_Data::berekeningen( sanitize_text_field( (string) $r->get_param( 'zoek' ) ) );
	}

	public static function berekening( WP_REST_Request $r ) {
		$b = PBV_Data::berekening( (int) $r['id'] );
		return $b ? $b : new WP_Error( 'pbv_niet_gevonden', 'Berekening niet gevonden.', array( 'status' => 404 ) );
	}

	public static function berekening_opslaan( WP_REST_Request $r ) {
		$id = PBV_Data::berekening_opslaan( $r->get_json_params() ?: array() );
		return is_wp_error( $id ) ? $id : PBV_Data::berekening( $id );
	}

	public static function berekening_verwijderen( WP_REST_Request $r ) {
		return PBV_Data::berekening_verwijderen( (int) $r['id'] );
	}

	// ------------------------------------------------------------------
	// Beheer
	// ------------------------------------------------------------------

	public static function instellingen_opslaan( WP_REST_Request $r ) {
		$p        = $r->get_json_params() ?: array();
		$wijzig   = array();
		if ( isset( $p['zones'] ) ) {
			$z    = array_map( 'floatval', (array) $p['zones'] );
			$fout = PBV_Reken::valideer_zones( $z );
			if ( $fout ) {
				return new WP_Error( 'pbv_zones', $fout, array( 'status' => 400 ) );
			}
			$wijzig['zones'] = $z;
		}
		if ( isset( $p['zones_per_merk'] ) ) {
			$per = array();
			foreach ( (array) $p['zones_per_merk'] as $merk_id => $z ) {
				if ( empty( $z ) ) {
					continue;
				}
				$z    = array_map( 'floatval', (array) $z );
				$fout = PBV_Reken::valideer_zones( $z );
				if ( $fout ) {
					return new WP_Error( 'pbv_zones', $fout, array( 'status' => 400 ) );
				}
				$per[ (int) $merk_id ] = $z;
			}
			$wijzig['zones_per_merk'] = $per;
		}
		if ( isset( $p['velden'] ) ) {
			$velden = array();
			foreach ( array_keys( PBV_Instellingen::VELDEN ) as $v ) {
				$velden[ $v ] = ! empty( $p['velden'][ $v ] );
			}
			$wijzig['velden'] = $velden;
		}
		$oud = PBV_Instellingen::publiek();
		PBV_Instellingen::bewaar( $wijzig );
		PBV_Data::log( 'instellingen', null, 'Instellingen gewijzigd', array_intersect_key( $oud, $wijzig ), $wijzig );
		return PBV_Instellingen::publiek();
	}

	public static function type_nieuw( WP_REST_Request $r ) {
		$p  = $r->get_json_params() ?: array();
		$id = PBV_Data::type_opslaan( 0, $p );
		if ( is_wp_error( $id ) ) {
			return $id;
		}
		if ( ! empty( $p['uitvoering'] ) ) {
			$u = PBV_Data::uitvoering_opslaan( 0, array_merge( (array) $p['uitvoering'], array( 'type_id' => $id ) ) );
			if ( is_wp_error( $u ) ) {
				return $u;
			}
		}
		return array( 'id' => $id, 'type' => PBV_Data::type( $id ), 'boom' => PBV_Data::boom() );
	}

	public static function type_wijzigen( WP_REST_Request $r ) {
		$id = PBV_Data::type_opslaan( (int) $r['id'], $r->get_json_params() ?: array() );
		return is_wp_error( $id ) ? $id : array( 'type' => PBV_Data::type( $id ), 'boom' => PBV_Data::boom() );
	}

	public static function uitvoering_nieuw( WP_REST_Request $r ) {
		$p  = $r->get_json_params() ?: array();
		$id = PBV_Data::uitvoering_opslaan( 0, $p );
		return is_wp_error( $id ) ? $id : array( 'type' => PBV_Data::type( (int) $p['type_id'] ) );
	}

	public static function uitvoering_wijzigen( WP_REST_Request $r ) {
		$id = PBV_Data::uitvoering_opslaan( (int) $r['id'], $r->get_json_params() ?: array() );
		if ( is_wp_error( $id ) ) {
			return $id;
		}
		global $wpdb;
		$type_id = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT type_id FROM ' . PBV_Installatie::tabel( 'uitvoeringen' ) . ' WHERE id = %d', $id ) ); // phpcs:ignore
		return array( 'type' => PBV_Data::type( $type_id ) );
	}

	public static function uitvoering_verwijderen( WP_REST_Request $r ) {
		global $wpdb;
		$type_id = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT type_id FROM ' . PBV_Installatie::tabel( 'uitvoeringen' ) . ' WHERE id = %d', (int) $r['id'] ) ); // phpcs:ignore
		$ok      = PBV_Data::uitvoering_verwijderen( (int) $r['id'] );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		return array( 'type' => PBV_Data::type( $type_id ), 'boom' => PBV_Data::boom() );
	}

	public static function review( WP_REST_Request $r ) {
		return PBV_Data::review_lijst( 'afgehandeld' !== $r->get_param( 'status' ) );
	}

	public static function review_besluit( WP_REST_Request $r ) {
		$p  = $r->get_json_params() ?: array();
		$ok = PBV_Data::review_besluit( (int) $r['id'], (string) ( $p['besluit'] ?? '' ), $p['ratio'] ?? null, (string) ( $p['toelichting'] ?? '' ) );
		return is_wp_error( $ok ) ? $ok : array( 'ok' => true );
	}

	public static function review_bulk( WP_REST_Request $r ) {
		$p = $r->get_json_params() ?: array();
		return array( 'aantal' => PBV_Data::review_bulk( sanitize_key( (string) ( $p['soort'] ?? '' ) ) ) );
	}

	public static function log() {
		return PBV_Data::log_lijst();
	}
}
