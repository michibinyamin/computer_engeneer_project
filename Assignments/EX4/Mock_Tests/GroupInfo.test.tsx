import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import GroupInfo from '../Components/GroupInfo';
import { NavigationContainer } from '@react-navigation/native';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
    useRoute: () => ({ params: { groupId: 'testGroupId' } }),
  };
});

// Mock Firebase Firestore
jest.mock('../firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => true, data: () => ({ name: 'Mock Group' }) })),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({
    docs: [
      { id: '1', data: () => ({ name: 'Category A' }) },
      { id: '2', data: () => ({ name: 'Category B' }) },
    ],
  })),
  addDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
}));

describe('GroupInfo Component', () => {
  it('renders group name and categories', async () => {
    const { findByText } = render(
      <NavigationContainer>
        <GroupInfo />
      </NavigationContainer>
    );

    expect(await findByText('Mock Group')).toBeTruthy();
    expect(await findByText('Category A')).toBeTruthy();
    expect(await findByText('Category B')).toBeTruthy();
  });

  it('opens modal and allows category creation and canceling', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(
      <NavigationContainer>
        <GroupInfo />
      </NavigationContainer>
    );

    fireEvent.press(getByText('+ Add Category'));
    expect(await getByText('New Category')).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('Category name'), 'New Test Category');
    fireEvent.press(getByText('Add'));

    fireEvent.press(getByText('+ Add Category'));
    fireEvent.press(getByText('Close'));

    await waitFor(() => {
      expect(queryByText('New Category')).toBeNull();
    });
  });

  it('navigates to Members screen when Members button is pressed', async () => {
    const { findByText } = render(
      <NavigationContainer>
        <GroupInfo />
      </NavigationContainer>
    );

    const membersButton = await findByText('Members');
    fireEvent.press(membersButton);

    expect(mockNavigate).toHaveBeenCalledWith('Members', { groupId: 'testGroupId' });
  });
});