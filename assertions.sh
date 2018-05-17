#!/bin/bash
# Run this after "rendering" in order to extract normative assertions
# and build testing summary file

# Start of HTML output
read -r -d '' FRONT << EOM
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>WoT Thing Description - Normative Assertions Summary</title>
  </head>
  <body>
	  <h1>WoT Thing Description - Normative Assertions Summary</h1>
  <p>This file is auto-generated using <tt>npm run assertions</tt>.
     Run it from the <tt>wot-thing-description</tt> home directory (eg <tt>..</tt>).
     It uses <tt>../index.html</tt> as input so run <tt>npm run render</tt> first.
  </p>
EOM
echo "$FRONT" > testing/assertions.html

# Find all assertions and add to table
# break lines at newlines
# DOES NOT WORK IN SOME sh SHELLS! Make sure to use "bash"
# Note: we use lists rather than tables here as they
# behave better when content is split over multiple lines.
# This allows for long assertion statements without having
# to mess about with complex table formatting to handle
# wrapping, etc.
echo "<dl>" >> testing/assertions.html
IFS=$'\n'
for i in `grep 'class="rfc2119-assertion' index.html`
do
  echo "<dt>" >> testing/assertions.html
  id=`echo $i | grep -oP '(?<=id\=\")[^\"]+(?=\")' -`
  class=`echo $i | grep -oP '(?<=class\=\"rfc2119-assertion-)[^\"]+(?=\")' -`
  comment=`echo $i | grep -oP '(?<=<\!--)[^\"]+(?=-->)' -`
  echo "<a href="../index.html#${id}"><tt>$id</tt></a>" >> testing/assertions.html
  echo ": <strong>$class</strong>" >> testing/assertions.html
  echo "</dt>" >> testing/assertions.html
  echo "<dd>" >> testing/assertions.html
  echo "$i" >> testing/assertions.html 
  if [ -n "$comment" ]; then
    echo "<ul>" >> testing/assertions.html
    echo "<li>${comment}</li>" >> testing/assertions.html
    echo "</ul>" >> testing/assertions.html
  fi
  echo "</dd>" >> testing/assertions.html
done
echo "</dl>" >> testing/assertions.html

# End of HTML output
read -r -d '' BACK << EOM
  </body>
</html>
EOM
echo "$BACK" >> testing/assertions.html
