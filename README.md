<h1 align="center" style="border-bottom: none;">Android Publish</h1>
<h3 align="center">Push Android Bundles to Google Play Store from cli</h3>
<br />
<div align="center" style="margin-bottom: 3em">
  <a href="https://npmjs.org/package/android-publish">
    <img alt="Version" src="https://img.shields.io/npm/v/android-publish.svg">
  </a>
  <a href="https://github.com/HausennTechnologies/android-publish/actions/workflows/build.yml">
    <img alt="Build" src="https://github.com/HausennTechnologies/android-publish/actions/workflows/release.yml/badge.svg?branch=master">
  </a>
  <a href="https://npmjs.org/package/android-publish">
    <img alt="Downloads per week" src="https://img.shields.io/npm/dw/android-publish.svg">
  </a>
    <a href="https://github.com/HausennTechnologies/android-publish/blob/master/LICENSE.md">
    <img alt="License" src="https://img.shields.io/npm/l/android-publish.svg">
  </a>
</div>

<p align="center">
Build With
<br />
<a href="https://oclif.io">
    <img alt="oclif" src="https://img.shields.io/badge/cli-oclif-brightgreen.svg">
  </a>
  <a href="https://github.com/semantic-release/semantic-release">
    <img alt="semantic release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
  </a>
</p>

# Installation

Use with npx without install:

```sh-session
  $ npx android-publish [OPTIONS] <path to .aab file>
```

or install globally:

```sh-session
  $ npm i -g android-publish
  $ android-publish [OPTIONS] <path to .aab file>

```

# How it works

`android-publish` will send your app bundle using the
[Google Apis](https://developers.google.com/android-publisher/api-ref/rest).

# Usage

```
Push Android Bundles to Google Play Store from cli

USAGE
  $ android-push [OPTIONS] BUNDLE

ARGUMENTS
  BUNDLE  Android bundle file

OPTIONS
  -h, --help                                    Show help
  -k, --key=api.json                            (required) Google service account key file
  -p, --packageName=com.example.app             (required) App package name
  -q, --quiet                                   Print only error messages
  -t, --track=(internal|alpha|beta|production)  (required) Publish track
  -v, --version                                 Show Android Publish version
```

```sh-session
// Publish app com.example.app to "internal" track.
android-publish -p com.example.app -k api.json -t internal - ./app/release/release.aab

// Display version information
android-publish -v

// Show help
android-publish -h
```

<br/>
<p align="center">
  <a style="color: #7c7c7c; font-size: small; margin-top: 2em" href="https://www.hausenn.com.br">
  Hausenn Technologies
  </a>
</p>
