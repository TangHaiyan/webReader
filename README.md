# webReader
web阅读界面

因请求的数据网址为http，因此https协议的网站会报错：已阻止混入活动内容。

暂时解决方法：

配置Fireworks不阻止

该配置针对用户自己的浏览器，可用于本地测试开发，查看效果，实际的生产环境则没有任何效果，如果重装浏览器一样会失效。

配置方法：

打开新标签页，在地址栏输入 about:config， 进入配置页面

搜索
security.mixed_content.block,，双击，修改默认配置。
