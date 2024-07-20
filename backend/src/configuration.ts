import { Configuration, App } from '@midwayjs/decorator';

@Configuration({
  imports: [],        // 导入其他模块
  importConfigs: [],  // 导入其他配置
})
export class ContainerConfiguration {
  @App()
  app;

  async onReady() {
    // 在应用准备好后执行的逻辑
    this.app.post('/login', async (ctx) => {
      ctx.body = await ctx.controller.User.checkUser(ctx.request.body);
    });

    this.app.post('/register', async (ctx) => {
      ctx.body = await ctx.controller.User.registerUser(ctx.request.body);
    });
  }
}
