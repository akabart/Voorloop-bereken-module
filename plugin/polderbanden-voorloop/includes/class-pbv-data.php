<?php
/**
 * Lezen en schrijven van trekkers, banden, berekeningen, reviewlijst en wijzigingslog.
 */

defined( 'ABSPATH' ) || exit;

class PBV_Data {

	const JSON_VELDEN   = array( 'componenten', 'wielen', 'banden_std', 'extra', 'bron' );
	const TEKST_VELDEN  = array( 'label', 'transmissie', 'vooras', 'achteras', 'asklasse', 'chassis_van', 'chassis_tot',
		'bouwjaar_van', 'bouwjaar_tot', 'regio', 'voorwaarde', 'opmerking' );
	const WIEL_VELDEN   = array( 'flensmaat', 'steekcirkel', 'bouten', 'draad', 'boutgat', 'naafgat', 'boutzitting', 'aanhaalmoment', 'spacer' );
	const STATUSSEN     = array( 'bron', 'twijfel', 'gecontroleerd' );

	private static function t( $naam ) {
		return PBV_Installatie::tabel( $naam );
	}

	// ------------------------------------------------------------------
	// Boom (navigatie + zoekindex)
	// ------------------------------------------------------------------

	public static function boom() {
		global $wpdb;
		$merken = $wpdb->get_results( 'SELECT id, naam FROM ' . self::t( 'merken' ) . ' ORDER BY naam', ARRAY_A ); // phpcs:ignore
		$series = $wpdb->get_results( 'SELECT id, merk_id, naam FROM ' . self::t( 'series' ) . ' ORDER BY naam', ARRAY_A ); // phpcs:ignore
		$types  = $wpdb->get_results( 'SELECT id, serie_id, naam, aliassen FROM ' . self::t( 'types' ) . ' ORDER BY naam', ARRAY_A ); // phpcs:ignore
		$uitv   = $wpdb->get_results( 'SELECT type_id, chassis_van, ratio, status FROM ' . self::t( 'uitvoeringen' ), ARRAY_A ); // phpcs:ignore

		$per_type = array();
		foreach ( $uitv as $u ) {
			$tid = (int) $u['type_id'];
			if ( ! isset( $per_type[ $tid ] ) ) {
				$per_type[ $tid ] = array( 'n' => 0, 'chassis' => array(), 'twijfel' => 0 );
			}
			$per_type[ $tid ]['n']++;
			if ( 'twijfel' === $u['status'] ) {
				$per_type[ $tid ]['twijfel']++;
			}
			$prefix = self::chassis_prefix( $u['chassis_van'] );
			if ( $prefix && ! in_array( $prefix, $per_type[ $tid ]['chassis'], true ) ) {
				$per_type[ $tid ]['chassis'][] = $prefix;
			}
		}
		$types_per_serie = array();
		foreach ( $types as $t ) {
			$extra = $per_type[ (int) $t['id'] ] ?? array( 'n' => 0, 'chassis' => array(), 'twijfel' => 0 );
			$types_per_serie[ (int) $t['serie_id'] ][] = array(
				'id'       => (int) $t['id'],
				'naam'     => $t['naam'],
				'aliassen' => json_decode( (string) $t['aliassen'], true ) ?: array(),
				'n'        => $extra['n'],
				'twijfel'  => $extra['twijfel'],
				'chassis'  => $extra['chassis'],
			);
		}
		$series_per_merk = array();
		foreach ( $series as $s ) {
			$series_per_merk[ (int) $s['merk_id'] ][] = array(
				'id'    => (int) $s['id'],
				'naam'  => $s['naam'],
				'types' => $types_per_serie[ (int) $s['id'] ] ?? array(),
			);
		}
		$uit = array();
		foreach ( $merken as $m ) {
			$uit[] = array(
				'id'     => (int) $m['id'],
				'naam'   => $m['naam'],
				'series' => $series_per_merk[ (int) $m['id'] ] ?? array(),
			);
		}
		return $uit;
	}

	/** '737/21/0001' -> '737/21'; '765' -> '765'. */
	public static function chassis_prefix( $chassis ) {
		$chassis = trim( (string) $chassis );
		if ( '' === $chassis ) {
			return null;
		}
		$delen = explode( '/', $chassis );
		return count( $delen ) >= 3 ? $delen[0] . '/' . $delen[1] : $delen[0];
	}

	// ------------------------------------------------------------------
	// Type met uitvoeringen
	// ------------------------------------------------------------------

