/*
    Offline Data Screen is responsible for displaying the list of offline transactions
    and allowing the user to send all of them to the server (sync) or delete individual
    records.

    This is part of the 'Main Screen' Bottom Tabs.    
*/

// React
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Canned UI
import { RefreshControl, StyleSheet, Text, View, ScrollView } from 'react-native';
import { Button, DataTable, Portal, Modal } from 'react-native-paper';

// Controllers
import { syncOfflineData } from '../../services/syncLocationService';

// Database
import { getOfflineData, deleteOfflineData, deleteAllOfflineData } from '../../database/localOfflineDatabase';

// Helpers
import { writeToLog } from '../../database/localLoggingDatabase';
import { haversineDistance } from '../../util/haversine';
import { convertMilesToMeters } from '../../util/calculations';


//const optionsPerPage = [2,3,4];

export function OfflineDataScreen({ navigation }) {
  // View Data
  const [offlineData, setOfflineData] = useState([]);
  const [offlineDistances, setOfflineDistances] = useState([]);

  // UI State
  const [syncing, setSyncing] = useState(false);              // used by Sync Button
  const [refreshing, setRefreshing] = useState(false);        // used by Refresh Control
  const [deleting, setDeleting] = useState(false);            // used by Delete Button
  const [deleteCount, setDeleteCount] = useState(0);          // used by Delete Button
  const [deleteColor, setDeleteColor] = useState('#FAB545');  // used by Delete Button

  // Data Table
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [numPages, setNumPages] = useState(1);

  // Modal
  const [modalText, setModalText] = useState("");
  const [modalId, setModalId] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);  
  const showModal = () => setModalVisible(true);
  const hideModal = () => { setModalVisible(false); updateDeleteStats(0); };
  const containerStyle = {backgroundColor: 'white', padding: 20, margin: 20};

  // Constants
  const NAME = 'Offline Screen';
  const PENDING = 0;
  const COMPLETE = 1;
  const ERROR = 99;
  const LOCATION_CATEGORY = 'location';
  let SYNC_IN_PROGRESS = false;


  // https://reactnavigation.org/docs/use-focus-effect/
  useFocusEffect(    
    React.useCallback(() => {  
      console.log('Offline Screen got Focus.');
      
      const gotFocus = async () => {        
        await reloadOfflineData();
      };
      gotFocus();   

      return () => {
        console.log('Offline Screen lost Focus.');        
      }   
     
    }, [])  
  );
 

  // -------------------------------------------------------------
  //  Gets offline data and converts it into view data.
  // -------------------------------------------------------------
  async function reloadOfflineData() {

    // GET ITEMS     
    await getOfflineData()
      .then((results) => {
        //console.log("Got Items: ", results.length);
        setOfflineData(results);
        
        const pages = Math.ceil(results.length / itemsPerPage);
        setNumPages(pages);

        // Calculate distances
        const distances = [];
        for(let i = 0; i < results.length; i ++) {
          if (i == 0) {
            distances.push(0);            
          }
          else {
            const coord1 = JSON.parse(results[i-1].data);
            const coord2 = JSON.parse(results[i].data);
            const distance = haversineDistance(coord2.lat, coord2.long, coord1.lat, coord1.long);
            const meters = convertMilesToMeters(distance); 
            distances.push(meters);            
          }
        }
        //console.log('Distances:  ', distances);
        setOfflineDistances(distances);

      })
      .catch((ex) => {
        console.error('Caught Error getting items: ', ex);
      });   

  }


  // -------------------------------------------------------------
  //  Takes all offline data and sends it to server.
  // -------------------------------------------------------------
  async function handleSyncButtonPress() {

    if (SYNC_IN_PROGRESS) {
      console.log('SYNC IN PROGRESS.  DO NOTHING');
      return;
    }


    // Disable future button presses
    SYNC_IN_PROGRESS = true;
    setSyncing(true);

    
    // STEP 1:  Attempt to sync data
    await syncOfflineData()
      .then(() => {
        writeToLog(NAME, 'Successfully synced offline data.');
      })
      .catch((ex) => {
        writeToLog(NAME, 'Exception caught while attempting to sync.', 1);
      });   


    // STEP 2:  Delete any offline data marked as complete.
    console.log('About to delete completed data');
    await deleteAllOfflineData(COMPLETE)
      .then(() => {        
        writeToLog(NAME, 'Deleted completed offline data.');

        // Reload the data
        reloadOfflineData()
          .then(() => {console.log('Got remaining offline data.');});
      })
      .catch((ex) => {
        console.error('Error deleting items: ', ex);
        writeToLog(NAME, `Exception caught while deleting offline data - ${ex}.`, 1);
      });


    // Re enable button
    SYNC_IN_PROGRESS = false;
    setSyncing(false);    
  }


  // -------------------------------------------------------------
  //  Pops up a modal to display the selected offline data record
  // -------------------------------------------------------------
  function handleViewButtonPress(data, id) {
    setModalText(data);
    setModalId(id);
    showModal();    
  }
  

  // -------------------------------------------------------------
  //  Requiries the list of offline datase transactions
  // -------------------------------------------------------------
  const onRefresh = async () => {       
    //React.useCallback(async () => {  
      setRefreshing(true);
      await reloadOfflineData()
        .then(() => {
          console.log('onRefresh - got data');
          setRefreshing(false);
        })
        .catch(() => {
          console.error('onRefresh - caught an error');
          setRefreshing(false);
        });      
  }


  // -------------------------------------------------------------
  //  Try to prevent the user from accidentally deleting a record
  //  by forcing them to click delete 3 times and changing the 
  //  button color each time.
  // -------------------------------------------------------------
  function updateDeleteStats(index) {    
    setDeleteCount(index);

    if (index == 0) {
      setDeleteColor('#FAB545');
    }
    else if (index == 1) {
      setDeleteColor('#FA7945');
    }
    else {
      setDeleteColor('firebrick');
    }
  }
  

  // -------------------------------------------------------------
  //  Delete offline data item.  Called from Modal.
  // -------------------------------------------------------------
  const handleDeleteButtonPress = async () => {    

    // Prevent accidental deletions
    if (deleteCount < 2) {
      updateDeleteStats(deleteCount + 1);
    }
    else {
      setDeleting(true);
      await deleteOfflineData(modalId)
        .then(() => {   
          writeToLog('Offline Screen', `Deleted Item ${modalId}`);
          setDeleting(false);          
          setModalId(0);    
          hideModal();
          onRefresh();
        })
        .catch((ex) => {   
          writeToLog('Offline Screen', `Exception caught while deleting Item ${modalId} - ${ex}`);
          setDeleting(false);
        }); 
    }       
  }

    
  return (   
    <View style={styles.flexContainer}>                
        <Text style={{marginBottom:15, marginTop: 15}}>The following data needs to be sent to the server.</Text>

        <ScrollView style={styles.scrollContainer} overScrollMode='never'
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Button 
            // style={styles.syncButton} 
            loading={syncing}
            mode="contained" 
            buttonColor={syncing ? "#F5B041" : "steelblue"}
            textColor="white" 
            icon="cloud-upload" 
            onPress={handleSyncButtonPress}
          >
            Sync Data ({offlineData.length})
          </Button>


          {/* Conditional here prevents RNP from re-opening the modal when it is closed. */}
          {modalVisible && 
            <Portal>
              <Modal visible={modalVisible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
                <Text style={{fontWeight:'bold', marginBottom: 20}}>Item {modalId}</Text>
                <Text>{modalText}</Text>
                <View style={{marginTop: 20, width: '35%', position: 'relative', left: '65%'}}>
                  <Button                      
                    loading={deleting}
                    mode="contained" 
                    buttonColor={deleting ? "#F5B041" : deleteColor}                    
                    textColor="white" 
                    icon="delete-variant" 
                    onPress={handleDeleteButtonPress}
                  >
                    Delete 
                  </Button>
                </View>
              </Modal>
            </Portal>
          }
          
          <DataTable>

            <DataTable.Pagination
              page={page}
              numberOfPages={numPages}
              onPageChange={(page) => setPage(page)}
              label={"Page: " + (page+1) + " of " + numPages}
              // optionsPerPage={optionsPerPage}
              itemsPerPage={4}
              setItemsPerPage={setItemsPerPage}
              showFastPagination
              optionsLabel={'Rows per page'}
            />

            <DataTable.Header>
              <DataTable.Title>ID</DataTable.Title>
              <DataTable.Title style={{flexGrow:3}}>Src</DataTable.Title>
              <DataTable.Title style={{flexGrow:3}}>Data</DataTable.Title>
              <DataTable.Title style={{flexGrow:3}}>Timestamp</DataTable.Title>              
              <DataTable.Title>Status</DataTable.Title>
            </DataTable.Header>
          
            { offlineData && 
              offlineData.map((item, index) => (
                 index >= (itemsPerPage * page) && index < (itemsPerPage * (page+1)) ? 
                  (<DataTable.Row key={item.id}>

                    {/* ID */}
                    <DataTable.Cell> {item.id} </DataTable.Cell>

                    {/* SRC */}
                    <DataTable.Cell style={{flexGrow: 3}}>{JSON.parse(item.data).src}</DataTable.Cell>

                    {/* DATA */}
                    <DataTable.Cell style={{flexGrow: 3}}>                                            
                      <Button 
                        mode="elevated"                         
                        textColor="steelblue"                         
                        onPress={() => handleViewButtonPress(item.data, item.id)}
                        >                          
                          {offlineDistances[index]}m
                      </Button>
                    </DataTable.Cell>

                    {/* TIME */}
                    <DataTable.Cell style={{flexGrow: 2}}>
                      <View>
                        <Text>{item.timestamp.substring(11, 19)}</Text>                        
                      </View>                      
                    </DataTable.Cell> 

                    {/* STATUS  */}
                    <DataTable.Cell numeric>{item.status}</DataTable.Cell>
                  </DataTable.Row>)
                  : null                
              ))
            }
            { (!offlineData || offlineData.length === 0) && 
              <DataTable.Row>
                <DataTable.Cell>
                  <Text>There is no offline data to process</Text>
                </DataTable.Cell>
              </DataTable.Row>
            }
          
          </DataTable>  

        </ScrollView>       
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
      padding:40,           
    },
    portalContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalContainer: {      
      backgroundColor: '#fff',
      padding: 20,
    },
    syncButton: {
      position: 'absolute',
      top: 5,
      left: 5,
      zIndex: 10
    },    
    scrollContainer: {
      flex: 1,
      width: '100%'
    },
    rowContainer: {
      flex: 1,
      justifyContent: 'space-around',        
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
      // opacity: 0.5,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      height: '50%',
      width: '100%',
      // transform: ([{ rotateZ: '-30deg' }, {translateY: -40}, {translateX: -140}])
      // transform: ([{translateY: 100}])
    },
    button: {
      position:'relative',
      zIndex: 10
    }
  });
  