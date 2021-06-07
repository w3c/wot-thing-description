#prev = /home/ashimura/public_html/www.w3.org/WWW/TR/2020/PR-wot-architecture-20200130/Overview.html
#dest = /home/ashimura/public_html/www.w3.org/WWW/TR/2021/WD-wot-discovery-20210531
orig = orig.html

### For Echidna
decision = https://www.w3.org/2021/05/19-wot-minutes.html#r01
#token = 3464434525dc27e6dd26f06.02444434

tidy:
	tidy -i -m index.html

diff:
	htmldiff.sh ${prev} index.html > diff.html

images:
	cp -R ../../images .
	rm images/README.md

install:
	cp index.html $(dest)/Overview.html
	cp -R images $(dest)

getprev:
	cp $(prev) prev.html

publish:
	curl 'https://labs.w3.org/echidna/api/request' --user 'ashimura:Haraheri1' -F "tar=@/home/ashimura/public_html/GitHub/w3c/wot-thing-description/publication/2-wd/spec.tar" -F "decision=$(decision)" -F "dry-run=true"

#	curl 'https://labs.w3.org/echidna/api/request' --user 'ashimura:Haraheri1' -F "tar=@/home/ashimura/public_html/GitHub/w3c/wot-discovery/publication/2-wd/spec.tar" -F "decision=$(decision)"

### manifest method is not available any more :(
#	curl 'https://labs.w3.org/echidna/api/request' --data 'url=$(document)&decision=$(decision)&token=$(token)' -d 'dry-run=true' > CODE
#	curl 'https://labs.w3.org/echidna/api/request' --data 'url=$(document)&decision=$(decision)&token=$(token)' > CODE

check:
	GET http://labs.w3.org/echidna/api/status?id=`cat CODE`

