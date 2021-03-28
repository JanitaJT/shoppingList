import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { Header, Input, Button, ListItem, Icon } from "react-native-elements";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("shoppingList.db");

export default function App() {
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [shopList, setShopList] = useState([]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists shoppinglist (id integer primary key not null, product text, amount text);"
      );
    });
    updateList();
  }, []);

  useEffect(() => {}, [shopList]);

  const saveItem = () => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "insert into shoppinglist (product, amount) values (?, ?);",
          [product, amount]
        );
      },
      null,
      updateList
    );
  };

  const updateList = () => {
    db.transaction((tx) => {
      tx.executeSql("select * from shoppinglist;", [], (_, { rows }) => {
        setShopList(rows._array);
      });
    });
  };

  const deleteItem = (id) => {
    db.transaction(
      (tx) => {
        tx.executeSql("delete from shoppinglist where id = ?;", [id]);
      },
      null,
      updateList
    );
  };

  const keyExtractor = (item, index) => index.toString();

  const renderItem = ({ item }) => (
    <ListItem bottomDivider>
      <ListItem.Content>
        <ListItem.Title>{item.product}</ListItem.Title>
        <ListItem.Subtitle>{item.amount}</ListItem.Subtitle>
      </ListItem.Content>
      <ListItem.Chevron
        name="trash-2"
        type="feather"
        color="#FF0206"
        onPress={deleteItem(item.id)}
      ></ListItem.Chevron>
    </ListItem>
  );

  return (
    <View style={{ flex: 1 }}>
      <Header
        centerComponent={{ text: "Shopping list", style: { color: "#fff" } }}
      />
      <View style={styles.container}>
        <Input
          placeholder="Product"
          onChangeText={(product) => setProduct(product)}
          value={product}
        />
        <Input
          placeholder="Amount"
          onChangeText={(amount) => setAmount(amount)}
          value={amount}
        />
        <Button title="Save" onPress={saveItem} />
      </View>
      <View style={{ flex: 2 }}>
        <FlatList
          keyExtractor={keyExtractor}
          data={shopList}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
