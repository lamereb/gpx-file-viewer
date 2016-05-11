#!/usr/bin/perl -l
use strict;
use warnings;
use XML::Simple;
use Data::Dumper;
use Time::Local;
use Math::Trig;

my $xml = new XML::Simple;
my $gps_dat = $xml->XMLin($ARGV[0]);
# print Dumper($gps_dat);
# my $point;
# my $agg_time = 0;
# my $time;
# my $start_time, my $start_flag = 1;
# my $curr_dist, my $totes_dist = 0;
# my $prev_lat, my $prev_long, my $prev_elev;
# my $min_mile = 10.0;
# my $pace = 10, my $pace_min = 10, my $pace_sec = 10;
# my @point_spread;

print "{";
print "\"points\":[";

# IF a .tcx file
if ($gps_dat->{Activities}) {
  stripTCX($gps_dat);
}
# ELSE IF a .gpx file
elsif ($gps_dat->{trk}->{trkseg}) {
  stripGPX($gps_dat);
}

printf '{"lat":"0.0","lng":"0.0","elev":"0.0","elapsed":"0.0"}';
print "]";
print "}";

# this function returns the time in seconds since the epoch, given a string of
# time formatted like so: YYYY-MM-DDTHH:MM:SSZ 
sub format_time {
  my $yr = substr $_[0], 0, 4;
  my $mo = substr $_[0], 5, 2;
  my $day = substr $_[0], 8, 2;
  my $hr = substr $_[0], 11, 2;
  my $min = substr $_[0], 14, 2;
  my $sec = substr $_[0], 17, 2;
  return timegm($sec, $min, $hr, $day, $mo, $yr);
}

# this function takes 2 cartesian coordinates and returns the distance between them
# assuming params of:
#       $_[0] = current_latitude, $_[1] = previous_latitude
#       $_[2] = current_longitude, $_[3] = previous_longitude
#       $_[4] = current_height, $_[5] = previous_height
sub calc_distance {
  my $lat_diff = deg2rad($_[0] - $_[1]);
  my $lng_diff = deg2rad($_[2] - $_[3]);
  my $height = $_[4] - $_[5];

  my $a = sin($lat_diff / 2) * sin($lat_diff / 2) + cos(deg2rad($_[1])) * cos(deg2rad($_[1])) * sin($lng_diff / 2) * sin($lng_diff / 2);
  my $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
  my $distance = 6371 * $c * 1000;
  return sqrt($distance**2 + $height**2);
}

sub stripTCX {
  my $time, my $point;
  my $start_time, my $start_flag = 1;
  my $agg_time = 0;
  my $curr_dist, my $totes_dist;
  my $lat = 0, my $long = 0, my $elev = 0;

  # does not account for possibility of multiple laps?
  foreach $point (@{$_[0]->{Activities}->{Activity}->{Lap}->{Track}->{Trackpoint}}) {
    $time = format_time($point->{Time});

    if ($start_flag) {
      $start_time = $time;
      $start_flag = 0;
    }
    if ($point->{Position}->{LatitudeDegrees}) {
      $lat = $point->{Position}->{LatitudeDegrees};
      $long = $point->{Position}->{LongitudeDegrees};
      $elev = $point->{AltitudeMeters};

      $agg_time = $time - $start_time;
      $totes_dist = $point->{DistanceMeters} * 3.28084;

      printf '{"lat":"%.6f","lng":"%.6f","elev":"%.4f","elapsed":"%s","distance":"%.6f"},', $lat, $long, $elev * 3.28084, $agg_time, $totes_dist;
      printf "\n";
    }
    # print $p->{HeartRateBpm}->{Value};
    # print $p->{Cadence};
  }
}

sub stripGPX {
  my $time, my $point;
  my $start_time, my $start_flag = 1;
  my $prev_lat, my $prev_long, my $prev_elev;
  my $agg_time = 0;
  my @point_spread;
  my $curr_dist, my $totes_dist;

  foreach $point (@{$_[0]->{trk}->{trkseg}->{trkpt}}) {
    $time = format_time($point->{time});
    if ($start_flag) {
      $start_time = $time;
      $start_flag = 0;
      $prev_lat = $point->{lat};
      $prev_long = $point->{lon};
      $prev_elev = $point->{ele};
    }
    $agg_time = $time - $start_time;
    @point_spread = ($point->{lat}, $prev_lat, $point->{lon}, $prev_long, $point->{ele}, $prev_elev);

    $curr_dist = calc_distance(@point_spread);
    $totes_dist += ($curr_dist * 3.28084);

    $prev_lat = $point->{lat};
    $prev_long = $point->{lon};
    $prev_elev = $point->{ele};

    printf '{"lat":"%.6f","lng":"%.6f","elev":"%.4f","elapsed":"%s","distance":"%.6f"},', $point->{lat}, $point->{lon}, $point->{ele} * 3.28084, $agg_time, $totes_dist;
    printf "\n";
  }
}

