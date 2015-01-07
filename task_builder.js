var exec = require('child_process').exec;

var taskBuilder  = function(task,next){
	this.task = task;
	this.next = next;
}

taskBuilder.prototype = {
	isNextTask:function(){
		var task =this.next;
		return ((task.task)&&(task.next)&&true)||false;
	},
	execute:function(path,onComplete){
		var task = this;
		console.log("executing:",task.task);
		var callBack = function(err,stdout,stderr){
			err&&console.log("ERROR:",err);
			onComplete&&(onComplete(err,stdout,stderr));
			if(task.isNextTask()){
				task.next.execute(path);
				return;
			}
			task.next&&(task.next());
		}	
		exec(task.task,{cwd:path},callBack);
	}		
}
taskBuilder.each =function(tasks,path,afterEach,onComplete){

	var taskBuilders =  tasks.map(function(tasks){
	 	return new taskBuilder(tasks,null);
	});
	createChain(taskBuilders,onComplete);	
	taskBuilders[0].execute(path,afterEach);
}

var createChain = function(taskBuilders,last_element){
	var lastTask = taskBuilders.reduce(function(pv_task,cv_task){
			pv_task.next =cv_task;
		return cv_task;
	});
	lastTask.next = last_element||new Function();
}


exports.TaskBuilder = taskBuilder;