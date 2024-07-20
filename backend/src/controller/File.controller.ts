// src/controller/file.controller.ts

import { Provide, Controller, Get, Param, Inject } from '@midwayjs/decorator';
import * as path from 'path';
import * as fs from 'fs';

@Provide()
@Controller('/files')
export class FileController {

  @Inject()
  ctx: any;

  @Get('/:fileName')
  async downloadFile(@Param('fileName') fileName: string) {
    console.log("downLoad");
    const filePath = path.resolve(__dirname, `../upload/${fileName}`);
    if (fs.existsSync(filePath)) {
      const fileStream = fs.createReadStream(filePath);
      this.ctx.set('Content-disposition', `attachment; filename=${fileName}`);
      this.ctx.body = fileStream;
    } else {
      this.ctx.status = 404;
      this.ctx.body = 'File not found';
    }
  }
}
