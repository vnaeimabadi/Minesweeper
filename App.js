import React, {useState, useRef, useEffect} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator} from 'react-native';

let ws = null;
const App = () => {
  const [table, setTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [result, setResult] = useState('');
  const dataType = useRef('');
  const Start = () => {
    if (ws != null) {
      if (ws.readyState == WebSocket.OPEN) ws.close();
    }
    ws = new WebSocket('wss://hometask.eg1236.com/game1');

    if (ws != null) {
      setLoading(true);
      setGameStarted(false);
      setResult('');
      console.log('start socket');

      ws.onopen = async () => {
        // connection opened
        console.log('start web socket');
        dataType.current = 'new 1';
        setGameStarted(true);
        sendData('new 1');
      };

      ws.onmessage = async e => {
        // a message was received
        setLoading(false);
        // console.log('a message was received');
        if (e.data.includes('You lose')) {
          console.log(e.data);
          setResult('You Lose');
        } else {
          if (dataType.current.includes('map')) {
            const usingSplit = e.data.split(':');
            const usingSpread = [...usingSplit[1]];
            let mainBox = [];
            let eachRow = [];
            usingSpread.map((element, index) => {
              if (element.trim() === '') {
                if (index !== 0) {
                  mainBox.push(eachRow);
                  eachRow = [];
                }
              } else {
                eachRow.push(element);
              }
            });
            setTable(mainBox);
          } else if (dataType.current.includes('open')) {
            dataType.current = 'map';
            ws.send('map');
          } else if (dataType.current.includes('new 1')) {
            dataType.current = 'map';
            ws.send('map');
          }
        }
      };

      ws.onerror = e => {
        // an error occurred
        console.log('an error occurred');
        console.log(e.message);
        setResult('an error occurred');
      };
      ws.onclose = e => {
        // connection closed
        console.log('connection closed by user');
      };
    } else {
      // console.log('null socket');
      setResult('null socket');
    }
  };

  const Stop = () => {
    if (ws != null) {
      if (ws.readyState == WebSocket.OPEN) {
        ws.close();
      }
    }
  };

  const sendData = data => {
    setLoading(true);
    dataType.current = data;
    ws.send(data);
  };

  return (
    <View style={{height: '100%', width: '100%'}}>
      {!gameStarted && (
        <View style={{paddingHorizontal: '15%', paddingVertical: '50%'}}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 20,
              backgroundColor: 'yellow',
              borderColor: 'red',
              borderWidth: 4,
            }}
            onPress={Start}>
            <Text style={{fontWeight: 'bold',color:"black", fontSize: 25}}>
              Start the game
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {gameStarted && (
        <View style={{paddingHorizontal: '25%'}}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={{
              height: 56,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 100,
              backgroundColor: 'red',
              borderColor:"yellow",
              borderWidth:4,
              marginBottom: 10,
              marginTop: 10,
            }}
            onPress={() => {
              setLoading(false);
              setGameStarted(false);
              setResult('');
              setTable([]);
            }}>
            <Text style={{fontWeight: 'bold', color: 'white'}}>
              Restart
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {gameStarted &&
        table.map((row, parentIndex) => {
          {
            return (
              <View
                key={`parent-${parentIndex}`}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginHorizontal: 5,
                }}>
                {row.map((singleRow, childIndex) => {
                  let dds = (childIndex + parentIndex) % 2;
                  return (
                    <TouchableOpacity
                      activeOpacity={isNaN(singleRow) ? 0.5 : 1}
                      key={`child-${childIndex}`}
                      style={{
                        flex: 1,
                        height: 30,
                        borderTopLeftRadius:
                          parentIndex === 0 && childIndex === 0 ? 10 : 0,
                        borderBottomLeftRadius:
                          parentIndex === table.length - 1 && childIndex === 0
                            ? 10
                            : 0,
                        borderTopRightRadius:
                          parentIndex === 0 && childIndex === row.length - 1
                            ? 10
                            : 0,
                        borderBottomRightRadius:
                          parentIndex === table.length - 1 &&
                          childIndex === row.length - 1
                            ? 10
                            : 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: !isNaN(singleRow)
                          ? dds === 0
                            ? '#F0927F'
                            : '#E4ABA0'
                          : dds === 0
                          ? '#BFFF94'
                          : '#6EAB65',
                      }}
                      onPress={() => {
                        if (isNaN(singleRow)) {
                          sendData(`open ${childIndex} ${parentIndex}`);
                        }
                      }}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                        }}>
                        {isNaN(singleRow) ? '' : singleRow}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          }
        })}

      {loading && (
        <View
          style={{
            position: 'absolute',
            zIndex: 12,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: '#0007',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color="#00ff00" />
        </View>
      )}
      {result !== '' && (
        <View
          style={{
            position: 'absolute',
            zIndex: 12,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: '#0007',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              position: 'relative',
              backgroundColor: 'white',
              width: '80%',
              height: 150,
              alignItems: 'center',
              paddingTop: 30,
              borderRadius: 10,
            }}>
            <Text style={{fontSize: 28, fontWeight: 'bold'}}>You Lose</Text>
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 10,
                backgroundColor: 'red',
                width: '60%',
                height: 30,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                setLoading(false);
                setGameStarted(false);
                setResult('');
                setTable([]);
              }}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default App;
