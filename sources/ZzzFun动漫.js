function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1648714353,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 80,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "ZzzFun动漫",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 4,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/ZzzFun动漫.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/ZzzFun动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/ZzzFun动漫.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/ZzzFun动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/ZzzFun动漫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/ZzzFun动漫.js",
		},
		
		//更新时间
		updateTime: "2022年3月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 2,
		
		//自定义标签
		tag: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "http://service-i86gk1am-1251249846.gz.apigw.tencentcs.com",
	});
}
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'http://service-i86gk1am-1251249846.gz.apigw.tencentcs.com/android/search@post->key='+ encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsonPathArray(response,'$..data[*]');
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsonPath(data,'$.videoName'),
			
			//概览
			summary : jsonPath(data,'$.videoremarks'),
			
			//封面
			cover : jsonPath(data,'$.videoImg'),
			
			//网址
			url : 'http://service-i86gk1am-1251249846.gz.apigw.tencentcs.com/android/video/list_ios?videoId='+jsonPath(data,'$.videoId')
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
		title: jsonPath(response,'$.data.videoName'),
		
		//作者
		author: jsonPath(response,'$.data.up'),
		
		//概览
		summary: jsonPath(response,'$.data.videoDoc'),

		//封面
		cover : jsonPath(response,'$.data.videoImg'),
		
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
	//分组代码
	const videoSets = jsonPathArray(response,'$.data.videoSets[*]');
	
	//创建目录数组
	var new_catalogs= [];
	
	for (var i = 0;i<videoSets.length;i++) {
	    var catalog = videoSets[i];
		
		//创建章节数组
		var newchapters= [];
		
		//章节代码
		var chapters = jsonPathArray(catalog,'$.list[*]');
		
		for (var ci=0;ci<chapters.length;ci++) {
			var chapter = chapters[ci];
			
			var playids = jsonPath(chapter,'$.playid').split('-');
			
			newchapters.push({
				//章节名称
				name: jsonPath(chapter,'$.ji'),
				//章节网址
				url: 'http://www.zzzfun.com/vod_play_id_'+playids[0]+'_sid_'+(i+1)+'_nid_'+playids[1]+'.html'
			});
		}
		//添加目录
		new_catalogs.push({
			//目录名称
			tag: jsonPath(videoSets[i],'$.load'),
			//章节
			chapter : newchapters
			});
	}
	return new_catalogs
}