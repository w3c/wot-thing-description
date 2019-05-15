#!/usr/bin/perl

while (<>) {
  chomp;
  if (/src="(.*?)"/) {
    print "$1\n";
  }
}

