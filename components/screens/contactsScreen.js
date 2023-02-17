/*
    Contacts Screen is responsible for displaying list of other users in the system
    and how many waypoints they have for the day.

    Future:
      - Put this into Data Table now that we're using React-Native-Paper.
      - Check/UnCheck which people to view on Map (maybe zoom to them?).
      - Way Future:  
          - Manage groups from here.

    This is part of the 'Main Screen' Bottom Tabs.
*/

// React
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Canned UI
import { StyleSheet, Text, View } from 'react-native';

// Controllers
import { getUsers } from '../../api/fetch';


export function ContactsScreen({ navigation }) {
  const [users, setUsers] = useState([]);


  // -------------------------------------------------------------
  //  Initial Page Load
  // -------------------------------------------------------------
  // useEffect(() => {        
  // },[]);


  // -------------------------------------------------------------
  //  Get list of users when screen gets focus
  // -------------------------------------------------------------
  useFocusEffect(    
    React.useCallback(() => {  
      //console.log('Contacts Screen got Focus.');
      
      const loadUsers = async () => {
        const result = await getUsers();
        if (result.success && result.data) {              
            setUsers(result.data);
        }    
      }
      loadUsers(); 

      return () => {
        console.log('Contacts Screen lost Focus.');        
      }   
     
    }, [])  
  );


  // Do something when tab is pressed.
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener("tabPress", async(e) => {
  //       // do stuff
  //       console.log("Tab Press:  Contacts");
  //   })

  //   // unsubscribe when component unmounts
  //   return () => unsubscribe();
  // }, [navigation]);

  
  console.log('Render');

  return (   
    <View style={styles.flexContainer}>                
        <Text>Contacts Screen</Text>

          { users && 
            users.map((contact) => (
            <View key={contact.email}>              
              <Text>{contact.name} - ({contact.coordinates.length})</Text>              
            </View>
            ))
          }
          { (!users || users.length === 0) && 
            <Text>You need to be online and logged in for this screen to function.</Text>
          }
          
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
      padding:40,             
    },
    flexContainer: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center',    
    },
    flexMContainer: {
      padding: 40,
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-around',    
    },
    headerText: {
      fontSize: 28,
      color: 'white',
      textAlign: 'center',
      fontStyle: 'italic',
      textTransform: 'uppercase' ,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: {width: 1, height: 1},
      textShadowRadius: 10  
    },
    text: {
      fontSize: 24,       
      color: 'white',
      textAlign: 'center'
    },
    smallText: {    
      color: 'white',
      textAlign: 'center'
    },
    image: {
      flex: 1,
      width: '100%',
      justifyContent: "center",    
    },  
    overlay: {
      position: 'absolute',
      top: '51.5%',
      zIndex: 1,      
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      height: '50%',
      width: '100%',      
    },
    button: {
      position:'relative',
      zIndex: 10
    }
  });
  