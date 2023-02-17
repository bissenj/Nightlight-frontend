/*
     List of helper classes loosely based around converting numbers and 
     dates which the app needs.  

     Generally used for computing distances, and storing/retrieving
     timestamps in the database.
*/


export function convertFeetToMiles(feet) {
    return feet / 5280;
}

export function convertMilesToFeet(miles) {
    return Math.round(miles * 5280);
}

export function convertMilesToMeters(miles) {
     return Math.round(miles * 1609.34);
}

export function convertMetersToFeet(alt) {
     return parseInt(alt * 3.281);
 }


// ------------------------------------------------------------
//  Used to convert a string containing a GPS location into
//  an object containing the Lat / Long coords.
// ------------------------------------------------------------
export function convertStringToCoords(gpsString) {
    var latLng = gpsString.replace("(", "").replace(")", "").split(", ")
    var latitude = parseFloat(latLng[0]);
    var longitude = parseFloat(latLng[1]);

    return { latitude, longitude };
}


// ------------------------------------------------------------
// Take in a string and return a formatted date string to display on screen
// Input format:  "2022-06-01T14:42:55.865Z"
//
// CURRENT NOT USED
//
// ------------------------------------------------------------
export function convertStringToDate2(dateString) {
    
    let result = "";
    if (dateString !== undefined) {
        let date = new Date(dateString);
        result = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.`;
    }
    else {
        result = getCurrentDateTime();
    }
    //console.log("convertStringToDate: ",dateString, result);    
    return result;
}


// ------------------------------------------------------------
// Input format:  "2022-06-01T14:42:55.865Z"
// Output format: "6/8/2022 at 9:05:48"
// ------------------------------------------------------------
export function convertStringToDate(dateString) {
     let result = "";
     if (dateString !== undefined) {
          const [dateComponents, timeComponents] = dateString.split('T');
          const [year, month, day] = dateComponents.split('-');
          let [hours, minutes, seconds] = timeComponents.split(':');
          let period = "am";
          if (hours > 12) {
               hours = hours - 12; 
               period = "pm";
          }
          result = `${month}/${day}/${year} at ${hours}:${minutes} ${period}.`;
     }
     else {
          result = "undefined";
     }
     return result;
}


// ------------------------------------------------------------
// Return a string representing a date/time in the following
// format:  year/month/day hour:min:sec
//          2023/01/20 07:15:55
// ------------------------------------------------------------
export function getCurrentDateTime() {
    var now     = new Date(); 
        var year    = now.getFullYear();
        var month   = now.getMonth()+1; 
        var day     = now.getDate();
        var hour    = now.getHours();
        var minute  = now.getMinutes();
        var second  = now.getSeconds(); 
        if(month.toString().length == 1) {
             month = '0'+month;
        }
        if(day.toString().length == 1) {
             day = '0'+day;
        }   
        if(hour.toString().length == 1) {
             hour = '0'+hour;
        }
        if(minute.toString().length == 1) {
             minute = '0'+minute;
        }
        if(second.toString().length == 1) {
             second = '0'+second;
        }   
        var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   
         return dateTime;
}


// ------------------------------------------------------------
// Return a string representing a date/time in the following
// format:  year-month-dayThour:min:sec.000Z
//          2023-01-20T07:15:55.000Z
// ------------------------------------------------------------
export function getCurrentDateTimeForDatabase() {
    var now     = new Date(); 
        var year    = now.getFullYear();
        var month   = now.getMonth()+1; 
        var day     = now.getDate();
        var hour    = now.getHours();
        var minute  = now.getMinutes();
        var second  = now.getSeconds(); 
        if(month.toString().length == 1) {
             month = '0'+month;
        }
        if(day.toString().length == 1) {
             day = '0'+day;
        }   
        if(hour.toString().length == 1) {
             hour = '0'+hour;
        }
        if(minute.toString().length == 1) {
             minute = '0'+minute;
        }
        if(second.toString().length == 1) {
             second = '0'+second;
        }   
        var dateTime = year+'-'+month+'-'+day+'T'+hour+':'+minute+':'+second+'.000Z';   
        //console.log("Current Date Time: ", dateTime);
        return dateTime;
}

