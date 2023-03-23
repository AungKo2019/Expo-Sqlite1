
import { useEffect, useState } from 'react';
import { Alert,Button, FlatList, StatusBar,StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { openDatabase } from 'expo-sqlite';

const db=openDatabase("expo-sqlite")

export default function App() {
  const [category, setCategory] = useState("");
  const[categories,setCategories]=useState([]);
  const [isDelete, setisDelete] = useState(false);

  const addCategory=()=>{
    if(!category){
      alert('Enter Category');
      return false;
    }

    db.transaction(txn=>{
      txn.executeSql(
        `insert into categories (name) values(?)`,
        [category],
        (sqlTxn,res)=>{
          console.log(`${category} category added successfully` );
          getCategories();
        },
          error=>{
            console.log('error on adding category'+ error.message)
          },
        
      )
    })
  }

  useEffect(() => {
    CreateTable();
    getCategories();
  }, [])

  const CreateTable=()=>{
    db.transaction(txn=>{
      txn.executeSql(
        `create table if not exists categories (id integer primary key autoincrement,name varchar(20))`,
        [],
        (sqlTxn,res)=>{
          console.log('categories table created successfully');
        },
        error=>{
          console.log('error on creating table'+error.message);
        },
      );
    });
  };

  const getCategories=()=>{
    db.transaction(txn=>{
      txn.executeSql(
        `select * from categories order by id desc`,
        [],
        (sqlTxn,res)=>{
          console.log('categories retrieved successfully');
          let len=res.rows.length;
          if (len>0){
            let results=[];
            for(let i=0;i<len;i++){
              let item=res.rows.item(i);
              results.push({id:item.id,name:item.name});
            
            }
            setCategories(results);
            console.log(results);
            
          }
        },
        error=>{
          console.log('error on getting categories'+error.message)
        },
      )
    })
  };

  const DeleteRow=(item)=>{
    
      db.transaction((trx)=>{
        trx.executeSql(
          `Delete from categories where id=?`,
          [item.id],
          (sqlTrx,res)=>{
            console.log('Delete Successfully')
            getCategories();
          },
          error=>{
            console.log('error on deleting'+ error.message)
          }
        );
      })
      
  }

  const createTwoButtonAlert = (item) =>
    Alert.alert('Delete Confirm', `${item.name} - Are you sure You want to Delete`, [
      {
        text: 'No',
        onPress: () => (null),
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => DeleteRow(item)
      },
    ]);

  const renderCategories=({item})=>{
    return(
      <TouchableOpacity style={{backgroundColor:'green',paddingVertical:12,paddingHorizontal:10,borderBottomWidth:1,borderColor:'#ddd'}} 
      onPress={()=>createTwoButtonAlert(item)}>
      <View style={{flexDirection:'row'}}>
        <Text style={{marginRight:9,color:'white',fontSize:20}}>{item.id}.</Text>
        <Text style={{color:'white',fontSize:20}}>{item.name}</Text>
      </View>
      </TouchableOpacity>
    )
  }

  return (
    <View >
     <StatusBar style="auto" backgroundColor='orange'/>
     <TextInput 
     placeholder='Enter Category'
     value={category}
     onChangeText={setCategory}
     style={{marginHorizontal:8 , marginVertical:8,fontSize:26}}
     />
     <Button title='submit' onPress={addCategory} style={{fontSize:24}}/> 

     <FlatList data={categories} renderItem={renderCategories} keyExtractor={categories.id}/>
    </View>
  );
}


