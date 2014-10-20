/* Copyright bigorangemachine@github.com 2014 
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 /*
	Author: bigorangemachine@github.com
	Name: Kerbal Space Program Parser
	Current Project Page: https://github.com/bigorangemachine/ksp_js_career_sci_list
	Version: 0.0.1
	Dependances: jQuery ($.extend,$.inArray,$.unique), functions in <git root>/js/js.js
	Description:
		A JavaScript Parser that primarially uses string manipulation to parse data from
		Kerbal Space Program Save Games.  Generically written it should be able to parse more than save games
		Light use of RegExp is encouraged as Chrome is not a RegExp friend browser and tends to lock up.
		This is pretty much a hack.  But it works
 */
function kspParser(){
	this.tnl='[\t\r\n]*';//regexp for tab and new lines
	this.tnl_p='[\t\r\n]+';
	this.tnls='[\t\r\n]*';
	this.tnls_='[^\t\r\n]*';//not the above
	this.nl='[\r\n]*';
	this.nl_p='[\r\n]+';
	//this.attr_regexp='('+this.tnls_+')+'+'(=+)(.*)[\r\n]+';
	this.attr_regexp='('+this.tnls_+')+'+'(=+)'+'('+this.tnls_+')+'+'[\r\n]+';
	this.chunk_regexp_str_1='((.*))('+this.tnl;//starts with anything then some white space then the ##ISLAND## of an index key
	this.chunk_regexp_str_2='(('+this.tnl+'\{){1}'+this.tnl+'))';//ending with some white space then '{' (at least once) <-that is wrong but not fixing it for now/<- follow by more white space

	this.plugin={
		'pre_attr_reader_line':false,
		'attr_reader_line':false
	};
}
kspParser.prototype.i_callback=function(hookIn,argsIn){//internal callback - pluginable hooks
	var self=this,
		has_callback=false;
	try{
		//if(typeof(this.plugin[hookIn])=='object' &&  this.plugin[hookIn] instanceof Array){has_callback=true;}
		//else 
		if(typeof(self.plugin[hookIn])=='function'){has_callback=true;}
	}catch(e){}
	if(has_callback){
		var args=Array(argsIn);
		self.plugin[hookIn].apply(self, args);
		obj=args[0];//push values up
		return true;
	}
	return false;
};
kspParser.prototype.attr_reader=function(strIn,dataOutObj,doDebug){
	var self=this,
		child_obj=[],
		seekObjs=true;
	if(seekObjs){//find all child objects?
		var pre_parse=self.chunk_reader(strIn,self.tnls_);//find anything resembling a child object
		for(var p=0;p<pre_parse.length;p++){
			strIn=strIn.replace(pre_parse[p].clean_chunk,'');//clean while we are at it hasten parsing
			child_obj.push({'key':pre_parse[p].key,'pos':pre_parse[p].open_pos});}
	}
	var attr_pat=new RegExp(self.attr_regexp,'gim'),
		attr_pat_test=new RegExp(self.attr_regexp,'gim'),
		found_str=[],
		attrs=[],
		attrs_as_obj={};

	var split_pat=new RegExp('([^=]+)','gim'),
		line_patt=new RegExp(self.tnl_p,'im'),
		t_arr=strIn.split(line_patt),
		attr_lines=[];
	for(var e=0;e<t_arr.length;e++){
		if(basic_check(t_arr[e])){
			var t_exp=t_arr[e].split(split_pat),
				t_key='',
				t_val='',
				a_inc=0;
//console.log('t_exp',t_exp);
			for(var t=0;t<t_exp.length;t++){
//console.log('-'+t,t_exp[t]);
				if(basic_check(t_exp[t])){
					if(a_inc==0){
						t_key=t_key+t_exp[t];
						var clean_regexp=new RegExp(self.tnl_p,'gim'),
							clean_str=t_exp[t].replace(clean_regexp,'');
//console.log('clean_str ',clean_str,JSON.stringify(clean_str),"\n","str_rep_count(clean_str,'=')",str_rep_count(clean_str,'='),'clean_str.length',clean_str.length);
						if((str_rep_count(clean_str,'=')!=clean_str.length)){a_inc++;}//might start with some equals? Who knows?!
					}else{
//console.log('+t_val',t_exp[t],JSON.stringify(t_exp[t]),"\n",'a_inc',a_inc);
						t_val=t_val+(a_inc>=2?t_exp[t]:self.l_trim(t_exp[t]));
						a_inc++;
					}
				//}else{//fix damage from exploding.  We don't have a schema for the data lets be safe.
					/*if(t==0){t_key=(a_inc==0?'=':'');}
					else{t_val=t_val+(a_inc!=0?'=':'');}*/
				}
			}
			var key_regexp=new RegExp('[ \t]*$','gim');
			t_key=t_key.replace(key_regexp,'');
			var val_regexp=new RegExp('^( )?(=)+( )+','gi');
			t_val=t_val.replace(val_regexp,'');
			found_str.push({'key':t_key,'val':t_val})
		}
	}
	//console.log("strIn.split(split_pat)",strIn.split(split_pat),'t_arr',t_arr);

	if(child_obj.length>0){
		for(var i=0;i<child_obj.length;i++){//quick lazy
			found_str.push({'val':(new kspDataChild(strIn,child_obj[i].key)),'key':child_obj[i].key});
		}
	}

	for(var i=0;i<found_str.length;i++){
		var clean_key=found_str[i].key,
			clean_val=found_str[i].val,
			do_break=false;

		///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
		var _args={'clean_key':clean_key,'clean_val':clean_val,'do_break':do_break},
			key_list=array_keys(_args),
			_vr='';
		self.i_callback('pre_attr_reader_line',_args);
		for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
		///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

		//if(out_meth=='arr'){
			attrs.push({'key':clean_key,'val':clean_val});
		//}else{
			if(typeof(attrs_as_obj[clean_key])=='undefined'){
				attrs_as_obj[clean_key]=clean_val;
			}else{
				if(typeof(attrs_as_obj[clean_key])=='object' && attrs_as_obj[clean_key] instanceof Array){attrs_as_obj[clean_key].push(clean_val);}
				else{
					var old_val=attrs_as_obj[clean_key]+'';//breaking live reference with +''
					attrs_as_obj[clean_key]=[];//setup as array
					attrs_as_obj[clean_key].push(old_val);
					attrs_as_obj[clean_key].push(clean_val);
					delete old_val;
				}
			}
		//}

		///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
		var _args={'clean_key':clean_key,'clean_val':clean_val,'do_break':do_break,'attrs':attrs,'attrs_as_obj':attrs_as_obj},
			key_list=array_keys(_args),
			_vr='';
		self.i_callback('attr_reader_line',_args);
		for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
		///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

if(doDebug){
//console.log('found_str',found_str[i].match);
//console.log('found_str',found_str[i],"\n",'attrs',attrs[attrs.length-1]);
//console.log('attrs',attrs[attrs.length-1]);
}
		if(do_break){break;}
	}

if(doDebug){
//console.log('attrs',attrs);
console.log('found_str',found_str);
//console.log('attrs_as_obj',attrs_as_obj);
}
	if(typeof(dataOutObj)=='object'){for(var k in attrs_as_obj){if(bdcheck_key(attrs_as_obj,k)){dataOutObj[k]=attrs_as_obj[k];}}}//push up values
	return attrs;
};
			
