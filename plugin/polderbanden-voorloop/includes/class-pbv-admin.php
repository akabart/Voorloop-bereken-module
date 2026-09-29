<?php
/**
 * Instellingenscherm in wp-admin: wachtwoorden, huisstijl, printgegevens, export en herimport.
 * De inhoudelijke instellingen (normzones, zichtbare velden) staan in het beheerdeel van de module zelf.
 */

defined( 'ABSPATH' ) || exit;

class PBV_Admin {

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_post_pbv_opslaan', array( __CLASS__, 'opslaan' ) );
		add_action( 'admin_post_pbv_export', array( __CLASS__, 'export' ) );
		add_action( 'admin_post_pbv_herimport', array( __CLASS__, 'herimport' ) );
		add_action( 'admin_notices', array( __CLASS__, 'melding' ) );
		add_filter( 'plugin_action_links_' . plugin_basename( PBV_BESTAND ), array( __CLASS__, 'links' ) );
	}

	public static function menu() {
		add_options_page( 'Voorloop-module', 'Voorloop-module', 'manage_options', 'pbv-instellingen', array( __CLASS__, 'pagina' ) );
	}

	public static function links( $links ) {
		array_unshift( $links, '<a href="' . esc_url( admin_url( 'options-general.php?page=pbv-instellingen' ) ) . '">Instellingen</a>' );
		return $links;
	}

	public static function melding() {
		if ( current_user_can( 'manage_options' ) && ! PBV_Toegang::is_ingesteld() ) {
			printf(
				'<div class="notice notice-warning"><p><strong>Voorloop-module:</strong> stel eerst een wachtwoord in via <a href="%s">Instellingen → Voorloop-module</a>.</p></div>',
				esc_url( admin_url( 'options-general.php?page=pbv-instellingen' ) )
			);
		}
	}

	public static function pagina() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$a       = PBV_Instellingen::alle();
		$pagina  = (int) $a['pagina_id'];
		$bericht = isset( $_GET['pbv'] ) ? sanitize_key( wp_unslash( $_GET['pbv'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
		?>
		<div class="wrap">
			<h1>Voorloop-module</h1>
			<?php if ( 'opgeslagen' === $bericht ) : ?>
				<div class="notice notice-success"><p>Instellingen opgeslagen.</p></div>
			<?php elseif ( 'herimport' === $bericht ) : ?>
				<div class="notice notice-success"><p>De startdata is opnieuw ingelezen.</p></div>
			<?php endif; ?>

			<p>
				De module staat op
				<?php if ( $pagina && get_post( $pagina ) ) : ?>
					<a href="<?php echo esc_url( get_permalink( $pagina ) ); ?>" target="_blank"><?php echo esc_html( get_permalink( $pagina ) ); ?></a>.
				<?php else : ?>
					een pagina met de shortcode <code>[polderbanden_voorloop]</code>.
				<?php endif; ?>
				De pagina wordt niet geïndexeerd door zoekmachines.
			</p>

			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="pbv_opslaan">
				<?php wp_nonce_field( 'pbv_opslaan' ); ?>
				<h2>Toegang</h2>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="pbv_ww_g">Wachtwoord medewerkers</label></th>
						<td>
							<input type="password" id="pbv_ww_g" name="wachtwoord_gebruiker" class="regular-text" autocomplete="new-password" placeholder="<?php echo $a['wachtwoord_gebruiker'] ? 'Ingesteld; leeg laten om te behouden' : 'Nog niet ingesteld'; ?>">
							<p class="description">Voor zoeken, rekenen, opslaan en printen.</p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="pbv_ww_b">Wachtwoord beheer</label></th>
						<td>
							<input type="password" id="pbv_ww_b" name="wachtwoord_beheer" class="regular-text" autocomplete="new-password" placeholder="<?php echo $a['wachtwoord_beheer'] ? 'Ingesteld; leeg laten om te behouden' : 'Nog niet ingesteld'; ?>">
							<p class="description">Geeft daarnaast toegang tot het beheerdeel: normzones, zichtbare velden, trekkers bewerken en de reviewlijst. Ingelogde WordPress-beheerders hebben altijd beheerrechten.</p>
						</td>
					</tr>
				</table>

				<h2>Huisstijl</h2>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="pbv_k1">Hoofdkleur</label></th>
						<td><input type="color" id="pbv_k1" name="kleur_primair" value="<?php echo esc_attr( $a['kleur_primair'] ); ?>"> <span class="description">Kopregels, knoppen en tekstaccenten.</span></td>
					</tr>
					<tr>
						<th scope="row"><label for="pbv_k2">Accentkleur</label></th>
						<td><input type="color" id="pbv_k2" name="kleur_accent" value="<?php echo esc_attr( $a['kleur_accent'] ); ?>"> <span class="description">Actieve elementen en markeringen.</span></td>
					</tr>
				</table>

				<h2>Print</h2>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="pbv_bn">Bedrijfsnaam</label></th>
						<td><input type="text" id="pbv_bn" name="bedrijfsnaam" class="regular-text" value="<?php echo esc_attr( $a['bedrijfsnaam'] ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="pbv_br">Regel onder de naam</label></th>
						<td><input type="text" id="pbv_br" name="bedrijfsregel" class="large-text" value="<?php echo esc_attr( $a['bedrijfsregel'] ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="pbv_logo">Logo (URL)</label></th>
						<td><input type="url" id="pbv_logo" name="logo_url" class="large-text" value="<?php echo esc_attr( $a['logo_url'] ); ?>">
							<p class="description">Bijvoorbeeld het adres van het logo in de mediabibliotheek.</p></td>
					</tr>
				</table>
				<?php submit_button( 'Opslaan' ); ?>
			</form>

			<h2>Data</h2>
			<p>
				<a class="button" href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=pbv_export' ), 'pbv_export' ) ); ?>">Exporteer alle uitvoeringen (CSV voor Excel)</a>
			</p>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" onsubmit="return confirm('Alle trekkerdata en de reviewlijst worden vervangen door de startdata uit de plugin. Wijzigingen die in de module zijn gedaan gaan verloren. Doorgaan?');">
				<input type="hidden" name="action" value="pbv_herimport">
				<?php wp_nonce_field( 'pbv_herimport' ); ?>
				<p><button class="button button-link-delete">Startdata opnieuw inlezen</button>
				<span class="description">Alleen nodig na een nieuwe migratie van de bronbestanden. Opgeslagen berekeningen en zelf ingevoerde banden blijven bewaard.</span></p>
			</form>
		</div>
		<?php
	}

	public static function opslaan() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Geen toegang.' );
		}
		check_admin_referer( 'pbv_opslaan' );
		$w = array(
			'kleur_primair' => sanitize_hex_color( wp_unslash( $_POST['kleur_primair'] ?? '' ) ) ?: '#1f2a2e',
			'kleur_accent'  => sanitize_hex_color( wp_unslash( $_POST['kleur_accent'] ?? '' ) ) ?: '#c10e1a',
			'bedrijfsnaam'  => sanitize_text_field( wp_unslash( $_POST['bedrijfsnaam'] ?? '' ) ),
			'bedrijfsregel' => sanitize_text_field( wp_unslash( $_POST['bedrijfsregel'] ?? '' ) ),
			'logo_url'      => esc_url_raw( wp_unslash( $_POST['logo_url'] ?? '' ) ),
		);
		foreach ( array( 'wachtwoord_gebruiker', 'wachtwoord_beheer' ) as $veld ) {
			$ww = (string) wp_unslash( $_POST[ $veld ] ?? '' ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			if ( '' !== $ww ) {
				$w[ $veld ] = wp_hash_password( $ww );
			}
		}
		PBV_Instellingen::bewaar( $w );
		wp_safe_redirect( admin_url( 'options-general.php?page=pbv-instellingen&pbv=opgeslagen' ) );
		exit;
	}

	public static function herimport() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Geen toegang.' );
		}
		check_admin_referer( 'pbv_herimport' );
		$r = PBV_Installatie::importeer_seed( true );
		if ( is_wp_error( $r ) ) {
			wp_die( esc_html( $r->get_error_message() ) );
		}
		wp_safe_redirect( admin_url( 'options-general.php?page=pbv-instellingen&pbv=herimport' ) );
		exit;
	}

	/** CSV-export (puntkomma, UTF-8 met BOM) zodat Excel het direct goed opent. */
	public static function export() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Geen toegang.' );
		}
		check_admin_referer( 'pbv_export' );
		global $wpdb;
		$rijen = $wpdb->get_results(
			'SELECT m.naam AS merk, s.naam AS serie, t.naam AS type, u.* FROM ' . PBV_Installatie::tabel( 'uitvoeringen' ) . ' u
			 JOIN ' . PBV_Installatie::tabel( 'types' ) . ' t ON t.id = u.type_id
			 JOIN ' . PBV_Installatie::tabel( 'series' ) . ' s ON s.id = t.serie_id
			 JOIN ' . PBV_Installatie::tabel( 'merken' ) . ' m ON m.id = s.merk_id
			 ORDER BY m.naam, s.naam, t.naam, u.id',
			ARRAY_A
		); // phpcs:ignore
		nocache_headers();
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename=voorloop-export-' . gmdate( 'Y-m-d' ) . '.csv' );
		$uit = fopen( 'php://output', 'w' );
		fwrite( $uit, "\xEF\xBB\xBF" );
		$kop = array( 'merk', 'serie', 'type', 'id', 'label', 'ratio', 'ratio_origineel', 'ratio_notatie', 'status', 'transmissie', 'snelheid', 'vooras', 'achteras', 'asklasse', 'chassis_van', 'chassis_tot', 'bouwjaar_van', 'bouwjaar_tot', 'regio', 'voorwaarde', 'opmerking' );
		foreach ( array( 'voor', 'achter' ) as $as ) {
			foreach ( PBV_Data::WIEL_VELDEN as $v ) {
				$kop[] = $as . '_' . $v;
			}
		}
		$kop[] = 'bron';
		fputcsv( $uit, $kop, ';' );
		foreach ( $rijen as $r ) {
			$regel = array();
			foreach ( array_slice( $kop, 0, 21 ) as $k ) {
				$waarde  = $r[ $k ] ?? '';
				$regel[] = 'ratio' === $k && '' !== (string) $waarde ? str_replace( '.', ',', (string) (float) $waarde ) : $waarde;
			}
			$wielen = json_decode( (string) $r['wielen'], true ) ?: array();
			foreach ( array( 'voor', 'achter' ) as $as ) {
				foreach ( PBV_Data::WIEL_VELDEN as $v ) {
					$regel[] = $wielen[ $as ][ $v ] ?? '';
				}
			}
			$bron    = json_decode( (string) $r['bron'], true ) ?: array();
			$regel[] = trim( ( $bron['bestand'] ?? '' ) . ' ' . ( $bron['blad'] ?? '' ) . ' ' . ( $bron['cel'] ?? '' ) );
			fputcsv( $uit, $regel, ';' );
		}
		fclose( $uit ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
		exit;
	}
}
