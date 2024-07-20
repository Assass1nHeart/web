// src/controller/user.controller.ts

import { Provide, Inject, Controller, Post } from '@midwayjs/decorator';
import * as fs from 'fs';

@Provide()
@Controller('/user')
export class UserController {

  @Inject()
  ctx: any; // 这里的 ctx 可以是 Context 类型，具体根据实际需要进行调整

  @Post('/check')
  async checkUser(data: any) {
    try {
      const content = fs.readFileSync('data/userlog.json', 'utf8');
      const userInfo = JSON.parse(content);

      for (const user of userInfo) {
        if (user.username === data.username) {
          if (user.password === data.password) {
            // 假设这里的 ctx.service.userInfo 是通过依赖注入的方式提供的服务
            this.ctx.service.userInfo.id = user.id;
            this.ctx.service.userInfo.username = user.username;
            this.ctx.service.userInfo.password = user.password;

            return {
              status: 'success',
              id: user.id,
            };
          } else {
            return {
              status: 'password error',
              id: '',
            };
          }
        }
      }

      return {
        status: 'username error',
        id: '',
      };
    } catch (err) {
      this.ctx.throw(500, err.message);
    }
  }

  @Post('/register')
  async registerUser(data: any) {
    try {
      const content = fs.readFileSync('data/userlog.json', 'utf8');
      const userList = JSON.parse(content);

      for (const user of userList) {
        if (user.username === data.username) {
          return {
            status: 'username error',
          };
        }
      }

      const newUser = {
        id: userList.length + 1,
        username: data.username,
        password: data.password,
      };

      userList.push(newUser);
      fs.writeFileSync('data/userlog.json', JSON.stringify(userList, null, 2), 'utf8');

      return {
        status: 'success',
      };
    } catch (err) {
      this.ctx.throw(500, err.message);
    }
  }
}
