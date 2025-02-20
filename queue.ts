import { better, defineQueue } from 'plainjob';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const connection = better(new Database(process.env.WORKER_DATABASE_URL!));
const queue = defineQueue({ connection });

export default queue;
