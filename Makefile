
build: components index.js js
	@bin/day
	@component build --dev -v
	@bin/report

components: component.json
#	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean
