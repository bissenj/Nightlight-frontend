/*
    This "screen" is the container which holds the actual app screens (map, contacts, settings, etc).
*/

// React
import { MapSettingsProvider } from '../../context/mapSettingsProvider';

// Canned UI
import { StyleSheet} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Custom Screens
import {MapScreen} from './mapScreen';
import {ContactsScreen} from './contactsScreen';
import {SettingsScreen} from './settingsScreen';
import {OfflineDataScreen} from './offlineScreen';
import {LogDataScreen} from './logScreen';

// Constants
const BottomTab = createBottomTabNavigator();


export function MainScreen({ navigation, route }) {
  
  const settings = route.params.settings; 
  const email = route.params.email;
  

  console.log('Render');

  return (
    <MapSettingsProvider settings={settings}>      
      <BottomTab.Navigator
        screenListeners={({ navigation }) => ({
            //focus: (e) => {console.log("Got here")},

            state: (e) => {
              // Do something with the state
              //console.log('state changed', e.data);
              
              //navigation.navigate('Home')
              // if (e.data.state.index == 0) {
              //     console.log("Main Screen");                 
              // }
          
              // Do something with the `navigation` object
              // if (!navigation.canGoBack()) {
              //     console.log("we're on the initial screen");
              // }
            },
        })}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Map') {              
              iconName = focused ? 'map' : 'map-outline';              
            } 
            else if (route.name === 'Contacts') {              
              iconName = focused ? 'people' : 'people-outline';                          
            } 
            else if (route.name === 'Settings') {                
              iconName = focused ? 'settings' : 'settings-outline';                
            }
            else if (route.name === 'Offline') {              
              iconName = focused ? 'cloud-offline' : 'cloud-offline-outline';                
            }
            else if (route.name === 'Logs') {              
              iconName = focused ? 'list' : 'list-outline';                
            }

            // You can return any component that you like here
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >        

      {/* Display bottom tabs if user is logged in */}      
      <BottomTab.Screen name="Map" children={() => <MapScreen navigation={navigation} email={email} />} />
      {email && 
        <>          
          <BottomTab.Screen name="Contacts" component={ContactsScreen} />  
          <BottomTab.Screen name="Settings" options={{ headerTitle: `Settings for ${email}` }} children={() => <SettingsScreen navigation={navigation} email={email} />} />
          <BottomTab.Screen name="Offline" options={{ headerTitle: `Offline Data` }} children={() => <OfflineDataScreen navigation={navigation} />} />
          <BottomTab.Screen name="Logs" options={{ headerTitle: `Application Logs` }} children={() => <LogDataScreen navigation={navigation} />} />
        </>
      }
      </BottomTab.Navigator>
    </MapSettingsProvider>
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
