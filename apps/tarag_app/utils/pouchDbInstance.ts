import PouchDB from 'pouchdb-react-native';
import 'pouchdb-adapter-asyncstorage';

export interface BaseDoc {
  _id?: string;
  _rev?: string;
  createdAt: number;
  updatedAt: number;
}

const db = new PouchDB<BaseDoc>('tarag_local', { adapter: 'asyncstorage' });

export default db;
