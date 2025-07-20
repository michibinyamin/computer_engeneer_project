import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Tabs from '../Components/MainContainer';
import { NavigationContainer } from '@react-navigation/native';

// Mock subcomponents
jest.mock('../Components/GeneralList', () => () => <></>);
jest.mock('../Components/GroupsList', () => () => <></>);
jest.mock('../Components/PersonalList', () => () => <></>);

describe('Tabs Component', () => {
  it('renders all tab buttons', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Tabs />
      </NavigationContainer>
    );

    expect(getByText('General')).toBeTruthy();
    expect(getByText('Groups')).toBeTruthy();
    expect(getByText('Personal')).toBeTruthy();
  });

  it('changes tab when buttons are pressed', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Tabs />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Groups'));
    fireEvent.press(getByText('Personal'));
    fireEvent.press(getByText('General'));
  });
});
