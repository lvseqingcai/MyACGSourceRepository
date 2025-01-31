function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654501053,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 50,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: true,
		
		//@NonNull 搜索源名称
		name: "哆咪动漫",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/哆咪动漫.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哆咪动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哆咪动漫.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/哆咪动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/哆咪动漫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/哆咪动漫.js",
		},
		
		//更新时间
		updateTime: "2022年7月18日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 2,
		
		//自定义标签
		tag: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "http://www.dmdm2020.com",//备份https://1090ys.com/
		
		
		//发现
		findList: {
			"国漫": "https://www.dmdm2020.com/dongmantype/21.html",
			"最近更新": "https://www.dmdm2020.com/dongmanshow/20/by/time.html",
			"热门": "https://www.dmdm2020.com/dongmanshow/20/by/hits.html",
			"完结": "https://www.dmdm2020.com/dongmanshow/20/area/%E5%B7%B2%E5%AE%8C%E7%BB%93.html",
			"校园": "https://www.dmdm2020.com/dongmanshow/20/class/%E6%A0%A1%E5%9B%AD.html",
			"百合": "https://www.dmdm2020.com/dongmanshow/20/class/%E7%99%BE%E5%90%88.html"
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
	var url = 'http://www.dmdm2020.com/dongmansearch/wd/'+ encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'#searchList > li').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'.title').text(),
			
			//概览
			summary : jsoup(data,'div.detail > p.hidden-xs > :matchText').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,'div.thumb > a').attr('data-original')),
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'.title > a').attr('href'))
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
	const list = jsoupArray(response,'ul.myui-vodlist > li').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'.title').text(),
			
			//概览
			summary : jsoup(data,'span.pic-text').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,'a.myui-vodlist__thumb').attr('data-original')),
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'.title > a').attr('href'))
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
		title : jsoup(response,'h1.title').text(),
		
		//作者
		author: jsoup(response,'li:nth-child(5) > span.detail_imform_value').text(),
		
		//日期
		date : jsoup(response,'span.text-red').text(),
		
		//概览
		summary: jsoup(response,'span.content').text(),

		//封面
		cover : jsoup(response,'div.myui-content__thumb > a > img').attr('data-original'),
		
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
	//目录标签代码
	const tabs = jsoupArray(response,'div:nth-child(3) > div > div.myui-panel_hd > div > ul > li').outerHtml();
	
	//目录代码
	const catalogs = jsoupArray(response,'div.tab-pane').outerHtml();
	
	//创建目录数组
	var new_catalogs= [];
	
	for (var i=0;i<catalogs.length;i++) {
	    var catalog = catalogs[i];
		
		//创建章节数组
		var newchapters= [];
		
		//章节代码
		var chapters = jsoupArray(catalog,'ul > li').outerHtml();
		
		for (var ci=0;ci<chapters.length;ci++) {
			var chapter = chapters[ci];
			
			newchapters.push({
				//章节名称
				name: jsoup(chapter,'a').text(),
				//章节网址
				url: ToolUtil.urlJoin(url,jsoup(chapter,'a').attr('href'))
			});
		}
		//添加目录
		new_catalogs.push({
			//目录名称
			tag: jsoup(tabs[i],'li').text(),
			//章节
			chapter : newchapters
			});
	}
	return new_catalogs
}

/**
 * 内容(InterceptRequest)
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	//浏览器请求结果处理
	if(url.indexOf('kwimgs.com') != -1){
		return url;
	}else{
		var re = /govzhajian|nbrlzy|dakawm|\.png|\.jpg|\.svg|\.ico|\.gif|\.webp|\.jpeg/i;
		if(!re.test(url)){
			return url;
		}
	}
	return null;
}