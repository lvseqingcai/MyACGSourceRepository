function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1648714588,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220705,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 50,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "轻小说文库",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/轻小说文库.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/轻小说文库.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/轻小说文库.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/轻小说文库.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/轻小说文库.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/轻小说文库.js",
		},
		
		//更新时间
		updateTime: "2022年3月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		tag: ["小说","轻小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://www.wenku8.net",
		
		//登录授权是否启用
		auth: true,
		
		//登录授权网址
		authUrl:"https://www.wenku8.net/index.php",
		
		//需要授权的功能（search，find，detail，content）
		authRequired: ["search"],
	});
}
/*
 * 拦截并验证手动授权数据
 * @params {string} html	网页源码
 * @params {string} url		网址
 * @returns 是否授权
 */
function authCallback(html,url) {
	if(html.length > 1 && html.indexOf('登录成功') != -1){
		return true;
	}
	return false;
}
/*
 * 自动验证授权结果
 * @returns 是否授权
 */
function authVerify() {
	const response = httpRequest("https://www.wenku8.net/index.php");
	if(response.length > 1 && response.indexOf('轻小说文库欢迎您') != -1){
		return true;
	}
	return false;
}

const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';
/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://www.wenku8.net/modules/article/search.php?searchtype=articlename&searchkey='+ ToolUtil.encodeURI(key,'GBK') + header;
	const response = httpRequest(url);
	
	var array= [];
	if(response.indexOf('小说目录')!=-1){
		array.push({
			//标题
			title : jsoup(response,'#content > div > table > tbody > tr > td > table > tbody > tr > td > span > b').text(),
			
			//概览
			summary : jsoup(response,'#content > div:nth-child(1) > table:nth-child(4) > tbody > tr > td:nth-child(2) > span:nth-child(13)').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(response,'#content > div > table > tbody > tr > td > img').attr('src')),
			
			//网址
			url : 'https://www.wenku8.net/book/' + ToolUtil.substring(response,'bid=','\"')+'.htm'
			});
		return JSON.stringify(array);
	}
	
	const list = jsoupArray(response,'#content > table > tbody > tr > td > div').outerHtml();
	
	for (var i=0;i <list.length ; i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'div:nth-child(2) > b > a').text(),
			
			//概览
			summary : jsoup(data,'div:nth-child(2) > p:nth-child(3)').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,':nth-child(1) > a >img').attr('src')),
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'div:nth-child(2) > b > a').attr('href'))
			});
	}
	return JSON.stringify(array);
}
/**
 * 详情
 * @params {string} url
 * @returns {[{title, author, date, summary, cover, reverseOrder, catalog:{[{tag, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = httpRequest(url+ header);
	return JSON.stringify({
		//标题
		title : jsoup(response,'#content > div:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(1) > span > b').text(),
		
		//作者
		author: jsoup(response,'#content > div:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(2)').text(),
		
		//日期
		date : jsoup(response,'dl:nth-child(5) > dd').text(),
		
		//概览
		summary: jsoup(response,'#content > div:nth-child(1) > table:nth-child(4) > tbody > tr > td:nth-child(2) > span:nth-child(13)').text(),

		//封面
		cover : ToolUtil.urlJoin(url,jsoup(response,'#content > div > table > tbody > tr > td > img').attr('src')),
		
		//目录是否倒序
		reverseOrder: false,
		
		//目录网址/非外链无需使用
		catalog: catalog(ToolUtil.urlJoin(url,jsoup(response,'#content > div:nth-child(1) > div:nth-child(6) > div > span:nth-child(1) > fieldset > div > a').attr('href')))
	})
}
/**
 * 目录
 * @params {string} response
 * @params {string} url
 * @returns {[{tag, chapter:{[{name, url}]}}]}
 */
function catalog(url) {
	const response = httpRequest(url+ header);
	//创建目录数组
	var new_catalogs= [];
	
	//创建章节数组
	var newchapters= [];
		
	//章节代码
	var chapters = jsoupArray(response,'td.vcss,td.ccss').outerHtml();
		
	var group;//分组记录
	for (var ci=0;ci<chapters.length;ci++) {
		var chapter = chapters[ci];
		
		if(!(chapter.indexOf('href')!=-1)){
			group = jsoup(chapter,':matchText').text();
		}else{
			newchapters.push({
				//章节名称
				name: group + ' ' + jsoup(chapter,'a').text(),
				//章节网址
				url: ToolUtil.urlJoin(url,jsoup(chapter,'a').attr('href'))
			});
		}
	}
	//添加目录
	new_catalogs.push({
		//目录名称
		tag: '目录',
		//章节
		chapter : newchapters
	});
	return new_catalogs;
}

/**
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = httpRequest(url + header);
	const content = jsoup(response,'#content').outerHtml();
	return content;
}

