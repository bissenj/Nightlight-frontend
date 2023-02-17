/*
    Checks whether device is connected to a network or not, and 
    attempts to determine the connection speed.

    NOTES:

    So far, this was a failed attempt.  There isn't an easy way to determine how many
    bars a user has in React Native (that I can find).  So the issue is, the device may
    technically be ONLINE, but the signal is so poor network requests don't work.


    CURRENT SOLUTION: 

    Switched location saving logic to be offline first which circumvents needing to check if 
    device is online or not.  App just keeps trying (at smart times / when it makes sense) until 
    there is a good enough network connection.

    ----------------

    Leaving this file here in case I come back and find a better way to determine Go/No-Go 
    network connectivity.
    
*/


import NetInfo from '@react-native-community/netinfo';

export async function isOnline() {    
    let result = false;

    await NetInfo.fetch().then(state => {
        //console.log('Network State: ', state);
        //console.log('Connection type', state.type);
        console.log('Is connected?', state.isConnected);

        result = state.isConnected;
      });

    console.log('isOnline(): ', result);

    return result;
}


// Summary:  Attempt to determine if network speed is fast enough by 
//           pinging google.com 
//             
// export async function checkSpeed() {

//     const TIMER_LABEL = 'fetch-timer';
//     console.time(TIMER_LABEL);
    

//     await fetch('https://www.google.com')
//     .then((response) => {
//         if (response.status === 200) {
//             console.log('success');
//             console.timeEnd(TIMER_LABEL);
//         } else {
//             console.log('error');
//             console.timeEnd(TIMER_LABEL);
//         }
//     })
//     .catch((error) => {
//        console.log('network error: ' + error);
//        console.timeEnd(TIMER_LABEL);
//    });   
// }


// Summary:  Attempt to determine if network speed is fast enough by 
//           pinging google.com before timing out.
//  
// https://stackoverflow.com/questions/42147733/doing-a-timeout-error-with-fetch-react-native
export const checkSpeed2 = async () => {
    console.log('CheckSpeed ---------------------------');

    const URL = 'https://www.google.com';
    const DURATION = 5000;
    const TIMER_LABEL = 'fetch-timer';
    console.time(TIMER_LABEL);

    let controller = new AbortController();
    let timer = setTimeout(
        () => controller.abort(),
     DURATION);   

    const resp = await fetch(URL, {signal: controller.signal})
        .then((response) => {
            if (response.status === 200) {
                clearTimeout(timer);
                console.log('success');
                console.timeEnd(TIMER_LABEL);
                return true;
            } else {
                clearTimeout(timer);
                console.log('error');
                console.timeEnd(TIMER_LABEL);
                return false;
            }
        })
        .catch((error) => {
            clearTimeout(timer);
            console.log('network error: ' + error);
            console.timeEnd(TIMER_LABEL);
            return false;
        }); 
    
    console.log('CheckSpeed End ---------------------------');
}



// async function fetchRace(item, timeout = 5000) {
//     return Promise.race([
//         item(),
//         new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
//     ]);
// }


// export async function checkSpeed3() {
//     fetchRace(checkSpeed, 1000);
// }



