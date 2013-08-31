
build: components index.js js
	@component build --dev -v

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean
