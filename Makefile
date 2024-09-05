DENO := ${HOME}/.deno/bin/deno

all: clean lint build

build: ${DENO}
	${DENO} run -A src/cmd/build.ts
	${DENO} run -A npm:typescript/tsc
	mkdir dist/node
	cp -r src/node/. dist/node
	cp dist/*js dist/*ts dist/node
	tar -zc -C dist/node -f dist/jotjs.tgz .
	rm -r dist/node

clean:
	rm -rf dist

example: ${DENO}
	${DENO} run -A src/cmd/example.ts

format: node_modules
	${DENO} run -A npm:prettier --write .

lint: node_modules
	${DENO} run -A npm:prettier --check .
	${DENO} lint

node_modules: ${DENO}
	git config core.hooksPath src/git
	${DENO} cache npm:prettier npm:typescript/tsc

pre-commit: all
	git add dist

${DENO}:
	curl -fsSL https://deno.land/install.sh | sh
