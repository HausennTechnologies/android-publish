import * as sinon from 'sinon';

export const client = {};

export const edit = {
  data: {
    id: 100,
  },
};

export const bundle = {
  data: {
    versionCode: 100,
  },
};

export const tracks = {};
export const commit = {};

export const publisher = {
  edits: {
    insert: sinon.stub().returns(edit),
    bundles: {
      upload: sinon.stub().returns(bundle),
    },
    tracks: {
      update: sinon.stub().returns(tracks),
    },
    commit: sinon.stub().returns(commit),
  },
};
