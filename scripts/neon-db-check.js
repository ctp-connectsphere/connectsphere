#!/usr/bin/env node

require('dotenv/config')

const { Client } = require('pg')

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL is not set in the environment.')
    process.exit(1)
  }

  const client = new Client({
    connectionString,
    // Neon requires TLS; your URL includes sslmode=require, but this helps in some environments
    ssl: { rejectUnauthorized: false }
  })

  try {
    const start = Date.now()
    await client.connect()

    const [{ now }] = (await client.query('SELECT NOW() as now')).rows
    const [{ db }] = (await client.query('SELECT current_database() as db')).rows
    const [{ cnt }] = (
      await client.query(
        "SELECT count(*)::int as cnt FROM information_schema.tables WHERE table_schema = 'public'"
      )
    ).rows
    const tablesRes = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name LIMIT 20"
    )
    const elapsedMs = Date.now() - start

    console.log('✅ Database connectivity: OK')
    console.log(`  Database: ${db}`)
    console.log(`  Time: ${now}`)
    console.log(`  Public tables: ${cnt}`)
    if (tablesRes.rows?.length) {
      console.log('  Sample tables:')
      for (const r of tablesRes.rows) console.log(`   - ${r.table_name}`)
    }
    console.log(`  Latency: ${elapsedMs} ms`)

    process.exit(0)
  } catch (err) {
    console.error('❌ Database connectivity: FAILED')
    console.error(err?.message || err)
    process.exit(2)
  } finally {
    try { await client.end() } catch {}
  }
}

main()


