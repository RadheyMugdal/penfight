const WebSocket = require('ws');

async function run() {
  const code = 'room4p';
  const topic = `realtime:room:${code}`;

  function createClient(id, name, requestedSeat) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:3002/realtime/v1/websocket?vsn=1.0.0`);
      let ref = 0;
      let presenceState = null;
      const peers = new Map();

      ws.on('open', () => {
        // join
        ref++;
        ws.send(JSON.stringify({
          topic,
          event: 'phx_join',
          payload: { config: { presence: { key: id } } },
          ref: String(ref),
          join_ref: String(ref)
        }));
      });

      ws.on('message', (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.event === 'phx_reply' && msg.payload.status === 'ok') {
          // track presence
          ref++;
          ws.send(JSON.stringify({
            topic,
            event: 'presence',
            payload: {
              type: 'presence',
              event: 'track',
              payload: { id, name, seat: requestedSeat, pen: 'reynolds045', at: Date.now() }
            },
            ref: String(ref)
          }));
        } else if (msg.event === 'presence_state') {
          presenceState = msg.payload;
          for (const [uid, data] of Object.entries(msg.payload)) {
            peers.set(uid, data.metas[0]);
          }
        } else if (msg.event === 'presence_diff') {
          for (const [uid, data] of Object.entries(msg.payload.joins || {})) {
            peers.set(uid, data.metas[0]);
          }
          for (const uid of Object.keys(msg.payload.leaves || {})) {
            peers.delete(uid);
          }
        }
      });

      setTimeout(() => {
        resolve({ id, ws, getPeers: () => peers, getState: () => presenceState });
      }, 500);
    });
  }

  console.log('Connecting Client 1 (Host, seat 0)...');
  const c1 = await createClient('user1', 'Host', 0);

  console.log('Connecting Client 2 (Guest 1, seat 1)...');
  const c2 = await createClient('user2', 'Guest1', 1);

  console.log('Connecting Client 3 (Guest 2, requested 1 -> should get 2)...');
  const c3 = await createClient('user3', 'Guest2', 1);

  console.log('Connecting Client 4 (Guest 3, requested 1 -> should get 3)...');
  const c4 = await createClient('user4', 'Guest3', 1);

  await new Promise(r => setTimeout(r, 600));

  console.log('\n--- Client 3 Peers View ---');
  for (const [uid, meta] of c3.getPeers().entries()) {
    console.log(`User: ${uid}, Name: ${meta.name}, Seat: ${meta.seat}`);
  }

  console.log('\n--- Client 1 Peers View ---');
  for (const [uid, meta] of c1.getPeers().entries()) {
    console.log(`User: ${uid}, Name: ${meta.name}, Seat: ${meta.seat}`);
  }

  console.log('\n--- Client 4 Peers View ---');
  for (const [uid, meta] of c4.getPeers().entries()) {
    console.log(`User: ${uid}, Name: ${meta.name}, Seat: ${meta.seat}`);
  }

  c1.ws.close();
  c2.ws.close();
  c3.ws.close();
  c4.ws.close();
  process.exit(0);
}

run().catch(console.error);
