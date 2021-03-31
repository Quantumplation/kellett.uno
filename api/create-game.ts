import type { VercelRequest, VercelResponse } from '@vercel/node'
import shortid from 'shortid';

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+=');

console.log('test');
export default (req: VercelRequest, res: VercelResponse) => {
  console.log('test2');
  res.json({ code: shortid.generate() });
}