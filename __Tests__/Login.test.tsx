import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import Login from '../Components/Login'

// Mock Firebase auth function
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: '123' } }),
  ),
}))

// Mock Firebase config
jest.mock('../firebase', () => ({
  auth: {},
}))

// Mock alert to prevent test crash
global.alert = jest.fn()

describe('Login screen', () => {
  const mockNavigate = jest.fn()
  const mockGoBack = jest.fn()

  const mockNavigation = {
    navigate: mockNavigate,
    goBack: mockGoBack,
  }

  it('renders all input fields and buttons', () => {
    const { getByPlaceholderText, getByText } = render(
      <Login navigation={mockNavigation} />,
    )

    expect(getByPlaceholderText('Email')).toBeTruthy()
    expect(getByPlaceholderText('Password')).toBeTruthy()
    expect(getByText('Login')).toBeTruthy()
    expect(getByText(/Forgot password/i)).toBeTruthy()
    expect(getByText(/Don't have an account/i)).toBeTruthy()
  })

  it('allows user to type in email and password', () => {
    const { getByPlaceholderText } = render(
      <Login navigation={mockNavigation} />,
    )

    fireEvent.changeText(getByPlaceholderText('Email'), 'omar@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), '123456')
  })

  it('navigates to ResetPassword when "Forgot password?" is pressed', () => {
    const { getByText } = render(<Login navigation={mockNavigation} />)
    fireEvent.press(getByText(/Forgot password/i))
    expect(mockNavigate).toHaveBeenCalledWith('ResetPassword')
  })

  it('navigates to previous screen when "Sign Up" is pressed', () => {
    const { getByText } = render(<Login navigation={mockNavigation} />)
    fireEvent.press(getByText(/Sign Up/i))
    expect(mockGoBack).toHaveBeenCalled()
  })

  it('submits login form without crashing', () => {
    const { getByPlaceholderText, getByText } = render(
      <Login navigation={mockNavigation} />,
    )

    fireEvent.changeText(getByPlaceholderText('Email'), 'omar@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), '123456')
    fireEvent.press(getByText('Login'))
  })
})
