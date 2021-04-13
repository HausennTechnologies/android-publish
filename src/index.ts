import { Command, flags } from '@oclif/command';
import { Tracks } from './tracks';
import cli from 'cli-ux';

import { ExitCode } from './exit-code';
import { PublisherAdapter } from './publisher-adapter';
import { createReadStream, existsSync, ReadStream } from 'fs';

/**
 * @brief Android Publish command.
 *
 * @note https://developers.google.com/android-publisher/api-ref/rest
 */
class AndroidPublish extends Command {
  static description = 'Push Android Bundles to Google Play Store from cli';

  static flags = {
    key: flags.string({
      char: 'k',
      description: 'Google service account key file',
      helpValue: 'api.json',
      env: 'AP_KEY',
      required: true,
    }),
    packageName: flags.string({
      char: 'p',
      description: 'App package name',
      helpValue: 'com.example.app',
      env: 'AP_PACKAGE',
      required: true,
    }),
    track: flags.enum({
      char: 't',
      description: 'Publish track',
      options: Object.values(Tracks),
      env: 'AP_TRACK',
      required: true,
    }),
    quiet: flags.boolean({ char: 'q', description: 'Print only error messages' }),
    version: flags.version({ char: 'v', description: 'Show Android Publish version' }),
    help: flags.help({ char: 'h', description: 'Show help' }),
  };

  static args = [{ name: 'bundle', description: 'Android bundle file', required: true }];

  private key!: string;
  private package!: string;
  private bundle!: ReadStream;
  private track!: Tracks;
  private quiet = false;

  private publisher = new PublisherAdapter();

  async run(): Promise<void> {
    await this.getParameters();
    await this.connect();
    await this.uploadBundle();
    await this.setTrack();
    await this.commit();

    if (!this.quiet) {
      cli.log('success!');
    }
  }

  /**
   * @brief parse and check cli parameters.
   */
  private async getParameters(): Promise<void> {
    const { args, flags } = this.parse(AndroidPublish);

    if (!existsSync(args['bundle'])) {
      this.error('Bundle file does not exist', { exit: ExitCode.ERROR_BUNDLE_FILE_DOES_NOT_EXIST });
    }

    this.bundle = createReadStream(args['bundle']);

    this.key = flags.key;

    if (!existsSync(this.key)) {
      this.error('Key file does not exist', { exit: ExitCode.ERROR_KEY_FILE_DOES_NOT_EXIST });
    }

    this.package = flags.packageName;
    this.track = flags.track;
    this.quiet = flags.quiet ? flags.quiet : false;
  }

  /**
   * @brief Connect to google server.
   */
  private async connect() {
    this.progressStart('Connecting to Google Api');

    try {
      await this.publisher.connect(this.key, this.package);
      this.progressStop('done!');
    } catch (error) {
      this.progressStop('fail!');
      this.error(error, { exit: ExitCode.ERROR_CONNECT });
    }
  }

  /**
   * @brief Upload android bundle file.
   */
  private async uploadBundle() {
    this.progressStart('Uploading bundle');

    try {
      await this.publisher.upload(this.bundle);
      this.progressStop('done!');
    } catch (error) {
      this.progressStop('fail!');
      this.error(error, { exit: ExitCode.ERROR_UPLOAD_BUNDLE });
    }
  }

  /**
   * @brief Set release track.
   */
  private async setTrack() {
    this.progressStart('Setting track');

    try {
      await this.publisher.setTrack(this.track);
      this.progressStop('done!');
    } catch (error) {
      this.progressStop('fail!');
      this.error(error, { exit: ExitCode.ERROR_SET_TRACK });
    }
  }

  /**
   * @brief Commit the changes and release the app.
   */
  private async commit() {
    this.progressStart('Commiting changes');

    try {
      await this.publisher.commit();
      this.progressStop('done!');
    } catch (error) {
      this.progressStop('fail!');
      this.error(error, { exit: ExitCode.ERROR_COMMIT });
    }
  }

  /**
   * @brief Display spinner with message.
   *
   * @param message Message to display.
   */
  private progressStart(message: string): void {
    if (!this.quiet) {
      cli.action.start(message);
    }
  }

  /**
   * @brief Stop spinner with message.
   *
   * @param message Message when stoped.
   */
  private progressStop(message: string): void {
    if (!this.quiet) {
      cli.action.stop(message);
    }
  }
}

export = AndroidPublish;
