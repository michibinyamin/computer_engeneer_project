import React from 'react';
import Catagorys from './Catagorys';
import { ScrollView } from 'react-native-gesture-handler';

const GeneralList = () => {
  return (
    <ScrollView>
      <Catagorys group_id={"General"} />
    </ScrollView>
  
);
};

export default GeneralList;
