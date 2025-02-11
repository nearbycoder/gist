import { better, defineQueue } from 'plainjob';
import Database from 'better-sqlite3';
import 'dotenv/config';

const connection = better(new Database(process.env.WORKER_DATABASE_URL));

export const queue = defineQueue({ connection });
