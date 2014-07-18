(function(){
/*

/*
tableObj.add_line(['adf',			'asdf',		'adfasdf',	'adfasdfasdf',				'aasdasdasdf','aasdasdaf'],{'row_type':'head'});//table should kurplunk
tableObj.add_line(['gjfdj43523',	'gdj43523',	'j43523',	tableObj.reserve_merge(),	'j43523','j43523','gdj43523',tableObj.reserve_merge()],{'row_type':'head'});
tableObj.add_line(['gjfdj43523',	'gdj43523',	'j43523',	tableObj.reserve_merge(),	'j43523','j43523','gdj43523','j43523'],{'row_type':'head'});
tableObj.add_line(['gjfdj43523',	'gdj43523',	'j43523',	'gdj43523',					'j43523','j43523','gdj43523','j43523'],{'row_type':'head'});
tableObj.add_line(['gjfdj43523',	'gdj43523',	'j43523',	'gdj43523',					'j43523','j43523','gdj43523','j43523'],{'row_type':'head'});*/
/*
tableObj.add_line(['adf',			'asdf',		'adfasdf',	'adfasdfasdf',				'aasdasdasdf','aasdasdaf'],{'row_type':'head'});//table should kurplunk
tableObj.add_line(['gjfdj43523',	'gdj43523',	'j43523',	tableObj.reserve_merge_col(),	'j43523','j43523','gdj43523 a',tableObj.reserve_merge_col()],{'row_type':'head'});
tableObj.add_line(['gjfdj43523',	'gdj43523',	'j43523',	tableObj.reserve_merge_col(),	'j43523','j43523','gdj43523 b','j43523'],{'row_type':'head'});
tableObj.add_line(['gjfdj43523',	'gdj43523',	'j43523',	'gdj43523',					'j43523','j43523','gdj43523','j43523'],{'row_type':'head'});
tableObj.add_line(['gjfdj43523',	'gdj43523',	'j43523',	'gdj43523',					'j43523','j43523','gdj43523','j43523'],{'row_type':'head'});
tableObj.add_line(['gjfdj43523',	'gdj43523',	'j43523',	'gdj43523',					'j43523','j43523','gdj43523','j43523'],{'row_type':'head'});
tableObj.add_line(['gjfdj43523',	tableObj.reserve_merge_row(),	tableObj.reserve_merge_row(),	tableObj.reserve_merge_row(),	'j43523','j43523','gdj43523','j43523'],{'row_type':'head'});
tableObj.draw_table(table_target_obj);*/
/*	console.log(
kspSciObj.parse_sci_id('recovery@KerbinFlew'),
kspSciObj.parse_sci_id('crewReport@KerbinSrfLandedLaunchPad'),
kspSciObj.parse_sci_id('crewReport@KerbinFlyingLowShores'),
kspSciObj.parse_sci_id('crewReport@KerbinSrfSplashedWater'),
kspSciObj.parse_sci_id('evaReport@KerbinInSpaceLowHighlands')
);
return;
*/

/*
//quick copy-paste unit test
var str='',allkeys='';
for(var kb in kspUniObj.body_types){
	allkeys=allkeys+kb+'|';
	str=str+"//////////"+kb+"\n";
	str=str+"if(do_test=='"+kb+"'){\n";
	str=str+"console.log('do_test',do_test);\n";
	for(var ks in kspSciObj.sciences){str=str+"\t"+"kspSciObj.get_rail_rules('"+kspSciObj.sciences[ks].ident+"','"+kb+"');\n";}
	str=str+"}\n";}
console.log('var do_test=\''+kb+'\';'+'//'+allkeys+"\n"+str);*/
//this was out putted to console to do tests
var do_test='atm_rocky';//asteroid|atm_rocky|atm_rocky_liquid|rocky|gas|star|
//////////asteroid
if(do_test=='asteroid'){
console.log('do_test',do_test);
	kspSciObj.get_rail_rules('asteroidSample','asteroid',true);
	kspSciObj.get_rail_rules('surfaceSample','asteroid',true);
	kspSciObj.get_rail_rules('evaReport','asteroid',true);
	kspSciObj.get_rail_rules('crewReport','asteroid',true);
	kspSciObj.get_rail_rules('mysteryGoo','asteroid',true);
	kspSciObj.get_rail_rules('mobileMaterialsLab','asteroid',true);
	kspSciObj.get_rail_rules('temperatureScan','asteroid',true);
	kspSciObj.get_rail_rules('barometerScan','asteroid',true);
	kspSciObj.get_rail_rules('gravityScan','asteroid',true);
	kspSciObj.get_rail_rules('seismicScan','asteroid',true);
	kspSciObj.get_rail_rules('atmosphereAnalysis','asteroid',true);
	kspSciObj.get_rail_rules('recovery','asteroid',true);
}
//////////atm_rocky
if(do_test=='atm_rocky'){
console.log('do_test',do_test);
	kspSciObj.get_rail_rules('asteroidSample','atm_rocky',true);
	kspSciObj.get_rail_rules('surfaceSample','atm_rocky',true);
	kspSciObj.get_rail_rules('evaReport','atm_rocky',true);
	kspSciObj.get_rail_rules('crewReport','atm_rocky',true);
	kspSciObj.get_rail_rules('mysteryGoo','atm_rocky',true);
	kspSciObj.get_rail_rules('mobileMaterialsLab','atm_rocky',true);
	kspSciObj.get_rail_rules('temperatureScan','atm_rocky',true);
	kspSciObj.get_rail_rules('barometerScan','atm_rocky',true);
	kspSciObj.get_rail_rules('gravityScan','atm_rocky',true);
	kspSciObj.get_rail_rules('seismicScan','atm_rocky',true);
	kspSciObj.get_rail_rules('atmosphereAnalysis','atm_rocky',true);
	kspSciObj.get_rail_rules('recovery','atm_rocky',true);
}
//////////atm_rocky_liquid
if(do_test=='atm_rocky_liquid'){
console.log('do_test',do_test);
	kspSciObj.get_rail_rules('asteroidSample','atm_rocky_liquid',true);
	kspSciObj.get_rail_rules('surfaceSample','atm_rocky_liquid',true);
	kspSciObj.get_rail_rules('evaReport','atm_rocky_liquid',true);
	kspSciObj.get_rail_rules('crewReport','atm_rocky_liquid',true);
	kspSciObj.get_rail_rules('mysteryGoo','atm_rocky_liquid',true);
	kspSciObj.get_rail_rules('mobileMaterialsLab','atm_rocky_liquid',true);
	kspSciObj.get_rail_rules('temperatureScan','atm_rocky_liquid',true);
	kspSciObj.get_rail_rules('barometerScan','atm_rocky_liquid',true);
	kspSciObj.get_rail_rules('gravityScan','atm_rocky_liquid',true);
	kspSciObj.get_rail_rules('seismicScan','atm_rocky_liquid',true);
	kspSciObj.get_rail_rules('atmosphereAnalysis','atm_rocky_liquid',true);
	kspSciObj.get_rail_rules('recovery','atm_rocky_liquid',true);
}
//////////rocky
if(do_test=='rocky'){
console.log('do_test',do_test);
	kspSciObj.get_rail_rules('asteroidSample','rocky',true);
	kspSciObj.get_rail_rules('surfaceSample','rocky',true);
	kspSciObj.get_rail_rules('evaReport','rocky',true);
	kspSciObj.get_rail_rules('crewReport','rocky',true);
	kspSciObj.get_rail_rules('mysteryGoo','rocky',true);
	kspSciObj.get_rail_rules('mobileMaterialsLab','rocky',true);
	kspSciObj.get_rail_rules('temperatureScan','rocky',true);
	kspSciObj.get_rail_rules('barometerScan','rocky',true);
	kspSciObj.get_rail_rules('gravityScan','rocky',true);
	kspSciObj.get_rail_rules('seismicScan','rocky',true);
	kspSciObj.get_rail_rules('atmosphereAnalysis','rocky',true);
	kspSciObj.get_rail_rules('recovery','rocky',true);
}
//////////gas
if(do_test=='gas'){
console.log('do_test',do_test);
	kspSciObj.get_rail_rules('asteroidSample','gas',true);
	kspSciObj.get_rail_rules('surfaceSample','gas',true);
	kspSciObj.get_rail_rules('evaReport','gas',true);
	kspSciObj.get_rail_rules('crewReport','gas',true);
	kspSciObj.get_rail_rules('mysteryGoo','gas',true);
	kspSciObj.get_rail_rules('mobileMaterialsLab','gas',true);
	kspSciObj.get_rail_rules('temperatureScan','gas',true);
	kspSciObj.get_rail_rules('barometerScan','gas',true);
	kspSciObj.get_rail_rules('gravityScan','gas',true);
	kspSciObj.get_rail_rules('seismicScan','gas',true);
	kspSciObj.get_rail_rules('atmosphereAnalysis','gas',true);
	kspSciObj.get_rail_rules('recovery','gas',true);
}
//////////star
if(do_test=='star'){
console.log('do_test',do_test);
	kspSciObj.get_rail_rules('asteroidSample','star',true);
	kspSciObj.get_rail_rules('surfaceSample','star',true);
	kspSciObj.get_rail_rules('evaReport','star',true);
	kspSciObj.get_rail_rules('crewReport','star',true);
	kspSciObj.get_rail_rules('mysteryGoo','star',true);
	kspSciObj.get_rail_rules('mobileMaterialsLab','star',true);
	kspSciObj.get_rail_rules('temperatureScan','star',true);
	kspSciObj.get_rail_rules('barometerScan','star',true);
	kspSciObj.get_rail_rules('gravityScan','star',true);
	kspSciObj.get_rail_rules('seismicScan','star',true);
	kspSciObj.get_rail_rules('atmosphereAnalysis','star',true);
	kspSciObj.get_rail_rules('recovery','star',true);
}
})();
/*
var mytmp_obj=$.extend(true,{},kspSciObj.sciences[1]);
Object.defineProperty(kspSciObj.sciences[1], 'rail_context', {
    get: function () {
        return mytmp_obj;
    },
    set: function (value) {

	console.trace();
alert('adf');
        mytmp_obj = value;
    }
});
*/