DENO := ${HOME}/.deno/bin/deno

.PHONY: all
all: clean lint build
	git config core.hookspath | \
		grep -q src/git || \
		git config core.hookspath src/git

.PHONY: build
build: ${DENO}
	${DENO} run -A src/cmd/build.ts
	${DENO} run -A npm:typescript/tsc
	mkdir dist/node
	cp -r src/node/. dist/node
	cp dist/*js dist/*ts dist/node
	tar -zc -C dist/node -f dist/jotjs.tgz .
	rm -r dist/node

.PHONY: clean
clean:
	rm -rf dist

.PHONY: example
example: ${DENO}
	${DENO} run -A src/cmd/example.ts

.PHONY: format
format: ${DENO}
	${DENO} run -A npm:prettier --write .

.PHONY: lint
lint: ${DENO}
	${DENO} run -A npm:prettier --check .
	${DENO} lint

.PHONY: pre-commit
pre-commit: all
	git add dist

${DENO}:
	${DENO} -v || curl -fsSL https://deno.land/install.sh | sh
