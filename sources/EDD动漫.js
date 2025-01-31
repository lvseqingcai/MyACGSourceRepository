function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652589052,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230428,
		
		//编译版本
		compileVersion: JavaUtils.JS_VERSION_1_7,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 1,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "EDD动漫",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/EDD动漫.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/EDD动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/EDD动漫.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/EDD动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/EDD动漫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/EDD动漫.js",
		},
		
		//更新时间
		updateTime: "2023年4月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentType: 2,
		
		//分组
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			"新番": 'https://www.hdddex.com/?s=home-vod-type-id-97',
			"剧场版": 'https://www.hdddex.com/?s=home-vod-type-id-85.html',
		}
	});
}
const baseUrl = "https://www.hdddex.com";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl,'/index.php?s=home-search-index.html@post->wd='+ encodeURI(key));
	var result= [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var document = response.body().cssDocument();
		var elements = document.select("#content > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称图片网址
				nameImgUrl: JavaUtils.urlJoin(baseUrl, element.selectFirst('a > img').attr('src')),
				
				//概览
				summary: element.selectFirst('ul.info > li:nth-child(12)').text(),
				
				//封面网址
				coverUrl: element.selectFirst('a.video-pic').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('ul.info > li:nth-child(1) > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}
/**
 * 发现
 * @param {string} url
 * @return {[{name, summary, coverUrl, url}]}
 */
function find(url) {
	var url = JavaUtils.urlJoin(baseUrl, url);
	var result= [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var document = response.body().cssDocument();
		var elements = document.select("#content > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.title').text(),
				
				//概览
				summary: element.selectFirst('.note').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.video-pic').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.video-pic').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}
/**
 * 详情
 * @return {[{name, author, update, summary, coverUrl, isEnabledChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var cssDocument = response.body().cssDocument();
		return JSON.stringify({
			//名称
			name: JavaUtils.substring(cssDocument.selectFirst('head > title').text(),"《","》"),
	
			//作者
			author: cssDocument.selectFirst('li.text.hidden-sm.hidden-md').text(),
			
			//更新时间
			date: cssDocument.selectFirst('ul.info > li:nth-child(12) > :matchText').text(),
			
			//概览
			summary: cssDocument.selectFirst('span.details-content-default').text(),
	
			//封面
			cover : cssDocument.selectFirst('div.details-pic > img').attr('src'),
			
			//目录是否倒序
			isEnabledChapterReverseOrder: true,
			
			//目录网址/非外链无需使用
			tocs: tocs(cssDocument, url)
		});
	}
	return null;
}
/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	//目录标签元素选择器
	const tagElements = document.select('ul.hidden-sm.nav-tabs> li:gt(0)');
	
	//目录元素选择器
	const catalogElements= document.select('div.playlist > ul');
	
	//创建目录数组
	var newCatalogs = [];
	
	catalogFor:for (var i = 0;i < catalogElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = catalogElements.get(i).select('ul > li');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			
			var name = chapterElement.selectFirst('a').text();
			if(name.indexOf('迅雷') != -1){
				break catalogFor;
			}
			newChapters.push({
				//章节名称
				name: name,
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
			});
		}
		newCatalogs.push({
			//目录名称
			name: tagElements.get(i).selectFirst('a').text(),
			//章节
			chapters : newChapters
		});
	}
	return newCatalogs;
}