function mainifest() {
	return JSON.stringify({
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		priority:1,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "刘志进实验室",

		//搜索源制作人
		author: "雨夏",

		//联系邮箱
		mail: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源更新链接(可使用多个) ","符号进行隔开，注意：不要使用中文的逗号
		updateUrl: "",
		
		//更新时间
		updateTime: "2022年3月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 5,
		
		//自定义标签 ","符号进行分割，注意：不要使用中文的逗号
		tag: "音乐",
		
		//@NonNull 详细界面域名，搜索源标识
		host: "liuzhijin.com"
	});
}
const header = '@header->x-requested-with:XMLHttpRequest@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://music.liuzhijin.cn/@post->input='+ encodeURI(key) + '&filter=name&type=netease' + header;
	const response = httpRequest(url);
	
	const list = jsonPathArray(response,'$..data[*]');
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsonPath(data,'$.title'),
			
			//概览
			summary : jsonPath(data,'$.author'),
			
			//封面
			cover : jsonPath(data,'$.pic'),
			
			//链接
			url : ToolUtil.urlJoin(url,jsonPath(data,'$.url'))
			});
	}
	return JSON.stringify(array);
}

/**
 * 解析
 * @params {string} url
 * @returns {string} url
 */
function analysis(url) {
	return url;
}

