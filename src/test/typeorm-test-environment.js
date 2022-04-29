/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');
const NodeEnvironment = require('jest-environment-node');
const crypto = require('crypto');
const { Client } = require('pg');
import { Connection } from 'typeorm';

dotenv.config({ path: '.env.test' });

export default class PrismaTestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);

    const dbUser = process.env.TEST_DATABASE_USER;
    const dbPass = process.env.TEST_DATABASE_PASS;
    const dbHost = process.env.TEST_DATABASE_HOST;
    const dbPort = process.env.TEST_DATABASE_PORT;
    const dbName = process.env.TEST_DATABASE_NAME;

    this.schema = `test_${crypto.randomUUID()}`;
    this.connectionString = `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;
  }

  async setup() {
    process.env.DATABASE_URL = this.connectionString;
    this.global.process.env.DATABASE_URL = this.connectionString;

    return super.setup();
  }

  async teardown() {
    const client = new Client({
      connectionString: this.connectionString,
    });

    await client.connect();
    await client.query('DELETE FROM users;');
    await client.end();
  }
}
