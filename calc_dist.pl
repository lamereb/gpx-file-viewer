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
my $point;
my $agg_time = 0;
my $time;
my $start_time, my $start_flag = 1;
my $curr_dist, my $totes_dist = 0;
my $prev_lat, my $prev_long, my $prev_elev;
my $min_mile = 10.0;
my $pace = 10, my $pace_min = 10, my $pace_sec = 10;
my @point_spread;

# print $gps_dat->{Activities}->{Track}->{Trackpoint}->{Time};
# print $gps_dat->{Activities}->{Activity}->{Lap};

my $p;
# print Dumper($gps_dat->{Activities}->{Activity}->{Lap}->{Track}->{Trackpoint});

foreach $p (@{$gps_dat->{Activities}->{Activity}->{Lap}->{Track}->{Trackpoint}}) {
  # print $p->{Time};
  # print $p->{HeartRateBpm}->{Value};
  # print $p->{DistanceMeters};
  # print $p->{Cadence};
  # print $p->{Position}->{LatitudeDegrees};
  # print $p->{Position}->{LongitudeDegrees};
  print $p->{AltitudeMeters};
}
