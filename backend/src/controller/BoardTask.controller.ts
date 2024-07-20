// src/controller/taskboard.controller.ts

import { Provide, Controller, Get, Post, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/web';
import * as fs from 'fs';
import * as path from 'path';

@Provide()
@Controller('/taskboard')
export class TaskboardController {

  @Inject()
  ctx: Context;

  @Get('/get')
  async getTaskboard() {
    console.log("begin get taskboard");
    let data = null;
    while (true) {
      try {
        const filePath = path.resolve(__dirname, `../../data/data_${this.ctx.userinfo.id}.json`);
        data = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));
        break;
      } catch (error) {
        if (error.code === 'ENOENT') {
          const defaultFilePath = path.resolve(__dirname, '../../data/data_default.json');
          const userFilePath = path.resolve(__dirname, `../../data/data_${this.ctx.userinfo.id}.json`);
          fs.copyFileSync(defaultFilePath, userFilePath);
        }
      }
    }
    return data;
  }

  @Post('/save')
  async saveTaskboard(data: any) {
    data = data.data;
    const filePath = path.resolve(__dirname, `../../data/data_${this.ctx.userinfo.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data), { encoding: 'utf-8' });
    return "success";
  }

  @Get('/getinfo')
  async getUserinfo() {
    return this.ctx.userinfo;
  }

  @Post('/upload')
  async uploadFile(file: any) {
    console.log(this.ctx.userinfo);
    if (!file) {
      return { status: "error" };
    }
    const filePath = path.resolve(__dirname, `../../upload/${file.filename}`);
    fs.writeFileSync(filePath, file.file);
    return;
  }

  @Post('/update')
  async updateIssueInfo(data: any) {
    console.log(data);
    const { columnId, issueId } = data;
    this.ctx.issueInfo.columnId = columnId;
    this.ctx.issueInfo.issueId = issueId;
    return;
  }
}
