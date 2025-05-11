import React from 'react';
import GeneralList from './Components/GeneralList';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <>
      <GeneralList />
      <StatusBar style="auto" />
    </>
  );
}
