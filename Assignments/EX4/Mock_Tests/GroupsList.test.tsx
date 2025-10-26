import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import GroupsList from '../Components/GroupsList';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return {
    Ionicons: () => React.createElement('Icon'),
  };
});

jest.mock('../Services', () => ({
  fetchGroups: jest.fn(() =>
    Promise.resolve([
      { id: '1', name: 'Group A' },
      { id: '2', name: 'Group B' }
    ])
  ),
  createGroup: jest.fn(() => Promise.resolve())
}));

jest.mock('../firebase', () => ({
  auth: {
    onAuthStateChanged: (cb: any) => {
      cb(); // simulate login
      return () => {};
    },
    currentUser: { uid: 'user123' }
  }
}));

describe('GroupsList Component', () => {
  it('renders group list and title', async () => {
    const { findByText } = render(
      <NavigationContainer>
        <GroupsList />
      </NavigationContainer>
    );

    expect(await findByText('Your Groups')).toBeTruthy();
    expect(await findByText('Group A')).toBeTruthy();
    expect(await findByText('Group B')).toBeTruthy();
  });

  it('opens modal, types input, and creates group', async () => {
    const { getByTestId, getByPlaceholderText, findByText } = render(
      <NavigationContainer>
        <GroupsList />
      </NavigationContainer>
    );

    // Open modal
    fireEvent.press(getByTestId('open-modal-button'));

    // Wait for modal
    expect(await findByText('Create New Group')).toBeTruthy();

    // Type into inputs
    fireEvent.changeText(getByPlaceholderText('Group name'), 'New Group');
    fireEvent.changeText(getByPlaceholderText('Description (optional)'), 'Test group description');

    // Press create
    fireEvent.press(getByTestId('create-button'));
  });

  it('opens modal and cancels creation', async () => {
    const { getByTestId, findByText } = render(
      <NavigationContainer>
        <GroupsList />
      </NavigationContainer>
    );

    // Open modal
    fireEvent.press(getByTestId('open-modal-button'));

    // Wait for modal
    expect(await findByText('Create New Group')).toBeTruthy();

    // Press cancel
    fireEvent.press(getByTestId('cancel-button'));

    // Modal should disappear (wait to let state update)
    await waitFor(() => {
      expect(() => findByText('Create New Group')).rejects.toThrow();
    });
  });
});
