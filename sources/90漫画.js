function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652586404,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230315,
		
		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 40,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "90漫画",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 4,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/90漫画.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/90漫画.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/90漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/90漫画.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/90漫画.js",
		},
		
		//更新时间
		updateTime: "2023年3月15日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		groupName: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
	});
}
const baseUrl = "https://api.90mh.com";
const header = '';

/**
 * 搜索
 * @param {string} key
 * @return {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = ToolUtils.urlJoin(baseUrl,'/app/comic/search?sort=click&keywords=' + encodeURI(key) + header);
	var response = HttpRequest(url);
	var result= [];
	if(response.code() == 200){
		const $ = JSON.parse(response.html())
		$.items.forEach((child) => {
			result.push({
				//标题
				title: child.name,
		
				//概览
				summary: child.last_chapter_name,
		
				//封面网址
				coverUrl: ToolUtils.urlJoin('https://js.tingliu.cc/',child.cover),
		
				//网址
				url: ToolUtils.urlJoin(baseUrl,'/app/comic/view?id=' + child.id)
			})
		})
	}
	return JSON.stringify(result);
}
/**
 * 详情
 * @return {[{title, author, update, summary, coverUrl, isEnabledChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		const $ = JSON.parse(response.html());
		return JSON.stringify({
			//标题
			title : $.data.title,
			
			//作者
			author: $.data.author,
			
			//日期
			//date: ,
			
			//概览
			summary: $.data.description,

			//封面网址
			coverUrl: ToolUtils.urlJoin('https://js.tingliu.cc/',$.data.cover),
			
			//是否启用将章节置为倒序
			isEnabledChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(response)
		});
	}
	return null;
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(response) {
	//创建章节数组
	var newChapters= [];
	
	var chapters = com.jayway.jsonpath.JsonPath.parse(response.html()).read('$.data.chapterGroup.*.*');
	const $ = JSON.parse(chapters)
	$.forEach((child) => {
		newChapters.push({
			//章节名称
			name: child.name,
			//章节网址
			url: 'https://api.90mh.com/app/chapter/view?id=' + child.id
		});
	})
	return [{
		//目录名称
		name: "目录",
		//章节
		chapters : newChapters
	}];
}

/**
 * 内容
 * @return {string} content
 */
function content(url) {
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		const $ = JSON.parse(response.html());
		var newImageArray= [];
		$.data.imageArray.forEach((child) => {
			newImageArray.push('http://js.tingliu.cc/' + $.data.path + child);
		})
		return JSON.stringify(newImageArray);
	}
	return null;
}
