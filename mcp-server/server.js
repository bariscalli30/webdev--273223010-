const readline = require('node:readline');
const fs = require('node:fs');

// Bir yanıtı JSON formatında ve satır sonu ekleyerek stdout'a gönderir.
function send(reply) {
  process.stdout.write(JSON.stringify(reply) + '\n');
}

// Gelen mesaja göre yanıtı belirler.
function handle(msg) {
  if (msg.method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id: msg.id,
      result: {
        protocolVersion: msg.params.protocolVersion,
        capabilities: { tools: {} },
        serverInfo: { name: 'lectures', version: '0.1.0' },
      },
    };
  }

  if (msg.method === 'notifications/initialized') {
    return null; // Bildirimler yanıt gerektirmez.
  }

  if (msg.method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id: msg.id,
      result: {
        tools: [
          {
            name: 'find_lecture',
            description: 'Search for lectures by keyword, topic or lecture number to find relevant study materials.',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Keyword to search in lectures' },
                number: { type: 'integer', description: 'Lecture number to search' }
              }
            }
          },
          {
            name: 'list_recent_messages',
            description: 'List recent chat messages or communication records stored in the system.',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      }
    };
  }

  if (msg.method === 'tools/call') {
    const toolName = msg.params.name;
    const args = msg.params.arguments || {};

    if (toolName === 'find_lecture') {
      const lectures = JSON.parse(fs.readFileSync('mcp-server/lectures.json', 'utf8'));

      let found = [];
      if (args.number !== undefined) {
        found = lectures.filter(l => l.number === args.number);
      } else {
        const query = (args.query || '').toLowerCase();
        found = lectures.filter(l =>
          l.title.toLowerCase().includes(query) ||
          (l.description && l.description.toLowerCase().includes(query))
        );
      }

      // Eğer ders bulunamadıysa isError: true dönmeliyiz
      if (found.length === 0) {
        return {
          jsonrpc: '2.0',
          id: msg.id,
          result: {
            content: [{ type: 'text', text: 'Lecture not found' }],
            isError: true
          }
        };
      }

      return {
        jsonrpc: '2.0',
        id: msg.id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(found, null, 2)
            }
          ]
        }
      };
    }

    if (toolName === 'list_recent_messages') {
      return {
        jsonrpc: '2.0',
        id: msg.id,
        result: {
          content: [
            {
              type: 'text',
              text: 'No recent messages found.'
            }
          ]
        }
      };
    }

    // Bilinmeyen araç çağrısı için protokol hatası (-32602)
    return {
      jsonrpc: '2.0',
      id: msg.id,
      error: {
        code: -32602,
        message: 'Unknown tool'
      }
    };
  }

  // Bilinmeyen metotlar için protokol hatası (-32601)
  if (msg.id !== undefined) {
    return {
      jsonrpc: '2.0',
      id: msg.id,
      error: {
        code: -32601,
        message: 'Method not found'
      }
    };
  }

  return null;
}

const lines = readline.createInterface({ input: process.stdin });

lines.on('line', (line) => {
  console.error('got: ' + line);
  try {
    const parsed = JSON.parse(line);
    const reply = handle(parsed);
    if (reply) send(reply);
  } catch (err) {
    console.error('Invalid JSON: ' + err.message);
  }
});