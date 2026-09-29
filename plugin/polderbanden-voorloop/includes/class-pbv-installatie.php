<?php
/**
 * Databasetabellen, eerste import van de startdata en aanmaken van de pagina.
 */

defined( 'ABSPATH' ) || exit;

class PBV_Installatie {

	public static function tabel( $naam ) {
		global $wpdb;
		return $wpdb->prefix . 'pbv_' . $naam;
	}

	public static function activeer() {
		self::maak_tabellen();
		if ( ! self::heeft_data() ) {
			self::importeer_seed();
		}
		self::maak_pagina();
		update_option( 'pbv_db_versie', PBV_DB_VERSIE, false );
	}

	public static function controleer_versie() {
		if ( get_option( 'pbv_db_versie' ) !== PBV_DB_VERSIE ) {
			self::maak_tabellen();
			update_option( 'pbv_db_versie', PBV_DB_VERSIE, false );
		}
	}

	public static function maak_tabellen() {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$c = $wpdb->get_charset_collate();

		$sql = array();
		$sql[] = 'CREATE TABLE ' . self::tabel( 'merken' ) . " (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			naam varchar(100) NOT NULL,
			notities longtext NULL,
			PRIMARY KEY  (id)
		) $c;";
		$sql[] = 'CREATE TABLE ' . self::tabel( 'series' ) . " (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			merk_id bigint(20) unsigned NOT NULL,
			naam varchar(150) NOT NULL,
			notities longtext NULL,
			PRIMARY KEY  (id),
			KEY merk_id (merk_id)
		) $c;";
		$sql[] = 'CREATE TABLE ' . self::tabel( 'types' ) . " (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			serie_id bigint(20) unsigned NOT NULL,
			naam varchar(150) NOT NULL,
			aliassen text NULL,
			PRIMARY KEY  (id),
			KEY serie_id (serie_id)
		) $c;";
		$sql[] = 'CREATE TABLE ' . self::tabel( 'uitvoeringen' ) . " (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			type_id bigint(20) unsigned NOT NULL,
			label varchar(255) NULL,
			transmissie varchar(100) NULL,
			snelheid smallint(5) NULL,
			vooras varchar(100) NULL,
			achteras varchar(100) NULL,
			asklasse varchar(50) NULL,
			chassis_van varchar(50) NULL,
			chassis_tot varchar(50) NULL,
			bouwjaar_van varchar(10) NULL,
			bouwjaar_tot varchar(10) NULL,
			regio varchar(50) NULL,
			voorwaarde varchar(255) NULL,
			ratio decimal(8,5) NULL,
			ratio_origineel varchar(100) NULL,
			ratio_notatie varchar(20) NULL,
			componenten longtext NULL,
			wielen longtext NULL,
			banden_std longtext NULL,
			extra longtext NULL,
			opmerking text NULL,
			bron longtext NULL,
			status varchar(20) NOT NULL DEFAULT 'bron',
			gewijzigd datetime NULL,
			PRIMARY KEY  (id),
			KEY type_id (type_id)
		) $c;";
		$sql[] = 'CREATE TABLE ' . self::tabel( 'banden' ) . " (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			merk varchar(100) NULL,
			profiel varchar(100) NULL,
			maat varchar(100) NOT NULL,
			afrolomtrek int(11) NOT NULL,
			bron varchar(255) NULL,
			aangemaakt datetime NULL,
			PRIMARY KEY  (id)
		) $c;";
		$sql[] = 'CREATE TABLE ' . self::tabel( 'berekeningen' ) . " (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			uitvoering_id bigint(20) unsigned NULL,
			trekker varchar(255) NULL,
			ratio decimal(8,5) NOT NULL,
			voor_band varchar(150) NULL,
			voor_rc int(11) NOT NULL,
			achter_band varchar(150) NULL,
			achter_rc int(11) NOT NULL,
			voorloop decimal(8,3) NOT NULL,
			zone varchar(20) NULL,
			klant varchar(150) NULL,
			referentie varchar(150) NULL,
			chassisnummer varchar(100) NULL,
			opmerking text NULL,
			aangemaakt datetime NULL,
			PRIMARY KEY  (id)
		) $c;";
		$sql[] = 'CREATE TABLE ' . self::tabel( 'review' ) . " (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			uitvoering_ids text NULL,
			soort varchar(30) NULL,
			merk varchar(100) NULL,
			type varchar(150) NULL,
			label varchar(255) NULL,
			bestand varchar(255) NULL,
			blad varchar(100) NULL,
			cel varchar(100) NULL,
			origineel text NULL,
			probleem text NULL,
			voorstel decimal(8,5) NULL,
			besluit varchar(20) NULL,
			toelichting text NULL,
			besloten_op datetime NULL,
			PRIMARY KEY  (id)
		) $c;";
		$sql[] = 'CREATE TABLE ' . self::tabel( 'log' ) . " (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			onderwerp varchar(50) NOT NULL,
			record_id bigint(20) unsigned NULL,
			omschrijving text NULL,
			rol varchar(20) NULL,
			oud longtext NULL,
			nieuw longtext NULL,
			tijd datetime NULL,
			PRIMARY KEY  (id)
		) $c;";
		foreach ( $sql as $q ) {
			dbDelta( $q );
		}
	}

	public static function heeft_data() {
		global $wpdb;
		$t = self::tabel( 'merken' );
		return (int) $wpdb->get_var( "SELECT COUNT(*) FROM $t" ) > 0; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	}

	/** Leest data/seed.json in. Wist bestaande trekkerdata alleen als $opnieuw true is. */
	public static function importeer_seed( $opnieuw = false ) {
		global $wpdb;
		$pad = PBV_MAP . 'data/seed.json';
		if ( ! file_exists( $pad ) ) {
			return new WP_Error( 'pbv_geen_seed', 'data/seed.json ontbreekt.' );
		}
		$data = json_decode( file_get_contents( $pad ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		if ( ! is_array( $data ) || empty( $data['merken'] ) ) {
			return new WP_Error( 'pbv_seed_ongeldig', 'data/seed.json is ongeldig.' );
		}
		if ( $opnieuw ) {
			foreach ( array( 'merken', 'series', 'types', 'uitvoeringen', 'review' ) as $t ) {
				$wpdb->query( 'DELETE FROM ' . self::tabel( $t ) ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
			}
			$wpdb->query( 'DELETE FROM ' . self::tabel( 'banden' ) . " WHERE bron NOT LIKE 'Ingevoerd%'" ); // phpcs:ignore
		}
		$nu       = current_time( 'mysql' );
		$ref_naar = array();
		$wpdb->query( 'START TRANSACTION' );
		foreach ( $data['merken'] as $merk ) {
			$wpdb->insert( self::tabel( 'merken' ), array(
				'naam'     => $merk['naam'],
				'notities' => wp_json_encode( $merk['notities'] ?? array() ),
			) );
			$merk_id = $wpdb->insert_id;
			foreach ( $merk['series'] as $serie ) {
				$wpdb->insert( self::tabel( 'series' ), array(
					'merk_id'  => $merk_id,
					'naam'     => $serie['naam'],
					'notities' => wp_json_encode( $serie['notities'] ?? array() ),
				) );
				$serie_id = $wpdb->insert_id;
				foreach ( $serie['types'] as $type ) {
					$wpdb->insert( self::tabel( 'types' ), array(
						'serie_id' => $serie_id,
						'naam'     => $type['naam'],
						'aliassen' => wp_json_encode( $type['aliassen'] ?? array() ),
					) );
					$type_id = $wpdb->insert_id;
					foreach ( $type['uitvoeringen'] as $u ) {
						$bron = $u['bron'] ?? array();
						if ( ! empty( $u['extra_bronnen'] ) ) {
							$bron['ook_in'] = $u['extra_bronnen'];
						}
						$wpdb->insert( self::tabel( 'uitvoeringen' ), array(
							'type_id'         => $type_id,
							'label'           => $u['label'] ?? null,
							'transmissie'     => $u['transmissie'] ?? null,
							'snelheid'        => $u['snelheid'] ?? null,
							'vooras'          => $u['vooras'] ?? null,
							'achteras'        => $u['achteras'] ?? null,
							'asklasse'        => $u['asklasse'] ?? null,
							'chassis_van'     => $u['chassis_van'] ?? null,
							'chassis_tot'     => $u['chassis_tot'] ?? null,
							'bouwjaar_van'    => $u['bouwjaar_van'] ?? null,
							'bouwjaar_tot'    => $u['bouwjaar_tot'] ?? null,
							'regio'           => $u['regio'] ?? null,
							'voorwaarde'      => $u['voorwaarde'] ?? null,
							'ratio'           => $u['ratio'] ?? null,
							'ratio_origineel' => $u['ratio_origineel'] ?? null,
							'ratio_notatie'   => $u['ratio_notatie'] ?? null,
							'componenten'     => wp_json_encode( $u['componenten'] ?? new stdClass() ),
							'wielen'          => wp_json_encode( $u['wielen'] ?? new stdClass() ),
							'banden_std'      => wp_json_encode( $u['banden_std'] ?? new stdClass() ),
							'extra'           => wp_json_encode( $u['extra'] ?? new stdClass() ),
							'opmerking'       => $u['opmerking'] ?? null,
							'bron'            => wp_json_encode( $bron ),
							'status'          => $u['status'] ?? 'bron',
							'gewijzigd'       => $nu,
						) );
						$ref_naar[ $u['ref'] ] = $wpdb->insert_id;
					}
				}
			}
		}
		foreach ( $data['review'] ?? array() as $r ) {
			$ids = array();
			foreach ( $r['refs'] ?? array() as $ref ) {
				if ( isset( $ref_naar[ $ref ] ) ) {
					$ids[] = $ref_naar[ $ref ];
				}
			}
			$wpdb->insert( self::tabel( 'review' ), array(
				'uitvoering_ids' => implode( ',', array_unique( $ids ) ),
				'soort'          => $r['soort'] ?? 'overig',
				'merk'           => $r['merk'] ?? null,
				'type'           => $r['type'] ?? null,
				'label'          => $r['label'] ?? null,
				'bestand'        => $r['bestand'] ?? null,
				'blad'           => $r['blad'] ?? null,
				'cel'            => $r['cel'] ?? null,
				'origineel'      => isset( $r['origineel'] ) ? (string) $r['origineel'] : null,
				'probleem'       => $r['probleem'] ?? null,
				'voorstel'       => $r['voorstel'] ?? null,
			) );
		}
		foreach ( $data['banden'] ?? array() as $b ) {
			$wpdb->insert( self::tabel( 'banden' ), array(
				'merk'        => $b['merk'],
				'profiel'     => $b['profiel'],
				'maat'        => $b['maat'],
				'afrolomtrek' => (int) $b['afrolomtrek'],
				'bron'        => $b['bron'],
				'aangemaakt'  => $nu,
			) );
		}
		$wpdb->query( 'COMMIT' );
		PBV_Data::log( 'import', null, 'Startdata ingelezen uit data/seed.json', null, null );
		return true;
	}

	/** Maakt een (niet-geïndexeerde) pagina met de shortcode, als die nog niet bestaat. */
	public static function maak_pagina() {
		$id = (int) PBV_Instellingen::get( 'pagina_id' );
		if ( $id && get_post( $id ) ) {
			return $id;
		}
		$id = wp_insert_post( array(
			'post_title'   => 'Voorloop',
			'post_name'    => 'voorloop',
			'post_status'  => 'publish',
			'post_type'    => 'page',
			'post_content' => '<!-- wp:shortcode -->[polderbanden_voorloop]<!-- /wp:shortcode -->',
		) );
		if ( $id && ! is_wp_error( $id ) ) {
			PBV_Instellingen::bewaar( array( 'pagina_id' => (int) $id ) );
		}
		return $id;
	}
}
