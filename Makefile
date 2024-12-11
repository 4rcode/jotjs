all: clean lint

clean:
	rm -rf dist node_modules

example:
	deno run -A src/example/server.ts

format: setup
	deno run -A npm:prettier --write .

lint: setup
	deno run -A npm:prettier --check .
	deno lint
	deno publish --dry-run --allow-dirty

pre-commit: clean lint

setup:
	git config core.hooksPath src/git
	deno install
