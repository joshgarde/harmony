import { expect } from 'chai';
import { describe, it } from 'mocha';
import fs from 'fs';
import tmp from 'tmp';
import path from 'path';

import { hookCliParser, hookCliMain } from './helpers/cli';

describe('cli', function () {
  describe('parser', function () {
    describe('--help', function () {
      hookCliParser('--help');

      it('outputs a usage message', async function () {
        expect(this.output).to.match(/^Usage: /);
      });

      it('does not produce an error', async function () {
        expect(this.error).to.equal(undefined);
      });
    });

    describe('--output-dir', function () {
      hookCliParser('--harmony-input', '{}', '--query', 'file.json');
      describe('when not provided', function () {
        it('produces a missing argument error', function () {
          expect(this.error.message).to.equal('Missing required argument: output-dir');
        });
      });

      describe('when provided', function () {
        hookCliParser('--output-dir', 'temp', '--harmony-input', '{}', '--query', 'file.json');

        it('does not produce an error', function () {
          expect(this.error).to.equal(null);
        });

        it('parses the next argument as a string', function () {
          expect(this.argv.outputDir).to.equal('temp');
        });
      });
    });

    describe('--harmony-input', function () {
      describe('when not provided', function () {
        hookCliParser('--output-dir', 'temp', '--query', 'file.json');
        it('produces a missing argument error', function () {
          expect(this.error.message).to.equal('Missing required argument: harmony-input');
        });
      });

      describe('when provided', function () {
        hookCliParser('--output-dir', 'temp', '--harmony-input', { hello: 'world' }, '--query', 'file.json');

        it('does not produce an error', function () {
          expect(this.error).to.equal(null);
        });

        it('parses the next argument as a JSON object', function () {
          expect(this.argv.harmonyInput).to.eql({ hello: 'world' });
        });
      });
    });

    describe('--query', function () {
      describe('when not provided', function () {
        hookCliParser('--output-dir', 'temp', '--harmony-input', '{}');
        it('produces a missing argument error', function () {
          expect(this.error.message).to.equal('Missing required argument: query');
        });
      });

      describe('when provided', function () {
        hookCliParser('--output-dir', 'temp', '--harmony-input', '{}', '--query', 'file.json');

        it('does not produce an error', function () {
          expect(this.error).to.equal(null);
        });

        it('parses the next argument as an array of strings', function () {
          expect(this.argv.query).to.eql(['file.json']);
        });
      });

      describe('when provided multiple inputs', function () {
        hookCliParser('--output-dir', 'temp', '--harmony-input', '{}', '--query', 'file.json', 'file2.json');

        it('does not produce an error', function () {
          expect(this.error).to.equal(null);
        });

        it('adds each argument to an array of strings', function () {
          expect(this.argv.query).to.eql(['file.json', 'file2.json']);
        });
      });
    });

    describe('--page-size', function () {
      describe('when not provided', function () {
        hookCliParser('--output-dir', 'temp', '--harmony-input', '{}', '--query', 'file.json');

        it('does not produce an error', function () {
          expect(this.error).to.equal(null);
        });

        it('defaults to a page size of 2000', function () {
          expect(this.argv.pageSize).to.equal(2000);
        });
      });

      describe('when provided', function () {
        hookCliParser('--output-dir', 'temp', '--harmony-input', '{}', '--query', 'file.json', '--page-size', '10');

        it('does not produce an error', function () {
          expect(this.error).to.equal(null);
        });

        it('parses the next argument as a number', function () {
          expect(this.argv.pageSize).to.equal(10);
        });
      });
    });

    describe('--max-pages', function () {
      describe('when not provided', function () {
        hookCliParser('--output-dir', 'temp', '--harmony-input', '{}', '--query', 'file.json');

        it('does not produce an error', function () {
          expect(this.error).to.equal(null);
        });

        it('defaults to a max pages of 1', function () {
          expect(this.argv.maxPages).to.equal(1);
        });
      });

      describe('when provided', function () {
        hookCliParser('--output-dir', 'temp', '--harmony-input', '{}', '--query', 'file.json', '--max-pages', '5');

        it('does not produce an error', function () {
          expect(this.error).to.equal(null);
        });

        it('parses the next argument as a number', function () {
          expect(this.argv.maxPages).to.equal(5);
        });
      });
    });
  });

  describe('main', function () {
    describe('when the output directory exists', function () {
      const tmpDir = tmp.dirSync({ unsafeCleanup: true }).name;
      hookCliMain(['--output-dir', tmpDir, '--harmony-input', '{}', '--query', 'file.json'], ['done']);

      it('outputs the result data to index.json in the directory', function () {
        const index = path.join(tmpDir, 'index.json');
        expect(fs.existsSync(index)).to.be.true;
        expect(fs.readFileSync(index, 'utf-8')).to.equal('["done"]');
      });
    });

    describe('when the output directory does not exist', function () {
      const tmpDir = tmp.tmpNameSync();
      hookCliMain(['--output-dir', tmpDir, '--harmony-input', '{}', '--query', 'file.json'], ['done']);
      after(() => fs.rmdirSync(tmpDir, { recursive: true }));

      it('creates it and outputs the result data to index.json in the directory', function () {
        const index = path.join(tmpDir, 'index.json');
        expect(fs.existsSync(index)).to.be.true;
        expect(fs.readFileSync(index, 'utf-8')).to.equal('["done"]');
      });
    });
  });
});
