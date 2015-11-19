function typeOf (obj) { return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();}

$(document).ready(function() {
    dropDownDataType();
});


function dropDownDataType(){
    var types = [{"type":"CSV","message":"Put in your header + a few hundred records to make a quick schema","default":true},{"type":"JSON (Soon)","message":"Not Yet","default":false},{"type":"XML (Soon)","message":"Not Yet","default":false}];
    $.each(types,function( key, value ) {
        $('#data-type').append($("<option></option>").attr("value",key).text(value.type));
    });
}

//Push Button to Make Schema
$(function() {
    $("#make-ecl").click( function(){ readSampleData();});
});

function readSampleData(){
    var dataType = parseInt($('#data-type').val());
    if(dataType === '' || isNaN(dataType) === true){ alert('No Data Type Selected');return; }
    var schemaName = String($('#schema-name').val());
    if(schemaName === '' ){ alert('Input a Schema Name');return; }
    var sampleData = $("#sample-data").val();
    if(sampleData.length < 1){ alert('No Data To Make a Schema');return; }
    
    switch(dataType) {
        case 0:
            csvParse(sampleData);
            break;
        case 1:
            alert('No JSON Yet');
            break;
        case 2:
            alert('No XML Yet');
            break;
        default:
            alert('ERROR: Robot Attack');
    } 
    $("#ecl-schema").css("background-color","#CEF6CE").slideDown(1750);
}


function csvParse(stringData){
    var dataArray = Papa.parse(stringData,{dynamicTyping:true});
     //console.log(dataArray);
     csvMakeECL(dataArray);
    //return CSVtoArray(stringData);
}

function csvMakeECL(csvJsArray){
    
     var header_data = csvJsArray.data[0];
     //console.log(header_data);
    
     var header_counter = new Object();
      var header_counter_array = new Array();
     
          $.each(csvJsArray.data[0],function(key,value){
              header_counter[value] = 0;
              var loop_array = new Object();
              loop_array["counter"] = 0;
              loop_array["numbers"] = 0;
              loop_array["strings"] = 0;
              header_counter_array[value] = loop_array;
          });
          
          //console.log(header_counter)
     $.each(csvJsArray.data,function(key,value){
         
         if(key !== 0){
            $.each(value,function(key2,value2){
                        var element_name_1 = Object.keys(header_counter_array)[key2];
                        //console.log(element_name_1)
                        //console.log(typeOf(value2));
                        var value_length = String(value2).length;
                        if(value_length > header_counter_array[element_name_1].counter){header_counter_array[element_name_1].counter = value_length;}
                        if(typeOf(value2) === "string"){header_counter_array[element_name_1].strings = header_counter_array[element_name_1].strings + 1;}
                        if(typeOf(value2) === "number"){header_counter_array[element_name_1].numbers = header_counter_array[element_name_1].numbers + 1;}
            });
         }
     });
     
     var ecl = '';
     for(var a in header_counter_array){
         var type_ecl = 'STRING';
         if(header_counter_array[a].strings === 0 && header_counter_array[a].numbers > 0){ type_ecl = 'INT';}
         ecl = ecl + '       ' + type_ecl + variableLengthCheck(header_counter_array[a].counter) + '  '+ cleanUpName(a) + '; \r\n';
     }     
    ecl = ecl_bookends($('#schema-name').val(),ecl);
    $('#ecl-schema').val(ecl);
}

function cleanUpName(string){
    string = string.toLowerCase().replace(/^(.)|\s(.)/g, function($1) { return $1.toUpperCase(); });
    string = string.replace(/ /g, '_');
    return string.replace(/[^A-Za-z_0-9]/g,''); //except letters & "_"
}

function ecl_bookends(schema_name,ecl_string){
     var ecl = cleanUpName(String(schema_name)) + ' := RECORD\r\n';
     ecl = ecl + ecl_string;
     ecl = ecl + '  END;'; 
    return ecl;
}

function variableLengthCheck(number){
    if(number === 0){return '{???}';}else{ return number;}
}