function fpsHandler(fpsIn){
	this.fps=fpsIn;
	this.interval_id=false;
	this.request_animation_id=false;
	this.callback_queue=[];
	this.once_queue=[];
	this.start_interval();
}
fpsHandler.prototype.add_callback=function(func){
	this.callback_queue.push(func);
};
fpsHandler.prototype.add_once_callback=function(func){
	this.once_queue.push(func);
};
fpsHandler.prototype.remove_callback=function(func){
	var did_delete=false;
	for(var r=0;r<this.callback_queue.length;r++){
		if(this.callback_queue[r]===func){
			did_delete=true;
			delete this.callback_queue[r];
			break;
		}
	}
	if(did_delete){this.callback_queue=array_redex(this.callback_queue);}
	return did_delete;
};
fpsHandler.prototype.change_fps=function(fpsIn){
	this.stop_interval();
	this.fps=fpsIn;
	this.start_interval();
};
fpsHandler.prototype.stop_interval=function(){
	if(this.interval_id!==false){clearInterval(this.interval_id);}
	if(this.request_animation_id!==false){cancelAnimationFrame(this.request_animation_id);}
};
fpsHandler.prototype.start_interval=function(){
	var self=this;
	self.interval_id=setInterval(function(){
		try{
			self.request_animation_id=requestAnimationFrame(function(){
				self.request_animation_id=false;
				if(self.once_queue.length>0){
					for(var z=0;z<self.once_queue.length;z++){
						if(typeof(self.once_queue[z])=='function'){
							var tmp_func=self.once_queue[z].bind(self);
							tmp_func.apply(self);}}
					self.once_queue=[];}
				if(self.callback_queue.length<=0){return;}
				for(var z=0;z<self.callback_queue.length;z++){
					if(typeof(self.callback_queue[z])=='function'){
						var tmp_func=self.callback_queue[z].bind(self);
						tmp_func.apply(self);}}
			});
		}catch(e){
			try{
				console.warn('Could not run request animation frame');
			}catch(eConsole){
			}
		}
	},(1000/self.fps));
};