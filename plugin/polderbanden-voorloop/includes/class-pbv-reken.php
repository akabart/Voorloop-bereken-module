<?php
/**
 * Rekenkern. Moet exact overeenkomen met assets/rekenkern.js (zelfde testgevallen in tests/).
 *
 * i          = omwentelingen voorwiel per omwenteling achterwiel (> 1)
 * voorloop % = (i × U_voor / U_achter − 1) × 100
 */

defined( 'ABSPATH' ) || exit;

class PBV_Reken {

	/** Standaard normzones in procenten. */
	const ZONES = array(
		'min'       => 0.0,
		'groen_min' => 1.0,
		'opt_min'   => 1.5,
		'doel'      => 2.5,
		'opt_max'   => 3.5,
		'groen_max' => 5.0,
		'max'       => 6.0,
	);

	/** Voorloop in procenten, of null bij ongeldige invoer. */
	public static function voorloop( $i, $u_voor, $u_achter ) {
		$i        = (float) $i;
		$u_voor   = (float) $u_voor;
		$u_achter = (float) $u_achter;
		if ( $i <= 0 || $u_voor <= 0 || $u_achter <= 0 ) {
			return null;
		}
		return ( $i * $u_voor / $u_achter - 1 ) * 100;
	}

	/** Afrolomtrek voorband die precies de doelvoorloop (in %) geeft. */
	public static function ideale_voor( $i, $u_achter, $doel ) {
		return ( $i > 0 ) ? $u_achter * ( 1 + $doel / 100 ) / $i : null;
	}

	/** Afrolomtrek achterband die precies de doelvoorloop (in %) geeft. */
	public static function ideale_achter( $i, $u_voor, $doel ) {
		return ( $doel > -100 ) ? $u_voor * $i / ( 1 + $doel / 100 ) : null;
	}

	/** Verhouding uit JD-componenten: (i_eind × i_diff) / (i_vooras × i_tussenbak). */
	public static function uit_componenten( $i_eind, $i_diff, $i_vooras, $i_tussenbak ) {
		$noemer = (float) $i_vooras * (float) $i_tussenbak;
		return $noemer > 0 ? (float) $i_eind * (float) $i_diff / $noemer : null;
	}

	/** Verhouding uit Fendt-notatie VA/HA (< 1). */
	public static function uit_fendt( $va_ha ) {
		return (float) $va_ha > 0 ? 1 / (float) $va_ha : null;
	}

	/** Verhouding uit meting: omwentelingen voorwiel bij een aantal omwentelingen achterwiel. */
	public static function uit_meting( $omw_voor, $omw_achter ) {
		return (float) $omw_achter > 0 ? (float) $omw_voor / (float) $omw_achter : null;
	}

	/** Zone voor een voorloop: rood, oranje, groen of optimaal. */
	public static function zone( $voorloop, $zones = null ) {
		$z = wp_parse_args( (array) $zones, self::ZONES );
		if ( null === $voorloop ) {
			return null;
		}
		if ( $voorloop < $z['min'] || $voorloop > $z['max'] ) {
			return 'rood';
		}
		if ( $voorloop < $z['groen_min'] || $voorloop > $z['groen_max'] ) {
			return 'oranje';
		}
		if ( $voorloop >= $z['opt_min'] && $voorloop <= $z['opt_max'] ) {
			return 'optimaal';
		}
		return 'groen';
	}

	/** Controleert of een zoneset oplopend en geldig is. Geeft een foutmelding of null. */
	public static function valideer_zones( $z ) {
		$volgorde = array( 'min', 'groen_min', 'opt_min', 'doel', 'opt_max', 'groen_max', 'max' );
		$vorige   = null;
		foreach ( $volgorde as $k ) {
			if ( ! isset( $z[ $k ] ) || ! is_numeric( $z[ $k ] ) ) {
				return sprintf( 'Waarde "%s" ontbreekt.', $k );
			}
			if ( null !== $vorige && (float) $z[ $k ] < $vorige ) {
				return 'De grenzen moeten van laag naar hoog oplopen.';
			}
			$vorige = (float) $z[ $k ];
		}
		return null;
	}
}
