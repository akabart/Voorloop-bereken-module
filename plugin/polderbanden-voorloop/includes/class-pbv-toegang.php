<?php
/**
 * Toegang met een eenvoudig wachtwoord (gebruiker) en een beheerwachtwoord (beheerder).
 *
 * Na inloggen krijgt de browser een ondertekende cookie. De REST API controleert die cookie bij elke
 * aanroep, zodat ook de gegevens (niet alleen de pagina) afgeschermd zijn. WordPress-beheerders
 * (manage_options) hebben altijd beheerrechten.
 */

defined( 'ABSPATH' ) || exit;

class PBV_Toegang {

	const COOKIE      = 'pbv_sessie';
	const GELDIGHEID  = 30 * DAY_IN_SECONDS;
	const MAX_POGING  = 8;

	/** Huidige rol: 'beheerder', 'gebruiker' of null. */
	public static function rol() {
		if ( is_user_logged_in() && current_user_can( 'manage_options' ) ) {
			return 'beheerder';
		}
		if ( empty( $_COOKIE[ self::COOKIE ] ) ) {
			return null;
		}
		$sessie = self::lees( sanitize_text_field( wp_unslash( $_COOKIE[ self::COOKIE ] ) ) );
		return $sessie ? $sessie['rol'] : null;
	}

	public static function is_beheerder() {
		return 'beheerder' === self::rol();
	}

	public static function heeft_toegang() {
		return null !== self::rol();
	}

	/** Is er minstens één wachtwoord ingesteld? */
	public static function is_ingesteld() {
		return '' !== (string) PBV_Instellingen::get( 'wachtwoord_gebruiker' )
			|| '' !== (string) PBV_Instellingen::get( 'wachtwoord_beheer' );
	}

	/**
	 * Controleert het wachtwoord en zet de cookie. Geeft de rol of een WP_Error.
	 */
	public static function inloggen( $wachtwoord ) {
		$sleutel = 'pbv_pogingen_' . md5( self::ip() );
		$pogingen = (int) get_transient( $sleutel );
		if ( $pogingen >= self::MAX_POGING ) {
			return new WP_Error( 'pbv_te_vaak', 'Te veel pogingen. Probeer het over tien minuten opnieuw.', array( 'status' => 429 ) );
		}
		$beheer    = (string) PBV_Instellingen::get( 'wachtwoord_beheer' );
		$gebruiker = (string) PBV_Instellingen::get( 'wachtwoord_gebruiker' );
		$rol       = null;
		if ( '' !== $beheer && wp_check_password( $wachtwoord, $beheer ) ) {
			$rol = 'beheerder';
		} elseif ( '' !== $gebruiker && wp_check_password( $wachtwoord, $gebruiker ) ) {
			$rol = 'gebruiker';
		}
		if ( ! $rol ) {
			set_transient( $sleutel, $pogingen + 1, 10 * MINUTE_IN_SECONDS );
			return new WP_Error( 'pbv_onjuist', 'Onjuist wachtwoord.', array( 'status' => 403 ) );
		}
		delete_transient( $sleutel );
		self::zet_cookie( $rol );
		return $rol;
	}

	public static function uitloggen() {
		setcookie( self::COOKIE, '', array(
			'expires'  => time() - 3600,
			'path'     => COOKIEPATH ? COOKIEPATH : '/',
			'secure'   => is_ssl(),
			'httponly' => true,
			'samesite' => 'Lax',
		) );
		unset( $_COOKIE[ self::COOKIE ] );
	}

	private static function zet_cookie( $rol ) {
		$payload = base64_encode( wp_json_encode( array(
			'rol' => $rol,
			'exp' => time() + self::GELDIGHEID,
			'gen' => self::generatie( $rol ),
		) ) );
		$waarde = $payload . '.' . hash_hmac( 'sha256', $payload, wp_salt( 'auth' ) );
		setcookie( self::COOKIE, $waarde, array(
			'expires'  => time() + self::GELDIGHEID,
			'path'     => COOKIEPATH ? COOKIEPATH : '/',
			'secure'   => is_ssl(),
			'httponly' => true,
			'samesite' => 'Lax',
		) );
		$_COOKIE[ self::COOKIE ] = $waarde;
	}

	private static function lees( $waarde ) {
		$delen = explode( '.', $waarde );
		if ( 2 !== count( $delen ) ) {
			return null;
		}
		if ( ! hash_equals( hash_hmac( 'sha256', $delen[0], wp_salt( 'auth' ) ), $delen[1] ) ) {
			return null;
		}
		$data = json_decode( base64_decode( $delen[0] ), true );
		if ( ! is_array( $data ) || empty( $data['rol'] ) || (int) $data['exp'] < time() ) {
			return null;
		}
		if ( ! in_array( $data['rol'], array( 'gebruiker', 'beheerder' ), true ) ) {
			return null;
		}
		// Een gewijzigd wachtwoord maakt bestaande sessies ongeldig.
		if ( ( $data['gen'] ?? '' ) !== self::generatie( $data['rol'] ) ) {
			return null;
		}
		return $data;
	}

	private static function generatie( $rol ) {
		$hash = (string) PBV_Instellingen::get( 'beheerder' === $rol ? 'wachtwoord_beheer' : 'wachtwoord_gebruiker' );
		return substr( md5( $hash ), 0, 10 );
	}

	private static function ip() {
		return isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	}
}
