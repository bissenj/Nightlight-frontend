/*
    The Log Screen allows the user to view and manage all the app logs that have been created.

    This is part of the 'Main Screen' Bottom Tabs.    
*/

// React
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Canned UI
import { RefreshControl, StyleSheet, Text, View, ScrollView } from 'react-native';
import { Button, DataTable, Portal, Modal } from 'react-native-paper';

// Controllers
import { getLogData, deleteAllLoggingData } from '../../database/localLoggingDatabase';


export function LogDataScreen({ navigation }) {
  // View Data
  const [logData, setLogData] = useState([]);
  
  // UI State
  const [deleting, setDeleting] = useState(false);          // when deleting logs
  const [refreshing, setRefreshing] = useState(false);      // when getting logs 

  // Data Table
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [numPages, setNumPages] = useState(1);

  // Modal
  const [modalId, setModalId] = useState(0);                // id of selected log record
  const [modalText, setModalText] = useState("");           // text of selected log record
  const [modalVisible, setModalVisible] = useState(false);  
  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);
  const containerStyle = {backgroundColor: 'white', padding: 20, margin: 20};

  // Constants
  let DELETE_IN_PROGRESS = false;


  // https://reactnavigation.org/docs/use-focus-effect/
  useFocusEffect(    
    React.useCallback(() => {  
      console.log('Log Screen got Focus.');
      
      const gotFocus = async () => {        
        await reloadLogData();
      };
      gotFocus();   
      
      return () => {
        console.log('Log Screen lost Focus.');        
      }    
    }, [])  
  );
  

  // -------------------------------------------------------------
  //  Gets log data and converts it into view data.
  // -------------------------------------------------------------
  async function reloadLogData() {

    // GET LOGS     
    await getLogData()
      .then((results) => {        
        setLogData(results);
        
        // for data table
        const pages = Math.ceil(results.length / itemsPerPage);
        setNumPages(pages);
      })
      .catch((ex) => {
        console.error('Caught Error getting logs: ', ex);
      });   

  }


  // -------------------------------------------------------------
  //  Takes all application log data and deletes it
  // -------------------------------------------------------------
  async function handleDeleteButtonPress() {

    if (DELETE_IN_PROGRESS) {
      console.log('DELETE IN PROGRESS.  DO NOTHING');
      return;
    }


    // Disable future button presses
    DELETE_IN_PROGRESS = true;
    setDeleting(true);

    
    // Delete all application logs
    console.log('About to delete log data');
    await deleteAllLoggingData()
      .then(async () => {
        console.log('Deleted log data.');

        // Retrieve logs (shouldn't be any, but just in case)
        await onRefresh();
      })
      .catch((ex) => {
        console.log('Error deleting logs: ', ex);
      });


      // Re enable button
      DELETE_IN_PROGRESS = false;
      setDeleting(false);
  }


  // -------------------------------------------------------------
  //  Displays view data in a modal
  // -------------------------------------------------------------
  function handleViewButtonPress(data, id) {
    setModalText(data);
    setModalId(id);
    showModal();    
  }
  

  // -------------------------------------------------------------
  //  Called when User wants to retrieve the current list of logs.
  // -------------------------------------------------------------
  const onRefresh = async () => {           
      setRefreshing(true);
      await reloadLogData()
        .then(() => {
          console.log('onRefresh - got data');
          setRefreshing(false);
        })
        .catch(() => {
          console.log('onRefresh - caught an error');
          setRefreshing(false);
        });      
  }
 

  console.log('Render');

  return (   
    <View style={styles.flexContainer}>                
        <Text style={{marginBottom:15, marginTop: 15}}>Application Logs.</Text>

        <ScrollView style={styles.scrollContainer} overScrollMode='never'
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >

          <Button             
            loading={deleting}
            mode="contained" 
            buttonColor={deleting ? "#F5B041" : "firebrick"}
            textColor="white" 
            icon="delete-variant" 
            onPress={handleDeleteButtonPress}
          >
            Delete Data ({logData.length})
          </Button>

          {/* Conditional here prevents RNP from re-opening the modal when it is closed. */}
          {modalVisible && 
            <Portal>
              <Modal visible={modalVisible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
                <Text style={{fontWeight:'bold', marginBottom: 20}}>Item {modalId}</Text>
                <Text>{modalText}</Text>
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
              <DataTable.Title style={{flexGrow:2}}>Timestamp</DataTable.Title>
              <DataTable.Title style={{flexGrow:2}}>Area</DataTable.Title>
              <DataTable.Title style={{flexGrow:3}}>Message</DataTable.Title>                                          
            </DataTable.Header>
          
            { logData && 
              logData.map((item, index) => (
                 index >= (itemsPerPage * page) && index < (itemsPerPage * (page+1)) ? 
                  (<DataTable.Row key={item.id}>

                    {/* ID */}
                    <DataTable.Cell>
                      {item.id}
                    </DataTable.Cell>

                    {/* TIMESTAMP */}
                    <DataTable.Cell style={{flexGrow: 2}}>                      
                        <Text>{item.timestamp.substring(11, 19)}</Text>   
                    </DataTable.Cell>      

                    {/* AREA */}
                    <DataTable.Cell style={{flexGrow: 2}}>                      
                        <Text>{item.area}</Text>   
                    </DataTable.Cell>    

                    {/* MESSAGE */}
                    <DataTable.Cell style={{flexGrow: 3}}>                                            
                      <Button 
                        mode="elevated"                                                 
                        textColor={item.type == 0 ? "steelblue" : "firebrick"}                     
                        onPress={() => handleViewButtonPress(item.message, item.id)}
                        >
                          {item.message.substring(0, 10)}                          
                      </Button>
                    </DataTable.Cell>  

                  </DataTable.Row>)
                  : null                
              ))
            }
            { (!logData || logData.length === 0) && 
              <DataTable.Row>
                <DataTable.Cell>
                  <Text>There are no application logs.</Text>
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
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      height: '50%',
      width: '100%',      
    },
    button: {
      position:'relative',
      zIndex: 10
    }
  });
  