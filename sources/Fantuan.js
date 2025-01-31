function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654757510,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 1,//加载速度慢，经常无法连接
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "Fantuan",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/Fantuan.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/Fantuan.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/Fantuan.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/Fantuan.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/Fantuan.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/Fantuan.js",
		},
		
		//更新时间
		updateTime: "2022年6月9日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 2,
		
		//自定义标签
		tag: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://acgfantuan.com",//备份https://fantuantv.com
		
		
		//发现
		findList: {
			"新番": "https://acgfantuan.com/album/serial-jp-video",
		},
	});
}
const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://acgfantuan.com/search/'+ encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'div.catalog > div > div > div').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'.card__title').text(),
			
			//概览
			summary : jsoup(data,'.card__description').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,'.card__cover > img').attr('src')),
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'.card__title > a').attr('href'))
			});
	}
	return JSON.stringify(array);
}
/**
 * 发现
 * @params string url
 * @returns {[{title, summary, cover, url}]}
 */
function find(url) {
	const response = httpRequest(url + header);
	//目录标签代码
	const list = jsoupArray(response,'div.catalog > div > div > div').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'.card__title').text(),
			
			//概览
			summary : jsoup(data,'.card__description').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,'.card__cover > img').attr('src')),
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'.card__title > a').attr('href'))
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
		title : jsoup(response,'.details__title').text(),
		
		//作者
		//author: jsoup(response,'li:nth-child(5) > span.detail_imform_value').text(),
		
		//日期
		date: jsoup(response,'.card__meta > li > :matchText').text(),
		
		//概览
		summary: jsoup(response,'.card__description').text(),

		//封面
		cover : jsoup(response,'.card__cover > img').attr('src'),
		
		//目录是否倒序
		reverseOrder: false,
		
		//目录网址/非外链无需使用
		catalog: catalog(response,url)
	})
}
/**
 * 目录
 * @params {string} response
 * @params {string} url
 * @returns {[{tag, chapter:{[{name, url}]}}]}
 */
function catalog(response,url) {
	//创建目录数组
	var new_catalogs= [];
		
	//创建章节数组
	var newchapters= [];
	
	//章节代码
	var tr = jsoupArray(response,'.accordion__list > tbody > tr').text();
	var id = jsoupArray(response,'.accordion__list > tbody > tr').attr('data-episode-id');
	
	for (var ci=0;ci< tr.length;ci++) {
		newchapters.push({
			//章节名称
			name: tr[ci],
			//章节网址
			url: ToolUtil.urlJoin(url,id[ci])
		});
	}
	//添加目录
	new_catalogs.push({
		//目录名称
		tag: "目录",
		//章节
		chapter : newchapters
		});
	return new_catalogs
}

/**
 * 内容(InterceptRequest)
 * @params {string} url
 * @returns {string} content

function content(url) {
	//浏览器请求结果处理
	var re = /\.png|\.jpg|\.svg|\.ico|\.gif|\.webp|\.jpeg/i;
	if(!re.test(url)){
		return url;
	}
	return null;
}
 */