	public static function type( $id ) {
		global $wpdb;
		$type = $wpdb->get_row( $wpdb->prepare(
			'SELECT t.id, t.naam, t.aliassen, s.id AS serie_id, s.naam AS serie, s.notities AS serie_notities,
			        m.id AS merk_id, m.naam AS merk, m.notities AS merk_notities
			 FROM ' . self::t( 'types' ) . ' t
			 JOIN ' . self::t( 'series' ) . ' s ON s.id = t.serie_id
			 JOIN ' . self::t( 'merken' ) . ' m ON m.id = s.merk_id
			 WHERE t.id = %d',
			$id
		), ARRAY_A ); // phpcs:ignore
		if ( ! $type ) {
			return null;
		}
		$rijen = $wpdb->get_results( $wpdb->prepare(
			'SELECT * FROM ' . self::t( 'uitvoeringen' ) . ' WHERE type_id = %d ORDER BY id',
			$id
		), ARRAY_A ); // phpcs:ignore
		$uitvoeringen = array_map( array( __CLASS__, 'uitvoering_uit_rij' ), $rijen );

		// open reviewpunten per uitvoering
		$ids = wp_list_pluck( $uitvoeringen, 'id' );
		if ( $ids ) {
			$review = self::review_voor_uitvoeringen( $ids );
			foreach ( $uitvoeringen as &$u ) {
				$u['review'] = $review[ $u['id'] ] ?? array();
			}
			unset( $u );
		}
		return array(
			'id'             => (int) $type['id'],
			'naam'           => $type['naam'],
			'aliassen'       => json_decode( (string) $type['aliassen'], true ) ?: array(),
			'serie_id'       => (int) $type['serie_id'],
			'serie'          => $type['serie'],
			'merk_id'        => (int) $type['merk_id'],
			'merk'           => $type['merk'],
			'notities'       => array_merge(
				json_decode( (string) $type['merk_notities'], true ) ?: array(),
				json_decode( (string) $type['serie_notities'], true ) ?: array()
			),
			'uitvoeringen'   => $uitvoeringen,
		);
	}

	public static function uitvoering_uit_rij( $r ) {
		foreach ( self::JSON_VELDEN as $v ) {
			$r[ $v ] = json_decode( (string) $r[ $v ], true ) ?: new stdClass();
		}
		$r['id']       = (int) $r['id'];
		$r['type_id']  = (int) $r['type_id'];
		$r['snelheid'] = null !== $r['snelheid'] ? (int) $r['snelheid'] : null;
		$r['ratio']    = null !== $r['ratio'] ? (float) $r['ratio'] : null;
		return $r;
	}

	private static function review_voor_uitvoeringen( $ids ) {
		global $wpdb;
		$rijen = $wpdb->get_results( 'SELECT id, uitvoering_ids, probleem, soort FROM ' . self::t( 'review' ) . ' WHERE besluit IS NULL', ARRAY_A ); // phpcs:ignore
		$uit   = array();
		foreach ( $rijen as $r ) {
			foreach ( array_filter( explode( ',', (string) $r['uitvoering_ids'] ) ) as $uid ) {
				if ( in_array( (int) $uid, $ids, true ) ) {
					$uit[ (int) $uid ][] = array( 'id' => (int) $r['id'], 'probleem' => $r['probleem'], 'soort' => $r['soort'] );
				}
			}
		}
		return $uit;
	}

	// ------------------------------------------------------------------
	// Beheer: types en uitvoeringen
	// ------------------------------------------------------------------

