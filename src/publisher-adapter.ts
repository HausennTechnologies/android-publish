import { androidpublisher_v3 as v3, google } from 'googleapis';
import { ReadStream } from 'fs';
import { Tracks } from './tracks';

/**
 * @brief Publisher Adapter
 *
 * Wrap google apis.
 */
export class PublisherAdapter {
  private packageName!: string;
  private publisher!: v3.Androidpublisher;
  private editId!: string;
  private versionCode!: string;

  public async connect(key: string, packageName: string): Promise<void> {
    // Get Google Api Client instance.
    const client = await google.auth.getClient({
      keyFile: key,
      scopes: 'https://www.googleapis.com/auth/androidpublisher',
    });

    // Get Android Publisher instance.
    this.publisher = await google.androidpublisher({
      version: 'v3',
      auth: client,
      params: {
        packageName,
      },
    });

    // Start edit.
    const id = Date.now().toString();

    const edit = await this.publisher.edits.insert({ requestBody: { id, expiryTimeSeconds: '600' } });

    if (!edit.data.id) throw new Error('Invalid edit id');

    this.editId = edit.data.id.toString();

    this.packageName = packageName;
  }

  public async upload(file: ReadStream): Promise<void> {
    const bundle = await this.publisher.edits.bundles.upload({
      editId: this.editId,
      packageName: this.packageName,
      media: {
        mimeType: 'application/octet-stream',
        body: file,
      },
    });

    if (!bundle.data.versionCode) {
      throw new Error(`Invalid bundle versionCode: ${bundle.data.versionCode}`);
    }

    this.versionCode = bundle.data.versionCode.toString();
  }

  public async setTrack(track: Tracks): Promise<void> {
    await this.publisher.edits.tracks.update({
      editId: this.editId,
      track,
      packageName: this.packageName,
      requestBody: {
        track: track,
        releases: [
          {
            versionCodes: [this.versionCode],
            status: 'completed',
          },
        ],
      },
    });
  }

  public async commit(): Promise<void> {
    await this.publisher.edits.commit({
      editId: this.editId,
      packageName: this.packageName,
    });
  }
}
