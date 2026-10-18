# Soroban Testkit Interface

A visual companion to [Soroban Testkit](https://github.com/soroban-testkit/testkit-blockchain). It documents the library's focused testing modules and provides a command builder for the supported CLI workflows.

The interface does not execute contracts in the browser. Generated commands run locally through `soroban-testkit`, keeping contract tests deterministic and offline as required by the core project.

## Workflow Testing & Verification

Comprehensive component testing ensures complete coverage of interactive command builder combinations:

- **Coverage Workflow**: Component tests verifying report format selections (`html`, `lcov`, `text`), `--open` flag toggling, path quoting, and combined option configurations.
- **Limits Workflow**: Component tests verifying `--contract` path resolution (including paths with spaces), custom function identifiers (`--fn`), and ramp parameters (`--ramp`).
- **Audit Workflow**: Component tests verifying strict mode toggling (`--strict`), contract source paths, and spaces in path arguments.
- **Workflow Switching**: Component tests ensuring instantaneous tab state changes, workflow description synchronization, dynamic mounting/unmounting of workflow-specific inputs, and seamless clipboard command generation.

## Development

```sh
npm install
npm run dev
```

## Validation

```sh
npm run build
npm test
```

## Project boundary

- Rust testing library and CLI: `testkit-blockchain`
- Documentation and CLI workbench: this repository

Licensed under Apache-2.0.
