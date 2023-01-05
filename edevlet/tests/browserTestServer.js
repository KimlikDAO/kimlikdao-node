import { createServer } from 'http';
import { readFileSync } from 'fs';

createServer((req, res) => {
  if (req.url.startsWith('/testdata')) {
    res.writeHead(200, {'content-type': 'application/pdf'});
    res.write(readFileSync(req.url.slice(1)));
    res.end();
  } else if (req.url == '/') {
    res.writeHead(200, {'content-type': 'text/html;charset=utf-8'});
    res.write(readFileSync('tests/browserTest.html'));
    res.end();
  } else if (!req.url.endsWith('.ico')){
    let fileName = req.url.slice(1);
    if (!fileName.endsWith('js'))
      fileName = fileName + '.js';
    res.writeHead(200, {'content-type': 'application/javascript;charset=utf-8'});
    res.write(readFileSync(fileName));
    res.end();
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(8788);