kspParser.prototype.chunk_reader=function(strIn,islandStr,doDebug){
	//since this isn't a universal format we are just 'seeking' the start of the island we're looking for.  Then string manipulate the rest
	var self=this,
		seek_pat=new RegExp(self.chunk_regexp_str_1+islandStr+self.chunk_regexp_str_2,'mg'),
		seek_pat_test=new RegExp(self.chunk_regexp_str_1+islandStr+self.chunk_regexp_str_2,'mg'),
		found_str=[],
		scenario_groups=[];
	if(!seek_pat_test.test(strIn)){return [];}
//console.log('islandStr',islandStr,'strIn',strIn);
	while((match = seek_pat.exec(strIn)) != null){found_str.push({'pos':match.index,'match':match});}//pre-parse
	for(var i=0;i<found_str.length;i++){
if(doDebug){
console.log('i: ',i,found_str[i]);
}
		var	wrapper_close_str=found_str[i].match[5].replace('{','}'),//preserve white spaces
			close_pos=strIn.indexOf(wrapper_close_str,found_str[i].match.index+1),
			chunk_start=found_str[i].match.index+found_str[i].match[1].length,//trim previous close from regex
			chunk_end=strIn.indexOf(wrapper_close_str,chunk_start)+wrapper_close_str.length,
			chunk=strIn.substr(chunk_start, chunk_end-chunk_start+1),//startPos, length
			regexp_trim_end=new RegExp(self.tnl+'$','gi'),//weird replacement to preserve formatting.  I wrote attr_before this so I need just the little fix for clean_chunk
			clean_island=found_str[i].match[3].replace(regexp_trim_end,''),
			clean_chunk_1=check_strip_first(chunk,clean_island).replace(regexp_trim_end,''),//\r was giving me trouble.  I just need to match what I have anyways
			clean_chunk_2=check_strip_last(clean_chunk_1,wrapper_close_str),
			clean_chunk=clean_chunk_2,
			regexp_trim_start=new RegExp('^'+self.tnl,'gi'),//weird replacement to preserve formatting.
			regexp_key_clean=new RegExp('('+self.tnls+'[\{]*)','gi');//change [^ - NOT to include the bracket
			clean_found_key=clean_island.replace(regexp_trim_start,'').replace(regexp_key_clean,'');
if(doDebug){
console.log('wrapper_close_str',wrapper_close_str
	,"\n",'JSON.stringify(wrapper_close_str)',JSON.stringify(wrapper_close_str)
	,"\n",'close_pos',close_pos
	,"\n",'chunk_start',chunk_start
	,"\n",'chunk_end',chunk_end
	,"\n",'chunk',chunk
	,"\n",'clean_chunk',clean_chunk
	,"\n",'clean_island',clean_island
);
//console.log('chunk',chunk);
}
		scenario_groups.push({'open_pos':chunk_start,'close_pos':chunk_end,'chunk':chunk,'clean_chunk':clean_chunk,'key':clean_found_key});//,'matches':found_str[i].match
/*
		for(var m=0;m<found_str[i].match.length;m++){
console.log('-['+i+']['+m+']: ',"\n",found_str[i].match[m],"\n","json",JSON.stringify(found_str[i].match[m]));
//						scenario_groups.push({'pos':match.index,'match':match});
		}
*/
	}
	return scenario_groups;
};
kspParser.prototype.l_trim=function(strIn){//for parsing; trim the left side
	var self=this,
		regexp_trim_start=new RegExp('^'+self.tnl,'gi');
	return strIn.replace(regexp_trim_start,'');
};
kspParser.prototype.r_trim=function(strIn){//for parsing; trim the right side
	var self=this,
		regexp_trim_end=new RegExp(self.tnl+'$','gi');
	return strIn.replace(regexp_trim_end,'');
};



////////////////////////////////////
function kspDataChild(strIn,keyIn){
	this.chunk=strIn;
	this.top_key=keyIn;
}
kspDataChild.prototype.get=function(){
};



