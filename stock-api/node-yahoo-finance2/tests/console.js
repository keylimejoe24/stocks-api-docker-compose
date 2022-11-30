/* istanbul ignore file */

let _console;

const fakeConsole = {
  warn() {},
  log() {},
  error() {},
  dir() {},
};

function consoleSilent() {
  _console = console;
  console = fakeConsole;
}

function consoleRestore() {
  console = _console;
}

export { consoleSilent, consoleRestore };
