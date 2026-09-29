<?php
// Draai met: php tests/rekenkern.test.php
define( 'ABSPATH', __DIR__ );
function wp_parse_args( $a, $d ) { return array_merge( $d, (array) $a ); }
require __DIR__ . '/../plugin/polderbanden-voorloop/includes/class-pbv-reken.php';
$T = json_decode( file_get_contents( __DIR__ . '/testgevallen.json' ), true );
$n = 0;
function dicht( $a, $b, $tol, $naam ) { global $n; if ( abs( $a - $b ) > $tol ) { fwrite( STDERR, "MISLUKT $naam: $a != $b\n" ); exit( 1 ); } $n++; }
foreach ( $T['voorloop'] as $g ) {
	$v = PBV_Reken::voorloop( $g['i'], $g['voor'], $g['achter'] );
	if ( null === $g['verwacht'] ) { if ( null !== $v ) { fwrite( STDERR, "MISLUKT {$g['naam']}\n" ); exit( 1 ); } $n++; } else { dicht( $v, $g['verwacht'], 0.001, $g['naam'] ); }
}
foreach ( $T['componenten'] as $g ) dicht( PBV_Reken::uit_componenten( $g['i_eind'], $g['i_diff'], $g['i_vooras'], $g['i_tussenbak'] ), $g['verwacht'], 1e-5, $g['naam'] );
foreach ( $T['fendt'] as $g ) dicht( PBV_Reken::uit_fendt( $g['va_ha'] ), $g['verwacht'], 1e-5, 'fendt' );
foreach ( $T['ideaal'] as $g ) dicht( PBV_Reken::ideale_voor( $g['i'], $g['achter'], $g['doel'] ), $g['verwacht_voor'], 0.1, $g['naam'] );
foreach ( $T['zones'] as $g ) { if ( PBV_Reken::zone( $g['v'] ) !== $g['verwacht'] ) { fwrite( STDERR, "MISLUKT zone {$g['v']}\n" ); exit( 1 ); } $n++; }
if ( null !== PBV_Reken::valideer_zones( PBV_Reken::ZONES ) || null === PBV_Reken::valideer_zones( array( 'min' => 3 ) ) ) { exit( 1 ); }
$n += 2;
echo "class-pbv-reken.php: $n controles geslaagd\n";
