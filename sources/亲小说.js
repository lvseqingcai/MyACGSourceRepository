function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652776332,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220705,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 50,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: true,
		
		//@NonNull 搜索源名称
		name: "亲小说",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/亲小说.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/亲小说.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/亲小说.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/亲小说.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/亲小说.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/亲小说.js",
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
		baseUrl: "https://www.qinxiaoshuo.com",
		
		//登录授权是否启用
		auth: true,
		
		//登录授权网址
		authUrl:"https://www.qinxiaoshuo.com/login/",
		
		//需要授权的功能（search，detail，content，find）
		authRequired: ["detail"],
	});
}
/*
 * 拦截并验证手动授权数据
 * @params {string} html	网页源码
 * @params {string} url		网址
 * @returns 是否授权
 */
function authCallback(html,url) {
	if(html.length > 1 && html.indexOf('上次活跃时间') != -1){
		return true;
	}
	return false;
}
/*
 * 自动验证授权结果
 * @returns 是否授权
 */
function authVerify() {
	const response = httpRequest("https://www.qinxiaoshuo.com/user/");
	if(response.indexOf('上次活跃时间') != -1){
		return true;
	}
	return false;
}

const header = '';
/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://www.qinxiaoshuo.com/search/'+ encodeURI(key) + header;
	const response = httpRequest(url);
	const list = jsoupArray(response,'div.box_content > div.book').outerHtml();
	
	var array= [];
	for (var i=0;i <list.length ; i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'div.items > h3 > a').text(),
			
			//概览
			summary : jsoup(data,'div.items > div:nth-child(3)').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,'a > img').attr('src')),
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'div.items > h3 > a').attr('href'))
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
		title : jsoup(response,'div.show_info > div > h1').text(),
		
		//作者
		author: jsoup(response,'div.info_item > div:nth-child(1) > a').text(),
		
		//日期
		date : jsoup(response,'div.show_info > div > div.info_item > div:nth-child(1)').text(),
		
		//概览
		summary: jsoup(response,'textarea.intro').text(),

		//封面
		cover : ToolUtil.urlJoin(url,jsoup(response,'#content > div > table > tbody > tr > td > img').attr('src')),
		
		//目录是否倒序
		reverseOrder: false,
		
		//目录网址/非外链无需使用
		catalog: catalog(ToolUtil.urlJoin('https://www.qinxiaoshuo.com/api/user/book/get/',ToolUtil.substring(response,'bookimg/','.'))+'@post->data')
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
	
	var group;//分组记录
	//目录代码
	const catalogs = jsonPathArray(response,'$.Volumes');
	for (var i=0;i<catalogs.length;i++) {
	    var catalog = catalogs[i];
		var Book_id = jsonPath(catalog,'$.Book_id');
		
		//章节代码
		var chapters = jsonPathArray(catalog,'$.Chapters.*');
		
		group = jsonPath(catalog,'$.Volume_name')
		
		for (var ci=0;ci<chapters.length;ci++) {
			var chapter = chapters[ci];
			newchapters.push({
				//章节名称
				name: group + ' ' + jsonPath(chapter,'$.Chapter_name'),
				//章节网址
				url: 'https://www.qinxiaoshuo.com/read/0/'+Book_id+'/'+jsonPath(chapter,'$.Chapter_id')+'.html'
			});
		}
		
	}
	//添加目录
	new_catalogs.push({
			//目录名称
			tag: "目录",
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
	const content = jsoup(response,'#chapter_content').outerHtml();
	return content;
}

