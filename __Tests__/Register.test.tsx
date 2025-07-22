import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import Register from '../Components/Register'

// Mock Firebase functions to avoid actual network calls
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: '123' } }),
  ),
}))
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ empty: true })), // allow any username
  setDoc: jest.fn(),
  doc: jest.fn(),
}))

// Provide a fake firebase import (if not globally mocked)
jest.mock('../firebase', () => ({
  auth: {},
  db: {},
}))

//mock alert to prevent error
global.alert = jest.fn()

describe('Register screen', () => {
  const mockNavigate = jest.fn()
  const mockNavigation = { navigate: mockNavigate }

  it('renders all input fields and buttons', () => {
    const { getByPlaceholderText, getByText } = render(
      <Register navigation={mockNavigation} />,
    )

    expect(getByPlaceholderText('Username')).toBeTruthy()
    expect(getByPlaceholderText('Email')).toBeTruthy()
    expect(getByPlaceholderText('Password')).toBeTruthy()
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy()
    expect(getByText('Create Account')).toBeTruthy()
    expect(getByText(/Already have an account/i)).toBeTruthy()
  })

  it('lets user type in all fields', () => {
    const { getByPlaceholderText } = render(
      <Register navigation={mockNavigation} />,
    )

    fireEvent.changeText(getByPlaceholderText('Username'), 'omar')
    fireEvent.changeText(getByPlaceholderText('Email'), 'omar@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), '123456')
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), '123456')
  })

  it('calls navigation when "Already have an account?" is pressed', () => {
    const { getByText } = render(<Register navigation={mockNavigation} />)
    fireEvent.press(getByText(/Already have an account/i))
    expect(mockNavigate).toHaveBeenCalledWith('Login')
  })

  it('calls create account logic when "Create Account" is pressed', async () => {
    const { getByPlaceholderText, getByText } = render(
      <Register navigation={mockNavigation} />,
    )

    fireEvent.changeText(getByPlaceholderText('Username'), 'omar')
    fireEvent.changeText(getByPlaceholderText('Email'), 'omar@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), '123456')
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), '123456')

    fireEvent.press(getByText('Create Account'))
    // We don't check async result here — just that button can be pressed without crash
  })
})
