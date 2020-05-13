import { NowRequest, NowResponse } from '@now/node'
import shortid from 'shortid';

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+=');

export default (req: NowRequest, res: NowResponse) => {
  res.json({ code: shortid.generate() });
}