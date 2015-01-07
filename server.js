var fs = require('fs');
var exec = require('child_process').exec;
var taskBuilder = require('./task_builder.js').TaskBuilder;

var configPath = process.argv[2];
var config = JSON.parse(fs.readFileSync(configPath));
if(!fs.existsSync(config.path)){
	exec("git clone "+config.remote,function (err,stdout,stderr) {
		console.log("cloned from "+config.remote);
	});	
}
else{
	exec("git fetch --dry-run",{cwd:config.path},function(error,stdout,stderr){
		stderr && console.log("stderr--",stderr)
		error && console.log("fetch_error:",error)
		console.log("fetch output: ",stdout)
		 pull();
	})

}


var pull = function(){
	exec("git rev-parse head > "+__dirname+"/prev_head",{cwd:config.path},function(error, stdout, stderr){
		exec("git pull",{cwd:config.path},function(error,stdout,stderr){
			console.log("Pulling.......",stderr)
			setEnvironment();
		})
	})
};

var setEnvironment = function(){
	taskBuilder.each(config.before,config.path,null,function(){
		runTests();
	})
};

var runTests = function(){
	taskBuilder.each(config.tests,config.path,function(err,stdout,stderr){
		if(stderr||err){
			exec("vlc ./choosle.mp3 vlc://quit");
		}else{
			exec("vlc ./shot.ogg vlc://quit");

		}
	},function(){
		clearSetup();
	})
};

var clearSetup = function(){
	taskBuilder.each(config.after,config.path)
};