////////////////////////////////////
function kspUniverse(){
	//used for both setting default values as a schema and providing an index to check against
	this.body_rails={
		'high_orbit':{'title':'Space High','ident':'InSpaceHigh','group_ident':'Orbited'},
		'low_orbit':{'title':'Space Low','ident':'InSpaceLow','group_ident':'SubOrbited'},
		'high_fly':{'title':'Fly High','ident':'FlyingHigh','group_ident':'Flew'},
		'low_fly':{'title':'Fly Low','ident':'FlyingLow','group_ident':'Flew'},
		'surface':{'title':'Surface','ident':'SrfLanded','group_ident':'Surfaced'},
		'splash':{'title':'Splash','ident':'SrfSplashed','group_ident':'Surfaced'}//aka ocean
	};
	this.body_rails_schema={//where can experiments happen - splashes and surfaces are kinda of a rail
		'surface':false,
		'splash':false,//aka ocean
		'low_fly':false,
		'high_fly':false,
		'low_orbit':false,
		'high_orbit':false
	};
	//used for both setting default values as a schema and providing an index to check against
	this.body_types_schema={
		'asteroid':false,//no astmosphere and not many rules/science
		'atm_rocky':false,//you cannot splash!
		'atm_rocky_liquid':false,//you can splash!
		'rocky':false,//no atmosphere!
		'gas':false,//jool
		'star':false//kerbol
	};
	this.celestial_bodies=[];//our heap
	this.celestial_bodies_schema={
		'ident':'',//string
		'name':'',//string
		'orbiting_body':false,//string - false if sun
		'satellite_bodies':[],//array
		'body_type':'',//string white list -> this.body_types_schema
		'biomes':[]
	};
	this.default_bodies=[
		{'ident':'Sun','name':'Kerbold','orbiting_body':false,'body_type':'star'},
		{'ident':'Moho','name':'Moho','orbiting_body':'Sun','body_type':'rocky'},
		{'ident':'Eve','name':'Eve','orbiting_body':'Sun','body_type':'atm_rocky'},
			{'ident':'Gilly','name':'Gilly','orbiting_body':'Eve','body_type':'rocky'},
		{
			'ident':'Kerbin',
			'name':'Kerbin',
			'orbiting_body':'Sun',
			'body_type':'atm_rocky_liquid',
			'biomes':['Grasslands','Highlands','Mountains','Deserts','Badlands','Tundra','IceCaps','Water','Shores','KSC','Administration','AstronautComplex','FlagPole','LaunchPad','Crawlerway','VAB','VABPodMemorial','VABMainBuilding','VABTanks','VABRoundTank','Runway','SPH','SPHMainBuilding','SPHWaterTower','SPHRoundTank','SPHTanks','TrackingStation','TrackingStationDishEast','TrackingStationDishSouth','TrackingStationDishNorth','TrackingStationHub','R&D','R&DCentralBuilding','R&DSmallLab','R&DMainBuilding','R&DObservatory','R&DCornerLab','R&DTanks','R&DWindTunnel','R&DSideLab','MissionControl']	//	Crawerlway	Administration	Astronaut Complex	Mission Control	Research and Development	Spaceplane Hanger	Tracking Station	Vehicle Assembly Building
		},
			{
				'ident':'Mun',
				'name':'Mun',
				'orbiting_body':'Kerbin',
				'body_type':'rocky',
				'biomes':['NorthernBasin','HighlandCraters','Highlands','MidlandCraters','Midlands','Canyons','EastCrater','EastFarsideCrater',
					'FarsideCrater','NorthwestCrater','SouthwestCrater','TwinCraters','PolarCrater','PolarLowlands','Poles']
			},
			{
				'ident':'Minmus',
				'name':'Minmus',
				'orbiting_body':'Kerbin',
				'body_type':'rocky',
				'biomes':['Highlands','Midlands','Lowlands','Slopes','LesserFlats','Flats','GreatFlats','GreaterFlats','Poles']
			},/**/
		{'ident':'Duna','name':'Duna','orbiting_body':'Sun','body_type':'atm_rocky'},
			{'ident':'Ike','name':'Ike','orbiting_body':'Duna','body_type':'rocky'},
		{'ident':'Dres','name':'Dres','orbiting_body':'Sun','body_type':'rocky'},
		{'ident':'Jool','name':'Jool','orbiting_body':'Sun','body_type':'gas'},
			{'ident':'Laythe','name':'Laythe','orbiting_body':'Jool','body_type':'atm_rocky_liquid'},
			{'ident':'Vall','name':'Vall','orbiting_body':'Jool','body_type':'rocky'},
			{'ident':'Tylo','name':'Tylo','orbiting_body':'Jool','body_type':'rocky'},
			{'ident':'Bop','name':'Bop','orbiting_body':'Jool','body_type':'rocky'},
			{'ident':'Pol','name':'Pol','orbiting_body':'Jool','body_type':'rocky'},
		{'ident':'Eeloo','name':'Eeloo','orbiting_body':'Sun','body_type':'rocky'}
	];


	this.plugin={
		'pre_add_body':false,
		'add_body':false,
		'pre_get_rail_rules':false,
		'get_rail_rules':false,
		'is_celestial_body':false
	};
	this.init();
}
kspUniverse.prototype.init=function(){
	var self=this;
	for(var b=0;b<self.default_bodies.length;b++){
		var new_line=$.extend(true,{},self.celestial_bodies_schema,self.default_bodies[b]);
		self.add_body(new_line.orbiting_body, new_line.ident, new_line.body_type, new_line.biomes, {'name':new_line.name});
	}
};
kspUniverse.prototype.i_callback=function(hookIn,argsIn){//internal callback - pluginable hooks
	var self=this,
		has_callback=false;
	try{
		//if(typeof(this.plugin[hookIn])=='object' &&  this.plugin[hookIn] instanceof Array){has_callback=true;}
		//else 
		if(typeof(self.plugin[hookIn])=='function'){has_callback=true;}
	}catch(e){}
	if(has_callback){
		var args=Array(argsIn);
		self.plugin[hookIn].apply(self, args);
		obj=args[0];//push values up
		return true;
	}
	return false;
};
kspUniverse.prototype.add_body=function(orbitBodyId,ident,planetType,planetBios,metaObj){
	var self=this,
		orbit_body_data={},
		add_line=$.extend(true,{},self.celestial_bodies_schema,{});//must break js 'pass by reference'
	if($.inArray(planetType,array_keys(self.body_types_schema))===-1){return false;}
	if(orbitBodyId!==false && !self.is_celestial_body(orbitBodyId,orbit_body_data)){return false;}//orbiting something check -> false is allowed for the sun... or something that just needs to be there somehow
	if(self.is_celestial_body(ident)){return false;}//existing check
	add_line.ident=ident;
	add_line.name=(bdcheck_key(metaObj,'name')?metaObj.name:ident);
	add_line.orbiting_body=orbitBodyId;
	add_line.body_type=planetType;
	add_line.biomes=(typeof(planetBios)=='object' && planetBios instanceof Array && planetBios.length>0?planetBios:[]);

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'add_line':add_line},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('pre_add_body',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

	
	self.celestial_bodies.push($.extend(true,{},add_line,{'biomes':[]}));//extending so the biomes go through the method.  for future plugin hooks!
	for(var b in add_line.biomes){self.add_biome(add_line.ident,add_line.biomes[b]);}
	if(orbitBodyId!==false){//if declared as orbiting something; add to its parent orbit list
		self.celestial_bodies[orbit_body_data.pos].satellite_bodies.push(add_line.ident);}

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'add_line':add_line},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('add_body',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

	return true;
};
kspUniverse.prototype.add_biome=function(planetIdent,biomeIdent){
	var self=this,
		body_data={};
	if(!self.is_celestial_body(planetIdent,body_data)){return false;}
	if($.inArray(biomeIdent,body_data.biomes)!==-1){return false;}
	self.celestial_bodies[body_data.pos].biomes.push(biomeIdent);
	return true;
};
kspUniverse.prototype.get_rail_rules=function(planetType,doDebug){
	var self=this,
		rails=$.extend(true,{},self.body_rails_schema,{}),//must break js 'pass by reference'
		has_atmosphere=false;

	if($.inArray(planetType,array_keys(self.body_types_schema))===-1){return false;}
	//if(!self.is_celestial_body(planetIdent)){return false;}

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'planetType':planetType,'rails':rails,'has_atmosphere':has_atmosphere},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('pre_get_rail_rules',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

if(doDebug){console.log('planetType',planetType,JSON.stringify(planetType));}

	if(planetType=='asteroid'){
if(doDebug){console.log('----planetType',planetType,JSON.stringify(planetType));}
		//do nothing
	}else if(planetType=='atm_rocky_liquid'){
if(doDebug){console.log('----planetType',planetType,JSON.stringify(planetType));}
		rails.high_orbit=true;
		rails.low_orbit=true;
		rails.high_fly=true;
		rails.low_fly=true;
		rails.surface=true;
		rails.splash=true;
		//non-rail rule
		has_atmosphere=true;
	}else if(planetType=='atm_rocky'){
if(doDebug){console.log('----planetType',planetType,JSON.stringify(planetType));}
		rails.high_orbit=true;
		rails.low_orbit=true;
		rails.high_fly=true;
		rails.low_fly=true;
		rails.surface=true;
		//non-rail rule
		has_atmosphere=true;
	}else if(planetType=='rocky'){
if(doDebug){console.log('----planetType',planetType,JSON.stringify(planetType));}
		rails.high_orbit=true;
		rails.low_orbit=true;
		rails.surface=true;
	}else if(planetType=='gas'){
if(doDebug){console.log('----planetType',planetType,JSON.stringify(planetType));}
		rails.high_orbit=true;
		rails.low_orbit=true;
		rails.high_fly=true;
		rails.low_fly=true;
		rails.surface=true;
		//non-rail rule
		has_atmosphere=true;
	}else{//planetType=='star'
if(doDebug){console.log('----planetType',planetType,JSON.stringify(planetType));}
		rails.high_orbit=true;
		rails.low_orbit=true;
	}

if(doDebug){console.log('----rails 1',$.extend(true,{},rails));}
	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'planetType':planetType,'rails':rails,'has_atmosphere':has_atmosphere},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('get_rail_rules',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////
if(doDebug){console.log('----rails 2',$.extend(true,{},rails));}
	return {'rails':rails,'has_atmosphere':has_atmosphere};
};
kspUniverse.prototype.is_biome=function(biomeIdent,planetIdent,foundObjRef){//foundObjRef is a 'push up' pass by reference
	var self=this,
		body_info={};
	if(!self.is_celestial_body(planetIdent,body_info)){return false;}
	if($.inArray(biomeIdent,body_info.biomes)!==-1){foundObjRef=body_info;return true;}
	return false;
};
kspUniverse.prototype.is_celestial_body=function(ident,foundObjRef,doDebug){//foundObjRef is a 'push up' pass by reference
	var self=this,
		result=$.inArray(ident,flatten_array(self.celestial_bodies,'ident'));
if(doDebug){console.log('============is_celestial_body(',ident,')','typeof(foundObjRef)',typeof(foundObjRef));}
if(doDebug){console.log('result',result);}
	if(result!==-1 && typeof(foundObjRef)=='object'){
		for(var cb in self.celestial_bodies[result]){
			if(bdcheck_key(self.celestial_bodies[result],cb)){
				foundObjRef[cb]=self.celestial_bodies[result][cb];
			}
		}
		foundObjRef['pos']=result;
	}
	if(result!==-1){
		///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
		var _args={'result':result,'foundObjRef':foundObjRef,'ident':ident},
			key_list=array_keys(_args),
			_vr='';
		self.i_callback('is_celestial_body',_args);
		for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
		///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////
	}
	return (result!==-1?true:false);//if not-not found
};



