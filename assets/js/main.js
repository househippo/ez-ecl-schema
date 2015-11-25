function typeOf (obj) { return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();}
function isDecimal(decimal1){return /^[-+]?[0-9]+\.[0-9]+$/.test(decimal1);}
function isFloat(float1){}

debug = false;

$(document).ready(function(){ dropDownDataType(); });

function dropDownDataType(){
    var types = [{"type":"CSV","message":"Put in your header + a few hundred records to make a quick schema","default":true,"sample":""},{"type":"JSON (Coming Soon)","message":"Not Yet","default":false},{"type":"XML (Coming Soon)","message":"Not Yet","default":false}];
    $.each(types,function( key, value ) {
        $('#data-type').append($("<option></option>").attr("value",key).text(value.type));
    });
}

//Push Button to Make Schema
$(function() { $("#make-ecl").click( function(){readSampleData();});});

function readSampleData(){
    var dataType = parseInt($('#data-type').val());
    if(dataType === '' || isNaN(dataType) === true){ alert('No Data Type Selected');return; }
    var schemaName = String($('#schema-name').val());
    if(schemaName === '' ){ alert('Input a Schema Name');return; }
    var sampleData = $("#sample-data").val();
    if(sampleData.length < 1){ alert('No Data To Make a Schema');return; }
    
    switch(dataType) {
        case 0:
            csvMakeECL(sampleData);
            break;
        case 1:
            alert('No JSON Yet');
            //jsonMakeECL(sampleData)
            break;
        case 2:
            alert('No XML Yet');
            break;
        default:
            alert('ERROR: Robot Attack');
    } 
    $("#ecl-schema").css("background-color","#CEF6CE").slideDown(1750);
}

function csvMakeECL(stringData){
      var csvJsArray = Papa.parse(stringData,{dynamicTyping:true});
      var header_data = csvJsArray.data[0];
      var header_counter = new Object();
      var header_counter_array = new Array();
      if(debug === true){console.log(csvJsArray);}
          $.each(csvJsArray.data[0],function(key,value){
              header_counter[value] = 0;

              var loop_array = new Object();
              loop_array["counter"] = 0;
              loop_array["numbers"] = 0;
              loop_array["strings"] = 0;
              loop_array["numberType"] = null;
              loop_array["stringType"] = null;
              loop_array["maxIntValue"] = 0;
              header_counter_array[value] = loop_array;
          });
          
          //console.log(header_counter)
     $.each(csvJsArray.data,function(key,value){
         
         if(key !== 0){
            $.each(value,function(key2,value2){
                        var element_name_1 = Object.keys(header_counter_array)[key2];
                        var value_length = String(value2).length;
                        
                        if(value_length > header_counter_array[element_name_1].counter){header_counter_array[element_name_1].counter = value_length;}
                        var typeTest = String(typeOf(value2));
                        if(typeTest === "string"){header_counter_array[element_name_1].strings = header_counter_array[element_name_1].strings + 1;}
                        if(typeTest === "number"){
                            header_counter_array[element_name_1].numbers = header_counter_array[element_name_1].numbers + 1;
                            
                            if(isDecimal(value2) && header_counter_array[element_name_1].numberType === null){
                               header_counter_array[element_name_1].numberType = 'decimal';
                            }
                           if( header_counter_array[element_name_1].maxIntValue < value2){header_counter_array[element_name_1].maxIntValue = value2; } 
                                
                        }
            });
         }
     });
     
     if(debug === true){console.log(header_counter_array);}
     
     var check_number = false;
     if($("#no_numbers").is(':checked')){check_number = true;}
     
     var ecl = '';
     var counter = 1;
     
     for(var a in header_counter_array){
         if(debug === true){console.log(a);}
         var type_ecl = '';
         if(header_counter_array[a].strings === 0 && header_counter_array[a].numbers > 0){
           if(header_counter_array[a].numberType === 'decimal'){
                type_ecl = 'DECIMAL';
                ecl = ecl + '       ' + type_ecl + variableLengthCheck(header_counter_array[a].counter) + '  '+ cleanUpName(a) + ';'+showNumber(counter,check_number)+'\r\n';
            }else{
               type_ecl = 'INTEGER';
               ecl = ecl + '       ' + type_ecl + integerSize(header_counter_array[a].maxIntValue) + '  '+ cleanUpName(a) + ';'+showNumber(counter,check_number)+'\r\n';
            }
         }else{
         type_ecl = 'STRING';
         ecl = ecl + '       ' + type_ecl + variableLengthCheck(header_counter_array[a].counter) + '  '+ cleanUpName(a) + ';'+showNumber(counter,check_number)+'\r\n';
         }
         counter++;
     }     
    ecl = ecl_bookends($('#schema-name').val(),ecl);
    $('#ecl-schema').val(ecl);
}

function variableLengthCheck(number){ if(number === 0){return '{???}';}else{ return number;}}

function integerSize(size){  
    var size = Math.abs(size);
    if(size <= 128){ return 1;}
    if(size <= 32768){ return 2;}
    if(size <= 8388608){ return 3;}
    if(size <= 2147483648){ return 4;}
    if(size <= 549755813887){ return 5;}
    if(size <= 140737488355327){ return 6;}
    if(size < 140737488355327){ return 8;}
}

function showNumber(number,status){ if(status){return   '   //'+number+' ';}else{return '';} }

///////////////////JSON///////////////////////////
function jsonMakeECL(json){
    var obj = jQuery.parseJSON(json);
    
     var j_array = new Array();

    for (var a in obj){    
    if(debug === true){console.log(typeOf(obj[a]));}
    
    if(typeOf(obj[a]) === "string"){
        var l_array = new Array();
        l_array["Type"] = "string";
        l_array["Size"] = obj[a].length;             
        j_array[a] = l_array;
    }
      if(typeOf(obj[a]) === "number"){
        var l_array = new Array();
        l_array["Type"] = "number";
        var value1 = String(obj[a]);
        l_array["Size"] = value1.length;             
        j_array[a] = l_array;
      }
    }
    console.log(j_array);
}

function cleanUpName(string){
    //string = string.toLowerCase().replace(/^(.)|\s(.)/g, function($1) { return $1.toUpperCase(); });
    string = string.replace(/ /g, '_');
    //string = string.replace(/ /g, '_').toLowerCase();
    return string.replace(/[^A-Za-z_0-9]/g,''); //except letters & "_"
}

function ecl_bookends(schema_name,ecl_string){
     var ecl = String(schema_name).trim() + ' := RECORD\r\n';
     ecl = ecl + ecl_string;
     ecl = ecl + '  END;'; 
    return ecl;
}