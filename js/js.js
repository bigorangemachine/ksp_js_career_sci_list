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
function str_rep(strIn,cnt){
	if(typeof(strIn)!='string'){return strIn;}
	var out='';
	for(var c=0;c<cnt;c++){out=out+strIn;}
	return out;
}
function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = (x.length > 1 ? '.' + x[1] : '');
    var rgx = /(\d+)(\d{3})/;

    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }

    return x1.toString().trim() + x2.toString().trim();
}
function flatten_array(arrIn,keySeek){
	if(typeof(keySeek)!='number' && typeof(keySeek)!='boolean' && typeof(keySeek)!='string'){return [];}
	var output=[];
	for(var ai in arrIn){
		if(bdcheck_key(arrIn[ai],keySeek)){//valid key check
			output[ai]=arrIn[ai][keySeek];
		}
	}
	return output;
}
function flatten_object(arrIn,keySeek){
	if(typeof(keySeek)!='number' && typeof(keySeek)!='boolean' && typeof(keySeek)!='string'){return {};}
	var output={};
	for(var ai in arrIn){
		if(bdcheck_key(arrIn[ai],keySeek)){//valid key check
			output[ai]=arrIn[ai][keySeek];
		}
	}
	return output;
}
function inObject(valIn,objectIn){
	for(var oKey in objectIn){
		if(bdcheck_key(objectIn,oKey)){
			if(objectIn[oKey]===valIn){return oKey;}
		}
	}
	return -1;
}
function array_object_search(arrIn,keyIn,valIn){//if keyIn is an object it'll try reduce itself until it matches the key structure found
	if(typeof(arrIn)!='object' || !arrIn instanceof Array){return [];}
	var output=[],
		key_index=(typeof(keyIn)=='object'?array_keys(keyIn):[]);
	for(var ai=0;ai<arrIn.length;ai++){
		if(typeof(keyIn)!='object'){//not an object! Not a problem! Just do!
			if(bdcheck_key(arrIn[ai],keyIn)){
				if(arrIn[ai][keyIn]===valIn){output.push(arrIn[ai]);}
			}
		}else{//sifting down through the provided key
			for(var ki=0;ki<key_index.length;ki++){
				var is_reduced=(typeof(keyIn[key_index[ki]])=='object'?false:true),//did we get reduced to a scalar value?  Basically anything but an object.  We might want a function!
					tmp=array_object_search([ (is_reduced?arrIn[ai]:arrIn[ai][ (key_index[ki]) ]) ],(is_reduced?key_index[ki]:keyIn[key_index[ki]]),valIn);
				if(tmp.length>0){output.push(arrIn[ai]);}
			}
		}
	}
	return output;
}
//this is a weird function. Will destroy the array index!
//arrIn Array being evaluted.  Should contain an array like [{'foo': ..., 'bar': ....},{'foo': ..., 'bar': ....}]
//whiteListIn Object with keys {'foo': ..., 'bar': ....}
//keyIn String of the key we're specifically looking for
//if the iteration of 'arrIn' is found with the 'keyIn' we want; 
function del_non_whitelisted_shift_to_whitelist_vals(arrIn,whiteListIn,keyIn){//delete values not found. Convert values to the key that is found
	var del_key=[],
		arr_out=[];//break pass by reference
console.log('b4 '+keyIn+' '+'flatten_array(whiteListIn,keyIn)',whiteListIn,"\n",'After',flatten_array(whiteListIn,keyIn));
	for(var br=0;br<arrIn.length;br++){
		var seek=inObject(arrIn[br],flatten_array(whiteListIn,keyIn));//can we convert?
		if(seek!==-1){//its a group rail or unknown rail
			arr_out.push(seek);}//convert it!
	}
	return arr_out;
}