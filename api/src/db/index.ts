import 'dotenv/config';
import pg from 'pg'
const Pool = pg.Pool

export const db = new Pool({
  connectionString: process.env.DATABASE_URL
});

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
db.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})