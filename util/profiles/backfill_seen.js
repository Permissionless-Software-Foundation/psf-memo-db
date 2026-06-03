/*
  Utility: backfill profile `seen` timestamps from on-chain block header times.

  Reads each profile's txid, looks up blockHeight in ptxs, fetches block header
  time via BCH RPC, and writes seen = block.time * 1000 (Unix ms).

  Run from the psf-memo-db repo root (memo-db must be stopped to avoid lock conflicts):
    node util/profiles/backfill_seen.js

  Environment (same as psf-memo-indexer):
    RPC_IP, RPC_PORT, RPC_USER, RPC_PASS
*/

import 'dotenv/config'
import level from 'level'
import * as url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const rpcIp = process.env.RPC_IP || '172.17.0.1'
const rpcPort = process.env.RPC_PORT || '8332'
const rpcUser = process.env.RPC_USER || 'bitcoin'
const rpcPass = process.env.RPC_PASS || 'password'

const profilesDb = level(`${__dirname}/../../leveldb/current/profiles`, {
  valueEncoding: 'json'
})

const ptxsDb = level(`${__dirname}/../../leveldb/current/ptxs`, {
  valueEncoding: 'json'
})

const blockTimeCache = new Map()

async function rpcCall (method, params = []) {
  const response = await fetch(`http://${rpcIp}:${rpcPort}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${rpcUser}:${rpcPass}`).toString('base64')}`
    },
    body: JSON.stringify({
      jsonrpc: '1.0',
      id: method,
      method,
      params
    })
  })

  const body = await response.json()
  if (body.error) {
    throw new Error(body.error.message || `RPC ${method} failed`)
  }
  return body.result
}

async function getBlockTimeMs (blockHeight) {
  if (blockTimeCache.has(blockHeight)) {
    return blockTimeCache.get(blockHeight)
  }

  const hash = await rpcCall('getblockhash', [blockHeight])
  const header = await rpcCall('getblockheader', [hash, true])
  const seen = header.time * 1000
  blockTimeCache.set(blockHeight, seen)
  return seen
}

async function backfillProfiles () {
  let updated = 0
  let skipped = 0
  let errors = 0

  try {
    for await (const [addr, profile] of profilesDb.iterator()) {
      try {
        if (!profile.txid) {
          skipped++
          continue
        }

        const ptx = await ptxsDb.get(profile.txid)
        if (!ptx || ptx.blockHeight === undefined) {
          console.warn(`No ptx blockHeight for ${addr} txid ${profile.txid}`)
          skipped++
          continue
        }

        const seen = await getBlockTimeMs(ptx.blockHeight)
        if (profile.seen === seen) {
          skipped++
          continue
        }

        await profilesDb.put(addr, { ...profile, seen })
        updated++
        console.log(`${addr}: seen ${profile.seen} -> ${seen} (block ${ptx.blockHeight})`)
      } catch (err) {
        errors++
        console.error(`Error updating ${addr}:`, err.message)
      }
    }

    console.log(`\nBackfill complete. Updated: ${updated}, skipped: ${skipped}, errors: ${errors}`)
  } finally {
    await profilesDb.close()
    await ptxsDb.close()
  }
}

backfillProfiles().catch((err) => {
  console.error('Backfill failed:', err.message)
  process.exit(1)
})
