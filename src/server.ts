import fastify from 'fastify';
import config from './plugins/config.js';
import routes from './routes/index.js';
import  {Server}  from '@tus/server'
import {FileStore}  from '@tus/file-store'


const tusServer = new Server({
  path: '/files',
  datastore: new FileStore({ directory: './files' }),
})

const server = fastify({
  ajv: {
    customOptions: {
      removeAdditional: "all",
      coerceTypes: true,
      useDefaults: true,
    }
  },
  logger: {
    level: process.env.LOG_LEVEL,
  },
});

/**
 * add new content-type to fastify forewards request
 * without any parser to leave body untouched
 * @see https://www.fastify.io/docs/latest/Reference/ContentTypeParser/
 */
server.addContentTypeParser(
  'application/offset+octet-stream', (request, payload, done) => done(null)
)

/**
 * let tus handle preparation and filehandling requests
 * fastify exposes raw nodejs http req/res via .raw property
 * @see https://www.fastify.io/docs/latest/Reference/Request/
 * @see https://www.fastify.io/docs/latest/Reference/Reply/#raw
 */
server.all('/files', (req, res) => {
  console.log('files')
  tusServer.handle(req.raw, res.raw)
})

server.all('/files/*', (req, res) => {
  console.log('files')
  tusServer.handle(req.raw, res.raw)
})

await server.register(config);
await server.register(routes);
await server.ready();

export default server;
