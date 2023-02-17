import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { MD3LightTheme as DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import HomeNavigation from './components/navigation/HomeNavigation';

const appName = "Nightlight";


//https://stackoverflow.com/questions/71519947/how-can-i-toggle-a-dark-theme-for-a-stack-of-screens
//https://callstack.github.io/react-native-paper/theming.html#using-the-theme-in-your-own-components
const theme = {  
  ...DefaultTheme,
  colors: {    
    "primary": "rgb(133, 84, 0)",
    "onPrimary": "rgb(255, 255, 255)",
    "primaryContainer": "rgb(255, 221, 183)",
    "onPrimaryContainer": "rgb(42, 23, 0)",
    "secondary": "rgb(112, 91, 65)",
    "onSecondary": "rgb(255, 255, 255)",
    "secondaryContainer": "rgb(252, 222, 188)",
    "onSecondaryContainer": "rgb(40, 24, 5)",
    "tertiary": "rgb(83, 100, 62)",
    "onTertiary": "rgb(255, 255, 255)",
    "tertiaryContainer": "rgb(214, 233, 185)",
    "onTertiaryContainer": "rgb(18, 31, 3)",
    "error": "rgb(186, 26, 26)",
    "onError": "rgb(255, 255, 255)",
    "errorContainer": "rgb(255, 218, 214)",
    "onErrorContainer": "rgb(65, 0, 2)",
    "background": "rgb(255, 251, 255)",
    "onBackground": "rgb(31, 27, 22)",
    "surface": "rgb(255, 251, 255)",
    "onSurface": "rgb(31, 27, 22)",
    "surfaceVariant": "rgb(240, 224, 208)",
    "onSurfaceVariant": "rgb(80, 69, 57)",
    "outline": "rgb(130, 117, 104)",
    "outlineVariant": "rgb(212, 196, 181)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(53, 47, 42)",
    "inverseOnSurface": "rgb(249, 239, 231)",
    "inversePrimary": "rgb(255, 185, 92)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(249, 243, 242)",
      "level2": "rgb(245, 238, 235)",
      "level3": "rgb(242, 233, 227)",
      "level4": "rgb(240, 231, 224)",
      "level5": "rgb(238, 228, 219)"
    },
    "surfaceDisabled": "rgba(31, 27, 22, 0.12)",
    "onSurfaceDisabled": "rgba(31, 27, 22, 0.38)",
    "backdrop": "rgba(56, 47, 36, 0.4)"
  }
};



export default function App() {
  
  return (
    
    <PaperProvider theme={theme}>
      <NavigationContainer> 
        <HomeNavigation/>
      </NavigationContainer>
    </PaperProvider>    
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
