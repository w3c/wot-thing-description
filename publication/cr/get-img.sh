#!/bin/sh

src=../..
files=`./extract-img.pl index.html | grep -v "https" | sort -u`

for f in ${files}
do
  echo $f
  cp ${src}/${f} ${f}
done

