import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddScreen from '../screens/AddScreen';
import DetailScreen from '../screens/DetailScreen';

export type RootStackParamList = {
  home: undefined;
  add: undefined;
  detail: { taskId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="home"
      screenOptions={{
        headerShown: false, 
      }}
    >
      <Stack.Screen name="home" component={HomeScreen} />
      <Stack.Screen name="add" component={AddScreen} />
      <Stack.Screen name="detail" component={DetailScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
