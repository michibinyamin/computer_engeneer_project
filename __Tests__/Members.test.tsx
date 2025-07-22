import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import Members from '../Components/Members'
import { NavigationContainer } from '@react-navigation/native'

// Mock the navigation route
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native')
  return {
    ...actual,
    useRoute: () => ({ params: { groupId: 'test-group' } }),
  }
})

// Mock Firestore and its methods
jest.mock('../firebase', () => ({
  db: {},
}))

jest.mock('firebase/firestore', () => {
  const originalModule = jest.requireActual('firebase/firestore')
  return {
    ...originalModule,
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(() =>
      Promise.resolve({
        docs: [
          {
            data: () => ({ user_id: 'user123', role: 'Member' }),
          },
        ],
      }),
    ),
    getDoc: jest.fn(() =>
      Promise.resolve({
        exists: () => true,
        data: () => ({ username: 'testuser' }),
      }),
    ),
    addDoc: jest.fn(() => Promise.resolve()),
    doc: jest.fn(),
  }
})

describe('Members Component', () => {
  it('renders member list and Invite button', async () => {
    const { findByText } = render(
      <NavigationContainer>
        <Members />
      </NavigationContainer>,
    )

    expect(await findByText('Members')).toBeTruthy()
    expect(await findByText('testuser')).toBeTruthy()
    expect(await findByText('Member')).toBeTruthy()
    expect(await findByText('Invite')).toBeTruthy()
  })

  it('opens modal and allows entering username and cancelling', async () => {
    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <Members />
      </NavigationContainer>,
    )

    fireEvent.press(getByText('Invite'))

    await waitFor(() => {
      expect(getByText('Invite User')).toBeTruthy()
    })

    fireEvent.changeText(getByPlaceholderText('Enter username'), 'newUser')
    fireEvent.press(getByText('Send'))
    fireEvent.press(getByText('Cancel'))
  })
})