	/** Zoekt of maakt merk en serie op naam. Geeft serie_id. */
	public static function serie_id( $merk_naam, $serie_naam ) {
		global $wpdb;
		$merk_naam  = trim( sanitize_text_field( $merk_naam ) );
		$serie_naam = trim( sanitize_text_field( $serie_naam ) );
		if ( '' === $merk_naam || '' === $serie_naam ) {
			return new WP_Error( 'pbv_ongeldig', 'Merk en serie zijn verplicht.', array( 'status' => 400 ) );
		}
		$merk_id = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . self::t( 'merken' ) . ' WHERE naam = %s', $merk_naam ) ); // phpcs:ignore
		if ( ! $merk_id ) {
			$wpdb->insert( self::t( 'merken' ), array( 'naam' => $merk_naam, 'notities' => '[]' ) );
			$merk_id = (int) $wpdb->insert_id;
			self::log( 'merk', $merk_id, 'Merk aangemaakt: ' . $merk_naam, null, null );
		}
		$serie_id = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . self::t( 'series' ) . ' WHERE merk_id = %d AND naam = %s', $merk_id, $serie_naam ) ); // phpcs:ignore
		if ( ! $serie_id ) {
			$wpdb->insert( self::t( 'series' ), array( 'merk_id' => $merk_id, 'naam' => $serie_naam, 'notities' => '[]' ) );
			$serie_id = (int) $wpdb->insert_id;
			self::log( 'serie', $serie_id, 'Serie aangemaakt: ' . $merk_naam . ' › ' . $serie_naam, null, null );
		}
		return $serie_id;
	}

	/** Nieuw type (met eerste uitvoering) of bestaand type bijwerken. */
	public static function type_opslaan( $id, $invoer ) {
		global $wpdb;
		$naam     = trim( sanitize_text_field( $invoer['naam'] ?? '' ) );
		$aliassen = array_values( array_filter( array_map( 'trim', array_map( 'sanitize_text_field', (array) ( $invoer['aliassen'] ?? array() ) ) ) ) );
		if ( '' === $naam ) {
			return new WP_Error( 'pbv_ongeldig', 'Typenaam is verplicht.', array( 'status' => 400 ) );
		}
		$serie_id = self::serie_id( $invoer['merk'] ?? '', $invoer['serie'] ?? '' );
		if ( is_wp_error( $serie_id ) ) {
			return $serie_id;
		}
		$rij = array( 'naam' => $naam, 'aliassen' => wp_json_encode( $aliassen ), 'serie_id' => $serie_id );
		if ( $id ) {
			$oud = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::t( 'types' ) . ' WHERE id = %d', $id ), ARRAY_A ); // phpcs:ignore
			if ( ! $oud ) {
				return new WP_Error( 'pbv_niet_gevonden', 'Type niet gevonden.', array( 'status' => 404 ) );
			}
			$wpdb->update( self::t( 'types' ), $rij, array( 'id' => $id ) );
			self::log( 'type', $id, 'Type gewijzigd: ' . $naam, $oud, $rij );
			self::ruim_op();
			return $id;
		}
		$wpdb->insert( self::t( 'types' ), $rij );
		$id = (int) $wpdb->insert_id;
		self::log( 'type', $id, 'Type aangemaakt: ' . $naam, null, $rij );
		return $id;
	}

	/**
	 * Slaat een uitvoering op. De verhouding kan in vier notaties binnenkomen:
	 * notatie 'direct' (ratio), 'va_ha' (ratio_invoer < 1), 'componenten' (i_eind, i_diff, i_vooras, i_tussenbak)
	 * of 'gemeten' (omw_voor, omw_achter).
	 */
	public static function uitvoering_opslaan( $id, $invoer ) {
		global $wpdb;
		$rij = array();
		foreach ( self::TEKST_VELDEN as $v ) {
			if ( array_key_exists( $v, $invoer ) ) {
				$waarde    = 'opmerking' === $v ? sanitize_textarea_field( (string) $invoer[ $v ] ) : sanitize_text_field( (string) $invoer[ $v ] );
				$rij[ $v ] = '' === trim( $waarde ) ? null : trim( $waarde );
			}
		}
		if ( array_key_exists( 'snelheid', $invoer ) ) {
			$rij['snelheid'] = is_numeric( $invoer['snelheid'] ) ? (int) $invoer['snelheid'] : null;
		}
		if ( isset( $invoer['status'] ) && in_array( $invoer['status'], self::STATUSSEN, true ) ) {
			$rij['status'] = $invoer['status'];
		}
		if ( isset( $invoer['wielen'] ) && is_array( $invoer['wielen'] ) ) {
			$wielen = array();
			foreach ( array( 'voor', 'achter' ) as $as ) {
				foreach ( self::WIEL_VELDEN as $v ) {
					$w = trim( sanitize_text_field( (string) ( $invoer['wielen'][ $as ][ $v ] ?? '' ) ) );
					if ( '' !== $w ) {
						$wielen[ $as ][ $v ] = $w;
					}
				}
			}
			$rij['wielen'] = wp_json_encode( $wielen ?: new stdClass() );
		}
		if ( isset( $invoer['banden_std'] ) && is_array( $invoer['banden_std'] ) ) {
			$rij['banden_std'] = wp_json_encode( array(
				'voor'   => sanitize_text_field( (string) ( $invoer['banden_std']['voor'] ?? '' ) ) ?: null,
				'achter' => sanitize_text_field( (string) ( $invoer['banden_std']['achter'] ?? '' ) ) ?: null,
			) );
		}
		if ( array_key_exists( 'notatie', $invoer ) ) {
			$ratio = self::ratio_uit_invoer( $invoer );
			if ( is_wp_error( $ratio ) ) {
				return $ratio;
			}
			$rij['ratio']           = $ratio['ratio'];
			$rij['ratio_origineel'] = $ratio['origineel'];
			$rij['ratio_notatie']   = $ratio['notatie'];
			if ( ! empty( $ratio['componenten'] ) ) {
				$rij['componenten'] = wp_json_encode( $ratio['componenten'] );
			}
		}
		$rij['gewijzigd'] = current_time( 'mysql' );

		if ( $id ) {
			$oud = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::t( 'uitvoeringen' ) . ' WHERE id = %d', $id ), ARRAY_A ); // phpcs:ignore
			if ( ! $oud ) {
				return new WP_Error( 'pbv_niet_gevonden', 'Uitvoering niet gevonden.', array( 'status' => 404 ) );
			}
			$wpdb->update( self::t( 'uitvoeringen' ), $rij, array( 'id' => $id ) );
			$gewijzigd = array_diff_key( array_intersect_key( $oud, $rij ), array( 'gewijzigd' => 1 ) );
			self::log( 'uitvoering', $id, 'Uitvoering gewijzigd', $gewijzigd, array_diff_key( $rij, array( 'gewijzigd' => 1 ) ) );
			return $id;
		}
		$type_id = (int) ( $invoer['type_id'] ?? 0 );
		if ( ! $type_id ) {
			return new WP_Error( 'pbv_ongeldig', 'Type ontbreekt.', array( 'status' => 400 ) );
		}
		$rij['type_id'] = $type_id;
		$rij['status']  = $rij['status'] ?? 'gecontroleerd';
		$rij['bron']    = wp_json_encode( array( 'bestand' => 'Handmatig ingevoerd', 'blad' => null, 'cel' => null ) );
		foreach ( array( 'componenten', 'wielen', 'banden_std', 'extra' ) as $v ) {
			$rij[ $v ] = $rij[ $v ] ?? '{}';
		}
		$wpdb->insert( self::t( 'uitvoeringen' ), $rij );
		$id = (int) $wpdb->insert_id;
		self::log( 'uitvoering', $id, 'Uitvoering toegevoegd', null, $rij );
		return $id;
	}

	/** Rekent de ingevoerde verhouding om naar i (> 1). */
	public static function ratio_uit_invoer( $invoer ) {
		$notatie = sanitize_key( $invoer['notatie'] ?? 'direct' );
		$getal   = function ( $v ) {
			return is_numeric( str_replace( ',', '.', (string) $v ) ) ? (float) str_replace( ',', '.', (string) $v ) : null;
		};
		$comp  = null;
		switch ( $notatie ) {
			case 'va_ha':
				$w     = $getal( $invoer['ratio_invoer'] ?? null );
				$ratio = $w ? PBV_Reken::uit_fendt( $w ) : null;
				$orig  = (string) ( $invoer['ratio_invoer'] ?? '' );
				break;
			case 'componenten':
				$c     = array_map( $getal, array( $invoer['i_eind'] ?? null, $invoer['i_diff'] ?? null, $invoer['i_vooras'] ?? null, $invoer['i_tussenbak'] ?? null ) );
				$ratio = in_array( null, $c, true ) ? null : PBV_Reken::uit_componenten( $c[0], $c[1], $c[2], $c[3] );
				$orig  = implode( ' / ', array_map( 'strval', $c ) );
				$comp  = array( 'eindreductie achter' => $c[0], 'differentieel achter' => $c[1], 'vooras' => $c[2], 'tussenbak' => $c[3] );
				break;
			case 'gemeten':
				$v     = $getal( $invoer['omw_voor'] ?? null );
				$a     = $getal( $invoer['omw_achter'] ?? null );
				$ratio = ( $v && $a ) ? PBV_Reken::uit_meting( $v, $a ) : null;
				$orig  = sprintf( '%s omw. voor bij %s omw. achter', $v, $a );
				break;
			case 'geen':
				return array( 'ratio' => null, 'origineel' => null, 'notatie' => null );
			default:
				$notatie = 'direct';
				$ratio   = $getal( $invoer['ratio_invoer'] ?? ( $invoer['ratio'] ?? null ) );
				$orig    = (string) ( $invoer['ratio_invoer'] ?? ( $invoer['ratio'] ?? '' ) );
		}
		if ( ! $ratio || $ratio < 0.5 || $ratio > 3 ) {
			return new WP_Error( 'pbv_ratio', 'De overbrengingsverhouding is ongeldig.', array( 'status' => 400 ) );
		}
		return array( 'ratio' => round( $ratio, 5 ), 'origineel' => $orig, 'notatie' => $notatie, 'componenten' => $comp );
	}

	public static function uitvoering_verwijderen( $id ) {
		global $wpdb;
		$oud = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::t( 'uitvoeringen' ) . ' WHERE id = %d', $id ), ARRAY_A ); // phpcs:ignore
		if ( ! $oud ) {
			return new WP_Error( 'pbv_niet_gevonden', 'Uitvoering niet gevonden.', array( 'status' => 404 ) );
		}
		$wpdb->delete( self::t( 'uitvoeringen' ), array( 'id' => $id ) );
		self::log( 'uitvoering', $id, 'Uitvoering verwijderd', $oud, null );
		self::ruim_op();
		return true;
	}

	/** Verwijdert lege types, series en merken. */
	public static function ruim_op() {
		global $wpdb;
		$wpdb->query( 'DELETE FROM ' . self::t( 'types' ) . ' WHERE id NOT IN (SELECT type_id FROM ' . self::t( 'uitvoeringen' ) . ')' ); // phpcs:ignore
		$wpdb->query( 'DELETE FROM ' . self::t( 'series' ) . ' WHERE id NOT IN (SELECT serie_id FROM ' . self::t( 'types' ) . ')' ); // phpcs:ignore
		$wpdb->query( 'DELETE FROM ' . self::t( 'merken' ) . ' WHERE id NOT IN (SELECT merk_id FROM ' . self::t( 'series' ) . ')' ); // phpcs:ignore
	}

	// ------------------------------------------------------------------
	// Reviewlijst
	// ------------------------------------------------------------------

	public static function review_lijst( $open = true ) {
		global $wpdb;
		$waar  = $open ? 'WHERE besluit IS NULL' : 'WHERE besluit IS NOT NULL';
		$rijen = $wpdb->get_results( 'SELECT * FROM ' . self::t( 'review' ) . " $waar ORDER BY id", ARRAY_A ); // phpcs:ignore
		$type_van = array();
		$uids     = array();
		foreach ( $rijen as $r ) {
			$uids = array_merge( $uids, array_map( 'intval', array_filter( explode( ',', (string) $r['uitvoering_ids'] ) ) ) );
		}
		if ( $uids ) {
			$lijst = implode( ',', array_map( 'intval', array_unique( $uids ) ) );
			foreach ( $wpdb->get_results( 'SELECT id, type_id, ratio FROM ' . self::t( 'uitvoeringen' ) . " WHERE id IN ($lijst)", ARRAY_A ) as $u ) { // phpcs:ignore
				$type_van[ (int) $u['id'] ] = array( 'type_id' => (int) $u['type_id'], 'ratio' => null !== $u['ratio'] ? (float) $u['ratio'] : null );
			}
		}
		foreach ( $rijen as &$r ) {
			$ids                 = array_map( 'intval', array_filter( explode( ',', (string) $r['uitvoering_ids'] ) ) );
			$r['id']             = (int) $r['id'];
			$r['uitvoering_ids'] = $ids;
			$r['voorstel']       = null !== $r['voorstel'] ? (float) $r['voorstel'] : null;
			$r['type_id']        = $ids && isset( $type_van[ $ids[0] ] ) ? $type_van[ $ids[0] ]['type_id'] : null;
			$r['huidige_ratio']  = $ids && isset( $type_van[ $ids[0] ] ) ? $type_van[ $ids[0] ]['ratio'] : null;
		}
		return $rijen;
	}

	/**
	 * Besluit over een reviewpunt: 'goedgekeurd' (voorstel klopt), 'aangepast' (andere verhouding),
	 * 'afgewezen' (verhouding onbruikbaar; wordt leeggemaakt) of 'gezien' (algemene opmerking).
	 */
	public static function review_besluit( $id, $besluit, $ratio = null, $toelichting = '' ) {
		global $wpdb;
		$r = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::t( 'review' ) . ' WHERE id = %d', $id ), ARRAY_A ); // phpcs:ignore
		if ( ! $r ) {
			return new WP_Error( 'pbv_niet_gevonden', 'Reviewpunt niet gevonden.', array( 'status' => 404 ) );
		}
		if ( ! in_array( $besluit, array( 'goedgekeurd', 'aangepast', 'afgewezen', 'gezien' ), true ) ) {
			return new WP_Error( 'pbv_ongeldig', 'Onbekend besluit.', array( 'status' => 400 ) );
		}
		$ids = array_map( 'intval', array_filter( explode( ',', (string) $r['uitvoering_ids'] ) ) );
		foreach ( $ids as $uid ) {
			$data = array( 'status' => 'gecontroleerd', 'gewijzigd' => current_time( 'mysql' ) );
			if ( 'aangepast' === $besluit ) {
				$ratio = (float) str_replace( ',', '.', (string) $ratio );
				if ( $ratio < 0.5 || $ratio > 3 ) {
					return new WP_Error( 'pbv_ratio', 'De verhouding is ongeldig.', array( 'status' => 400 ) );
				}
				$data['ratio'] = round( $ratio, 5 );
			} elseif ( 'afgewezen' === $besluit ) {
				$data['ratio']  = null;
				$data['status'] = 'twijfel';
			}
			$wpdb->update( self::t( 'uitvoeringen' ), $data, array( 'id' => $uid ) );
		}
		$wpdb->update( self::t( 'review' ), array(
			'besluit'     => $besluit,
			'toelichting' => sanitize_textarea_field( (string) $toelichting ),
			'besloten_op' => current_time( 'mysql' ),
		), array( 'id' => $id ) );
		self::log( 'review', $id, 'Reviewpunt ' . $besluit . ': ' . $r['merk'] . ' ' . $r['type'], null, array( 'ratio' => $ratio ) );
		return true;
	}

	/** Keurt alle open punten van één soort goed (bijv. alle ontbrekende decimaaltekens). */
	public static function review_bulk( $soort ) {
		$n = 0;
		foreach ( self::review_lijst( true ) as $r ) {
			if ( $r['soort'] === $soort ) {
				if ( true === self::review_besluit( $r['id'], 'goedgekeurd', null, 'In één keer goedgekeurd (' . $soort . ')' ) ) {
					$n++;
				}
			}
		}
		return $n;
	}

	// ------------------------------------------------------------------
	// Banden
	// ------------------------------------------------------------------

	public static function banden() {
		global $wpdb;
		$rijen = $wpdb->get_results( 'SELECT id, merk, profiel, maat, afrolomtrek, bron FROM ' . self::t( 'banden' ) . ' ORDER BY maat, merk, profiel', ARRAY_A ); // phpcs:ignore
		foreach ( $rijen as &$r ) {
			$r['id']          = (int) $r['id'];
			$r['afrolomtrek'] = (int) $r['afrolomtrek'];
		}
		return $rijen;
	}

	public static function band_opslaan( $invoer ) {
		global $wpdb;
		$maat = trim( sanitize_text_field( (string) ( $invoer['maat'] ?? '' ) ) );
		$rc   = (int) ( $invoer['afrolomtrek'] ?? 0 );
		if ( '' === $maat || $rc < 1000 || $rc > 10000 ) {
			return new WP_Error( 'pbv_ongeldig', 'Maat en een afrolomtrek tussen 1000 en 10000 mm zijn verplicht.', array( 'status' => 400 ) );
		}
		$merk    = trim( sanitize_text_field( (string) ( $invoer['merk'] ?? '' ) ) );
		$profiel = trim( sanitize_text_field( (string) ( $invoer['profiel'] ?? '' ) ) );
		$bestaat = $wpdb->get_var( $wpdb->prepare(
			'SELECT id FROM ' . self::t( 'banden' ) . ' WHERE maat = %s AND merk = %s AND profiel = %s AND afrolomtrek = %d',
			$maat, $merk, $profiel, $rc
		) ); // phpcs:ignore
		if ( $bestaat ) {
			return (int) $bestaat;
		}
		$wpdb->insert( self::t( 'banden' ), array(
			'merk'        => $merk,
			'profiel'     => $profiel,
			'maat'        => $maat,
			'afrolomtrek' => $rc,
			'bron'        => sanitize_text_field( (string) ( $invoer['bron'] ?? 'Ingevoerd in de module' ) ),
			'aangemaakt'  => current_time( 'mysql' ),
		) );
		$id = (int) $wpdb->insert_id;
		self::log( 'band', $id, 'Band toegevoegd: ' . trim( "$maat $merk $profiel" ) . " ($rc mm)", null, null );
		return $id;
	}

	/**
	 * Importeert banden uit een CSV (al gelezen en gecontroleerd in de browser).
	 * Bestaat dezelfde maat + merk + profiel al met één afrolomtrek, dan wordt die bijgewerkt;
	 * anders wordt de band toegevoegd. Geeft tellingen terug.
	 */
	public static function banden_importeren( array $rijen, $bestand ) {
		global $wpdb;
		if ( count( $rijen ) > 5000 ) {
			return new WP_Error( 'pbv_ongeldig', 'Maximaal 5000 banden per import.', array( 'status' => 400 ) );
		}
		$tabel   = self::t( 'banden' );
		$telling = array( 'nieuw' => 0, 'bijgewerkt' => 0, 'ongewijzigd' => 0, 'fout' => 0 );
		$gezien  = array();
		$nu      = current_time( 'mysql' );
		foreach ( $rijen as $rij ) {
			$maat    = trim( sanitize_text_field( (string) ( $rij['maat'] ?? '' ) ) );
			$merk    = trim( sanitize_text_field( (string) ( $rij['merk'] ?? '' ) ) );
			$profiel = trim( sanitize_text_field( (string) ( $rij['profiel'] ?? '' ) ) );
			$rc      = (int) round( (float) str_replace( ',', '.', (string) ( $rij['afrolomtrek'] ?? 0 ) ) );
			if ( '' === $maat || $rc < 1000 || $rc > 10000 ) {
				$telling['fout']++;
				continue;
			}
			$bron = 'Import: ' . sanitize_text_field( (string) ( $rij['bron'] ?? '' ) ?: $bestand );
			$bron = mb_substr( $bron, 0, 250 );
			$sleutel = strtolower( "$maat|$merk|$profiel" );
			$bestaand = $wpdb->get_results( $wpdb->prepare(
				"SELECT id, afrolomtrek FROM $tabel WHERE maat = %s AND merk = %s AND profiel = %s", // phpcs:ignore
				$maat, $merk, $profiel
			), ARRAY_A );
			$zelfde = array_filter( $bestaand, function ( $b ) use ( $rc ) { return (int) $b['afrolomtrek'] === $rc; } );
			if ( $zelfde ) {
				$telling['ongewijzigd']++;
			} elseif ( 1 === count( $bestaand ) && ! isset( $gezien[ $sleutel ] ) ) {
				// Eén bestaande waarde en de eerste keer in deze import: bijwerken.
				$wpdb->update( $tabel, array( 'afrolomtrek' => $rc, 'bron' => $bron ), array( 'id' => $bestaand[0]['id'] ) );
				self::log( 'band', (int) $bestaand[0]['id'], "Band bijgewerkt via import: $maat $merk $profiel", array( 'afrolomtrek' => (int) $bestaand[0]['afrolomtrek'] ), array( 'afrolomtrek' => $rc ) );
				$telling['bijgewerkt']++;
			} else {
				$wpdb->insert( $tabel, array(
					'merk' => $merk, 'profiel' => $profiel, 'maat' => $maat, 'afrolomtrek' => $rc, 'bron' => $bron, 'aangemaakt' => $nu,
				) );
				$telling['nieuw']++;
			}
			$gezien[ $sleutel ] = true;
		}
		self::log( 'band', 0, sprintf( 'Banden geïmporteerd uit %s: %d nieuw, %d bijgewerkt, %d ongewijzigd, %d fout',
			$bestand ?: 'CSV', $telling['nieuw'], $telling['bijgewerkt'], $telling['ongewijzigd'], $telling['fout'] ), null, null );
		return $telling;
	}

	public static function band_verwijderen( $id ) {
		global $wpdb;
		$oud = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::t( 'banden' ) . ' WHERE id = %d', $id ), ARRAY_A ); // phpcs:ignore
		$wpdb->delete( self::t( 'banden' ), array( 'id' => $id ) );
		self::log( 'band', $id, 'Band verwijderd', $oud, null );
		return true;
	}

	// ------------------------------------------------------------------
	// Berekeningen
	// ------------------------------------------------------------------

	public static function berekening_opslaan( $invoer ) {
		global $wpdb;
		$ratio = (float) str_replace( ',', '.', (string) ( $invoer['ratio'] ?? 0 ) );
		$uv    = (int) ( $invoer['voor_rc'] ?? 0 );
		$ua    = (int) ( $invoer['achter_rc'] ?? 0 );
		$v     = PBV_Reken::voorloop( $ratio, $uv, $ua );
		if ( null === $v || $ratio < 0.5 || $ratio > 3 ) {
			return new WP_Error( 'pbv_ongeldig', 'Onvolledige berekening.', array( 'status' => 400 ) );
		}
		$uitvoering_id = (int) ( $invoer['uitvoering_id'] ?? 0 ) ?: null;
		$zones         = self::zones_voor_uitvoering( $uitvoering_id );
		$wpdb->insert( self::t( 'berekeningen' ), array(
			'uitvoering_id' => $uitvoering_id,
			'trekker'       => sanitize_text_field( (string) ( $invoer['trekker'] ?? '' ) ),
			'ratio'         => round( $ratio, 5 ),
			'voor_band'     => sanitize_text_field( (string) ( $invoer['voor_band'] ?? '' ) ),
			'voor_rc'       => $uv,
			'achter_band'   => sanitize_text_field( (string) ( $invoer['achter_band'] ?? '' ) ),
			'achter_rc'     => $ua,
			'voorloop'      => round( $v, 3 ),
			'zone'          => PBV_Reken::zone( $v, $zones ),
			'klant'         => sanitize_text_field( (string) ( $invoer['klant'] ?? '' ) ),
			'referentie'    => sanitize_text_field( (string) ( $invoer['referentie'] ?? '' ) ),
			'chassisnummer' => sanitize_text_field( (string) ( $invoer['chassisnummer'] ?? '' ) ),
			'opmerking'     => sanitize_textarea_field( (string) ( $invoer['opmerking'] ?? '' ) ),
			'aangemaakt'    => current_time( 'mysql' ),
		) );
		return (int) $wpdb->insert_id;
	}

	public static function berekeningen( $zoek = '' ) {
		global $wpdb;
		$t = self::t( 'berekeningen' );
		if ( '' !== $zoek ) {
			$like  = '%' . $wpdb->esc_like( $zoek ) . '%';
			$rijen = $wpdb->get_results( $wpdb->prepare(
				"SELECT * FROM $t WHERE klant LIKE %s OR referentie LIKE %s OR trekker LIKE %s OR chassisnummer LIKE %s OR voor_band LIKE %s OR achter_band LIKE %s ORDER BY id DESC LIMIT 200",
				$like, $like, $like, $like, $like, $like
			), ARRAY_A ); // phpcs:ignore
		} else {
			$rijen = $wpdb->get_results( "SELECT * FROM $t ORDER BY id DESC LIMIT 200", ARRAY_A ); // phpcs:ignore
		}
		return array_map( array( __CLASS__, 'berekening_uit_rij' ), $rijen );
	}

	public static function berekening( $id ) {
		global $wpdb;
		$r = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::t( 'berekeningen' ) . ' WHERE id = %d', $id ), ARRAY_A ); // phpcs:ignore
		return $r ? self::berekening_uit_rij( $r ) : null;
	}

	private static function berekening_uit_rij( $r ) {
		global $wpdb;
		$r['type_id'] = $r['uitvoering_id'] ? (int) $wpdb->get_var( $wpdb->prepare( 'SELECT type_id FROM ' . self::t( 'uitvoeringen' ) . ' WHERE id = %d', $r['uitvoering_id'] ) ) : null; // phpcs:ignore
		$r['id']            = (int) $r['id'];
		$r['uitvoering_id'] = $r['uitvoering_id'] ? (int) $r['uitvoering_id'] : null;
		$r['ratio']         = (float) $r['ratio'];
		$r['voor_rc']       = (int) $r['voor_rc'];
		$r['achter_rc']     = (int) $r['achter_rc'];
		$r['voorloop']      = (float) $r['voorloop'];
		return $r;
	}

	public static function berekening_verwijderen( $id ) {
		global $wpdb;
		$wpdb->delete( self::t( 'berekeningen' ), array( 'id' => $id ) );
		return true;
	}

	/** Zones die voor een uitvoering gelden: per merk als ingesteld, anders standaard. */
	public static function zones_voor_uitvoering( $uitvoering_id ) {
		global $wpdb;
		$alle = PBV_Instellingen::alle();
		if ( $uitvoering_id ) {
			$merk_id = (int) $wpdb->get_var( $wpdb->prepare(
				'SELECT s.merk_id FROM ' . self::t( 'uitvoeringen' ) . ' u JOIN ' . self::t( 'types' ) . ' t ON t.id = u.type_id JOIN ' . self::t( 'series' ) . ' s ON s.id = t.serie_id WHERE u.id = %d',
				$uitvoering_id
			) ); // phpcs:ignore
			if ( $merk_id && ! empty( $alle['zones_per_merk'][ $merk_id ] ) ) {
				return $alle['zones_per_merk'][ $merk_id ];
			}
		}
		return $alle['zones'];
	}

	// ------------------------------------------------------------------
	// Wijzigingslog
	// ------------------------------------------------------------------

	public static function log( $onderwerp, $record_id, $omschrijving, $oud, $nieuw ) {
		global $wpdb;
		$wpdb->insert( self::t( 'log' ), array(
			'onderwerp'    => $onderwerp,
			'record_id'    => $record_id,
			'omschrijving' => $omschrijving,
			'rol'          => PBV_Toegang::rol() ?: 'systeem',
			'oud'          => null === $oud ? null : wp_json_encode( $oud ),
			'nieuw'        => null === $nieuw ? null : wp_json_encode( $nieuw ),
			'tijd'         => current_time( 'mysql' ),
		) );
	}

	public static function log_lijst() {
		global $wpdb;
		return $wpdb->get_results( 'SELECT id, onderwerp, record_id, omschrijving, rol, oud, nieuw, tijd FROM ' . self::t( 'log' ) . ' ORDER BY id DESC LIMIT 300', ARRAY_A ); // phpcs:ignore
	}
}
