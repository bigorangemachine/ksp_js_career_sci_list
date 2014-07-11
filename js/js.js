// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
function basic_check(stringIn){
	if(typeof(stringIn)=='string'){
		tmp=stringIn.trim();
		if(tmp.length>0){
			return true;
		}else{
			return false;}
	}else if(typeof(stringIn)=='number'){
		if(tmp.length>0){
			return true;
		}else{
			return false;}
	}else{
		return false;}
}
function check_strip_last(stringIn,checkFor){
	output="";
	if(!(stringIn.indexOf(checkFor)==-1)){//found
		startPoint=stringIn.length-checkFor.length;
		tmp=stringIn.substr(startPoint,checkFor.length);
		if(tmp==checkFor){
			output=stringIn.substr(0,(stringIn.length-checkFor.length));}
		else{
			output=stringIn;}		
		return output;
	}else{
		return stringIn;}
}
function check_strip_first(stringIn,checkFor){
	output="";
	if(!(stringIn.indexOf(checkFor)==-1)){//found
		startPoint=stringIn.length-checkFor.length;
		tmp=stringIn.substr(0,checkFor.length);
		if(tmp==checkFor){
			output=stringIn.substr(checkFor.length,stringIn.length);}
		else{
			output=stringIn;}	
		return output;
	}else{
		return stringIn;}	
}
if(typeof(bdcheck_key)=='undefined'){
	function bdcheck_key(obj,key){
		var result=false;
		var empty_obj;
		if(obj instanceof Array){empty_obj=new Array();}//check for array first as an array comes up both as array and object
		else if(obj instanceof Object){empty_obj=new Object();}
		else{return false;}
		if(typeof(empty_obj)=='undefined'){//instanceof didn't work! IE9!?
			if(obj.constructor==Object){empty_obj=new Object();}
			else if(obj.constructor==Array){empty_obj=new Array();}
		}
		for(var k_e_y_check in obj){
			var do_result='proceed';
			for(var empty_key in empty_obj){
				if(empty_key==k_e_y_check){do_result='continue';break;}}//it matches! So this key is a prototype

			//if(typeof(empty_obj[k_e_y_check])!='undefined'){continue;}//trying to ignore prototypes <- ISSUE WITH IE9 Uuuuugggg
			if(do_result=='continue'){continue;}
			if(k_e_y_check===key){result=true;break;}
		}
		return result;
	}
}
function array_redex(arrayIn){
	if(typeof(arrayIn)!='object'){return false;}
	var is_valid_arr=undefined;

	if(arrayIn instanceof Array){is_valid_arr=true;}//check for array first as an array comes up both as array and object
	else if(arrayIn instanceof Object){is_valid_arr=false;}
	if(typeof(is_valid_arr)=='undefined'){//instanceof didn't work! IE9!?
		if(arrayIn.constructor==Object){is_valid_arr=true;}
		else if(arrayIn.constructor==Array){is_valid_arr=false;}
	}
	if(typeof(is_valid_arr)=='undefined'){is_valid_arr=(Object.prototype.toString.call(arrayIn) === '[object Array]');}
	
	if(is_valid_arr!==true){return false;}
	var old=arrayIn.concat([]),
		output=[];//break live link
	for(var k in old){
		if(bdcheck_key(old,k)){//valid key?! check gripCall for function
			output.push(old[k]);}}//all brackets's closed here
	return output;
}
function array_keys(objIn){//shallow get key
	if(typeof(objIn)=='object'){
		var output=[];
		for(var _a_r_r_a_y_key_test in objIn){
			if(bdcheck_key(objIn,_a_r_r_a_y_key_test)){output.push(_a_r_r_a_y_key_test);}
		}
		return (output.length==0?false:output);
	}
	return false;
}
function str_rep_count(strIn,fChr){
	if(typeof(strIn)!='string'){return 0;}
	var rep_count=0;
	for(var strrep=0;strrep<strIn.length;strrep++){
		var t_chr=strIn[strrep];
		if(t_chr===fChr){rep_count++;}
	}
	return rep_count;
}