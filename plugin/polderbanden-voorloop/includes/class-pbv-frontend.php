<?php
/**
 * Shortcode [polderbanden_voorloop], scripts en noindex.
 */

defined( 'ABSPATH' ) || exit;

class PBV_Frontend {

	public static function init() {
		add_shortcode( 'polderbanden_voorloop', array( __CLASS__, 'shortcode' ) );
		add_filter( 'wp_robots', array( __CLASS__, 'robots' ) );
		add_action( 'template_redirect', array( __CLASS__, 'geen_cache' ) );
	}

	private static function is_module_pagina() {
		if ( ! is_singular() ) {
			return false;
		}
		$post = get_post();
		return $post && ( (int) $post->ID === (int) PBV_Instellingen::get( 'pagina_id' ) || has_shortcode( $post->post_content, 'polderbanden_voorloop' ) );
	}

	public static function robots( $robots ) {
		if ( self::is_module_pagina() ) {
			$robots['noindex']  = true;
			$robots['nofollow'] = true;
			$robots['noarchive'] = true;
		}
		return $robots;
	}

	public static function geen_cache() {
		if ( self::is_module_pagina() ) {
			nocache_headers();
			header( 'X-Robots-Tag: noindex, nofollow', true );
			if ( ! defined( 'DONOTCACHEPAGE' ) ) {
				define( 'DONOTCACHEPAGE', true ); // gangbare cacheplugins slaan deze pagina dan over
			}
		}
	}

	public static function shortcode() {
		$versie = PBV_VERSIE . '.' . filemtime( PBV_MAP . 'assets/app.js' );
		wp_enqueue_style( 'pbv-app', PBV_URL . 'assets/app.css', array(), $versie );
		wp_enqueue_script( 'pbv-rekenkern', PBV_URL . 'assets/rekenkern.js', array(), $versie, true );
		wp_enqueue_script( 'pbv-app', PBV_URL . 'assets/app.js', array( 'pbv-rekenkern' ), $versie, true );
		wp_localize_script( 'pbv-app', 'PBV_CONFIG', array(
			'rest'  => esc_url_raw( rest_url( PBV_Rest::NS ) ),
			'nonce' => is_user_logged_in() ? wp_create_nonce( 'wp_rest' ) : '',
		) );
		$primair = sanitize_hex_color( PBV_Instellingen::get( 'kleur_primair' ) ) ?: '#1f2a2e';
		$accent  = sanitize_hex_color( PBV_Instellingen::get( 'kleur_accent' ) ) ?: '#c10e1a';
		return sprintf(
			'<div id="pbv-app" class="pbv" style="--pbv-primair:%1$s;--pbv-accent:%2$s"><noscript>Deze module heeft JavaScript nodig.</noscript><div class="pbv-laden">Laden…</div></div>',
			esc_attr( $primair ),
			esc_attr( $accent )
		);
	}
}
