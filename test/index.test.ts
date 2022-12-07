import { test } from '@oclif/test';
import { resolve } from 'path';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as mockfs from 'mock-fs';
import * as fakes from './fakes';

import { google } from 'googleapis';
import { ExitCode } from '../src/exit-code';

import { AndroidPublish as cmd } from '../src';

chai.should();
chai.use(sinonChai);

const expect = chai.expect;

describe('android-publish', () => {
  beforeEach(() => {
    mockfs({
      'package.json': mockfs.load(resolve(__dirname, '../package.json')),
      'node_modules': mockfs.load(resolve(__dirname, '../node_modules')),
      'mockfs': {
        'api.json': mockfs.load(resolve(__dirname, 'mockfs/api.json')),
        'release.aab': mockfs.load(resolve(__dirname, 'mockfs/release.aab')),
      },
    });
  });

  afterEach(() => {
    mockfs.restore();
  });

  describe('when valid input is passed', () => {
    test
      .stderr()
      .stdout()
      .stub(google.auth, 'getClient', sinon.stub().returns(fakes.client))
      .stub(google, 'androidpublisher', sinon.stub().returns(fakes.publisher))
      .do(() =>
        cmd.run(['-p', 'com.example.app', '-t', 'production', '-k', './mockfs/api.json', './mockfs/release.aab']),
      )
      .it('should upload bundle with success', ctx => {
        expect(google.auth.getClient).to.have.been.calledWith({
          keyFile: './mockfs/api.json',
          scopes: 'https://www.googleapis.com/auth/androidpublisher',
        });

        expect(google.androidpublisher).to.have.been.calledWith({
          version: 'v3',
          auth: fakes.client,
          params: { packageName: 'com.example.app' },
        });

        expect(ctx.stdout).to.contain('success!');
      });
  });

  describe('when quiet', () => {
    test
      .stderr()
      .stdout()
      .stub(google.auth, 'getClient', sinon.stub().returns(fakes.client))
      .stub(google, 'androidpublisher', sinon.stub().returns(fakes.publisher))
      .do(() =>
        cmd.run(['-p', 'com.example.app', '-t', 'production', '-k', './mockfs/api.json', '-q', './mockfs/release.aab']),
      )
      .it('should not display logs', ctx => {
        expect(ctx.stdout).to.be.empty;
        expect(ctx.stderr).to.be.empty;
      });
  });

  describe('when bundle file does not exist', () => {
    test
      .do(() =>
        cmd.run(['-p', 'com.example.app', '-t', 'production', '-k', './mockfs/api.json', './mockfs/invalid.aab']),
      )
      .exit(ExitCode.ERROR_BUNDLE_FILE_DOES_NOT_EXIST)
      .it('should fail');
  });

  describe('when api key file does not exist', () => {
    test
      .do(() =>
        cmd.run(['-p', 'com.example.app', '-t', 'production', '-k', './mockfs/invalid.json', './mockfs/release.aab']),
      )
      .exit(ExitCode.ERROR_KEY_FILE_DOES_NOT_EXIST)
      .it('should fail');
  });

  describe('when edit id is undefined', () => {
    test
      .stderr()
      .stub(google.auth, 'getClient', sinon.stub().returns(fakes.client))
      .stub(google, 'androidpublisher', sinon.stub().returns(fakes.publisher))
      .stub(fakes.publisher.edits, 'insert', sinon.stub().returns({ data: { id: null } }))
      .do(() =>
        cmd.run(['-p', 'com.example.app', '-t', 'production', '-k', './mockfs/api.json', './mockfs/release.aab']),
      )
      .exit(ExitCode.ERROR_CONNECT)
      .it('should fail', ctx => {
        expect(ctx.stderr).to.not.be.undefined;
        expect(ctx.stderr).to.include('Connecting to Google Api... fail!');
      });
  });

  describe('when bundle version is undefined', () => {
    test
      .stderr()
      .stub(google.auth, 'getClient', sinon.stub().returns(fakes.client))
      .stub(google, 'androidpublisher', sinon.stub().returns(fakes.publisher))
      .stub(fakes.publisher.edits.bundles, 'upload', sinon.stub().returns({ data: { versionCode: null } }))
      .do(() =>
        cmd.run(['-p', 'com.example.app', '-t', 'production', '-k', './mockfs/api.json', './mockfs/release.aab']),
      )
      .exit(ExitCode.ERROR_UPLOAD_BUNDLE)
      .it('should fail', ctx => {
        expect(ctx.stderr).to.not.be.undefined;
        expect(ctx.stderr).to.include('Uploading bundle... fail!');
      });
  });

  describe('when set track fails', () => {
    test
      .stderr()
      .stub(google.auth, 'getClient', sinon.stub().returns(fakes.client))
      .stub(google, 'androidpublisher', sinon.stub().returns(fakes.publisher))
      .stub(fakes.publisher.edits.tracks, 'update', sinon.stub().throws())
      .do(() =>
        cmd.run(['-p', 'com.example.app', '-t', 'production', '-k', './mockfs/api.json', './mockfs/release.aab']),
      )
      .exit(ExitCode.ERROR_SET_TRACK)
      .it('should fail', ctx => {
        expect(ctx.stderr).to.not.be.undefined;
        expect(ctx.stderr).to.include('Setting track... fail!');
      });
  });

  describe('when commit fails', () => {
    test
      .stdout()
      .stderr()
      .stub(google.auth, 'getClient', sinon.stub().returns(fakes.client))
      .stub(google, 'androidpublisher', sinon.stub().returns(fakes.publisher))
      .stub(fakes.publisher.edits, 'commit', sinon.stub().throws('failed'))
      .do(() =>
        cmd.run(['-p', 'com.example.app', '-t', 'production', '-k', './mockfs/api.json', './mockfs/release.aab']),
      )
      .exit(ExitCode.ERROR_COMMIT)
      .it('should fail', ctx => {
        expect(ctx.stderr).to.not.be.undefined;
        expect(ctx.stderr).to.include('Commiting changes... fail!');
      });
  });
});
