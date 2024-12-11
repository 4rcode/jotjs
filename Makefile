all: lint
	git config core.hooksPath src/git

example:
	deno run -A src/example/server.ts

format:
	deno fmt

lint:
	deno fmt --check
	deno lint
	deno publish --dry-run --allow-dirty

pre-commit: lint