////////////////////////////////////
function kspSci(kspUniObj){
	this.ksp_uni_obj=(typeof(kspUniObj)=='object' && kspUniObj.constructor==kspUniverse?kspUniObj:new kspUniverse());
	this.sciences=[];
	this.sciences_schema={
		'ident':'',
		'name':'',
		'meta':{'ignore_planet_rail':false,'require_atmosphere':false,'rails_as_groups':false},//'ignore_planet_rail':false is dead.  Left for reference
		'rail_context':false,
		'biome_context':false
	};
/*
// situation bits:
// SrfLanded = 1,
// SrfSplashed = 2,
// FlyingLow = 4,
// FlyingHigh = 8,
// InSpaceLow = 16,
// InSpaceHigh = 32
	situationMask = 63 -> all added together
	biomeMask = 7 -> first 3 added together
*/
	this.default_sciences=[
		{'ident':'asteroidSample','name':'Asteroid Surface Sample','biome_context':{'low_fly':true,'surface':true,'splash':true},'rail_context':true},//,'meta':{'ignore_planet_rail':'asteroid'} <- was here but I realized you can't have astroids as places there are more like vessels
		{'ident':'surfaceSample','name':'Surface Sample','biome_context':{'surface':true,'splash':true},'rail_context':{'splash':true,'surface':true}},
		{'ident':'evaReport','name':'EVA Report','biome_context':{'low_orbit':true,'low_fly':true,'surface':true,'splash':true},'rail_context':true},
		{'ident':'crewReport','name':'Crew Report','biome_context':{'low_fly':true,'surface':true,'splash':true},'rail_context':true},
		{'ident':'mysteryGoo','name':'Goo','biome_context':{'surface':true,'splash':true},'rail_context':true},
		{'ident':'mobileMaterialsLab','name':'Materials Bay','biome_context':{'surface':true,'splash':true},'rail_context':true},
		{'ident':'temperatureScan','name':'Temperature Scan','biome_context':{'low_fly':true,'surface':true,'splash':true},'rail_context':{'low_orbit':true,'high_fly':true,'low_fly':true,'splash':true,'surface':true}},
		{'ident':'barometerScan','name':'Barometer Scan','biome_context':{'surface':true,'splash':true},'rail_context':{'high_fly':true,'low_fly':true,'splash':true,'surface':true},'meta':{'require_atmosphere':true}},
		{'ident':'gravityScan','name':'Gravioli Particles','biome_context':{'high_orbit':true,'low_orbit':true,'surface':true,'splash':true},'rail_context':{'high_orbit':true,'low_orbit':true,'splash':true,'surface':true}},
		{'ident':'seismicScan','name':'Seismic Scan','biome_context':{'surface':true},'rail_context':{'surface':true}},
		{'ident':'atmosphereAnalysis','name':'S.A.C Nose Cone','biome_context':{'high_fly':true,'low_fly':true,'surface':true},'rail_context':{'high_fly':true,'low_fly':true,'surface':true},'meta':{'require_atmosphere':true}},
		{'ident':'recovery','name':'Vessel Recovery','biome_context':false,'rail_context':true,'meta':{'rails_as_groups':true}}//rails as groups says to ignore the rails labels and use the group labels.  This is just a hack for recovery
	];
	this.plugin={
		'pre_add_science':false,
		'add_science':false,
		'pre_get_rail_rules':false,
		'get_rail_rules_line':false,
		'get_rail_rules':false
	};

	this.init();
}
//kspSci.prototype = new kspUniverse();
kspSci.prototype.init=function(){//kspSci.init fires then kspUniverse.init
	var self=this;
	for(var b=0;b<self.default_sciences.length;b++){
		var new_line=$.extend(true,{},self.sciences_schema,self.default_sciences[b]);
		self.add_science(new_line.ident, new_line.biome_context, new_line.rail_context, $.extend(true,{},new_line.meta,{'name':new_line.name}));//adding name into the meta due to how I arrange the defaults
	}
};
kspSci.prototype.i_callback=function(hookIn,argsIn){//internal callback - pluginable hooks
	var self=this,
		has_callback=false;
	try{
		//if(typeof(this.plugin[hookIn])=='object' &&  this.plugin[hookIn] instanceof Array){has_callback=true;}
		//else 
		if(typeof(self.plugin[hookIn])=='function'){has_callback=true;}
	}catch(e){}
	if(has_callback){
		var args=Array(argsIn);
		self.plugin[hookIn].apply(self, args);
		obj=args[0];//push values up
		return true;
	}
	return false;
};
kspSci.prototype.add_science=function(ident,biomeObj,railObj,metaObj){
	var self=this,
		default_rails=$.extend(true,{},self.ksp_uni_obj.body_rails_schema,{}),//must break js 'pass by reference'
		add_line=$.extend(true,{},self.sciences_schema,{});//must break js 'pass by reference'
	if(typeof(biomeObj)=='object'){//possible it comes through as boolean!
		for(var tk in biomeObj){
			if(bdcheck_key(biomeObj,tk)){
				if($.inArray(tk,array_keys(default_rails))===-1){return false;}}}}//1 not found we reject it.  Important to populate the KSP Universe object first!
	if(typeof(railObj)=='object'){//possible it comes through as boolean!
		for(var tk in railObj){
			if(bdcheck_key(railObj,tk)){
				if($.inArray(tk,array_keys(default_rails))===-1){return false;}}}}//1 not found we reject it.  Important to populate the KSP Universe object first!
	if(self.is_science(ident)){return false;}//existing check

	add_line.ident=ident;
	if(bdcheck_key(metaObj,'name')){
		add_line.name=metaObj.name;
		delete metaObj.name;
	}else{
		add_line.name=ident;}

	add_line.meta=metaObj;
	if(typeof(biomeObj)=='object' && biomeObj instanceof Object){
		add_line.biome_context=$.extend(true,{},default_rails,biomeObj);}//include defaults
	else{
		add_line.biome_context=(typeof(biomeObj)=='boolean'?biomeObj:false);}
	if(typeof(railObj)=='object' && railObj instanceof Object){
		add_line.rail_context=$.extend(true,{},default_rails,railObj);}//include defaults
	else{
		add_line.rail_context=(typeof(railObj)=='boolean'?railObj:false);}

	var boolean_to_context_obj=function(objIn,objOut){
		var output={};
		for(var itm in objOut){//objOut aka science_data.biome_context looping through the defaults basically
			if(bdcheck_key(objOut,itm)){//key not a prototype!
				if(typeof(objIn)=='boolean'){//objIn aka science_data.biome_context -> might be boolean - just expand the boolean value into the object index one might be expecting
					output[itm]=(objIn?true:false);
//console.log(itm,'bool',objIn,"\n",'output['+itm+']',output[itm]);
				}else{
					if(bdcheck_key(objIn,itm)){//were we provided the value from the science rules
//console.log('objIn['+itm+'](sci rule)',objIn[itm]);
						output[itm]=(objIn[itm]?true:false);}
					else{
//console.log('objOut['+itm+'](default rule)',objOut[itm]);
						output[itm]=objOut[itm];}//use the default!
//console.log(itm,'obj!',"\n",'output['+itm+']',output[itm]);
				}
			}
		}
//console.log('context(science rules)',(typeof(objIn)=='boolean'?objIn:$.extend(true,{},objIn)),'rule(defaults)',(typeof(objOut)=='boolean'?objOut:$.extend(true,{},objOut)),'output',(typeof(output)=='boolean'?output:$.extend(true,{},output)));
		return output;
	};

	add_line.rail_context=boolean_to_context_obj(add_line.rail_context, $.extend(true,{},self.ksp_uni_obj.body_rails_schema,{}));//expand the values
//console.log('==========================================');
	add_line.biome_context=boolean_to_context_obj(add_line.biome_context, $.extend(true,{},self.ksp_uni_obj.body_rails_schema,{}));//expand the values

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'add_line':add_line},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('pre_add_science',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

	self.sciences.push(add_line);

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'add_line':add_line},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('add_science',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

	return true;
};
kspSci.prototype.get_rail_rules=function(scienceIdent,planetType,doDebug){
	var self=this,
		science_data={};//for a pass by reference

	if($.inArray(planetType,array_keys(self.ksp_uni_obj.body_types_schema))===-1){return false;}//valid body type
	if(!self.is_science(scienceIdent,science_data)){return false;}//valid science id
 
	var rules={//this was here before when we expanded the contexts from boolean into the object.  however I moved it to the add phase at it was probably more helpful to keep the tree expanded
		'biome':$.extend(true,{},science_data.biome_context,{}),//must break js 'pass by reference'
		'rail':$.extend(true,{},science_data.rail_context,{}) //must break js 'pass by reference'
	};

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'planetType':planetType,'scienceIdent':scienceIdent,'rules':rules,'science_data':science_data},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('pre_get_rail_rules',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

	//cross reference planetary abilities
	var planet=self.ksp_uni_obj.get_rail_rules(planetType,doDebug);
/*
if(doDebug){console.log('planet',planet,"\n",
	'science_data.rail_context',$.extend(true,{},science_data.rail_context),"\n",
	'science_data.biome_context',$.extend(true,{},science_data.biome_context),"\n");}*/
	for(var pr in planet.rails){
		if(bdcheck_key(planet.rails,pr)){
			var line_rule={'planet_rule':planet.rails[pr],'has_atmosphere':planet.has_atmosphere,'rail':rules.rail[pr],'biome':rules.biome[pr]},
				has_rail_exception=false,
				has_atm_exception=false;

			if(science_data.meta.ignore_planet_rail==planetType || science_data.meta.ignore_planet_rail==true){has_rail_exception=true;}//old rule
			else if(science_data.meta.ignore_planet_rail instanceof Array && $.inArray(planetType, science_data.meta.ignore_planet_rail)!==-1){has_rail_exception=true;}//old rule
			
			if(science_data.meta.require_atmosphere==pr || science_data.meta.require_atmosphere==true){has_atm_exception=true;}
			else if(science_data.meta.require_atmosphere instanceof Array && $.inArray(pr,science_data.meta.require_atmosphere)!==-1){has_atm_exception=true;}
			if(pr=='high_fly' || pr=='low_fly'){has_atm_exception=true;}//you can only fly if there is an atmosphere!

			if(line_rule.planet_rule===false && has_rail_exception===true){//old rule
				line_rule.planet_rule=true;
			}else if(line_rule.planet_rule===false){//no rail no experiment! unless there is an exception specifically listed (above)
				line_rule.rail=false;
				line_rule.biome=false;
			}else if(line_rule.planet_rule && science_data.meta.rails_as_groups && self.ksp_uni_obj.body_rails[pr].group_ident){//just for recovery?!
				line_rule.rail=true;
			}
			
			//apply scientific dependancies!
			if(line_rule.rail===false){//no scientific rail... no biome!
				line_rule.biome=false;}
			if(line_rule.has_atmosphere===false && has_atm_exception){//atmosphere required!
//if(doDebug && scienceIdent=='asteroidSample'){console.log('atm except',pr);}
				line_rule.rail=false;
				line_rule.biome=false;}
			///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
			var _args={'planetType':planetType,'scienceIdent':scienceIdent,'rules':rules,'science_data':science_data,'line_rule':line_rule},
				key_list=array_keys(_args),
				_vr='';
			self.i_callback('get_rail_rules_line',_args);
			for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
			///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////
			
			//transfer to the return output
			rules.rail[pr]=line_rule.rail;
			rules.biome[pr]=line_rule.biome;
//if(doDebug){console.log(pr,'line_rule.rail',line_rule.rail,'line_rule.biome',line_rule.biome);}
		}
	}

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'planetType':planetType,'scienceIdent':scienceIdent,'rules':rules,'science_data':science_data},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('get_rail_rules',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////
if(doDebug){console.log(scienceIdent,'rules: rail ',science_data.rail_context,'biome',science_data.biome_context);}
	return {'rail_context':rules.rail,'biome_context':rules.biome};
	//return science_data;
};
kspSci.prototype.is_science=function(ident,foundObjRef){//foundObjRef is a 'push up' pass by reference ,doDeug
	var self=this,
		result=$.inArray(ident,flatten_array(self.sciences,'ident'));
//if(doDeug){console.log('is_science('+ident+')',result,"\n","flatten_array(self.sciences,'ident')",flatten_array(self.sciences,'ident'));}
	if(result!==-1 && typeof(foundObjRef)=='object'){
		for(var s in self.sciences[result]){
			if(bdcheck_key(self.sciences[result],s)){
				foundObjRef[s]=self.sciences[result][s];}}}
	return (result!==-1?true:false);//if not-not found
};
kspSci.prototype.parse_sci_id=function(sciIdIn){
	var self=this,
		rail_ident=false,
		regex_str='',
		rail_ids='',
		rails_arr=[],
		found_str=[];
	
	for(var br in self.ksp_uni_obj.body_rails){
		if(bdcheck_key(self.ksp_uni_obj.body_rails,br)){
			rails_arr.push(self.ksp_uni_obj.body_rails[br].ident);}}
	for(var br in self.ksp_uni_obj.body_rails){
		if(bdcheck_key(self.ksp_uni_obj.body_rails,br)){
			if($.inArray(self.ksp_uni_obj.body_rails[br].group_ident,rails_arr)==-1){
				rails_arr.push(self.ksp_uni_obj.body_rails[br].group_ident);}}}
		rails_arr.sort(function ( a, b ){
			if(a.length<b.length){return -1;}
			if(a.length>b.length){return 1;}
			return 0;});

	rail_ids=check_strip_last(rails_arr.join('|'),'|');
//console.log('regex_str',regex_str,"\n",'rail_ids',rail_ids);
	//scienceIdent@	//Planet	//Rail	//Biome	//_PotatoRoid######
	var rail_pat=new RegExp('('+rail_ids+')','gi'),
		roid_pat=new RegExp('_PotatoRoid([0-9]+)?$','gi'),
		test_str=sciIdIn,
		roid_result=roid_pat.exec(test_str),
		rail_result='',
		asteroid_ident='',
		biome='';
	if(roid_result!==null && (roid_result instanceof Array && roid_result.length>0)){
		test_str=check_strip_last(test_str,roid_result[0]);
		asteroid_ident=check_strip_first(roid_result[0],'_');
	}
	delete roid_result;
	//need to extract the rail to because when its mixed in JavaScript doesn't reliable match the string we're looking for

	rail_result=rail_pat.exec(test_str);
/*
var testing_arr=['crewReport@KerbinSrfLandedLaunchPad','crewReport@KerbinFlyingLowShores','crewReport@KerbinSrfSplashedWater','evaReport@KerbinInSpaceLowHighlands'];
var testing_arr=['evaReport@MunInSpaceLowHighlands'];
if($.inArray(sciIdIn,testing_arr)!==-1){
	console.log('rail_result',rail_result);}*/

	if(rail_result!==null && (rail_result instanceof Array && rail_result.length>0)){
		test_str=test_str.replace(new RegExp('('+rail_result[0]+')'),'|'+rail_result[0]+'|');//replace the found rail with something distinct.  Rails are pretty reliable as they probably won't change
		rail=rail_result[0];
	}//should return false because a bad rail is a justifyable halt
	delete rail_result;
	var regex_str='^(.+)@(.*)(\\|('+rail_ids+')\\|){1}(.*)',
		sci_pat=new RegExp(regex_str,'gi');

	while((match = sci_pat.exec(test_str)) != null){found_str.push({'pos':match.index,'match':match});}//pre-parse
	if(found_str.length>0){
		var science_ident=found_str[0].match[1],
			planet_ident=found_str[0].match[2],
			biome=found_str[0].match[5],
			sci_data={};
/*if($.inArray(sciIdIn,testing_arr)!==-1){
	console.log('test_str',test_str,'found_str[0].match',found_str[0].match,'biome',biome);}*/

		var t_seek={'rail':inObject(rail,flatten_object(self.ksp_uni_obj.body_rails,'ident')),'group':inObject(rail,flatten_object(self.ksp_uni_obj.body_rails,'group_ident'))};

		if(t_seek.rail!==-1){rail_ident=t_seek.rail;}
		else if(t_seek.group!==-1){rail_ident=t_seek.group;}
		else{try{console.warn('rail ',rail,' not found');}catch(e){}}

		if(self.is_science(science_ident,sci_data)){//known science <- this is a patch for a 'FlyBy' is FlyBy Stock?
			var biome_compact=object_group_val(sci_data.biome_context);
			//if(sci_data.biome_context===false){}
			if(sci_data.meta.rails_as_groups===true && (biome_compact.length==1 && biome_compact[0]===false)){//basically if its recovery?
				rail=rail+found_str[0].match[5];//anything after the rail (which is also match[4]) is the rail.  Recovery has special rules.  Its not even in the science file
				biome='';//biome should not be relavent
			}
		}
		
		return {
			'science_ident':science_ident,
			'planet_ident':planet_ident,
			'biome_ident':(basic_check(biome)?biome:false),
			'rail_ident':rail_ident,
			'rail':rail,
			'meta':{'asteroid_ident':(basic_check(asteroid_ident)?asteroid_ident:false)}
		};
	}
	return false;
};
kspSci.prototype.guess_body_type_from_sci=function(sciArrIn){//needs a array of objects.  expected parsed extracted objects.  {'rail'://the extraced rail name aka SrfLanded, 'science_ident'://the extracted science id} <- required objects keys
	var self=this,
		sci_atm={//science with atmosphere
		'atm':array_object_search(self.sciences,{'meta':{'require_atmosphere':true}},true,true),
		//'fly_low_biome':array_object_search(self.sciences,{'biome_context':{'low_fly':true}},true),//if the rail is true the biome doesn't apply
		//'fly_high_biome':array_object_search(self.sciences,{'biome_context':{'high_fly':true}},true),//if the rail is true the biome doesn't apply
		'fly_low_rail':array_object_search(self.sciences,{'rail_context':{'low_fly':true}},true),
		'fly_high_rail':array_object_search(self.sciences,{'rail_context':{'high_fly':true}},true)
	},
	sci_lqd=array_object_search(self.sciences,{'rail_context':{'splash':true}},true);
	//build a profile for the planet
	var this_body_sci=sciArrIn,//all the found science for this body
		this_body_rails=$.unique(flatten_array(this_body_sci,'rail')),
		has_obj={
			'found_rails':[],
			'atm':false,//atmosphere
			'lqd':false//liquid
		},
		body_type=false;

	this_body_rails=reduce_array_to_common_alias_values(this_body_rails,self.ksp_uni_obj.body_rails,'ident');//the list of rail_idents found! (non-group ids)
	has_obj.found_rails=has_obj.found_rails.concat(this_body_rails);
	delete this_body_rails;
	
	var flat_sci=flatten_array(this_body_sci,'science_ident'),
		flat_rail_key=flatten_array(this_body_sci,'rail_ident');
	for(var at=0;at<sci_atm.atm.length;at++){
		if($.inArray(sci_atm.atm[at].ident,flat_sci)!==-1){
			has_obj.atm=true;break;}}
	for(var at=0;at<sci_atm.fly_low_rail.length;at++){
		if(inArray_multi_seek([sci_atm.fly_low_rail[at].ident,'low_fly'],[flat_sci,flat_rail_key])!==-1){
			has_obj.atm=true;break;}}
	for(var at=0;at<sci_atm.fly_high_rail.length;at++){
		if(inArray_multi_seek([sci_atm.fly_high_rail[at].ident,'high_fly'],[flat_sci,flat_rail_key])!==-1){
			has_obj.atm=true;break;}}
	for(var at=0;at<sci_lqd.length;at++){
		if(inArray_multi_seek([sci_lqd[at].ident,'splash'],[flat_sci,flat_rail_key])!==-1){
			has_obj.lqd=true;break;}}

	if(has_obj.found_rails.length==3 && $.inArray('surface',has_obj.found_rails)!==-1 && $.inArray('low_orbit',has_obj.found_rails)!==-1 && $.inArray('high_orbit',has_obj.found_rails)!==-1){//if only 3 rails found surface, low_orbit, high_orbit
		body_type='rocky';
	}else if(has_obj.lqd && (has_obj.lqd || has_obj.atm)){//if atmosphere and splash
		body_type='atm_rocky_liquid';
	}else if((!has_obj.lqd) && (has_obj.lqd || has_obj.atm)){//if atmosphere and surface -> since gas planets 'can' have a surface it can be hard to differentiate - We'll do best guess since body type isn't that important
		if($.inArray('surface',has_obj.found_rails)!==-1){
			body_type='atm_rocky';}
		else{
			body_type='gas';}
	}else if(has_obj.found_rails.length==2  && $.inArray('low_orbit',has_obj.found_rails)!==-1 && $.inArray('high_orbit',has_obj.found_rails)!==-1){//starts have only 2 rails
		body_type='star';
	}else{//last chance asteroid or maybe a body
		body_type='asteroid';//assume asteroid won't hurt
		if(has_obj.found_rails.length>0){//guessing mode
			if($.inArray('surface',has_obj.found_rails)!==-1){//well its probably rocky
				body_type='rocky';
			}else if(($.inArray('low_orbit',has_obj.found_rails)!==-1 || $.inArray('high_orbit',has_obj.found_rails)!==-1) && has_obj.found_rails.length==1){//probably a star
				body_type='star';
			}else if(($.inArray('low_orbit',has_obj.found_rails)!==-1 || $.inArray('high_orbit',has_obj.found_rails)!==-1 || $.inArray('surface',has_obj.found_rails)!==-1) && has_obj.found_rails.length>0){//probably a rocky
				body_type='rocky';
			}
		}
	}
	return body_type;
};
kspSci.prototype.guess_science=function(sciId,sciArrIn){
	var self=this,
		rail_context=$.extend(true,{},self.ksp_uni_obj.body_rails_schema),
		biome_context=$.extend(true,{},self.ksp_uni_obj.body_rails_schema),
		new_meta=$.extend(true,{},self.sciences_schema.meta),//break pass by reference
		atm_bodies=[],
		atm_bodies_obj={
			'rocky':array_object_search(self.ksp_uni_obj.celestial_bodies,'body_type','atm_rocky'),
			'lqd':array_object_search(self.ksp_uni_obj.celestial_bodies,'body_type','atm_rocky_liquid'),
			'gas':array_object_search(self.ksp_uni_obj.celestial_bodies,'body_type','gas')
		},
		sci_bodies=array_object_search(page_data.parsed_science,'science_ident',sciId);//the list of bodies with this science
	atm_bodies=atm_bodies.concat((typeof(atm_bodies_obj.rocky)=='object'?atm_bodies_obj.rocky:[]),(typeof(atm_bodies_obj.lqd)=='object'?atm_bodies_obj.lqd:[]),(typeof(atm_bodies_obj.gas)=='object'?atm_bodies_obj.gas:[]));
	atm_bodies=$.unique(atm_bodies);
	delete atm_bodies_obj;
	
//console.log('sci_bodies',sci_bodies);
	var is_atm_only=false,
		is_lqd_rail=false,
		found_biomes=[],
		found_rails=[],
		raw_rail_count=0,
		atm_body_count=0,
		non_atm_body_count=0,
		lqd_body_count=0,
		atm_flat=flatten_array(atm_bodies,'ident');//from the list of planets - AKA YES DEF!;//from the list of science
		
		
	for(var sb=0;sb<sci_bodies.length;sb++){
		if(sci_bodies[sb].rail==self.ksp_uni_obj.body_rails.high_orbit.ident || sci_bodies[sb].rail==self.ksp_uni_obj.body_rails.low_orbit.ident){//this experiment orbiting! Not Atmosphere dependant!
			non_atm_body_count++;}
		else if(sci_bodies[sb].rail==self.ksp_uni_obj.body_rails.splash.ident){//this experiment splashed! Has atmosphere! Has Liquid!
			atm_body_count++;
			lqd_body_count++;}
		else if($.inArray(sci_bodies[sb].planet_ident,atm_flat)!==-1){//this planet ident is found, we know it has an atmosphere already!
			atm_body_count++;}
		else if(sci_bodies[sb].rail==self.ksp_uni_obj.body_rails.high_fly.ident || sci_bodies[sb].rail==self.ksp_uni_obj.body_rails.low_fly.ident){//this experiment was flown! Atmosphere dependant!
			atm_body_count++;}
		else{//this planet ident is not found, didn't fly and didn't splash not a planet with an atmosphere
			non_atm_body_count++;}
		
		//ready the rails for further examination
		if(basic_check(sci_bodies[sb].rail)){
			raw_rail_count++;
			found_rails.push(sci_bodies[sb].rail);
			if(basic_check(sci_bodies[sb].biome_ident)){found_biomes.push(sci_bodies[sb].rail);}
		}
	}

	found_biomes=$.unique(found_biomes);
	found_rails=$.unique(found_rails);
	found_biomes=reduce_array_to_common_alias_values(found_biomes,self.ksp_uni_obj.body_rails,'ident');
	found_rails=reduce_array_to_common_alias_values(found_rails,self.ksp_uni_obj.body_rails,'ident');//the list of rail_idents found! (non-group ids)
	
	for(var fr=0;fr<found_rails.length;fr++){
		if(bdcheck_key(rail_context,(found_rails[fr]))){
			if(found_rails[fr]=='splash'){lqd_body_count++;}
			rail_context[ (found_rails[fr]) ]=true;}}
	for(var fb=0;fb<found_biomes.length;fb++){
		if($.inArray(found_biomes[fb],found_rails)!==-1){//its in the rails so we are good!
			if(bdcheck_key(biome_context,(found_biomes[fb]))){
				if(found_rails[fr]=='splash'){lqd_body_count++;}
				biome_context[ (found_biomes[fb]) ]=true;}}}

	if(non_atm_body_count==0 && atm_body_count>0){is_atm_only=true;}
	if(lqd_body_count>0){is_lqd_rail=true;}

	//new_meta.ignore_planet_rail=true;//true if ???? attr not used
	if(is_atm_only){//true if experiement only appears in bodies that have atmospheres
		new_meta.require_atmosphere=true;}
	
	if(found_biomes.length==0 && found_rails.length==0 && raw_rail_count>0){//true if rails are not standard; aka group reference used such as recovery
		new_meta.rails_as_groups=true;}
	return {'sci_id':sciId,'biome_context':biome_context,'rail_context':rail_context,'meta':$.extend(true,{},new_meta,{'name':sciId})};
};
