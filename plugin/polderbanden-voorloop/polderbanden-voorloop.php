<?php
/**
 * Plugin Name:       Polderbanden Voorloop
 * Description:       Interne module voor het opzoeken van overbrengingsverhoudingen van trekkers en het berekenen van de voorloop bij een bandencombinatie. Plaats de shortcode [polderbanden_voorloop] op een pagina.
 * Version:           1.1.2
 * Requires at least: 6.0
 * Requires PHP:      8.0
 * Author:            Polderbanden.nl
 * Text Domain:       polderbanden-voorloop
 */

defined( 'ABSPATH' ) || exit;

define( 'PBV_VERSIE', '1.1.2' );
define( 'PBV_DB_VERSIE', '1' );
define( 'PBV_BESTAND', __FILE__ );
define( 'PBV_MAP', plugin_dir_path( __FILE__ ) );
define( 'PBV_URL', plugin_dir_url( __FILE__ ) );

require_once PBV_MAP . 'includes/class-pbv-reken.php';
require_once PBV_MAP . 'includes/class-pbv-instellingen.php';
require_once PBV_MAP . 'includes/class-pbv-installatie.php';
require_once PBV_MAP . 'includes/class-pbv-toegang.php';
require_once PBV_MAP . 'includes/class-pbv-data.php';
require_once PBV_MAP . 'includes/class-pbv-rest.php';
require_once PBV_MAP . 'includes/class-pbv-frontend.php';
require_once PBV_MAP . 'includes/class-pbv-admin.php';

register_activation_hook( __FILE__, array( 'PBV_Installatie', 'activeer' ) );

add_action( 'plugins_loaded', array( 'PBV_Installatie', 'controleer_versie' ) );
add_action( 'rest_api_init', array( 'PBV_Rest', 'registreer' ) );
PBV_Frontend::init();
PBV_Admin::init();
